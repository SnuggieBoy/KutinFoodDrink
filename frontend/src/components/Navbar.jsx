import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X, Phone, Shield, Lock, LogOut } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useRestaurant } from '../context/RestaurantContext'
import CartDrawer from './CartDrawer'
import StaffLoginModal from './StaffLoginModal'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [staffLoginOpen, setStaffLoginOpen] = useState(false)
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false)

  const { totalItems } = useCart()
  const { isAdminAuthenticated, logoutAdmin, storeInfo } = useRestaurant()
  const location = useLocation()

  const hotline = storeInfo?.hotline || '0947 007 881'
  const telHref = `tel:${hotline.replace(/\s+/g, '')}`

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Standard public customer links (NO POS or Admin visible)
  const navLinks = [
    { to: '/', label: 'Trang Chủ' },
    { to: '/menu', label: 'Menu' },
    { to: '/order', label: 'Đặt Món' },
    { to: '/track', label: 'Theo Dõi Đơn' },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#1a5c2a] shadow-lg shadow-black/20 py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between relative">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group z-10 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#f5c518] flex items-center justify-center font-black text-[#1a5c2a] text-lg shadow-md group-hover:scale-110 transition-transform">
              K
            </div>
            <div className="leading-none">
              <p className="font-black text-white text-xl tracking-wider drop-shadow">{storeInfo?.name?.split(' ')[0] || 'KUTIN'}</p>
              <p className="text-[#f5c518] text-[10px] font-semibold tracking-widest">FOOD & DRINK</p>
            </div>
          </Link>

          {/* Desktop Links (Căn giữa tuyệt đối 100% cả khi đăng nhập và chưa đăng nhập) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-semibold text-sm tracking-wide transition-colors hover:text-[#f5c518] whitespace-nowrap ${
                  location.pathname === link.to ? 'text-[#f5c518] font-bold' : 'text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 z-10 flex-shrink-0">
            {/* If Staff / Admin is logged in: Show discrete staff menu */}
            {isAdminAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setStaffDropdownOpen(!staffDropdownOpen)}
                  className="flex items-center gap-1.5 bg-[#f5c518] text-[#1a5c2a] px-3 py-1.5 rounded-full text-xs font-black shadow-md hover:bg-[#fdd835] transition-all"
                >
                  <Shield size={13} />
                  <span>Quản Trị ▾</span>
                </button>

                {staffDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-fadeIn">
                    <Link
                      to="/pos"
                      onClick={() => setStaffDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-[#1a5c2a]"
                    >
                      💻 Máy Bán Hàng Thu Ngân
                    </Link>
                    <Link
                      to="/admin"
                      onClick={() => setStaffDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-[#1a5c2a]"
                    >
                      📊 Báo Cáo & Quản Trị
                    </Link>
                    <button
                      onClick={() => {
                        setStaffDropdownOpen(false)
                        logoutAdmin()
                      }}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                    >
                      <LogOut size={13} /> Đăng Xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* If NOT logged in: Discrete lock button for staff only */
              <button
                onClick={() => setStaffLoginOpen(true)}
                className="p-1.5 text-white/40 hover:text-[#f5c518] transition-colors rounded-lg"
                title="Dành cho nhân viên quản lý"
              >
                <Lock size={15} />
              </button>
            )}

            {/* Hotline */}
            <a
              href={telHref}
              className="hidden md:flex items-center gap-1.5 bg-[#f5c518] text-[#1a5c2a] px-3.5 py-1.5 rounded-full text-sm font-bold hover:bg-[#fdd835] transition-colors shadow-sm"
            >
              <Phone size={14} />
              {hotline}
            </a>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-white hover:text-[#f5c518] transition-colors"
            >
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#f5c518] text-[#1a5c2a] rounded-full text-xs font-black flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-white hover:text-[#f5c518] transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0f3a1a] border-t border-[#2d7a40] py-4 px-4">
            <div className="flex flex-col gap-3">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`font-semibold py-2 text-center rounded-lg transition-colors ${
                    location.pathname === link.to
                      ? 'bg-[#f5c518] text-[#1a5c2a]'
                      : 'text-white hover:bg-[#1a5c2a]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {isAdminAuthenticated && (
                <div className="border-t border-[#2d7a40] pt-2 space-y-2">
                  <p className="text-[10px] text-amber-400 font-bold uppercase text-center">Khu vực nhân viên</p>
                  <Link
                    to="/pos"
                    onClick={() => setMobileOpen(false)}
                    className="block bg-[#1a5c2a] text-[#f5c518] py-2 text-center rounded-lg font-bold text-xs"
                  >
                    💻 Máy Bán Hàng Thu Ngân
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block bg-[#1a5c2a] text-white py-2 text-center rounded-lg font-bold text-xs"
                  >
                    📊 Báo Cáo & Quản Trị
                  </Link>
                </div>
              )}

              <a
                href={telHref}
                className="flex items-center justify-center gap-2 bg-[#f5c518] text-[#1a5c2a] py-2 rounded-lg font-bold"
              >
                <Phone size={16} />
                Gọi: {hotline}
              </a>
            </div>
          </div>
        )}
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <StaffLoginModal
        isOpen={staffLoginOpen}
        onClose={() => setStaffLoginOpen(false)}
      />
    </>
  )
}
