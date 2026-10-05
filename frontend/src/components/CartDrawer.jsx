import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice, categoryImages } from '../data/menuData'
import { useRestaurant } from '../context/RestaurantContext'

export default function CartDrawer({ open, onClose }) {
  const { storeInfo } = useRestaurant()
  const { items, totalAmount, updateQty, removeItem, clearCart } = useCart()
  const drawerRef = useRef(null)

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const buildWhatsAppMessage = () => {
    const lines = items.map(i => `- ${i.name} x${i.qty} = ${formatPrice(i.price * i.qty)}${i.note ? ` (${i.note})` : ''}`)
    const storeName = storeInfo?.name || 'KUTIN Food & Drink'
    const msg = `🍜 *Đặt món ${storeName}*\n\n${lines.join('\n')}\n\n💰 *Tổng: ${formatPrice(totalAmount)}*\n\nXin vui lòng xác nhận đơn hàng!`
    const zaloPhone = (storeInfo?.zalo || storeInfo?.hotline || '0947007881').replace(/\s+/g, '')
    return `https://zalo.me/${zaloPhone}?text=${encodeURIComponent(msg)}`
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } bg-black/50`}
        onClick={handleBackdropClick}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] z-50 bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-[#1a5c2a] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <h2 className="font-bold text-lg">Giỏ Hàng</h2>
            {items.length > 0 && (
              <span className="bg-[#f5c518] text-[#1a5c2a] text-xs font-black px-2 py-0.5 rounded-full">
                {items.length} món
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:text-[#f5c518] transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <ShoppingBag size={64} strokeWidth={1} />
              <p className="font-semibold text-lg">Giỏ hàng trống</p>
              <p className="text-sm text-center">Hãy thêm món ngon vào giỏ hàng của bạn!</p>
              <button
                onClick={onClose}
                className="bg-[#1a5c2a] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#2d7a40] transition-colors"
              >
                Xem Menu
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-start gap-3">
                <img
                  src={item.image || categoryImages[item.category] || categoryImages.default}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover object-center flex-shrink-0 border border-gray-200 bg-white shadow-xs"
                  onError={(e) => { e.currentTarget.src = categoryImages[item.category] || categoryImages.default }}
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 leading-tight line-clamp-1">{item.name}</p>
                      <p className="text-[#1a5c2a] font-black text-xs sm:text-sm mt-0.5 tabular-nums">{formatPrice(item.price)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Ghi chú (không cay, ít đá...)"
                    defaultValue={item.note || ''}
                    onChange={e => {
                      clearTimeout(item._noteTimer)
                      item._noteTimer = setTimeout(() => updateQty(item.id, item.qty), 0)
                    }}
                    className="mt-1.5 w-full text-[11px] border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:border-[#1a5c2a] bg-white"
                  />
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-200/60">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-6 h-6 rounded-full border border-[#1a5c2a] text-[#1a5c2a] flex items-center justify-center hover:bg-[#1a5c2a] hover:text-white transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center font-bold text-xs">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-6 h-6 rounded-full bg-[#1a5c2a] text-white flex items-center justify-center hover:bg-[#2d7a40] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="font-black text-xs sm:text-sm text-[#1a5c2a] tabular-nums">{formatPrice(item.price * item.qty)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-600">Tổng cộng:</span>
              <span className="text-2xl font-black text-[#1a5c2a]">{formatPrice(totalAmount)}</span>
            </div>

            <Link
              to="/order"
              onClick={onClose}
              className="block w-full bg-[#1a5c2a] text-white py-3 rounded-xl font-bold text-center hover:bg-[#2d7a40] transition-colors"
            >
              🛍️ Tiến Hành Đặt Hàng
            </Link>

            <a
              href={buildWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#f5c518] text-[#1a5c2a] py-3 rounded-xl font-bold hover:bg-[#fdd835] transition-colors"
            >
              <MessageCircle size={18} />
              Đặt qua Zalo
            </a>

            <button
              onClick={clearCart}
              className="w-full text-gray-400 text-sm hover:text-red-500 transition-colors py-1"
            >
              Xóa giỏ hàng
            </button>
          </div>
        )}
      </div>
    </>
  )
}
