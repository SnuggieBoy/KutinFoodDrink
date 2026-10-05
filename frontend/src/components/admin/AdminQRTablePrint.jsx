import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Printer, QrCode, Settings, CheckSquare, Square, 
  ExternalLink, Copy, Check, Sparkles, Wifi, Phone, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminQRTablePrint({ storeInfo, tableCount = 12 }) {
  const [numTables, setNumTables] = useState(tableCount);
  const [selectedTables, setSelectedTables] = useState(
    Array.from({ length: tableCount }, (_, i) => i + 1)
  );
  const [copiedTable, setCopiedTable] = useState(null);

  const handleNumTablesChange = (val) => {
    let num = parseInt(val);
    if (isNaN(num) || num < 1) num = 1;
    if (num > 100) num = 100;
    setNumTables(num);
    
    // Giữ lại các bàn đã chọn nằm trong khoảng mới
    const newSelected = selectedTables.filter(t => t <= num);
    if (newSelected.length === 0) {
      setSelectedTables(Array.from({ length: num }, (_, i) => i + 1));
    } else {
      setSelectedTables(newSelected);
    }
  };

  const toggleTableSelection = (tableNum) => {
    if (selectedTables.includes(tableNum)) {
      setSelectedTables(selectedTables.filter(t => t !== tableNum));
    } else {
      setSelectedTables([...selectedTables, tableNum].sort((a, b) => a - b));
    }
  };

  const selectAll = () => {
    setSelectedTables(Array.from({ length: numTables }, (_, i) => i + 1));
  };

  const deselectAll = () => {
    setSelectedTables([]);
  };

  const selectRange = (start, end) => {
    const range = [];
    for (let i = start; i <= Math.min(end, numTables); i++) {
      range.push(i);
    }
    setSelectedTables(range);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = (tableNum) => {
    const url = `https://kutin-food-drink.vercel.app/order?table=${tableNum}`;
    navigator.clipboard?.writeText(url);
    setCopiedTable(tableNum);
    toast.success(`Đã sao chép link đặt món Bàn ${tableNum}!`);
    setTimeout(() => setCopiedTable(null), 2000);
  };

  const restaurantName = storeInfo?.name || 'KUTIN FOOD & DRINK';
  const hotline = storeInfo?.hotline || '0947 007 881';
  const wifiPass = storeInfo?.wifi || 'kutin2024';

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-10">
      {/* ================= PRINT STYLES ================= */}
      <style>
        {`
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            body * {
              visibility: hidden;
            }
            .qr-print-area, .qr-print-area * {
              visibility: visible;
            }
            .qr-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              display: grid !important;
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 12mm !important;
              padding: 6mm !important;
            }
            .print-card-wrapper {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 0 !important;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
          }
        `}
      </style>

      {/* ================= HEADER SECTION ================= */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-[#1a5c2a]">
              <QrCode size={20} />
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1a5c2a] bg-emerald-50 px-2.5 py-0.5 rounded-lg">
              Bộ Nhận Diện Gọi Món
            </span>
          </div>
          <h2 className="font-black text-xl sm:text-2xl lg:text-3xl text-gray-900">
            In Mã QR Đặt Món Theo Bàn
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-2xl">
            Tạo thẻ QR chuẩn kích thước A6 dán lên bàn ăn. Khách quét camera là tự động mở web với đúng số bàn, không cần gọi nhân viên!
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto w-full md:w-auto">
          <button
            type="button"
            onClick={handlePrint}
            disabled={selectedTables.length === 0}
            className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-[#1a5c2a] hover:bg-[#2d7a40] text-[#f5c518] text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer size={18} />
            In {selectedTables.length} Thẻ QR (A4)
          </button>
        </div>
      </div>

      {/* ================= CONTROLS & SETTINGS ================= */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          {/* Quick numbers */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-gray-700">Quy mô quán:</span>
            {[6, 12, 16, 20, 24].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleNumTablesChange(n)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  numTables === n
                    ? 'bg-[#1a5c2a] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {n} Bàn
              </button>
            ))}

            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-xs text-gray-500">Tùy chỉnh:</span>
              <input
                type="number"
                min="1"
                max="100"
                value={numTables}
                onChange={(e) => handleNumTablesChange(e.target.value)}
                className="w-16 px-2.5 py-1 text-xs font-bold text-center border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a5c2a]"
              />
            </div>
          </div>

          {/* Quick select buttons */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-gray-500">Chọn in:</span>
            <button
              type="button"
              onClick={selectAll}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#1a5c2a] hover:bg-emerald-100 font-bold transition-colors"
            >
              Chọn Tất Cả ({numTables})
            </button>
            {numTables >= 12 && (
              <>
                <button
                  type="button"
                  onClick={() => selectRange(1, 6)}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
                >
                  Bàn 1-6
                </button>
                <button
                  type="button"
                  onClick={() => selectRange(7, 12)}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
                >
                  Bàn 7-12
                </button>
              </>
            )}
            <button
              type="button"
              onClick={deselectAll}
              className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold transition-colors"
            >
              Bỏ Chọn
            </button>
          </div>
        </div>

        {/* Table Selector Pills Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-600">
              Danh sách bàn ({selectedTables.length} đã chọn):
            </p>
            <span className="text-[11px] text-gray-400">
              💡 Bấm vào số bàn để bật/tắt in
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: numTables }, (_, i) => i + 1).map((tableNum) => {
              const isSelected = selectedTables.includes(tableNum);
              return (
                <button
                  key={tableNum}
                  type="button"
                  onClick={() => toggleTableSelection(tableNum)}
                  className={`min-w-[48px] h-11 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 active:scale-95 ${
                    isSelected
                      ? 'bg-[#1a5c2a] text-[#f5c518] shadow-sm ring-2 ring-[#1a5c2a]/20'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {tableNum < 10 ? `0${tableNum}` : tableNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Printing Notice Card */}
        <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
          <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <b>Mẹo in ấn:</b> Chọn máy in ở khổ giấy <b>A4</b>, hướng <b>Dọc (Portrait)</b>, tỉ lệ <b>100% (Default)</b>. Hệ thống tự động dàn <b>4 thẻ / 1 trang A4</b> với viền nét đứt tiện lợi để dùng kéo cắt và ép nhựa bảo vệ.
          </p>
        </div>
      </div>

      {/* ================= PREVIEW & PRINT CARDS GRID ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-base sm:text-lg text-gray-900 flex items-center gap-2">
            <span>Khung Xem Trước Trực Tiếp</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {selectedTables.length} Thẻ Sẵn Sàng
            </span>
          </h3>
          <span className="text-xs text-gray-400 hidden sm:inline">
            Khổ chuẩn A6 (105 × 148 mm)
          </span>
        </div>

        {selectedTables.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 space-y-3">
            <QrCode size={48} className="mx-auto text-gray-300" />
            <p className="font-bold text-gray-500 text-sm">Chưa có bàn nào được chọn để in</p>
            <button
              type="button"
              onClick={selectAll}
              className="px-4 py-2 rounded-xl bg-[#1a5c2a] text-[#f5c518] font-bold text-xs"
            >
              Chọn Tất Cả {numTables} Bàn
            </button>
          </div>
        ) : (
          <div className="qr-print-area grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {selectedTables.map((tableNum) => {
              const tableUrl = `https://kutin-food-drink.vercel.app/order?table=${tableNum}`;
              const isCopied = copiedTable === tableNum;

              return (
                <div key={tableNum} className="print-card-wrapper">
                  {/* Outer Cutting Guide (Dotted Border) */}
                  <div className="bg-white p-2.5 rounded-3xl border-2 border-dashed border-gray-300 shadow-sm hover:shadow-md transition-shadow relative group">
                    {/* Inner Restaurant Stand Card */}
                    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white flex flex-col justify-between aspect-[3/4.2]">
                      
                      {/* Card Header (Gold Banner) */}
                      <div className="bg-gradient-to-r from-[#1a5c2a] via-[#236e35] to-[#1a5c2a] text-white p-3 text-center border-b border-[#155325]">
                        <div className="inline-flex items-center gap-1 bg-[#f5c518] text-[#1a5c2a] px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-1">
                          <Sparkles size={10} /> Đặt Món Trực Tiếp
                        </div>
                        <h4 className="font-black text-sm tracking-wider uppercase text-[#f5c518]">
                          {restaurantName}
                        </h4>
                        <p className="text-[10px] text-emerald-100/90 font-medium tracking-wide">
                          Ăn Vặt • Mì Cay • Tokpokki
                        </p>
                      </div>

                      {/* Card Body: QR Code & Table Number */}
                      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-[#fdf8f0]">
                        {/* QR Code Container */}
                        <div className="bg-white p-3 rounded-2xl shadow-md border-2 border-[#1a5c2a]/15 relative">
                          <QRCodeSVG
                            value={tableUrl}
                            size={140}
                            bgColor="#ffffff"
                            fgColor="#0a2f14"
                            level="H"
                            imageSettings={{
                              src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f5c518'/%3E%3Ctext x='50' y='68' font-family='Arial' font-size='52' font-weight='900' fill='%231a5c2a' text-anchor='middle'%3EK%3C/text%3E%3C/svg%3E",
                              height: 32,
                              width: 32,
                              excavate: true,
                            }}
                          />
                        </div>

                        {/* Table Number Title */}
                        <div className="text-center mt-3">
                          <div className="inline-block bg-[#1a5c2a] text-[#f5c518] px-4 py-1 rounded-xl shadow-sm">
                            <span className="text-xl sm:text-2xl font-black tracking-wider">
                              BÀN {tableNum < 10 ? `0${tableNum}` : tableNum}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-gray-700 mt-1.5">
                            Quét camera để gọi món
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Đơn tự động chuyển đến Bếp & POS
                          </p>
                        </div>
                      </div>

                      {/* Card Footer Info */}
                      <div className="bg-gray-50 border-t border-gray-100 px-3 py-2 text-[10px] text-gray-600 flex items-center justify-between">
                        <span className="flex items-center gap-1 font-medium">
                          <Wifi size={11} className="text-[#1a5c2a]" /> Wi-Fi: <b>{wifiPass}</b>
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Phone size={11} className="text-[#1a5c2a]" /> <b>{hotline}</b>
                        </span>
                      </div>
                    </div>

                    {/* Hover Quick Action Buttons (No-print) */}
                    <div className="no-print mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(tableNum)}
                        className="text-[11px] font-bold text-gray-600 hover:text-[#1a5c2a] flex items-center gap-1 transition-colors"
                      >
                        {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        {isCopied ? 'Đã chép link' : 'Chép link'}
                      </button>

                      <a
                        href={tableUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-[#1a5c2a] hover:underline flex items-center gap-0.5"
                      >
                        Thử nghiệm <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
