import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Package, Clock, CheckCircle, Bike, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { formatPrice } from '../data/menuData'
import { useRestaurant } from '../context/RestaurantContext'

const statusConfig = {
  pending: { label: 'Chờ xác nhận', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', step: 1 },
  confirmed: { label: 'Đã xác nhận', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', step: 2 },
  preparing: { label: 'Đang chuẩn bị', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', step: 3 },
  delivering: { label: 'Đang giao hàng', icon: Bike, color: 'text-purple-600', bg: 'bg-purple-50', step: 4 },
  done: { label: 'Hoàn thành', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', step: 5 },
  cancelled: { label: 'Đã hủy', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', step: 0 },
}

const steps = ['Chờ xác nhận', 'Đã xác nhận', 'Đang chuẩn bị', 'Đang giao hàng', 'Hoàn thành']

export default function TrackOrderPage() {
  const { storeInfo } = useRestaurant()
  const hotline = storeInfo?.hotline || '0947 007 881'
  const telHref = `tel:${hotline.replace(/\s+/g, '')}`
  const zaloPhone = (storeInfo?.zalo || hotline).replace(/\s+/g, '')

  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('order') || '')
  const [order, setOrder] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const searchOrder = (q) => {
    const orders = JSON.parse(localStorage.getItem('kutin_orders') || '[]')
    const found = orders.find(o =>
      o.orderNumber === q.toUpperCase() ||
      o.customer?.phone === q
    )
    if (found) {
      setOrder(found)
      setNotFound(false)
    } else {
      setOrder(null)
      setNotFound(true)
    }
  }

  useEffect(() => {
    const orderNum = searchParams.get('order')
    if (orderNum) {
      setQuery(orderNum)
      searchOrder(orderNum)
    }
  }, [searchParams])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) searchOrder(query.trim())
  }

  const config = order ? statusConfig[order.status] : null
  const StatusIcon = config?.icon

  return (
    <div className="min-h-screen bg-[#fdf8f0]">
      <Navbar />

      <div className="bg-[#1a5c2a] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-white font-black text-4xl mb-2">Theo Dõi Đơn Hàng</h1>
          <p className="text-white/70">Nhập mã đơn hàng hoặc số điện thoại</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Nhập mã đơn hàng (VD: KT123456) hoặc SĐT"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1a5c2a] bg-white text-sm"
          />
          <button type="submit" className="bg-[#1a5c2a] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#2d7a40] transition-colors flex items-center gap-2">
            <Search size={18} /> Tìm
          </button>
        </form>

        {notFound && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 text-center border border-gray-100"
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-bold text-lg text-gray-700 mb-2">Không tìm thấy đơn hàng</h3>
            <p className="text-gray-500 text-sm">Kiểm tra lại mã đơn hoặc số điện thoại đã đặt.</p>
            <p className="text-gray-400 text-xs mt-3">Nếu vừa đặt, hãy đợi vài giây rồi thử lại.</p>
          </motion.div>
        )}

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Status Card */}
            <div className={`${config?.bg} rounded-2xl p-6 border border-gray-100`}>
              <div className="flex items-center gap-3 mb-4">
                {StatusIcon && <StatusIcon size={28} className={config?.color} />}
                <div>
                  <p className="font-black text-xl text-gray-800">#{order.orderNumber}</p>
                  <p className={`font-bold ${config?.color}`}>{config?.label}</p>
                </div>
              </div>

              {/* Progress steps */}
              {order.status !== 'cancelled' && (
                <div className="relative">
                  <div className="flex items-center justify-between relative z-10">
                    {steps.map((step, i) => {
                      const stepNum = i + 1
                      const isActive = stepNum <= (config?.step || 0)
                      return (
                        <div key={step} className="flex flex-col items-center gap-1 flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                            isActive ? 'bg-[#1a5c2a] border-[#1a5c2a] text-white' : 'bg-white border-gray-300 text-gray-400'
                          }`}>
                            {stepNum}
                          </div>
                          <span className={`text-[9px] font-semibold text-center leading-tight ${isActive ? 'text-[#1a5c2a]' : 'text-gray-400'}`}>
                            {step}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-0">
                    <div
                      className="h-full bg-[#1a5c2a] transition-all duration-500"
                      style={{ width: `${((config?.step - 1) / (steps.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Real-time feedback from Restaurant Owner */}
              {order.estimateTime && (
                <div className="mt-4 p-3.5 bg-amber-50 rounded-2xl border-2 border-amber-300 flex items-center justify-between text-xs shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl animate-bounce">⏱️</span>
                    <div>
                      <p className="text-gray-500 text-[11px] font-semibold">Phản hồi từ quán KUTIN:</p>
                      <p className="text-amber-900 font-black text-sm">{order.estimateTime}</p>
                    </div>
                  </div>
                  <span className="bg-[#1a5c2a] text-[#f5c518] text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse">
                    Đang Nấu Món
                  </span>
                </div>
              )}

              {/* Direct Zalo Chat about this order */}
              <div className="mt-3 text-center">
                <a
                  href={`https://zalo.me/${zaloPhone}?text=${encodeURIComponent(`Xin chào ${storeInfo?.name || 'KUTIN'}! Tôi muốn hỏi thăm về đơn hàng #${order.orderNumber}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm"
                >
                  💬 Nhắn Zalo cho quán về đơn này
                </a>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3">Chi Tiết Đơn Hàng</h3>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name} x{item.qty}</span>
                    <span className="font-semibold text-[#1a5c2a]">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 space-y-1">
                  {order.shippingFee > 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Phí giao hàng</span>
                      <span>{formatPrice(order.shippingFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-base">
                    <span>Tổng cộng</span>
                    <span className="text-[#1a5c2a]">{formatPrice(order.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3">Thông Tin Giao Hàng</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Tên:</span> <span className="font-semibold">{order.customer.name}</span></p>
                <p><span className="text-gray-500">SĐT:</span> <span className="font-semibold">{order.customer.phone}</span></p>
                {order.customer.address && (
                  <p><span className="text-gray-500">Địa chỉ:</span> <span className="font-semibold">{order.customer.address}</span></p>
                )}
                {order.customer.note && (
                  <p><span className="text-gray-500">Ghi chú:</span> <span className="font-semibold">{order.customer.note}</span></p>
                )}
              </div>
            </div>

            {/* Help */}
            <div className="bg-[#f5c518]/10 border border-[#f5c518] rounded-2xl p-4 text-center">
              <p className="text-sm text-gray-700">Cần hỗ trợ? Gọi ngay cho chúng tôi!</p>
              <a href={telHref} className="font-black text-[#1a5c2a] text-lg hover:underline">{hotline}</a>
            </div>
          </motion.div>
        )}

        {!order && !notFound && (
          <div className="text-center py-12 text-gray-400">
            <Package size={64} className="mx-auto mb-4" strokeWidth={1} />
            <p className="font-semibold">Nhập mã đơn hàng để theo dõi</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
