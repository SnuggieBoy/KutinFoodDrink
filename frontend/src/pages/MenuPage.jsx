import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MenuCard from '../components/MenuCard'
import { getActiveMenu, categories } from '../data/menuData'

import { useRestaurant } from '../context/RestaurantContext'
import ServiceCallModal from '../components/ServiceCallModal'

export default function MenuPage() {
  const { currentTable, selectCustomerTable } = useRestaurant()
  const [showCallModal, setShowCallModal] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'all')
  const [allDishes, setAllDishes] = useState(() => getActiveMenu())

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'kutin_custom_menu') {
        setAllDishes(getActiveMenu())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    const cat = searchParams.get('cat')
    if (cat) setActiveCategory(cat)
  }, [searchParams])

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId)
    if (catId !== 'all') setSearchParams({ cat: catId })
    else setSearchParams({})
  }

  const filtered = useMemo(() => {
    return allDishes.filter(item => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [allDishes, activeCategory, search])

  return (
    <div className="min-h-screen bg-[#fdf8f0] pb-20 md:pb-10">
      <Navbar />

      {/* Header */}
      <div className="bg-[#1a5c2a] pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          {/* Table Indicator Badge */}
          {currentTable ? (
            <div className="inline-flex items-center gap-2 bg-[#f5c518] text-[#1a5c2a] px-4 py-1.5 rounded-full text-xs font-black mb-3 shadow-md">
              <span>🍽️ ĐANG GỌI MÓN TẠI: BÀN {currentTable}</span>
              <button
                onClick={() => setShowCallModal(true)}
                className="underline hover:text-black ml-1"
              >
                (Đổi bàn / Gọi phục vụ)
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCallModal(true)}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-[#f5c518] px-4 py-1.5 rounded-full text-xs font-bold mb-3 transition-colors backdrop-blur-sm"
            >
              <span>📍 Đang ngồi tại quán? Bấm chọn số bàn</span>
            </button>
          )}

          <h1 className="text-white font-black text-3xl md:text-5xl mb-2 tracking-tight">Thực Đơn KUTIN</h1>
          <p className="text-white/80 text-xs md:text-sm">Trọn vẹn 91 món ăn vặt & mì cay ngon nức tiếng Hố Nai</p>
        </div>
      </div>

      {/* Search + Filter sticky bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm món ăn..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c2a] bg-gray-50"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">{filtered.length} món</span>
          </div>
        </div>

        {/* Category tabs scrollable */}
        <div className="max-w-7xl mx-auto px-4 pb-2 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-[#1a5c2a] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🍽️ Tất Cả
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-[#1a5c2a] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">🔍</div>
            <p className="font-semibold text-lg">Không tìm thấy món nào</p>
            <p className="text-sm mt-1">Thử từ khóa khác hoặc chọn danh mục khác</p>
            <button
              onClick={() => { setSearch(''); handleCategoryChange('all') }}
              className="mt-4 bg-[#1a5c2a] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#2d7a40] transition-colors"
            >
              Xem tất cả
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {filtered.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <MenuCard item={item} compact />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <ServiceCallModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
      />

      <Footer />
    </div>
  )
}
