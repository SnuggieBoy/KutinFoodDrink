import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Utensils, ShoppingBag, Bell, Phone } from 'lucide-react'
import { useCart } from '../context/CartContext'
import ServiceCallModal from './ServiceCallModal'
import CartDrawer from './CartDrawer'

export default function MobileBottomNav() {
  const location = useLocation()
  const { totalItems } = useCart()
  const [showCallModal, setShowCallModal] = useState(false)
  const [showCartDrawer, setShowCartDrawer] = useState(false)

  // Do not show on POS or Admin pages (they have their own full screen layout)
  if (location.pathname === '/pos' || location.pathname === '/admin') {
    return null
  }

  return (
    <>
      {/* Mobile Floating Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around">
          {/* Home */}
          <Link
            to="/"
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
              location.pathname === '/' ? 'text-[#1a5c2a] font-black' : 'text-gray-500 font-medium'
            }`}
          >
            <Home size={19} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
            <span className="text-[10px]">Trang Chủ</span>
          </Link>

          {/* Menu */}
          <Link
            to="/menu"
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
              location.pathname === '/menu' ? 'text-[#1a5c2a] font-black' : 'text-gray-500 font-medium'
            }`}
          >
            <Utensils size={19} strokeWidth={location.pathname === '/menu' ? 2.5 : 2} />
            <span className="text-[10px]">Thực Đơn</span>
          </Link>

          {/* Center: Chuông gọi phục vụ */}
          <button
            onClick={() => setShowCallModal(true)}
            className="flex flex-col items-center -mt-4 group active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-white">
              <Bell size={22} className="animate-wiggle" />
            </div>
            <span className="text-[9px] font-black text-amber-700 mt-0.5">Gọi Phục Vụ</span>
          </button>

          {/* Cart */}
          <button
            onClick={() => setShowCartDrawer(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-gray-500 relative transition-all"
          >
            <ShoppingBag size={19} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                {totalItems}
              </span>
            )}
            <span className="text-[10px] font-medium">Giỏ Hàng</span>
          </button>

          {/* Hotline / Zalo */}
          <a
            href="tel:0947007881"
            className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-emerald-700 transition-all font-medium"
          >
            <Phone size={19} />
            <span className="text-[10px]">Hotline</span>
          </a>
        </div>
      </div>

      {/* Modals */}
      <ServiceCallModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
      />
      <CartDrawer
        open={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
      />
    </>
  )
}
