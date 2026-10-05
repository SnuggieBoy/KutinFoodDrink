import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Phone, MapPin, Star, Truck, Clock, Shield, Ticket, Copy, Check, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MenuCard from '../components/MenuCard'
import { featuredItems, categories, getActiveMenu } from '../data/menuData'
import { getActiveVouchers } from '../data/voucherData'
import { useRestaurant } from '../context/RestaurantContext'

const formatPrice = (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + 'đ'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
}

const reviews = [
  { name: 'Minh Khoa', text: 'Mì cay ở đây ăn là ghiền luôn! Vị cay đậm đà, topping đầy đủ, giá cũng hợp lý nữa 🔥', stars: 5, avatar: 'MK' },
  { name: 'Thu Hà', text: 'Cơm trộn gà xù phô mai ngon xuất sắc! Giòn, béo, đậm vị. Sẽ quay lại nhiều lần!', stars: 5, avatar: 'TH' },
  { name: 'Văn Hùng', text: 'Tokpokki phô mai thập cẩm cực kỳ ngon, phục vụ nhanh, giao hàng đúng giờ. 5 sao!', stars: 5, avatar: 'VH' },
  { name: 'Ngọc Linh', text: 'Bạch tuộc sốt cay phô mai là đỉnh của đỉnh! Đặc biệt recommend cho ai thích đồ cay.', stars: 5, avatar: 'NL' },
  { name: 'Quốc Bảo', text: 'Gà xù ở đây giòn lắm, sauce ngon, cơm trộn ăn cũng rất hợp vị. Ủng hộ quán!', stars: 5, avatar: 'QB' },
]

export default function HomePage() {
  const { storeInfo } = useRestaurant()
  const [menuList, setMenuList] = useState(() => getActiveMenu())
  const [vouchers, setVouchers] = useState(() => getActiveVouchers())
  const [copiedCode, setCopiedCode] = useState('')

  const handleCopyVoucher = (code) => {
    navigator.clipboard?.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(''), 2500)
  }

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'kutin_custom_menu') {
        setMenuList(getActiveMenu())
      }
      if (e.key === 'kutin_vouchers') {
        setVouchers(getActiveVouchers())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const displayFeatured = useMemo(() => {
    const featured = menuList.filter(i => i.isFeatured || i.badge === 'Hot' || i.badge === 'Bán chạy')
    return (featured.length > 0 ? featured : menuList).slice(0, 8)
  }, [menuList])

  const openHours = storeInfo?.openHours || '10:00 - 20:30 hàng ngày'
  const tagline = storeInfo?.tagline || '"Ngon hết sẩy!"'
  const hotline = storeInfo?.hotline || '0947 007 881'
  const telHref = `tel:${hotline.replace(/\s+/g, '')}`
  const address = storeInfo?.address || '1 Ngô Sĩ Liên, Khu Phố 2, Hố Nai, Biên Hòa, Đồng Nai'
  const mapEmbedUrl = storeInfo?.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3917.472888523306!2d106.877028!3d10.957519!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174dfb2a472c51f%3A0x6b490d182b8344e2!2zMSBOZ8O0IFMlogsIExpw6puLCBUw6JuIEJpw6puLCBUaMOgbmggcGjhu5EgQmnDqm4gSMOyYSwgxJDhu5NuZyBOYWk!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s'
  const zaloHref = storeInfo?.zalo ? (storeInfo.zalo.startsWith('http') ? storeInfo.zalo : `https://zalo.me/${storeInfo.zalo.replace(/\s+/g, '')}`) : 'https://zalo.me/0947007881'

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden relative">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section
        id="hero"
        className="relative min-h-[100dvh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-24 sm:pt-24 sm:pb-14"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1600&q=90')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 gradient-hero" />

        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full border-2 border-[#f5c518]/20 hidden lg:block pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full border-2 border-white/10 hidden lg:block pointer-events-none" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto w-full">
          {/* Badge giờ phục vụ (Tối ưu gọn gàng cho điện thoại) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-[#f5c518]/20 border border-[#f5c518]/50 text-[#f5c518] px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 backdrop-blur-sm max-w-[90vw] truncate"
          >
            <span className="animate-pulse text-[10px]">●</span>
            <span className="truncate">Đang phục vụ: {openHours.replace(/\(.*?\)/g, '').trim()}</span>
          </motion.div>

          {/* Logo mark */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-4 mb-1 sm:mb-2"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#f5c518] flex items-center justify-center font-black text-[#1a5c2a] text-2xl sm:text-3xl shadow-2xl animate-float">
              K
            </div>
          </motion.div>

          {/* Title KUTIN */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white font-black text-shadow"
            style={{ fontSize: 'clamp(2.6rem, 8.5vw, 6.5rem)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            KUTIN
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[#f5c518] font-bold tracking-[0.25em] text-sm sm:text-xl md:text-2xl mb-1.5 sm:mb-2 uppercase"
          >
            FOOD & DRINK
          </motion.p>

          {/* Menu Highlights Row (Không bị rớt chữ đơn lẻ) */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-white/85 text-[11px] sm:text-sm md:text-base tracking-normal sm:tracking-wider mb-2 font-medium px-2 max-w-md mx-auto"
          >
            ĂN VẶT · MÌ CAY · TOKPOKKI · CƠM TRỘN · GÀ XÙ
          </motion.p>

          {/* Slogan */}
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-[#f5c518] font-black italic text-base sm:text-xl md:text-3xl mb-5 sm:mb-8 text-shadow-sm px-3 max-w-lg mx-auto leading-snug"
          >
            {tagline}
          </motion.p>

          {/* CTA Buttons (Tối ưu cảm ứng mobile) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 mb-6 sm:mb-8 w-full max-w-xs sm:max-w-none mx-auto"
          >
            <Link
              to="/order"
              className="w-full sm:w-auto group bg-[#f5c518] text-[#1a5c2a] px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg hover:bg-[#fdd835] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              🍜 Đặt Món Ngay
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              to="/menu"
              className="w-full sm:w-auto bg-white/20 backdrop-blur-md text-white border border-white/40 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-white/30 transition-all flex items-center justify-center gap-2"
            >
              📋 Xem Menu
            </Link>
          </motion.div>

          {/* Info chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs"
          >
            <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md border border-white/15 text-white px-3 py-1.5 rounded-full">
              <Truck size={13} className="text-[#f5c518]" />
              <span>Giao tận nơi</span>
            </div>
            <a href="tel:0947007881" className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md border border-white/15 text-white px-3 py-1.5 rounded-full hover:bg-black/40 transition-colors">
              <Phone size={13} className="text-[#f5c518]" />
              <span>0947 007 881</span>
            </a>
            <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md border border-white/15 text-white px-3 py-1.5 rounded-full">
              <MapPin size={13} className="text-[#f5c518]" />
              <span>Hố Nai, Biên Hòa</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll arrow (Ẩn trên mobile để không bị BottomNav đè) */}
        <a href="#about" className="hidden sm:block absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 hover:text-white animate-bounce transition-colors">
          <ChevronDown size={28} />
        </a>
      </section>

      {/* ===== ABOUT / HIGHLIGHTS SECTION ===== */}
      <section id="about" className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8"
          >
            {[
              {
                icon: '🌟',
                title: 'NGON',
                desc: 'Công thức độc quyền, hương vị đậm đà khó quên. Mỗi món đều được chế biến tỉ mỉ từ nguyên liệu chọn lọc kỹ càng.',
                color: 'from-yellow-50 to-orange-50',
                border: 'border-yellow-200',
              },
              {
                icon: '🧼',
                title: 'SẠCH',
                desc: 'Nguyên liệu tươi, an toàn vệ sinh thực phẩm. Quy trình chế biến đảm bảo tiêu chuẩn sạch sẽ, an toàn cho sức khỏe.',
                color: 'from-green-50 to-teal-50',
                border: 'border-green-200',
              },
              {
                icon: '💎',
                title: 'CHẤT LƯỢNG',
                desc: 'Giá cả hợp lý, phục vụ tận tâm. Chúng tôi cam kết mang đến trải nghiệm ẩm thực tuyệt vời cho mọi khách hàng.',
                color: 'from-blue-50 to-indigo-50',
                border: 'border-blue-200',
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className={`bg-gradient-to-br ${item.color} rounded-2xl p-5 sm:p-8 border ${item.border} text-center card-hover`}
              >
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{item.icon}</div>
                <h3 className="text-[#1a5c2a] font-black text-xl sm:text-2xl mb-2 sm:mb-3 tracking-wider">{item.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== VOUCHERS / PROMOTIONS SECTION ===== */}
      {vouchers.filter(v => v.isActive).length > 0 && (
        <section className="py-10 sm:py-14 bg-gradient-to-r from-emerald-900 via-[#1a5c2a] to-emerald-950 text-white relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f5c518_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-black tracking-wider uppercase mb-2">
                  <Sparkles size={13} /> Ưu Đãi Độc Quyền
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                  Mã Giảm Giá Hôm Nay 🎟️
                </h2>
                <p className="text-emerald-100/80 text-xs sm:text-sm mt-1">
                  Nhận ngay voucher giảm giá trực tiếp khi đặt món online hoặc ăn tại quán
                </p>
              </div>

              <Link
                to="/order"
                className="inline-flex items-center gap-2 self-start md:self-auto px-5 py-2.5 rounded-2xl bg-[#f5c518] hover:bg-[#fdd835] text-[#1a5c2a] font-black text-xs sm:text-sm shadow-xl transition-transform active:scale-95"
              >
                🍜 Dùng Mã Đặt Món Ngay →
              </Link>
            </div>

            {/* Voucher Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {vouchers.filter(v => v.isActive).slice(0, 4).map((voucher) => (
                <div
                  key={voucher.id}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-400/50 hover:bg-white/15 transition-all shadow-xl relative group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-emerald-950">
                        {voucher.type === 'percentage' ? `Giảm ${voucher.value}%` : voucher.type === 'freeship' ? 'Miễn Phí Ship' : `Giảm ${formatPrice(voucher.value)}`}
                      </span>
                      {voucher.endDate && (
                        <span className="text-[10px] text-emerald-200 font-medium">
                          Hạn: {voucher.endDate}
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {voucher.title}
                    </h3>
                    
                    <p className="text-xs text-emerald-100/70 line-clamp-2 min-h-[32px]">
                      {voucher.description || (voucher.minOrder ? `Đơn tối thiểu ${formatPrice(voucher.minOrder)}` : 'Áp dụng cho mọi đơn')}
                    </p>
                  </div>

                  {/* Copy Button & Code */}
                  <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-black/30 border border-dashed border-amber-400/60 font-mono font-black text-amber-300 text-xs tracking-wider">
                      {voucher.code}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyVoucher(voucher.code)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-all ${
                        copiedCode === voucher.code
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white text-gray-900 hover:bg-amber-400 hover:text-emerald-950'
                      }`}
                    >
                      {copiedCode === voucher.code ? (
                        <>
                          <Check size={12} strokeWidth={3} /> Đã Chép
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Sao Chép
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="py-10 sm:py-16 bg-[#fdf8f0]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-8 sm:mb-12"
          >
            <p className="text-[#f5c518] font-bold tracking-widest text-xs sm:text-sm mb-1.5">THỰC ĐƠN ĐA DẠNG</p>
            <h2 className="text-[#1a5c2a] font-black text-2xl sm:text-3xl md:text-4xl">Danh Mục Món Ăn</h2>
            <div className="w-12 sm:w-16 h-1 bg-[#f5c518] mx-auto mt-3 rounded-full"></div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4"
          >
            {categories.map((cat) => (
              <motion.div key={cat.id} variants={fadeUp}>
                <Link
                  to={`/menu?cat=${cat.id}`}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#1a5c2a] hover:shadow-lg hover:-translate-y-1 transition-all group text-center"
                >
                  <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-[#1a5c2a] leading-tight line-clamp-1">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURED DISHES ===== */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-8 sm:mb-12"
          >
            <p className="text-[#f5c518] font-bold tracking-widest text-xs sm:text-sm mb-1.5">ĐƯỢC YÊU THÍCH NHẤT</p>
            <h2 className="text-[#1a5c2a] font-black text-2xl sm:text-3xl md:text-4xl">Món Nổi Bật</h2>
            <div className="w-12 sm:w-16 h-1 bg-[#f5c518] mx-auto mt-3 rounded-full"></div>
            <p className="text-gray-500 text-xs sm:text-sm mt-3 max-w-xl mx-auto">Những món được khách hàng yêu thích và đặt nhiều nhất tại KUTIN</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
          >
            {displayFeatured.map(item => (
              <motion.div key={item.id} variants={fadeUp}>
                <MenuCard item={item} />
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-8 sm:mt-10">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-[#1a5c2a] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-[#2d7a40] transition-all shadow-lg hover:-translate-y-1"
            >
              Xem Tất Cả Menu →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ORDER CTA BANNER ===== */}
      <section
        className="py-12 sm:py-16 md:py-20 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a5c2a 0%, #0f3a1a 100%)',
        }}
      >
        <div className="absolute inset-0 bg-kutin-pattern" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-[#f5c518] font-bold tracking-widest text-xs sm:text-sm mb-1.5">ĐẶT MÓN NGAY</motion.p>
            <motion.h2 variants={fadeUp} className="text-white font-black text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">
              Đói rồi? Gọi ngay thôi! 🍜
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70 text-sm sm:text-base mb-6 sm:mb-8 max-w-xl mx-auto">
              Đặt món online dễ dàng, giao hàng tận nơi nhanh chóng. Phục vụ trong khu vực Hố Nai, Đồng Nai.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                to="/order"
                className="w-full sm:w-auto bg-[#f5c518] text-[#1a5c2a] px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-xl hover:bg-[#fdd835] transition-all shadow-2xl hover:-translate-y-1 active:scale-95"
              >
                🛒 Đặt Món Online
              </Link>
              <a
                href="tel:0947007881"
                className="w-full sm:w-auto border-2 border-white/40 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                0947 007 881
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-10 sm:py-16 bg-[#fdf8f0]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-8 sm:mb-12"
          >
            <p className="text-[#f5c518] font-bold tracking-widest text-xs sm:text-sm mb-1.5">TẠI SAO CHỌN KUTIN</p>
            <h2 className="text-[#1a5c2a] font-black text-2xl sm:text-3xl md:text-4xl">Chúng Tôi Khác Biệt</h2>
            <div className="w-12 sm:w-16 h-1 bg-[#f5c518] mx-auto mt-3 rounded-full"></div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {[
              { icon: <Truck size={24} />, title: 'Giao Hàng Nhanh', desc: 'Giao hàng tận nơi trong khu vực, đảm bảo món ăn còn nóng hổi khi đến tay bạn.' },
              { icon: <Clock size={24} />, title: 'Mở Cửa Mỗi Ngày', desc: 'Phục vụ từ 10:00 đến 20:30, không có ngày nghỉ để phục vụ bạn tốt nhất.' },
              { icon: <Shield size={24} />, title: 'An Toàn Thực Phẩm', desc: 'Nguyên liệu tươi sạch, chế biến theo quy trình đảm bảo an toàn vệ sinh thực phẩm.' },
              { icon: <Star size={24} />, title: 'Đánh Giá 5 Sao', desc: 'Hàng trăm đánh giá 5 sao từ khách hàng hài lòng về chất lượng và dịch vụ.' },
            ].map((feat) => (
              <motion.div
                key={feat.title}
                variants={fadeUp}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 card-hover text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1a5c2a]/10 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-[#1a5c2a]">
                  {feat.icon}
                </div>
                <h3 className="font-bold text-[#1a5c2a] text-base sm:text-lg mb-1.5">{feat.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== REVIEWS SECTION ===== */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-8 sm:mb-12"
          >
            <p className="text-[#f5c518] font-bold tracking-widest text-xs sm:text-sm mb-1.5">PHẢN HỒI KHÁCH HÀNG</p>
            <h2 className="text-[#1a5c2a] font-black text-2xl sm:text-3xl md:text-4xl">Khách Hàng Nói Gì</h2>
            <div className="w-12 sm:w-16 h-1 bg-[#f5c518] mx-auto mt-3 rounded-full"></div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {reviews.map((review) => (
              <motion.div
                key={review.name}
                variants={fadeUp}
                className="bg-[#fdf8f0] rounded-2xl p-5 sm:p-6 border border-gray-100 card-hover"
              >
                <div className="flex items-center gap-1 mb-2.5">
                  {[...Array(review.stars)].map((_, i) => (
                    <Star key={i} size={15} fill="#f5c518" stroke="none" />
                  ))}
                </div>
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-3.5 italic">"{review.text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#1a5c2a] flex items-center justify-center text-white font-bold text-xs">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-xs sm:text-sm">{review.name}</p>
                    <p className="text-gray-400 text-[11px]">Khách hàng thường xuyên</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CONTACT SECTION ===== */}
      <section className="py-10 sm:py-16 bg-[#fdf8f0]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-8 sm:mb-12"
          >
            <p className="text-[#f5c518] font-bold tracking-widest text-xs sm:text-sm mb-1.5">TÌM CHÚNG TÔI</p>
            <h2 className="text-[#1a5c2a] font-black text-2xl sm:text-3xl md:text-4xl">Liên Hệ & Vị Trí</h2>
            <div className="w-12 sm:w-16 h-1 bg-[#f5c518] mx-auto mt-3 rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
            {/* Contact Info */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="space-y-3 sm:space-y-4"
            >
              {[
                {
                  icon: <MapPin size={20} />,
                  title: 'Địa Chỉ Quán',
                  value: address,
                  action: null,
                },
                {
                  icon: <Phone size={20} />,
                  title: 'Điện Thoại / Hotline',
                  value: hotline,
                  action: telHref,
                },
                {
                  icon: <Clock size={20} />,
                  title: 'Thời Gian Phục Vụ',
                  value: openHours,
                  action: null,
                },
              ].map((info) => (
                <motion.div
                  key={info.title}
                  variants={fadeUp}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 flex items-start gap-3 sm:gap-4 card-hover"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1a5c2a] flex items-center justify-center text-[#f5c518] flex-shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-xs sm:text-sm mb-0.5">{info.title}</p>
                    {info.action ? (
                      <a href={info.action} className="text-[#1a5c2a] font-semibold text-xs sm:text-sm hover:underline">{info.value}</a>
                    ) : (
                      <p className="text-gray-600 text-xs sm:text-sm">{info.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 h-64 sm:h-80 lg:h-[340px]"
            >
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${storeInfo?.name || 'KUTIN'} - Vị Trí Google Maps`}
                className="w-full h-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Floating Zalo button (Nổi phía trên thanh MobileBottomNav) */}
      <a
        href={zaloHref}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        style={{ background: '#0068FF' }}
        title="Chat Zalo Tư Vấn"
      >
        <svg width="24" height="24" className="sm:w-7 sm:h-7" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="#0068FF"/>
          <path d="M24 9C15.163 9 8 15.492 8 23.5c0 4.42 2.256 8.36 5.81 11.004L12 39l4.962-1.485C18.881 38.468 21.37 39 24 39c8.837 0 16-6.492 16-14.5S32.837 9 24 9z" fill="white"/>
          <text x="24" y="28" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0068FF">Z</text>
        </svg>
      </a>
    </div>
  )
}
