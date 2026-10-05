import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag, MapPin, Phone, User, MessageSquare, CreditCard, Bike, Store, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MenuCard from '../components/MenuCard'
import SepayQRModal from '../components/SepayQRModal'
import { useCart } from '../context/CartContext'
import { featuredItems, formatPrice } from '../data/menuData'

import { useRestaurant } from '../context/RestaurantContext'
import { sound } from '../utils/sound'
import { UtensilsCrossed } from 'lucide-react'

const DELIVERY_FEE = 15000
const MIN_ORDER_FREE_DELIVERY = 150000

export default function OrderPage() {
  const { currentTable } = useRestaurant()
  const { items, totalAmount, updateQty, removeItem, clearCart } = useCart()
  const navigate = useNavigate()
  const [orderType, setOrderType] = useState(currentTable ? 'dine-in' : 'delivery')
  const [form, setForm] = useState({ 
    name: currentTable ? `Khách Bàn ${currentTable}` : '', 
    phone: '', 
    address: '', 
    note: '' 
  })
  const [payMethod, setPayMethod] = useState('sepay')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pendingSepayOrder, setPendingSepayOrder] = useState(null)

  const shippingFee = orderType === 'delivery' && totalAmount < MIN_ORDER_FREE_DELIVERY ? DELIVERY_FEE : 0
  const grandTotal = totalAmount + shippingFee

  const finalizeOrder = (orderNum, orderData) => {
    const orders = JSON.parse(localStorage.getItem('kutin_orders') || '[]')
    orders.push(orderData)
    localStorage.setItem('kutin_orders', JSON.stringify(orders))

    clearCart()
    setPendingSepayOrder(null)
    setSubmitted(true)
    setLoading(false)

    toast.success(`Đặt hàng thành công! Mã đơn: ${orderNum}`)
    setTimeout(() => navigate(`/track?order=${orderNum}`), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (items.length === 0) {
      toast.error('Giỏ hàng trống! Hãy thêm món ăn trước.')
      return
    }

    const orderNum = `KT${Date.now().toString().slice(-6)}`
    const orderData = {
      orderNumber: orderNum,
      items,
      customer: form,
      orderType,
      paymentMethod: payMethod,
      totalAmount,
      shippingFee,
      grandTotal,
      status: payMethod === 'sepay' ? 'confirmed' : 'pending',
      createdAt: new Date().toISOString(),
    }

    if (payMethod === 'sepay') {
      // Open SePay QR Modal directly
      setPendingSepayOrder({ orderNum, orderData })
      return
    }

    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    finalizeOrder(orderNum, orderData)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#fdf8f0]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-[#1a5c2a] flex items-center justify-center"
          >
            <Check size={48} className="text-[#f5c518]" strokeWidth={3} />
          </motion.div>
          <h1 className="text-[#1a5c2a] font-black text-3xl">Đặt Hàng Thành Công!</h1>
          <p className="text-gray-600 max-w-md">
            Cảm ơn bạn đã đặt hàng tại KUTIN Food & Drink! Chúng tôi sẽ liên hệ xác nhận đơn trong vài phút. 🍜
          </p>
          <p className="text-gray-500 text-sm">Đang chuyển đến trang theo dõi đơn hàng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdf8f0]">
      <Navbar />

      <div className="bg-[#1a5c2a] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-white font-black text-4xl md:text-5xl mb-2">Đặt Món Online</h1>
          <p className="text-white/70">Kiểm tra giỏ hàng và hoàn tất đơn hàng</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
        {/* LEFT: Cart items */}
        <div className="space-y-4">
          <h2 className="font-black text-xl text-[#1a5c2a] flex items-center gap-2">
            <ShoppingBag size={22} /> Giỏ Hàng ({items.length} món)
          </h2>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">🛒</div>
              <p className="font-semibold text-lg text-gray-600 mb-4">Giỏ hàng trống</p>
              <button
                onClick={() => navigate('/menu')}
                className="bg-[#1a5c2a] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2d7a40] transition-colors"
              >
                Chọn Món Ngay
              </button>
            </div>
          ) : (
            <>
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-[#1a5c2a] font-semibold text-sm mt-1">{formatPrice(item.price)}</p>
                    {item.note && (
                      <p className="text-gray-400 text-xs mt-1">📝 {item.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 rounded-full border-2 border-[#1a5c2a] text-[#1a5c2a] flex items-center justify-center hover:bg-[#1a5c2a] hover:text-white transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-8 h-8 rounded-full bg-[#1a5c2a] text-white flex items-center justify-center hover:bg-[#2d7a40] transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="font-black text-[#1a5c2a]">{formatPrice(item.price * item.qty)}</p>
                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors mt-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Suggestions */}
              <div className="mt-6">
                <p className="font-bold text-gray-700 mb-3">Thêm món nữa không? 🍜</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {featuredItems.slice(0, 3).map(item => (
                    <MenuCard key={item.id} item={item} compact />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Order form */}
        <div className="space-y-4">
          {/* Order type */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Bike size={18} className="text-[#1a5c2a]" /> Hình Thức Phục Vụ</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('dine-in')}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl font-bold text-xs border-2 transition-all ${
                  orderType === 'dine-in'
                    ? 'border-[#1a5c2a] bg-[#1a5c2a]/10 text-[#1a5c2a] shadow-sm'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <UtensilsCrossed size={18} />
                <span>{currentTable ? `Bàn ${currentTable}` : 'Ăn Tại Bàn'}</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl font-bold text-xs border-2 transition-all ${
                  orderType === 'delivery'
                    ? 'border-[#1a5c2a] bg-[#1a5c2a]/10 text-[#1a5c2a] shadow-sm'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Bike size={18} />
                <span>Giao Tận Nơi</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl font-bold text-xs border-2 transition-all ${
                  orderType === 'pickup'
                    ? 'border-[#1a5c2a] bg-[#1a5c2a]/10 text-[#1a5c2a] shadow-sm'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Store size={18} />
                <span>Mang Về</span>
              </button>
            </div>
            {orderType === 'dine-in' && (
              <p className="text-xs text-[#1a5c2a] mt-2 bg-emerald-50 rounded-xl p-2 font-medium">
                🍽️ Đơn gọi món sẽ gửi thẳng tới Bếp & Thu ngân của quán.
              </p>
            )}
            {orderType === 'delivery' && totalAmount < MIN_ORDER_FREE_DELIVERY && (
              <p className="text-xs text-orange-600 mt-2 bg-orange-50 rounded-xl p-2">
                Đặt thêm {formatPrice(MIN_ORDER_FREE_DELIVERY - totalAmount)} để được miễn phí giao hàng!
              </p>
            )}
            {orderType === 'delivery' && totalAmount >= MIN_ORDER_FREE_DELIVERY && (
              <p className="text-xs text-green-600 mt-2 bg-green-50 rounded-xl p-2 font-semibold">✅ Bạn đủ điều kiện miễn phí giao hàng!</p>
            )}
          </div>

          {/* Customer info */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><User size={18} className="text-[#1a5c2a]" /> Thông Tin Khách Hàng</h3>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Họ tên *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block flex items-center gap-1"><Phone size={13} /> Số điện thoại *</label>
                <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="0901 234 567" type="tel"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>
              {orderType === 'delivery' && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block flex items-center gap-1"><MapPin size={13} /> Địa chỉ giao hàng *</label>
                  <textarea required value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c2a] resize-none"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block flex items-center gap-1"><MessageSquare size={13} /> Ghi chú đơn hàng</label>
                <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})}
                  placeholder="Không cay, ít đường, giao trước 12h..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c2a] resize-none"
                />
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><CreditCard size={18} className="text-[#1a5c2a]" /> Phương Thức Thanh Toán</h3>
              <div className="space-y-2">
                {[
                  { id: 'sepay', label: '⚡ Chuyển khoản VietQR (SePay)', desc: 'Quét mã VietQR thanh toán tự động xác nhận 24/7' },
                  { id: 'cod', label: '💵 Tiền mặt (COD)', desc: 'Thanh toán trực tiếp khi nhận hàng' },
                  { id: 'transfer', label: '🏦 Chuyển khoản thông thường', desc: 'Chuyển khoản thủ công qua số tài khoản quán' },
                ].map(method => (
                  <label key={method.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${payMethod === method.id ? 'border-[#1a5c2a] bg-[#1a5c2a]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="pay" value={method.id} checked={payMethod === method.id} onChange={e => setPayMethod(e.target.value)} className="accent-[#1a5c2a]" />
                    <div>
                      <p className="font-bold text-sm text-gray-800">{method.label}</p>
                      <p className="text-gray-400 text-xs">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-[#1a5c2a] rounded-2xl p-5 text-white space-y-2">
              <div className="flex justify-between text-sm text-white/70">
                <span>Tiền món ăn</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              {orderType === 'delivery' && (
                <div className="flex justify-between text-sm text-white/70">
                  <span>Phí giao hàng</span>
                  <span>{shippingFee > 0 ? formatPrice(shippingFee) : 'Miễn phí'}</span>
                </div>
              )}
              <div className="border-t border-white/20 pt-2 flex justify-between font-black text-lg">
                <span>Tổng thanh toán</span>
                <span className="text-[#f5c518]">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full bg-[#f5c518] text-[#1a5c2a] py-4 rounded-2xl font-black text-lg hover:bg-[#fdd835] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin">⏳</span> Đang xử lý...</>
              ) : payMethod === 'sepay' ? (
                <><CreditCard size={20} /> Thanh Toán Qua SePay QR</>
              ) : (
                <><Check size={20} /> Xác Nhận Đặt Hàng</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* SePay QR Modal for Online Order */}
      {pendingSepayOrder && (
        <SepayQRModal
          isOpen={!!pendingSepayOrder}
          onClose={() => setPendingSepayOrder(null)}
          amount={pendingSepayOrder.orderData.grandTotal}
          orderCode={pendingSepayOrder.orderNum}
          customerName={pendingSepayOrder.orderData.customer?.name}
          onSuccess={() => finalizeOrder(pendingSepayOrder.orderNum, pendingSepayOrder.orderData)}
        />
      )}

      <Footer />
    </div>
  )
}
