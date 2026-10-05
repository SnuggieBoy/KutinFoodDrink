import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Minus, Plus, Trash2, ShoppingBag, MapPin, Phone, User, MessageSquare, 
  CreditCard, Bike, Store, Check, UtensilsCrossed, Ticket, Tag, Sparkles, X, ChevronRight 
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MenuCard from '../components/MenuCard'
import SepayQRModal from '../components/SepayQRModal'
import { useCart } from '../context/CartContext'
import { featuredItems, formatPrice, categoryImages } from '../data/menuData'
import { useRestaurant } from '../context/RestaurantContext'
import { sound } from '../utils/sound'
import { getActiveVouchers, validateVoucher, incrementVoucherUsage } from '../data/voucherData'

export default function OrderPage() {
  const { currentTable, storeInfo } = useRestaurant()
  const deliveryFee = Number(storeInfo?.deliveryFee) || 15000
  const minFreeDelivery = Number(storeInfo?.minFreeDelivery) || 150000

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

  // VOUCHER / DISCOUNT STATE
  const [voucherInput, setVoucherInput] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(null)
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [vouchersList, setVouchersList] = useState(() => getActiveVouchers())

  // Sync vouchers across storage
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'kutin_vouchers') {
        setVouchersList(getActiveVouchers())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const shippingFee = orderType === 'delivery' && totalAmount < minFreeDelivery ? deliveryFee : 0

  // Calculate discount amount based on active voucher and order conditions
  const discountAmount = useMemo(() => {
    if (!appliedVoucher) return 0
    const res = validateVoucher(appliedVoucher.code, totalAmount, shippingFee)
    if (res.valid) {
      return res.discountAmount
    }
    return 0
  }, [appliedVoucher, totalAmount, shippingFee])

  const grandTotal = Math.max(0, totalAmount + shippingFee - discountAmount)

  const handleApplyVoucher = (codeToApply) => {
    const code = codeToApply || voucherInput
    if (!code || !code.trim()) {
      toast.error('Vui lòng nhập mã giảm giá!')
      return
    }
    const res = validateVoucher(code, totalAmount, shippingFee)
    if (!res.valid) {
      toast.error(res.message)
      return
    }
    setAppliedVoucher(res.voucher)
    setVoucherInput(res.voucher.code)
    setShowVoucherModal(false)
    toast.success(`🎉 ${res.message}`)
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherInput('')
    toast.success('Đã hủy áp dụng mã giảm giá')
  }

  const finalizeOrder = (orderNum, orderData) => {
    const orders = JSON.parse(localStorage.getItem('kutin_orders') || '[]')
    orders.push(orderData)
    localStorage.setItem('kutin_orders', JSON.stringify(orders))

    if (appliedVoucher) {
      incrementVoucherUsage(appliedVoucher.code)
    }

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
      discountAmount,
      voucherCode: appliedVoucher ? appliedVoucher.code : null,
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
                <div key={item.id} className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 flex items-center gap-3 sm:gap-4 shadow-sm">
                  {/* Dish Thumbnail */}
                  <img
                    src={item.image || categoryImages[item.category] || categoryImages.default}
                    alt={item.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover object-center flex-shrink-0 border border-gray-100 bg-gray-50"
                    onError={(e) => { e.currentTarget.src = categoryImages[item.category] || categoryImages.default }}
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm sm:text-base line-clamp-1">{item.name}</p>
                    <p className="text-[#1a5c2a] font-semibold text-xs sm:text-sm mt-0.5 tabular-nums">{formatPrice(item.price)}</p>
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
            {orderType === 'delivery' && totalAmount < minFreeDelivery && (
              <p className="text-xs text-orange-600 mt-2 bg-orange-50 rounded-xl p-2">
                Đặt thêm {formatPrice(minFreeDelivery - totalAmount)} để được miễn phí giao hàng!
              </p>
            )}
            {orderType === 'delivery' && totalAmount >= minFreeDelivery && (
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

            {/* Voucher / Coupon Code */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Ticket size={18} className="text-[#1a5c2a]" /> Mã Giảm Giá / Voucher
                </h3>
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(true)}
                  className="text-xs font-bold text-[#1a5c2a] hover:underline flex items-center gap-1"
                >
                  <Tag size={13} /> Xem mã có sẵn ({vouchersList.filter(v => v.isActive).length})
                </button>
              </div>

              {appliedVoucher ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                      %
                    </span>
                    <div className="min-w-0">
                      <p className="font-black text-xs text-emerald-900 truncate">
                        {appliedVoucher.code} — Giảm {formatPrice(discountAmount)}
                      </p>
                      <p className="text-[10px] text-emerald-700 truncate">{appliedVoucher.title}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="text-xs font-bold text-red-500 hover:text-red-700 px-2.5 py-1 bg-white rounded-lg border border-red-200 shadow-sm flex-shrink-0 ml-2"
                  >
                    Gỡ mã
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={e => setVoucherInput(e.target.value.toUpperCase())}
                    placeholder="Nhập mã (vd: KUTIN10, GIAM20K...)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-wider focus:outline-none focus:border-[#1a5c2a]"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyVoucher()}
                    className="px-4 py-2.5 rounded-xl bg-[#1a5c2a] hover:bg-[#2d7a40] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    Áp Dụng
                  </button>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><CreditCard size={18} className="text-[#1a5c2a]" /> Phương Thức Thanh Toán</h3>
              <div className="space-y-2">
                {[
                  { id: 'sepay', label: '⚡ Chuyển khoản VietQR Tự Động', desc: 'Quét mã VietQR thanh toán tự động xác nhận 24/7' },
                  { id: 'cod', label: '💵 Tiền mặt khi nhận hàng', desc: 'Thanh toán trực tiếp bằng tiền mặt' },
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
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-[#f5c518] font-bold">
                  <span>Giảm giá ({appliedVoucher?.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
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
                <><CreditCard size={20} /> Thanh Toán Chuyển Khoản VietQR</>
              ) : (
                <><Check size={20} /> Xác Nhận Đặt Hàng</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* VOUCHER SELECTION MODAL */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b flex items-center justify-between bg-[#1a5c2a] text-white">
              <div className="flex items-center gap-2">
                <Ticket size={20} className="text-[#f5c518]" />
                <h3 className="font-black text-base">Kho Ưu Đãi & Voucher KUTIN</h3>
              </div>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-gray-50">
              {vouchersList.filter(v => v.isActive).map(v => {
                const isValidForCurrentCart = totalAmount >= (v.minOrder || 0)
                const isSelected = appliedVoucher?.code === v.code

                return (
                  <div
                    key={v.id}
                    className={`bg-white rounded-2xl p-3.5 border transition-all ${
                      isSelected 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' 
                        : isValidForCurrentCart 
                          ? 'border-gray-200 hover:border-[#1a5c2a] shadow-sm' 
                          : 'border-gray-200 opacity-60 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg bg-[#1a5c2a]/10 text-[#1a5c2a] font-black text-xs uppercase tracking-wider">
                            {v.code}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            {v.type === 'percentage' ? `Giảm ${v.value}%` : v.type === 'freeship' ? 'Freeship' : `Giảm ${formatPrice(v.value)}`}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 mt-1">{v.title}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{v.description}</p>
                        {v.minOrder > 0 && (
                          <p className="text-[10px] text-gray-400 mt-1">
                            • Đơn tối thiểu: {formatPrice(v.minOrder)} {isValidForCurrentCart ? '✓ Đã đạt' : `(Cần thêm ${formatPrice(v.minOrder - totalAmount)})`}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={!isValidForCurrentCart}
                        onClick={() => handleApplyVoucher(v.code)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex-shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 text-white cursor-default'
                            : isValidForCurrentCart
                              ? 'bg-[#1a5c2a] text-white hover:bg-[#2d7a40] active:scale-95 shadow-sm'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isSelected ? 'Đang dùng' : 'Áp Dụng'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

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
