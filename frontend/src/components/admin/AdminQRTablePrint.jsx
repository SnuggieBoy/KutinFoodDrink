import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, QrCode, Settings, CheckSquare, Square } from 'lucide-react';

export default function AdminQRTablePrint({ storeInfo, tableCount = 12 }) {
  const [numTables, setNumTables] = useState(tableCount);
  const [selectedTables, setSelectedTables] = useState(
    Array.from({ length: tableCount }, (_, i) => i + 1)
  );
  
  const handleNumTablesChange = (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 100) val = 100;
    setNumTables(val);
    
    // Update selected tables
    const newSelected = [];
    for (let i = 1; i <= val; i++) {
      if (selectedTables.includes(i) || selectedTables.length === numTables) {
        newSelected.push(i);
      }
    }
    if (newSelected.length === 0) newSelected.push(1);
    setSelectedTables(newSelected);
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Print Styles */}
      <style>
        {`
          @media print {
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
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              padding: 0;
            }
            .print-card-wrapper {
              page-break-inside: avoid;
              margin-bottom: 20px;
            }
            @page {
              size: A4 portrait;
              margin: 1.5cm;
            }
          }
        `}
      </style>

      {/* Screen Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1a5c2a] flex items-center gap-2">
            <QrCode className="w-8 h-8" />
            In Mã QR Đặt Món Cho Bàn
          </h2>
          <p className="text-gray-500 mt-1">
            Tạo và in thẻ QR code cho từng bàn. Khách hàng quét mã để xem thực đơn và gọi món.
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handlePrint}
            disabled={selectedTables.length === 0}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1a5c2a] hover:bg-[#154a22] text-white px-6 py-3 rounded-2xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-5 h-5" />
            In {selectedTables.length} Thẻ
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#1a5c2a]" />
          Cài Đặt In
        </h3>
        
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex items-center gap-3">
            <label className="font-medium text-gray-700">Tổng số bàn:</label>
            <input 
              type="number" 
              min="1" 
              max="100" 
              value={numTables} 
              onChange={handleNumTablesChange}
              className="w-24 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
            />
          </div>
          
          <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
          
          <div className="flex gap-3">
            <button 
              onClick={selectAll}
              className="text-sm font-medium text-[#1a5c2a] hover:underline"
            >
              Chọn tất cả
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={deselectAll}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>

        {/* Table selector grid */}
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-3">Chọn các bàn cần in ({selectedTables.length}/{numTables}):</p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: numTables }, (_, i) => i + 1).map(tableNum => {
              const isSelected = selectedTables.includes(tableNum);
              return (
                <button
                  key={tableNum}
                  onClick={() => toggleTableSelection(tableNum)}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg transition-colors border-2 ${
                    isSelected 
                      ? 'bg-[#1a5c2a] border-[#1a5c2a] text-white' 
                      : 'bg-white border-gray-200 text-gray-500 hover:border-[#1a5c2a] hover:text-[#1a5c2a]'
                  }`}
                >
                  {tableNum}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preview & Print Area */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Xem Trước ({selectedTables.length} Thẻ)</h3>
        
        {selectedTables.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300 text-gray-500">
            Chưa có bàn nào được chọn để in.
          </div>
        ) : (
          <div className="qr-print-area grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {selectedTables.map((tableNum) => {
              const tableUrl = `https://kutin-food-drink.vercel.app/order?table=${tableNum}`;
              
              return (
                <div key={tableNum} className="print-card-wrapper">
                  <div className="border-[3px] border-dashed border-gray-300 rounded-3xl p-[2px] bg-white w-full max-w-[320px] mx-auto aspect-[3/4] flex flex-col relative overflow-hidden">
                    {/* Inner solid border */}
                    <div className="border border-gray-200 rounded-[22px] flex-1 flex flex-col overflow-hidden bg-white">
                      
                      {/* Top Header */}
                      <div className="bg-gradient-to-r from-[#f5c518] to-[#fbbf24] p-4 text-center">
                        <h2 className="font-black text-xl text-[#1a5c2a] tracking-wider uppercase">
                          {storeInfo?.name || 'KUTIN FOOD & DRINK'}
                        </h2>
                      </div>
                      
                      {/* Center Content */}
                      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
                        <div className="bg-white p-3 rounded-2xl shadow-[0_0_15px_rgba(26,92,42,0.1)] border-2 border-[#1a5c2a]/10">
                          <QRCodeSVG
                            value={tableUrl}
                            size={160}
                            bgColor={"#ffffff"}
                            fgColor={"#1a5c2a"}
                            level={"H"}
                            imageSettings={{
                              src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f5c518'/%3E%3Ctext x='50' y='68' font-family='Arial' font-size='50' font-weight='bold' fill='%231a5c2a' text-anchor='middle'%3EK%3C/text%3E%3C/svg%3E",
                              x: undefined,
                              y: undefined,
                              height: 36,
                              width: 36,
                              excavate: true,
                            }}
                          />
                        </div>
                        
                        <div className="text-center">
                          <h1 className="text-4xl font-black text-[#1a5c2a]">
                            BÀN {tableNum < 10 ? `0${tableNum}` : tableNum}
                          </h1>
                          <p className="text-gray-600 font-medium mt-2">
                            Quét mã để gọi món tại bàn
                          </p>
                        </div>
                      </div>
                      
                      {/* Bottom Footer */}
                      <div className="bg-[#1a5c2a] text-white text-center p-3 text-sm font-medium">
                        Hotline hỗ trợ: {storeInfo?.hotline || '0909.999.999'}
                      </div>
                      
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
