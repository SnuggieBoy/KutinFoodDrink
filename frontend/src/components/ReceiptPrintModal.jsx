import { useRef } from 'react'
import { Printer, X, Download } from 'lucide-react'
import { formatPrice } from '../data/menuData'

export default function ReceiptPrintModal({ isOpen, onClose, order }) {
  const receiptRef = useRef(null)

  if (!isOpen || !order) return null

  const handlePrint = () => {
    window.print()
  }

  const currentDate = new Date().toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Modal Controls (Not printed) */}
        <div className="print:hidden bg-[#1a5c2a] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer size={20} className="text-[#f5c518]" />
            <h3 className="font-bold text-sm">Hóa Đơn Bán Hàng (K80)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#f5c518] text-[#1a5c2a] px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-[#fdd835] transition-colors shadow-sm"
            >
              <Printer size={14} /> In Bill
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Receipt Content Container */}
        <div className="p-6 overflow-y-auto bg-gray-50 flex justify-center">
          {/* Printable K80 thermal bill */}
          <div
            ref={receiptRef}
            id="thermal-receipt"
            className="w-full max-w-[340px] bg-white p-6 shadow-sm border border-gray-200 text-gray-900 font-mono text-xs leading-relaxed print:shadow-none print:border-none print:p-0 print:m-0 print:w-full"
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-gray-400">
              <h2 className="text-base font-black tracking-wider uppercase">KUTIN FOOD & DRINK</h2>
              <p className="text-[10px] text-gray-600 uppercase font-semibold">Ăn Vặt · Mì Cay · Tokpokki · Gà Xù</p>
              <p className="text-[10px] text-gray-600 mt-1">1 Ngô Sĩ Liên, KP2, Hố Nai, Đồng Nai</p>
              <p className="text-[10px] text-gray-600">Hotline: 0947 007 881</p>
              <div className="my-2 border-t border-dashed border-gray-300"></div>
              <h3 className="text-xs font-black uppercase">PHIẾU THANH TOÁN</h3>
              <p className="text-[10px] text-gray-500">Mã đơn: <span className="font-bold text-black">#{order.orderNumber}</span></p>
            </div>

            {/* Metadata */}
            <div className="py-2.5 border-b border-dashed border-gray-400 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span>Ngày in:</span>
                <span>{currentDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Khu vực / Bàn:</span>
                <span className="font-bold uppercase">{order.tableName || (order.orderType === 'delivery' ? 'Giao hàng ship' : 'Khách mang về')}</span>
              </div>
              <div className="flex justify-between">
                <span>Thu ngân:</span>
                <span>Thu ngân 01</span>
              </div>
              {order.customer?.name && (
                <div className="flex justify-between">
                  <span>Khách hàng:</span>
                  <span className="font-semibold">{order.customer.name} {order.customer.phone ? `(${order.customer.phone})` : ''}</span>
                </div>
              )}
            </div>

            {/* Table Items */}
            <div className="py-3 border-b border-dashed border-gray-400">
              <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-gray-300">
                <span className="w-1/2">Tên món</span>
                <span className="w-12 text-center">SL</span>
                <span className="w-16 text-right">Đ.Giá</span>
                <span className="w-16 text-right">T.Tiền</span>
              </div>

              <div className="divide-y divide-gray-100 text-[10px] pt-1">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="py-1.5">
                    <div className="flex justify-between font-semibold">
                      <span className="w-1/2 break-words">{item.name}</span>
                      <span className="w-12 text-center">{item.qty}</span>
                      <span className="w-16 text-right">{formatPrice(item.price)}</span>
                      <span className="w-16 text-right font-bold">{formatPrice(item.price * item.qty)}</span>
                    </div>
                    {/* Item modifiers/notes */}
                    {(item.spicyLevel !== undefined || item.topping || item.note) && (
                      <div className="text-[9px] text-gray-500 pl-1">
                        {item.spicyLevel !== undefined && <span>• Cấp cay: {item.spicyLevel} </span>}
                        {item.topping && <span>• Topping: {item.topping} </span>}
                        {item.note && <span>• {item.note}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Financials */}
            <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span>Tiền món ăn:</span>
                <span className="font-semibold">{formatPrice(order.totalAmount || order.grandTotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Giảm giá khuyến mãi:</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              {order.shippingFee > 0 && (
                <div className="flex justify-between">
                  <span>Phí giao hàng:</span>
                  <span>{formatPrice(order.shippingFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black pt-1 border-t border-gray-200">
                <span>TỔNG CỘNG:</span>
                <span className="text-black text-sm">{formatPrice(order.grandTotal || order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-600 pt-1">
                <span>Hình thức thanh toán:</span>
                <span className="font-bold uppercase">
                  {order.paymentMethod === 'sepay' || order.paymentMethod === 'transfer' ? 'Chuyển khoản VietQR SePay' : 'Tiền mặt (Cash)'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-3 space-y-1">
              <p className="font-bold text-[10px]">KUTIN CẢM ƠN QUÝ KHÁCH!</p>
              <p className="text-[9px] text-gray-500 italic">Chúc Quý Khách ngon miệng - Hẹn gặp lại!</p>
              <p className="text-[8px] text-gray-400 font-sans mt-2">Phần mềm quản lý KUTIN POS • SePay Pay</p>
            </div>
          </div>
        </div>

        {/* Modal Footer (Not printed) */}
        <div className="print:hidden bg-gray-100 p-3 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="bg-[#1a5c2a] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-[#2d7a40] transition-colors shadow-sm"
          >
            <Printer size={14} /> In Phiếu Hóa Đơn
          </button>
        </div>
      </div>
    </div>
  )
}
