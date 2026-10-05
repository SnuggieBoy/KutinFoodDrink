import React, { useState, useMemo } from 'react';
import { 
  DollarSign, Calculator, Plus, Edit2, Trash2, 
  CheckCircle, FileText, Download, X, Info, AlertTriangle, Calendar,
  Receipt, ArrowUpRight, Check, Sparkles, LayoutGrid, List, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  TAX_CONFIG, TAX_PERIODS, INITIAL_TAX_RECORDS, saveTaxRecords, calculateTax, getTaxSummary 
} from '../../data/taxData';

const formatPrice = (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + 'đ';

export default function AdminTax({ taxRecords, setTaxRecords, orders = [] }) {
  const [estimateRevenue, setEstimateRevenue] = useState('1200000000');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [formData, setFormData] = useState({
    period: new Date().toISOString().slice(0, 7),
    periodLabel: '',
    revenue: '',
    deductibleCosts: '',
    status: 'pending',
    paidDate: '',
    notes: ''
  });

  // KPI Calculations
  const kpis = useMemo(() => {
    let totalRevenue = 0;
    let totalTax = 0;
    let totalPaid = 0;
    let totalPending = 0;

    taxRecords.forEach(r => {
      const rev = Number(r.revenue) || 0;
      const tax = Number(r.totalTax) || 0;
      totalRevenue += rev;
      totalTax += tax;
      if (r.status === 'paid') {
        totalPaid += tax;
      } else {
        totalPending += tax;
      }
    });

    return { totalRevenue, totalTax, totalPaid, totalPending };
  }, [taxRecords]);

  // Quick estimator calculation
  const estimateResult = useMemo(() => {
    const rev = Number(estimateRevenue) || 0;
    const isExempt = rev <= TAX_CONFIG.exemptionThreshold;
    const vat = isExempt ? 0 : Math.round(rev * TAX_CONFIG.vatRate);
    const pit = isExempt ? 0 : Math.round(rev * TAX_CONFIG.pitRate);
    return { isExempt, vat, pit, total: vat + pit, rev };
  }, [estimateRevenue]);

  const calculateFormTax = (rev) => {
    // Với kỳ tháng, nếu tính theo mức cả năm thì ta tạm tính theo tỷ lệ 4.5%
    const vat = Math.round(rev * TAX_CONFIG.vatRate);
    const pit = Math.round(rev * TAX_CONFIG.pitRate);
    return { vat, pit, totalTax: vat + pit };
  };

  const handleExportCSV = () => {
    if (taxRecords.length === 0) {
      toast.error('Chưa có hồ sơ thuế để xuất báo cáo!');
      return;
    }

    const csvRows = [
      ['Kỳ Kê Khai', 'Tên Kỳ', 'Doanh Thu (VNĐ)', 'Chi Phí Khấu Trừ', 'Thuế GTGT (3%)', 'Thuế TNCN (1.5%)', 'Tổng Thuế (4.5%)', 'Trạng Thái', 'Ngày Nộp', 'Ghi Chú'].join(',')
    ];

    taxRecords.forEach(r => {
      const row = [
        `"${r.period || ''}"`,
        `"${r.periodLabel || `Tháng ${r.period}`}"`,
        r.revenue || 0,
        r.deductibleCosts || 0,
        r.vatAmount || 0,
        r.pitAmount || 0,
        r.totalTax || 0,
        `"${r.status === 'paid' ? 'Đã nộp' : r.status === 'overdue' ? 'Quá hạn' : 'Chưa nộp'}"`,
        `"${r.paidDate || ''}"`,
        `"${r.notes || ''}"`
      ].join(',');
      csvRows.push(row);
    });

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KuTin_BaoCaoThue_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('📥 Đã xuất báo cáo thuế Excel/CSV thành công!');
  };

  const openAddModal = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    // Tính tổng doanh thu từ orders của tháng hiện tại nếu có
    const monthOrders = (orders || []).filter(o => o.createdAt && o.createdAt.startsWith(currentMonth));
    const suggestedRev = monthOrders.reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 0);

    setFormData({
      period: currentMonth,
      periodLabel: `Tháng ${currentMonth.split('-')[1]}/${currentMonth.split('-')[0]}`,
      revenue: suggestedRev > 0 ? String(suggestedRev) : '95000000',
      deductibleCosts: '35000000',
      status: 'pending',
      paidDate: '',
      notes: 'Kê khai thuế dịch vụ ăn uống F&B'
    });
    setEditIndex(-1);
    setIsModalOpen(true);
  };

  const openEditModal = (record, index) => {
    setFormData({
      period: record.period,
      periodLabel: record.periodLabel || `Tháng ${record.period}`,
      revenue: String(record.revenue || 0),
      deductibleCosts: String(record.deductibleCosts || 0),
      status: record.status || 'pending',
      paidDate: record.paidDate || '',
      notes: record.notes || ''
    });
    setEditIndex(index);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.period) {
      toast.error('Vui lòng chọn kỳ kê khai!');
      return;
    }

    const rev = parseFloat(formData.revenue) || 0;
    const ded = parseFloat(formData.deductibleCosts) || 0;
    const { vat, pit, totalTax } = calculateFormTax(rev);

    const recordToSave = {
      id: editIndex >= 0 ? taxRecords[editIndex].id : `tx_${Date.now()}`,
      period: formData.period,
      periodLabel: formData.periodLabel || `Tháng ${formData.period.split('-')[1]}/${formData.period.split('-')[0]}`,
      revenue: rev,
      deductibleCosts: ded,
      vatAmount: vat,
      pitAmount: pit,
      totalTax,
      status: formData.status,
      paidDate: formData.status === 'paid' ? (formData.paidDate || new Date().toISOString().slice(0, 10)) : null,
      notes: formData.notes.trim()
    };

    let updatedRecords = [...taxRecords];
    if (editIndex >= 0) {
      updatedRecords[editIndex] = recordToSave;
      toast.success(`Đã cập nhật hồ sơ thuế kỳ ${recordToSave.periodLabel}!`);
    } else {
      updatedRecords = [recordToSave, ...taxRecords];
      toast.success(`Đã thêm mới hồ sơ thuế kỳ ${recordToSave.periodLabel}!`);
    }

    setTaxRecords(updatedRecords);
    saveTaxRecords(updatedRecords);
    setIsModalOpen(false);
  };

  const handleDelete = (index, label) => {
    if (window.confirm(`Xác nhận xóa hồ sơ thuế kỳ "${label}"?`)) {
      const updated = taxRecords.filter((_, i) => i !== index);
      setTaxRecords(updated);
      saveTaxRecords(updated);
      toast.success('Đã xóa hồ sơ thuế!');
    }
  };

  const handleMarkPaid = (index) => {
    const updated = [...taxRecords];
    const today = new Date().toISOString().slice(0, 10);
    updated[index] = {
      ...updated[index],
      status: 'paid',
      paidDate: today
    };
    setTaxRecords(updated);
    saveTaxRecords(updated);
    toast.success(`Đã đánh dấu đã nộp thuế kỳ ${updated[index].periodLabel || updated[index].period} (${today})!`);
  };

  const handleResetDefaultTax = () => {
    if (window.confirm('Khôi phục lại dữ liệu mẫu kê khai thuế ban đầu?')) {
      localStorage.removeItem('kutin_tax_records');
      setTaxRecords(INITIAL_TAX_RECORDS);
      toast.success('Đã khôi phục dữ liệu thuế mẫu!');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-12">
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-[#1a5c2a]">
              <Receipt size={20} />
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1a5c2a] bg-emerald-50 px-2.5 py-0.5 rounded-lg">
              Kế Toán & Pháp Lý 2026
            </span>
          </div>
          <h2 className="font-black text-xl sm:text-2xl lg:text-3xl text-gray-900">
            Kê Khai & Quản Lý Thuế 2026
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Theo dõi nghĩa vụ thuế GTGT (3%) và TNCN (1.5%) theo quy định mới nhất cho hộ kinh doanh quán ăn
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaultTax}
            className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Khôi phục dữ liệu mẫu"
          >
            <RotateCcw size={14} /> Khôi Phục Mẫu
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[#1a5c2a] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Xuất bảng kê khai ra file Excel"
          >
            <ArrowUpRight size={14} /> Xuất Báo Cáo CSV
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#1a5c2a] hover:bg-[#2d7a40] text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} /> Kê Khai Kỳ Mới
          </button>
        </div>
      </div>

      {/* ================= VIETNAM 2026 TAX LAW POLICY CARD ================= */}
      <div className="bg-gradient-to-br from-emerald-900 via-[#1a5c2a] to-emerald-950 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_center,#f5c518_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5c518]/20 border border-[#f5c518]/40 text-[#f5c518] text-xs font-black uppercase tracking-wider">
              <Sparkles size={13} /> Quy Định Thuế Hộ Kinh Doanh Từ 01/01/2026
            </div>
            <h3 className="font-black text-lg sm:text-xl text-white">
              Phương Pháp Tự Kê Khai & Thuế Suất Dịch Vụ Ăn Uống 4.5%
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs text-emerald-100">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                <p className="font-bold text-[#f5c518] text-sm mb-0.5">🟢 Doanh thu ≤ 1 Tỷ / Năm</p>
                <p className="text-emerald-100/80"><b>Miễn hoàn toàn</b> thuế GTGT & thuế TNCN. Chỉ cần duy trì sổ doanh thu Mẫu S1a-HKD.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                <p className="font-bold text-[#f5c518] text-sm mb-0.5">🔴 Doanh thu &gt; 1 Tỷ / Năm</p>
                <p className="text-emerald-100/80">Thuế GTGT: <b>3%</b> + Thuế TNCN: <b>1.5%</b> = <b>Tổng 4.5%</b> trên doanh thu thực tế.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10 sm:col-span-2 lg:col-span-1">
                <p className="font-bold text-[#f5c518] text-sm mb-0.5">⚡ Bỏ Thuế Khoán & Môn Bài</p>
                <p className="text-emerald-100/80">Xóa bỏ thuế khoán & miễn lệ phí môn bài từ 2026. Bắt buộc kê khai điện tử minh bạch.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4 KPI CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Doanh Thu Kê Khai</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black text-gray-900">{formatPrice(kpis.totalRevenue)}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Tổng cộng {taxRecords.length} kỳ</p>
        </div>

        {/* Total Tax */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tổng Nghĩa Vụ Thuế</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#1a5c2a]">{formatPrice(kpis.totalTax)}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Theo thuế suất 4.5%</p>
        </div>

        {/* Total Paid */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Đã Nộp Ngân Sách</p>
            <CheckCircle size={15} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-600">{formatPrice(kpis.totalPaid)}</span>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full">
              Hoàn thành
            </span>
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold mt-1">Đã quyết toán xong</p>
        </div>

        {/* Total Pending / Overdue */}
        <div className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-sm relative overflow-hidden ${
          kpis.totalPending > 0 ? 'bg-amber-50/80 border-amber-200' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Chưa Nộp / Quá Hạn</p>
            {kpis.totalPending > 0 && <AlertTriangle size={15} className="text-amber-600" />}
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xl sm:text-2xl font-black ${kpis.totalPending > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
              {formatPrice(kpis.totalPending)}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              kpis.totalPending > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'
            }`}>
              {kpis.totalPending > 0 ? 'Cần nộp' : 'Không nợ'}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Chờ nộp kho bạc</p>
        </div>
      </div>

      {/* ================= TAX ESTIMATOR TOOL ================= */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="font-black text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <Calculator size={18} className="text-[#1a5c2a]" />
              Máy Tính Dự Toán Thuế 2026
            </h3>
            <p className="text-gray-500 text-xs">
              Nhập mức doanh thu ước tính để kiểm tra xem quán có thuộc diện miễn thuế không
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-gray-400 font-bold">Mẫu nhanh:</span>
            {[
              { label: '80 Tr/tháng', val: '960000000' },
              { label: '100 Tr/tháng', val: '1200000000' },
              { label: '150 Tr/tháng', val: '1800000000' },
              { label: '2.5 Tỷ/năm', val: '2500000000' }
            ].map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => setEstimateRevenue(p.val)}
                className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-5 space-y-2">
            <label className="text-xs font-bold text-gray-700 block">
              Ước tính doanh thu cả năm (VNĐ):
            </label>
            <div className="relative">
              <input
                type="number"
                step="10000000"
                value={estimateRevenue}
                onChange={e => setEstimateRevenue(e.target.value)}
                placeholder="Ví dụ: 1200000000"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-lg font-black text-gray-900 focus:outline-none focus:border-[#1a5c2a]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                VNĐ/năm
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Ngưỡng miễn thuế theo luật 2026: <b>1.000.000.000đ</b> (1 tỷ VNĐ)
            </p>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-7">
            <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              estimateResult.isExempt
                ? 'bg-emerald-50/90 border-emerald-200'
                : 'bg-amber-50/90 border-amber-200'
            }`}>
              <div className="space-y-1">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  estimateResult.isExempt
                    ? 'bg-emerald-200 text-emerald-950'
                    : 'bg-amber-200 text-amber-950'
                }`}>
                  {estimateResult.isExempt ? '✅ Miễn Thuế GTGT & TNCN' : '⚠️ Thuộc Diện Phải Nộp Thuế'}
                </span>

                <p className="text-xs text-gray-600 pt-1">
                  {estimateResult.isExempt ? (
                    <>Doanh thu dưới 1 tỷ/năm: <b>Không phải nộp thuế</b>. Chỉ nộp báo cáo doanh thu định kỳ.</>
                  ) : (
                    <>
                      • Thuế GTGT (3%): <b>{formatPrice(estimateResult.vat)}</b><br />
                      • Thuế TNCN (1.5%): <b>{formatPrice(estimateResult.pit)}</b>
                    </>
                  )}
                </p>
              </div>

              <div className="text-left sm:text-right bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm w-full sm:w-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Tổng Thuế Dự Tính / Năm</p>
                <p className={`text-xl sm:text-2xl font-black mt-0.5 ${
                  estimateResult.isExempt ? 'text-emerald-600' : 'text-amber-700'
                }`}>
                  {estimateResult.isExempt ? '0đ (Miễn thuế)' : formatPrice(estimateResult.total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TAX RECORDS LIST / TABLE ================= */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div>
            <h3 className="font-black text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-[#1a5c2a]" />
              Sổ Bộ Kê Khai Thuế Theo Kỳ ({taxRecords.length})
            </h3>
            <p className="text-gray-500 text-xs">
              Lưu trữ chi tiết các kỳ kê khai, số tiền đã nộp và trạng thái quyết toán
            </p>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#1a5c2a] shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Xem dạng bảng"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'cards' ? 'bg-white text-[#1a5c2a] shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Xem dạng thẻ"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>

        {taxRecords.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Receipt size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="font-bold text-sm">Chưa có hồ sơ kê khai thuế nào</p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-3 px-4 py-2 rounded-xl bg-[#1a5c2a] text-white text-xs font-bold"
            >
              Kê Khai Kỳ Đầu Tiên
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                  <th className="py-3 px-4">Kỳ Kê Khai</th>
                  <th className="py-3 px-3">Doanh Thu</th>
                  <th className="py-3 px-3">Chi Phí Khấu Trừ</th>
                  <th className="py-3 px-3">Thuế GTGT (3%)</th>
                  <th className="py-3 px-3">Thuế TNCN (1.5%)</th>
                  <th className="py-3 px-3">Tổng Thuế (4.5%)</th>
                  <th className="py-3 px-3">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {taxRecords.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-black text-sm text-gray-900 block">
                        {r.periodLabel || `Tháng ${r.period}`}
                      </span>
                      {r.notes && <span className="text-[10px] text-gray-400 block">{r.notes}</span>}
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-900">
                      {formatPrice(r.revenue)}
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {formatPrice(r.deductibleCosts)}
                    </td>
                    <td className="py-3 px-3 text-[#1a5c2a] font-medium">
                      {formatPrice(r.vatAmount)}
                    </td>
                    <td className="py-3 px-3 text-[#1a5c2a] font-medium">
                      {formatPrice(r.pitAmount)}
                    </td>
                    <td className="py-3 px-3 font-black text-base text-[#1a5c2a]">
                      {formatPrice(r.totalTax)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                        r.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status === 'paid' ? '✓ Đã nộp' : r.status === 'overdue' ? 'Quá hạn' : 'Chưa nộp'}
                      </span>
                      {r.paidDate && (
                        <span className="text-[10px] text-gray-400 block mt-0.5 font-medium">
                          Ngày: {r.paidDate}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(idx)}
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#1a5c2a] font-bold text-[11px] flex items-center gap-1"
                            title="Đánh dấu đã nộp thuế"
                          >
                            <Check size={12} strokeWidth={3} /> Đã Nộp
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditModal(r, idx)}
                          className="p-1 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                          title="Sửa hồ sơ"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(idx, r.periodLabel || r.period)}
                          className="p-1 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600"
                          title="Xóa"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARDS VIEW (Great for Mobile) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {taxRecords.map((r, idx) => (
              <div
                key={r.id || idx}
                className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-gray-900">
                      {r.periodLabel || `Tháng ${r.period}`}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      r.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                      r.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status === 'paid' ? 'Đã nộp' : r.status === 'overdue' ? 'Quá hạn' : 'Chưa nộp'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Doanh thu kê khai:</span>
                      <span className="font-bold text-gray-900">{formatPrice(r.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chi phí khấu trừ:</span>
                      <span>{formatPrice(r.deductibleCosts)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-200">
                      <span className="font-bold text-gray-800">Tổng thuế phải nộp:</span>
                      <span className="font-black text-base text-[#1a5c2a]">{formatPrice(r.totalTax)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    {r.paidDate ? `Nộp: ${r.paidDate}` : 'Chưa quyết toán'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {r.status !== 'paid' && (
                      <button
                        type="button"
                        onClick={() => handleMarkPaid(idx)}
                        className="px-2 py-1 rounded-lg bg-emerald-50 text-[#1a5c2a] font-bold text-[11px]"
                      >
                        ✓ Đã Nộp
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditModal(r, idx)}
                      className="p-1 rounded-lg bg-white border text-gray-600"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx, r.periodLabel || r.period)}
                      className="p-1 rounded-lg bg-white border text-gray-600 hover:text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL: KÊ KHAI THUẾ ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-base sm:text-lg text-gray-900 flex items-center gap-2">
                <Receipt size={18} className="text-[#1a5c2a]" />
                {editIndex >= 0 ? 'Cập Nhật Hồ Sơ Kê Khai Thuế' : 'Lập Tờ Khai Thuế Kỳ Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kỳ kê khai (Tháng/Năm) *</label>
                  <input
                    type="month"
                    required
                    value={formData.period}
                    onChange={e => {
                      const p = e.target.value;
                      setFormData({
                        ...formData,
                        period: p,
                        periodLabel: p ? `Tháng ${p.split('-')[1]}/${p.split('-')[0]}` : ''
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Trạng thái nộp thuế</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-700 bg-white focus:outline-none focus:border-[#1a5c2a]"
                  >
                    <option value="pending">🟡 Chưa nộp (Chờ quyết toán)</option>
                    <option value="paid">🟢 Đã nộp vào ngân sách</option>
                    <option value="overdue">🔴 Quá hạn nộp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Doanh thu thực tế trong kỳ (VNĐ) *</label>
                <input
                  type="number"
                  step="100000"
                  required
                  value={formData.revenue}
                  onChange={e => setFormData({ ...formData, revenue: e.target.value })}
                  placeholder="95000000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-base font-black text-gray-900 focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Chi phí hợp lý được khấu trừ (VNĐ)</label>
                <input
                  type="number"
                  step="100000"
                  value={formData.deductibleCosts}
                  onChange={e => setFormData({ ...formData, deductibleCosts: e.target.value })}
                  placeholder="35000000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              {/* Live Tax Auto Calculation */}
              {formData.revenue && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                  <p className="font-bold text-emerald-950 text-xs">Dự tính nghĩa vụ thuế tự động (4.5%):</p>
                  <div className="flex justify-between text-gray-600">
                    <span>• Thuế GTGT (3%):</span>
                    <span className="font-bold">{formatPrice(Math.round((parseFloat(formData.revenue) || 0) * 0.03))}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>• Thuế TNCN (1.5%):</span>
                    <span className="font-bold">{formatPrice(Math.round((parseFloat(formData.revenue) || 0) * 0.015))}</span>
                  </div>
                  <div className="flex justify-between text-[#1a5c2a] font-black text-sm pt-1 border-t border-emerald-200">
                    <span>Tổng Thuế Phải Nộp:</span>
                    <span>{formatPrice(Math.round((parseFloat(formData.revenue) || 0) * 0.045))}</span>
                  </div>
                </div>
              )}

              {formData.status === 'paid' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ngày nộp thuế thực tế</label>
                  <input
                    type="date"
                    value={formData.paidDate || new Date().toISOString().slice(0, 10)}
                    onChange={e => setFormData({ ...formData, paidDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-medium text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Ghi chú kê khai</label>
                <input
                  type="text"
                  placeholder="VD: Kê khai doanh thu dịch vụ ăn uống..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1a5c2a] hover:bg-[#2d7a40] text-white font-black shadow-md transition-all active:scale-95"
                >
                  {editIndex >= 0 ? 'Lưu Thay Đổi' : 'Xác Nhận Kê Khai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
