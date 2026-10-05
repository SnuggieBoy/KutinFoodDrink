import { Phone, MapPin, Clock, Send } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0f3a1a] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#f5c518] flex items-center justify-center font-black text-[#1a5c2a] text-2xl">K</div>
            <div>
              <p className="font-black text-2xl tracking-wider">KUTIN</p>
              <p className="text-[#f5c518] text-xs font-semibold tracking-widest">FOOD & DRINK</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Ngon - Sạch - Chất Lượng. Chúng tôi mang đến những món ăn ngon nhất với nguyên liệu tươi sạch, phục vụ tận tâm.
          </p>
          <p className="text-[#f5c518] font-bold italic">"Ngon hết sẩy!"</p>
          {/* Social */}
          <div className="flex items-center gap-3 mt-4">
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f5c518] hover:text-[#1a5c2a] transition-colors" title="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f5c518] hover:text-[#1a5c2a] transition-colors" title="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://zalo.me/0947007881" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f5c518] hover:text-[#1a5c2a] transition-colors" title="Zalo">
              <Send size={16} />
            </a>
          </div>

        </div>

        {/* Links */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-[#f5c518]">Liên Kết Nhanh</h3>
          <ul className="space-y-2">
            {[
              { to: '/', label: 'Trang Chủ' },
              { to: '/menu', label: 'Xem Menu' },
              { to: '/order', label: 'Đặt Món Online' },
              { to: '/track', label: 'Theo Dõi Đơn Hàng' },
            ].map(link => (
              <li key={link.to}>
                <Link to={link.to} className="text-gray-300 hover:text-[#f5c518] transition-colors text-sm flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#f5c518] rounded-full"></span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-[#f5c518]">Liên Hệ</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-[#f5c518] mt-0.5 flex-shrink-0" />
              <p className="text-gray-300 text-sm">1 Ngô Sĩ Liên, Khu Phố 2, Hố Nai, Biên Hòa, Đồng Nai</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-[#f5c518] flex-shrink-0" />
              <a href="tel:0947007881" className="text-gray-300 text-sm hover:text-white transition-colors">0947 007 881</a>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} className="text-[#f5c518] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-300 text-sm">Thứ 2 - Chủ Nhật</p>
                <p className="text-white font-semibold text-sm">10:00 - 20:30</p>
              </div>
            </div>
          </div>

          {/* Map preview */}
          <div className="mt-4 rounded-xl overflow-hidden border border-[#2d7a40]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.862827756556!2d106.89!3d10.925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDU1JzMwLjAiTiAxMDbCsDUzJzI0LjAiRQ!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn"
              width="100%"
              height="120"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="KUTIN Food & Drink Location"
            />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#2d7a40] py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-400">
          <p>© {currentYear} KUTIN Food & Drink. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <p>Giao hàng tận nơi • Hotline: <a href="tel:0947007881" className="text-[#f5c518] hover:underline">0947 007 881</a></p>
            <span className="text-gray-600">•</span>
            <Link to="/admin" className="text-gray-500 hover:text-white transition-colors">
              🔒 Nhân viên
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
