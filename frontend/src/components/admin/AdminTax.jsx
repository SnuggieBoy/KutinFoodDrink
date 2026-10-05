import React, { useState, useMemo } from 'react';
import { 
  AlertCircle, DollarSign, Calculator, Plus, Edit2, Trash2, 
  CheckCircle, FileText, Download, X, Info, AlertTriangle, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  TAX_CONFIG, TAX_PERIODS, saveTaxRecords, calculateTax, getTaxSummary 
} from '../../data/taxData';

const formatPrice = (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + 'đ';

export default function AdminTax({ taxRecords, setTaxRecords, orders }) {
  const [estimateRevenue, setEstimateRevenue] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [formData, setFormData] = useState({
    period: '',
    revenue: 0,
    deductibleCosts: 0,
    status: 'pending',
    paidDate: '',
    notes: ''
  });

  const kpis = useMemo(() => {
    let totalRevenue = 0;
    let totalTax = 0;
    let totalPaid = 0;
    let totalPending = 0;

    taxRecords.forEach(r => {
      totalRevenue += Number(r.revenue) || 0;
      totalTax += Number(r.totalTax) || 0;
      if (r.status === 'paid') {
        totalPaid += Number(r.totalTax) || 0;
      } else {
        totalPending += Number(r.totalTax) || 0;
      }
    });

    return { totalRevenue, totalTax, totalPaid, totalPending };
  }, [taxRecords]);

  const estimateResult = useMemo(() => {
    const rev = Number(estimateRevenue) || 0;
    const isExempt = rev <= 1000000000;
    const vat = isExempt ? 0 : rev * 0.03;
    const pit = isExempt ? 0 : rev * 0.015;
    return { isExempt, vat, pit, total: vat + pit, rev };
  }, [estimateRevenue]);

  const calculateFormTax = (rev) => {
    const isExempt = rev <= 1000000000;
    const vat = isExempt ? 0 : rev * 0.03;
    const pit = isExempt ? 0 : rev * 0.015;
    return { vat, pit, totalTax: vat + pit };
  };

  const handleExportCSV = () => {
    if (taxRecords.length === 0) {
      toast.error('Không có dữ liệu để xuất');
      return;
    }

    const headers = ['Kỳ thuế', 'Doanh thu', 'Chi phí khấu trừ', 'Thuế GTGT', 'Thuế TNCN', 'Tổng thuế', 'Trạng thái', 'Ngày nộp', 'Ghi chú'];
    const rows = taxRecords.map(r => [
      r.period || '',
      r.revenue || 0,
      r.deductibleCosts || 0,
      r.vat || 0,
      r.pit || 0,
      r.totalTax || 0,
      r.status === 'paid' ? 'Đã nộp' : (r.status === 'overdue' ? 'Quá hạn' : 'Chưa nộp'),
      r.paidDate || '',
      r.notes || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(',') + '\n' 
      + rows.map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bao_cao_thue_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã xuất báo cáo thuế');
  };

  const openAddModal = () => {
    // Try to suggest revenue from orders for current month if possible
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(currentMonth));
    const suggestedRev = monthOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    setFormData({
      period: currentMonth,
      revenue: suggestedRev,
      deductibleCosts: 0,
      status: 'pending',
      paidDate: '',
      notes: ''
    });
    setEditIndex(-1);
    setIsModalOpen(true);
  };

  const openEditModal = (record, index) => {
    setFormData({ ...record });
    setEditIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.period) {
      toast.error('Vui lòng chọn kỳ thuế');
      return;
    }

    const rev = Number(formData.revenue) || 0;
    const { vat, pit, totalTax } = calculateFormTax(rev);

    const recordToSave = {
      ...formData,
      revenue: rev,
      deductibleCosts: Number(formData.deductibleCosts) || 0,
      vat,
      pit,
      totalTax,
      updatedAt: new Date().toISOString()
    };

    let updatedRecords = [...taxRecords];
    if (editIndex >= 0) {
      updatedRecords[editIndex] = { ...updatedRecords[editIndex], ...recordToSave };
      toast.success('Đã cập nhật hồ sơ thuế');
    } else {
      recordToSave.id = Date.now().toString();
      recordToSave.createdAt = new Date().toISOString();
      updatedRecords.push(recordToSave);
      toast.success('Đã thêm hồ sơ thuế mới');
    }

    setTaxRecords(updatedRecords);
    saveTaxRecords(updatedRecords);
    closeModal();
  };

  const handleDelete = (index) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ thuế này?')) {
      const updatedRecords = [...taxRecords];
      updatedRecords.splice(index, 1);
      setTaxRecords(updatedRecords);
      saveTaxRecords(updatedRecords);
      toast.success('Đã xóa hồ sơ thuế');
    }
  };

  const handleMarkPaid = (index) => {
    const updatedRecords = [...taxRecords];
    updatedRecords[index] = {
      ...updatedRecords[index],
      status: 'paid',
      paidDate: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString()
    };
    setTaxRecords(updatedRecords);
    saveTaxRecords(updatedRecords);
    toast.success('Đã đánh dấu là đã nộp');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Info Banner */}
      <div className="bg-[#1a5c2a]/10 border-l-4 border-[#1a5c2a] p-4 rounded-r-2xl">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-[#1a5c2a] flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-black text-lg text-[#1a5c2a] mb-2">QUY ĐỊNH THUẾ HỘ KINH DOANH (TỪ NĂM 2026)</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Doanh thu ≤ 1 tỷ VNĐ/năm: <strong>MIỄN THUẾ</strong>.</li>
              <li>Doanh thu &gt; 1 tỷ VNĐ/năm: <strong>Thuế GTGT 3% + Thuế TNCN 1.5% = Tổng 4.5%</strong>.</li>
              <li>Đã bãi bỏ lệ phí môn bài từ năm 2026.</li>
              <li>Phương pháp áp dụng: Tự kê khai & nộp thuế.</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2 italic">* Thông tin mang tính chất tham khảo. Vui lòng liên hệ cơ quan thuế địa phương để xác nhận chính xác nhất.</p>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng Doanh Thu Kê Khai</p>
            <p className="text-xl font-black text-gray-900">{formatPrice(kpis.totalRevenue)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng Thuế Phải Nộp</p>
            <p className="text-xl font-black text-gray-900">{formatPrice(kpis.totalTax)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Đã Nộp</p>
            <p className="text-xl font-black text-green-600">{formatPrice(kpis.totalPaid)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Chưa Nộp / Quá Hạn</p>
            <p className="text-xl font-black text-red-600">{formatPrice(kpis.totalPending)}</p>
          </div>
        </div>
      </div>

      {/* 3. Revenue Estimator Tool */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#f5c518]" />
          CÔNG CỤ ƯỚC TÍNH THUẾ
        </h3>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ước tính doanh thu năm (VNĐ)</label>
            <input 
              type="number" 
              value={estimateRevenue}
              onChange={(e) => setEstimateRevenue(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a] transition-shadow text-lg font-bold"
              placeholder="Ví dụ: 1500000000"
            />
          </div>
          <div className="w-full md:w-2/3">
            {estimateRevenue ? (
              <div className={`p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border ${estimateResult.isExempt ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div>
                  <p className="font-bold text-gray-900 mb-1">
                    Trạng thái: <span className={estimateResult.isExempt ? 'text-green-600' : 'text-red-600'}>
                      {estimateResult.isExempt ? 'MIỄN THUẾ' : 'PHẢI NỘP THUẾ'}
                    </span>
                  </p>
                  {!estimateResult.isExempt && (
                    <div className="text-sm text-gray-600 space-y-1 mt-2">
                      <p>Thuế GTGT (3%): <span className="font-medium text-gray-900">{formatPrice(estimateResult.vat)}</span></p>
                      <p>Thuế TNCN (1.5%): <span className="font-medium text-gray-900">{formatPrice(estimateResult.pit)}</span></p>
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-right bg-white py-3 px-6 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-500 font-medium mb-1">Tổng Thuế Ước Tính</p>
                  <p className={`text-2xl font-black ${estimateResult.isExempt ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPrice(estimateResult.total)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center text-gray-500 text-sm">
                Nhập doanh thu ước tính để xem kết quả tính thuế
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Tax Records Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1a5c2a]" />
            HỒ SƠ KÊ KHAI THUẾ
          </h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất Báo Cáo</span>
            </button>
            <button 
              onClick={openAddModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#1a5c2a] text-white font-bold rounded-xl hover:bg-[#1a5c2a]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Kê Khai Mới
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-3 px-4 text-sm font-bold text-gray-500">Kỳ Thuế</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-500">Doanh Thu</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-500">Chi Phí Khấu Trừ</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-500">Tổng Thuế (4.5%)</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-500">Trạng Thái</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-500">Ngày Nộp</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-500 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {taxRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">Chưa có hồ sơ thuế nào</td>
                </tr>
              ) : (
                taxRecords.map((record, idx) => (
                  <tr key={record.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {record.period}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{formatPrice(record.revenue)}</td>
                    <td className="py-3 px-4 text-gray-600">{formatPrice(record.deductibleCosts)}</td>
                    <td className="py-3 px-4 font-bold text-[#1a5c2a]">{formatPrice(record.totalTax)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        record.status === 'paid' ? 'bg-green-100 text-green-700' :
                        record.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {record.status === 'paid' ? 'Đã nộp' : record.status === 'overdue' ? 'Quá hạn' : 'Chưa nộp'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {record.status === 'paid' && record.paidDate ? record.paidDate : '-'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {record.status !== 'paid' && (
                        <button 
                          onClick={() => handleMarkPaid(idx)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Đánh dấu đã nộp"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => openEditModal(record, idx)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-black text-gray-900">
                {editIndex >= 0 ? 'Cập Nhật Hồ Sơ Thuế' : 'Kê Khai Thuế Mới'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ Thuế (Tháng/Năm)</label>
                  <input 
                    type="month" 
                    value={formData.period}
                    onChange={(e) => setFormData({...formData, period: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                  >
                    <option value="pending">Chưa nộp</option>
                    <option value="paid">Đã nộp</option>
                    <option value="overdue">Quá hạn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doanh Thu Kê Khai (VNĐ)</label>
                <input 
                  type="number" 
                  value={formData.revenue}
                  onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chi Phí Khấu Trừ (Nếu Có)</label>
                <input 
                  type="number" 
                  value={formData.deductibleCosts}
                  onChange={(e) => setFormData({...formData, deductibleCosts: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                />
              </div>

              {formData.status === 'paid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Nộp</label>
                  <input 
                    type="date" 
                    value={formData.paidDate}
                    onChange={(e) => setFormData({...formData, paidDate: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                    required={formData.status === 'paid'}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a] resize-none"
                  rows="2"
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-4">
                <p className="text-sm text-gray-500 font-medium mb-2">Tự Động Tính Thuế:</p>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-600">Thuế GTGT (3%):</span>
                  <span className="font-bold">{formatPrice(calculateFormTax(Number(formData.revenue)).vat)}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">Thuế TNCN (1.5%):</span>
                  <span className="font-bold">{formatPrice(calculateFormTax(Number(formData.revenue)).pit)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Tổng Thuế Phải Nộp:</span>
                  <span className="font-black text-lg text-[#1a5c2a]">{formatPrice(calculateFormTax(Number(formData.revenue)).totalTax)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-[#1a5c2a] bg-[#f5c518] hover:bg-[#f5c518]/90 transition-colors"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
