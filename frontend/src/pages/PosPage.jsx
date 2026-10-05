import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, Plus, Minus, Trash2, Printer, QrCode, Banknote, 
  RotateCcw, UtensilsCrossed, ShoppingBag, CheckCircle, 
  Clock, ArrowLeft, ArrowRight, LayoutGrid, Flame, Check, Sparkles, ChefHat
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getActiveMenu, menuItems, categories, formatPrice } from '../data/menuData'
import SepayQRModal from '../components/SepayQRModal'
import ReceiptPrintModal from '../components/ReceiptPrintModal'
import { useRestaurant } from '../context/RestaurantContext'
import { sound } from '../utils/sound'

const TABLES = [
  { id: 'T1', name: 'Bàn 01' },
  { id: 'T2', name: 'Bàn 02' },
  { id: 'T3', name: 'Bàn 03' },
  { id: 'T4', name: 'Bàn 04' },
  { id: 'T5', name: 'Bàn 05' },
  { id: 'T6', name: 'Bàn 06' },
  { id: 'T7', name: 'Bàn 07' },
  { id: 'T8', name: 'Bàn 08' },
  { id: 'MV', name: 'Mang Về' },
  { id: 'SHIP', name: 'Giao Hàng' },
]

const TOPPING_OPTIONS = [
  { name: 'Thêm Phô mai', price: 10000 },
  { name: 'Thêm Mì', price: 10000 },
  { name: 'Thêm Bò', price: 15000 },
  { name: 'Thêm Trứng', price: 5000 },
  { name: 'Thêm Xúc xích', price: 10000 },
  { name: 'Thêm Kim chi', price: 10000 },
]

export default function PosPage() {
  const { 
    serviceCalls, 
    resolveServiceCall, 
    isAdminAuthenticated, 
    loginAdmin, 
    logoutAdmin 
  } = useRestaurant()

  const [posPassword, setPosPassword] = useState('')
  const [posError, setPosError] = useState(false)

  const [activeTable, setActiveTable] = useState('T1')
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [mobileTab, setMobileTab] = useState('menu') // 'menu' | 'cart'
  const [tableOrders, setTableOrders] = useState(() => {
    return JSON.parse(localStorage.getItem('kutin_pos_tables') || '{}')
  })

  // Item customization modal
  const [customizingItem, setCustomizingItem] = useState(null)
  const [selectedSpicyLevel, setSelectedSpicyLevel] = useState(1)
  const [selectedToppings, setSelectedToppings] = useState([])
  const [itemNote, setItemNote] = useState('')

  // Modals
  const [showSepayModal, setShowSepayModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [currentPrintOrder, setCurrentPrintOrder] = useState(null)

  // Cash payment calculator modal
  const [showCashModal, setShowCashModal] = useState(false)
  const [cashGiven, setCashGiven] = useState('')

  // Discount
  const [discountPercent, setDiscountPercent] = useState(0)

  // Sync active table cart
  const currentCart = tableOrders[activeTable] || []

  // Save table orders to localStorage
  useEffect(() => {
    localStorage.setItem('kutin_pos_tables', JSON.stringify(tableOrders))
  }, [tableOrders])

  const [posMenuItems, setPosMenuItems] = useState(() => getActiveMenu())

  // Reload menu if storage changes
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'kutin_custom_menu') {
        setPosMenuItems(getActiveMenu())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Filter items
  const filteredItems = posMenuItems.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory
    const matchSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCat && matchSearch
  })

  // Table status check
  const getTableItemCount = (tableId) => {
    const list = tableOrders[tableId] || []
    return list.reduce((sum, item) => sum + item.qty, 0)
  }

  // Handle open customize or direct add
  const handleItemClick = (item) => {
    if (item.category === 'mi-cay') {
      setCustomizingItem(item)
      setSelectedSpicyLevel(1)
      setSelectedToppings([])
      setItemNote('')
    } else {
      addToCart(item, { spicyLevel: null, toppings: [], note: '' })
    }
  }

  const confirmCustomizeAndAdd = () => {
    if (!customizingItem) return
    addToCart(customizingItem, {
      spicyLevel: selectedSpicyLevel,
      toppings: selectedToppings,
      note: itemNote,
    })
    setCustomizingItem(null)
  }

  const addToCart = (item, options = {}) => {
    const toppingsTotal = (options.toppings || []).reduce((s, t) => s + t.price, 0)
    const effectivePrice = item.price + toppingsTotal
    const toppingNames = (options.toppings || []).map(t => t.name).join(', ')

    // Unique key based on modifiers
    const itemKey = `${item.id}_spicy${options.spicyLevel ?? 'none'}_top${toppingNames}_note${options.note || ''}`

    const existingIdx = currentCart.findIndex(i => i.key === itemKey)
    let newCart = [...currentCart]

    if (existingIdx > -1) {
      newCart[existingIdx].qty += 1
    } else {
      newCart.push({
        key: itemKey,
        id: item.id,
        name: item.name,
        basePrice: item.price,
        price: effectivePrice,
        qty: 1,
        spicyLevel: options.spicyLevel,
        topping: toppingNames,
        note: options.note,
      })
    }

    setTableOrders(prev => ({
      ...prev,
      [activeTable]: newCart,
    }))
    toast.success(`+1 ${item.name}`, { duration: 1200 })
  }

  const updateCartQty = (key, delta) => {
    let newCart = currentCart.map(item => {
      if (item.key === key) {
        return { ...item, qty: item.qty + delta }
      }
      return item
    }).filter(item => item.qty > 0)

    setTableOrders(prev => ({
      ...prev,
      [activeTable]: newCart,
    }))
  }

  const removeCartItem = (key) => {
    const newCart = currentCart.filter(item => item.key !== key)
    setTableOrders(prev => ({
      ...prev,
      [activeTable]: newCart,
    }))
  }

  const clearCurrentTable = () => {
    if (window.confirm(`Xác nhận xóa hết món của ${TABLES.find(t => t.id === activeTable)?.name}?`)) {
      setTableOrders(prev => ({
        ...prev,
        [activeTable]: [],
      }))
      setDiscountPercent(0)
    }
  }

  // Calculate totals
  const subtotal = currentCart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const discountAmount = Math.round((subtotal * discountPercent) / 100)
  const grandTotal = Math.max(0, subtotal - discountAmount)

  // Build current order object
  const buildCurrentOrderObject = (paymentMethod = 'cash') => {
    const activeTableName = TABLES.find(t => t.id === activeTable)?.name || 'Tại bàn'
    return {
      orderNumber: `POS${Date.now().toString().slice(-6)}`,
      tableName: activeTableName,
      items: currentCart,
      totalAmount: subtotal,
      discountAmount,
      grandTotal,
      paymentMethod,
      orderType: activeTable === 'MV' ? 'takeaway' : (activeTable === 'SHIP' ? 'delivery' : 'dine-in'),
      status: 'done',
      createdAt: new Date().toISOString(),
      source: 'POS',
    }
  }

  // Finalize payment
  const completeOrder = (paymentMethod = 'cash') => {
    if (currentCart.length === 0) {
      toast.error('Chưa có món nào trong đơn!')
      return
    }

    const completedOrder = buildCurrentOrderObject(paymentMethod)

    // Save to master orders list in localStorage
    const masterOrders = JSON.parse(localStorage.getItem('kutin_orders') || '[]')
    masterOrders.push(completedOrder)
    localStorage.setItem('kutin_orders', JSON.stringify(masterOrders))

    // Clear active table
    setTableOrders(prev => ({
      ...prev,
      [activeTable]: [],
    }))
    setDiscountPercent(0)
    setShowSepayModal(false)
    setShowCashModal(false)

    // Open receipt modal for printing
    setCurrentPrintOrder(completedOrder)
    setShowPrintModal(true)
    sound.playSuccess()
    toast.success(`🎉 Thanh toán thành công ${completedOrder.tableName}!`)
  }

  const handleUnlockPos = (e) => {
    e.preventDefault()
    if (loginAdmin(posPassword)) {
      setPosError(false)
      setPosPassword('')
    } else {
      setPosError(true)
      toast.error('Mật khẩu mở khóa không đúng!')
    }
  }

  // POS Security Lock Guard if not authenticated
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#0f3a1a] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#f5c518] text-[#1a5c2a] flex items-center justify-center mx-auto text-2xl sm:text-3xl font-black shadow-lg">
            K
          </div>
          <div>
            <h2 className="font-black text-xl text-gray-900">Khóa Máy Thu Ngân POS</h2>
            <p className="text-gray-500 text-xs mt-1">Vui lòng nhập mật khẩu quản lý để mở khóa máy</p>
          </div>

          <form onSubmit={handleUnlockPos} className="space-y-3 pt-2">
            <input
              type="password"
              autoFocus
              value={posPassword}
              onChange={e => {
                setPosPassword(e.target.value)
                setPosError(false)
              }}
              placeholder="Nhập mật khẩu POS..."
              className={`w-full px-4 py-3 rounded-2xl border-2 text-center text-lg font-mono font-bold focus:outline-none transition-colors ${
                posError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c2a]'
              }`}
            />
            {posError && <p className="text-red-500 text-xs">Mật khẩu không chính xác!</p>}

            <button
              type="submit"
              className="w-full bg-[#1a5c2a] hover:bg-[#2d7a40] text-white py-3.5 rounded-2xl font-black text-sm shadow-md transition-all active:scale-95"
            >
              Mở Khóa Máy Bán Hàng
            </button>
          </form>

          <div className="pt-2 border-t">
            <Link
              to="/"
              className="text-gray-400 hover:text-gray-700 text-xs font-semibold inline-flex items-center gap-1"
            >
              ← Quay lại trang chủ khách hàng
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-gray-100 overflow-hidden font-sans">
      {/* ===== POS TOPBAR ===== */}
      <header className="bg-[#1a5c2a] text-white h-14 px-4 flex items-center justify-between shadow-md z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="w-9 h-9 rounded-xl bg-[#f5c518] text-[#1a5c2a] flex items-center justify-center font-black text-lg hover:scale-105 transition-transform shadow">
            K
          </Link>
          <div>
            <h1 className="font-black text-base tracking-wide flex items-center gap-2">
              KUTIN POS 
              <span className="bg-[#f5c518] text-[#1a5c2a] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                Thu Ngân
              </span>
            </h1>
          </div>
        </div>

        {/* Quick Nav Links */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {serviceCalls.length > 0 && (
            <span className="bg-red-500 text-white text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-full font-black animate-bounce flex items-center gap-1 shadow">
              🔔 {serviceCalls.length} bàn gọi
            </span>
          )}
          <Link
            to="/admin"
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
          >
            📊 <span className="hidden sm:inline">Báo Cáo /</span> Admin
          </Link>
          <button
            onClick={logoutAdmin}
            className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors"
            title="Khóa máy POS"
          >
            🔒 <span className="hidden sm:inline">Khóa Máy</span>
          </button>
          <Link
            to="/"
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
          >
            <ArrowLeft size={14} /> <span className="hidden sm:inline">Về Web Khách</span>
          </Link>
        </div>
      </header>

      {/* ===== MOBILE TAB SWITCHER ===== */}
      <div className="md:hidden flex bg-[#0f3a1a] p-1 border-b border-[#1b632e] flex-shrink-0">
        <button
          onClick={() => setMobileTab('menu')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'menu' ? 'bg-[#f5c518] text-[#1a5c2a] font-black shadow' : 'text-white/70'
          }`}
        >
          🍽️ Chọn Món ({filteredItems.length})
        </button>
        <button
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all relative ${
            mobileTab === 'cart' ? 'bg-[#f5c518] text-[#1a5c2a] font-black shadow' : 'text-white/70'
          }`}
        >
          🧾 Đơn Bàn ({currentCart.reduce((s, i) => s + i.qty, 0)})
          {currentCart.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute top-1.5 right-3" />
          )}
        </button>
      </div>

      {/* ===== ACTIVE SERVICE CALLS BANNER (IF ANY) ===== */}
      {serviceCalls.length > 0 && (
        <div className="bg-amber-400 text-amber-950 px-4 py-2 flex items-center justify-between text-xs font-bold overflow-x-auto border-b border-amber-500 shadow-inner flex-shrink-0 animate-fadeIn">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 font-black uppercase text-[11px] bg-amber-600 text-white px-2 py-0.5 rounded-lg">
              🔔 Yêu Cầu Tại Bàn:
            </span>
            {serviceCalls.map(call => (
              <div key={call.id} className="bg-white/80 px-2.5 py-1 rounded-xl flex items-center gap-2 border border-amber-300 shadow-sm">
                <span className="font-black text-[#1a5c2a]">{call.table}</span>
                <span>• {call.type}</span>
                <span className="text-[10px] text-gray-500">({call.time})</span>
                <button
                  onClick={() => resolveServiceCall(call.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded-lg text-[10px] font-black transition-colors"
                >
                  ✓ Đã Xong
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== POS MAIN WORKSPACE ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Table Bar + Categories + Menu Items */}
        <div className={`flex-1 flex-col bg-gray-50 border-r border-gray-200 overflow-hidden ${mobileTab === 'menu' ? 'flex' : 'hidden md:flex'}`}>
          {/* Table Selector Bar */}
          <div className="bg-white p-2.5 border-b border-gray-200 overflow-x-auto scrollbar-none flex-shrink-0">
            <div className="flex gap-2 min-w-max">
              {TABLES.map(table => {
                const count = getTableItemCount(table.id)
                const isActive = activeTable === table.id
                return (
                  <button
                    key={table.id}
                    onClick={() => setActiveTable(table.id)}
                    className={`relative px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
                      isActive
                        ? 'bg-[#1a5c2a] text-white shadow-[#1a5c2a]/20 scale-105'
                        : count > 0
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{table.name}</span>
                    {count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? 'bg-[#f5c518] text-[#1a5c2a]' : 'bg-red-500 text-white animate-pulse'
                      }`}>
                        {count} món
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Search + Category Tabs */}
          <div className="bg-white px-3 py-2 border-b border-gray-200 flex flex-col gap-2 flex-shrink-0">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm nhanh món ăn (bấm hoặc gõ tên món)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:border-[#1a5c2a] focus:bg-white"
              />
            </div>

            {/* Category tabs */}
            <div className="overflow-x-auto scrollbar-none pb-1">
              <div className="flex gap-1.5 min-w-max">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-[#f5c518] text-[#1a5c2a] font-black'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tất cả ({posMenuItems.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-[#f5c518] text-[#1a5c2a] font-black'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#1a5c2a] text-left flex flex-col justify-between transition-all active:scale-95 group relative overflow-hidden"
                >
                  {item.category === 'mi-cay' && (
                    <span className="absolute top-1 right-1 bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                      <Flame size={10} /> Chọn cay
                    </span>
                  )}
                  <div>
                    <p className="font-bold text-gray-800 text-xs line-clamp-2 group-hover:text-[#1a5c2a] transition-colors leading-tight">
                      {item.name}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">{categories.find(c => c.id === item.category)?.name}</span>
                  </div>
                  <div className="mt-2 pt-1 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-black text-[#1a5c2a] text-xs">
                      {formatPrice(item.price)}
                    </span>
                    <span className="w-5 h-5 rounded-lg bg-[#1a5c2a]/10 text-[#1a5c2a] group-hover:bg-[#1a5c2a] group-hover:text-white flex items-center justify-center transition-colors">
                      <Plus size={12} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Floating Cart Bar on Mobile when browsing Menu */}
          {currentCart.length > 0 && (
            <div className="md:hidden p-2.5 bg-white border-t border-gray-200 shadow-lg flex-shrink-0 animate-fadeIn">
              <button
                onClick={() => setMobileTab('cart')}
                className="w-full bg-[#1a5c2a] text-[#f5c518] py-3 rounded-2xl font-black text-xs flex items-center justify-between px-4 shadow-md active:scale-95 transition-transform"
              >
                <span>🧾 Xem Đơn Bàn ({currentCart.reduce((s, i) => s + i.qty, 0)} món)</span>
                <span className="flex items-center gap-1 text-white font-bold">{formatPrice(grandTotal)} <ArrowRight size={14} /></span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Active Table Cart & Checkout */}
        <div className={`w-full md:w-[380px] lg:w-[420px] bg-white flex-col border-l border-gray-200 shadow-xl flex-shrink-0 ${mobileTab === 'cart' ? 'flex' : 'hidden md:flex'}`}>
          {/* Mobile Back Button to return to menu */}
          <div className="md:hidden bg-gray-50 px-3.5 py-2 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => setMobileTab('menu')}
              className="text-xs font-bold text-[#1a5c2a] flex items-center gap-1 py-0.5 hover:underline"
            >
              <ArrowLeft size={14} /> ← Quay lại chọn thêm món
            </button>
            <span className="text-[11px] font-bold text-gray-500">
              {TABLES.find(t => t.id === activeTable)?.name}
            </span>
          </div>
          {/* Cart Header */}
          <div className="bg-[#1a5c2a] text-white p-3.5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f5c518] animate-ping"></span>
                <h2 className="font-black text-sm">
                  {TABLES.find(t => t.id === activeTable)?.name}
                </h2>
                <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {currentCart.length} món
                </span>
              </div>
            </div>
            {currentCart.length > 0 && (
              <button
                onClick={clearCurrentTable}
                className="text-white/70 hover:text-red-300 text-xs flex items-center gap-1 transition-colors"
                title="Xóa bàn"
              >
                <Trash2 size={13} /> Xóa bàn
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {currentCart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-6 space-y-3">
                <UtensilsCrossed size={48} strokeWidth={1.5} className="text-gray-300" />
                <p className="font-bold text-sm text-gray-600">Bàn chưa có món nào</p>
                <p className="text-xs text-gray-400">Bấm món ở danh mục bên trái để thêm nhanh vào đơn của bàn này.</p>
              </div>
            ) : (
              currentCart.map(item => (
                <div key={item.key} className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs flex flex-col gap-1.5">
                  <div className="flex justify-between items-start gap-1">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 leading-tight">{item.name}</p>
                      {/* Modifiers */}
                      <div className="text-[11px] text-gray-500 mt-0.5 space-y-0.5">
                        {item.spicyLevel !== null && item.spicyLevel !== undefined && (
                          <span className="inline-block bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold mr-1">
                            🌶️ Cay cấp {item.spicyLevel}
                          </span>
                        )}
                        {item.topping && (
                          <span className="inline-block bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium mr-1">
                            + {item.topping}
                          </span>
                        )}
                        {item.note && (
                          <span className="inline-block text-gray-400 italic">
                            ({item.note})
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeCartItem(item.key)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                    <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                      <button
                        onClick={() => updateCartQty(item.key, -1)}
                        className="text-gray-500 hover:text-black p-0.5"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-bold w-5 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateCartQty(item.key, 1)}
                        className="text-gray-500 hover:text-[#1a5c2a] p-0.5"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-black text-[#1a5c2a] text-xs">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Calculations & Actions */}
          <div className="border-t border-gray-200 bg-white p-3.5 space-y-2.5">
            {/* Discount selector */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Giảm giá:</span>
              <div className="flex gap-1">
                {[0, 5, 10, 15].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setDiscountPercent(pct)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      discountPercent === pct
                        ? 'bg-[#1a5c2a] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Giảm giá ({discountPercent}%):</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-1.5 border-t border-gray-200 font-black">
                <span className="text-gray-800 text-sm">KHÁCH PHẢI TRẢ:</span>
                <span className="text-xl text-[#1a5c2a]">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {/* Quick Print Draft / Order Slip */}
              <button
                disabled={currentCart.length === 0}
                onClick={() => {
                  setCurrentPrintOrder(buildCurrentOrderObject('draft'))
                  setShowPrintModal(true)
                }}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Printer size={14} /> Tạm Tính / In Phiếu Bếp
              </button>

              {/* Main Payment Options */}
              <div className="grid grid-cols-2 gap-2">
                {/* Cash Payment */}
                <button
                  disabled={currentCart.length === 0}
                  onClick={() => {
                    setCashGiven(grandTotal.toString())
                    setShowCashModal(true)
                  }}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  <Banknote size={16} /> Tiền Mặt
                </button>

                {/* SePay VietQR Payment */}
                <button
                  disabled={currentCart.length === 0}
                  onClick={() => setShowSepayModal(true)}
                  className="py-3 bg-gradient-to-r from-[#1a5c2a] to-[#2d7a40] hover:from-[#0f3a1a] hover:to-[#1a5c2a] text-[#f5c518] rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 border border-[#f5c518]/30"
                >
                  <QrCode size={16} /> SePay QR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ITEM CUSTOMIZER MODAL (SPICY LEVEL & TOPPINGS) ===== */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-5 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Tùy chọn Mì Cay</span>
                <h3 className="font-black text-base text-gray-800 mt-1">{customizingItem.name}</h3>
                <p className="text-xs font-bold text-[#1a5c2a]">{formatPrice(customizingItem.price)}</p>
              </div>
              <button
                onClick={() => setCustomizingItem(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Spicy Level Picker */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2 flex items-center gap-1">
                <Flame size={14} className="text-red-500" /> Chọn Cấp Độ Cay (0 đến 7):
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 0.5, 1, 2, 3, 4, 5, 6, 7].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedSpicyLevel(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedSpicyLevel === lvl
                        ? 'bg-red-600 text-white shadow-md scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cấp {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Toppings Picker */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Topping Thêm:</label>
              <div className="grid grid-cols-2 gap-2">
                {TOPPING_OPTIONS.map(top => {
                  const isChecked = selectedToppings.some(t => t.name === top.name)
                  return (
                    <button
                      key={top.name}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setSelectedToppings(prev => prev.filter(t => t.name !== top.name))
                        } else {
                          setSelectedToppings(prev => [...prev, top])
                        }
                      }}
                      className={`p-2 rounded-xl text-xs font-semibold text-left border transition-all flex items-center justify-between ${
                        isChecked
                          ? 'border-[#1a5c2a] bg-[#1a5c2a]/10 text-[#1a5c2a]'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{top.name}</span>
                      <span className="font-bold text-[10px]">+{formatPrice(top.price)}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Item Note */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Ghi chú bếp:</label>
              <input
                type="text"
                placeholder="VD: Không hành lá, nhiều nước dùng..."
                value={itemNote}
                onChange={e => setItemNote(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#1a5c2a]"
              />
            </div>

            {/* Action */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setCustomizingItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmCustomizeAndAdd}
                className="flex-1 py-2.5 rounded-xl bg-[#1a5c2a] text-white text-xs font-bold hover:bg-[#2d7a40] transition-colors shadow-md"
              >
                Xác Nhận Thêm Vào Đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CASH PAYMENT MODAL ===== */}
      {showCashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h3 className="font-black text-base text-gray-800 flex items-center gap-2">
              <Banknote className="text-emerald-600" /> Thanh Toán Tiền Mặt
            </h3>

            <div className="bg-gray-50 p-3 rounded-2xl border space-y-1 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Số tiền phải thu:</span>
                <span className="font-bold text-gray-800">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Tiền khách đưa:</label>
              <div className="relative">
                <input
                  type="number"
                  readOnly
                  value={cashGiven}
                  className="w-full px-4 py-2.5 text-xl font-mono font-black text-emerald-950 bg-gray-50 rounded-2xl border-2 border-emerald-500/40 focus:outline-none"
                />
                {cashGiven && (
                  <button
                    type="button"
                    onClick={() => setCashGiven('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-xs font-bold"
                  >
                    Xóa
                  </button>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => setCashGiven(grandTotal.toString())}
                  className="py-1.5 bg-emerald-100 hover:bg-emerald-200 rounded-xl text-[11px] font-black text-emerald-800 transition-colors"
                >
                  Đúng Tiền
                </button>
                {[100000, 200000, 500000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashGiven(amt.toString())}
                    className="py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-[11px] font-bold text-gray-700 transition-colors"
                  >
                    {formatPrice(amt)}
                  </button>
                ))}
              </div>

              {/* Touchscreen Virtual Numpad */}
              <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-gray-100">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCashGiven(prev => `${prev || ''}${num}`)}
                    className="h-11 bg-gray-50 hover:bg-gray-200 active:scale-95 text-gray-900 rounded-xl text-base font-bold shadow-sm border border-gray-200 transition-all"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCashGiven(prev => `${prev || ''}000`)}
                  className="h-11 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 rounded-xl text-xs font-black shadow-sm border border-gray-200 transition-all"
                >
                  .000
                </button>
                <button
                  type="button"
                  onClick={() => setCashGiven(prev => `${prev || ''}0`)}
                  className="h-11 bg-gray-50 hover:bg-gray-200 active:scale-95 text-gray-900 rounded-xl text-base font-bold shadow-sm border border-gray-200 transition-all"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setCashGiven(prev => prev.slice(0, -1))}
                  className="h-11 bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 rounded-xl text-sm font-black shadow-sm border border-red-200 transition-all"
                >
                  ⌫
                </button>
              </div>
            </div>

            {/* Change return */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Tiền thối lại khách:</span>
                <span className="font-black text-base text-emerald-900">
                  {formatPrice(Math.max(0, (Number(cashGiven) || 0) - grandTotal))}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCashModal(false)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={(Number(cashGiven) || 0) < grandTotal}
                onClick={() => completeOrder('cash')}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black shadow-md transition-all active:scale-95"
              >
                Xác Nhận & In Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SEPAY VIETQR PAYMENT MODAL ===== */}
      <SepayQRModal
        isOpen={showSepayModal}
        onClose={() => setShowSepayModal(false)}
        amount={grandTotal}
        orderCode={`POS${Date.now().toString().slice(-4)}`}
        customerName={TABLES.find(t => t.id === activeTable)?.name}
        onSuccess={() => completeOrder('sepay')}
      />

      {/* ===== K80 PRINT MODAL ===== */}
      <ReceiptPrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        order={currentPrintOrder}
      />
    </div>
  )
}
