import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  BarChart3, ShoppingBag, Users, TrendingUp, Package, Eye, EyeOff, 
  Settings, LogOut, ChefHat, QrCode, Printer, CheckCircle, Clock, 
  Flame, CreditCard, Banknote, ArrowUpRight, Search, ShieldCheck, Check,
  Plus, Edit2, Trash2, Filter, RotateCcw, LayoutGrid, List, AlertTriangle,
  ArrowRight, X, Sparkles, CheckSquare, Coffee, Utensils
} from 'lucide-react'
import toast from 'react-hot-toast'
import { menuItems, formatPrice, categories, getActiveMenu, saveActiveMenu } from '../data/menuData'
import ReceiptPrintModal from '../components/ReceiptPrintModal'
import { useRestaurant } from '../context/RestaurantContext'

// Demo sample data to make dashboard look rich and alive for demo
const INITIAL_DEMO_ORDERS = [
  {
    orderNumber: 'POS9012',
    tableName: 'Bàn 03',
    items: [
      { name: 'Mì Cay Thập Cẩm Đặc Biệt (full topping)', qty: 2, price: 70000, spicyLevel: 2, topping: 'Thêm Phô mai' },
      { name: 'Trà Sữa Truyện Thống', qty: 2, price: 25000 },
    ],
    totalAmount: 190000,
    grandTotal: 190000,
    discountAmount: 0,
    paymentMethod: 'sepay',
    orderType: 'dine-in',
    status: 'done',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    source: 'POS',
  },
  {
    orderNumber: 'POS9015',
    tableName: 'Bàn 01',
    items: [
      { name: 'Cơm Trộn Gà Xù Phô Mai', qty: 1, price: 55000 },
      { name: 'Tokpokki Phô Mai Thập Cẩm', qty: 1, price: 65000 },
      { name: 'Pepsi / Coca / Sting / 7up', qty: 2, price: 15000 },
    ],
    totalAmount: 150000,
    grandTotal: 150000,
    discountAmount: 0,
    paymentMethod: 'cash',
    orderType: 'dine-in',
    status: 'done',
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    source: 'POS',
  },
  {
    orderNumber: 'KT8920',
    tableName: 'Giao hàng',
    customer: { name: 'Nguyễn Văn Minh', phone: '0908 123 456', address: '45 Hố Nai, Biên Hòa' },
    items: [
      { name: 'Bạch Tuộc Sốt Cay Phô Mai (bánh mì)', qty: 2, price: 59000 },
      { name: 'Khoai Tây Đút Lò Phô Mai', qty: 1, price: 35000 },
    ],
    totalAmount: 153000,
    shippingFee: 0,
    grandTotal: 153000,
    discountAmount: 0,
    paymentMethod: 'sepay',
    orderType: 'delivery',
    status: 'preparing',
    estimateTime: 'Dự kiến 15 phút',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    source: 'WEB',
  },
  {
    orderNumber: 'POS9022',
    tableName: 'Bàn 05',
    items: [
      { name: 'Mì Cay Hải Sản', qty: 2, price: 50000, spicyLevel: 3 },
      { name: 'Gà Xù Sốt Cay Phô Mai', qty: 1, price: 55000 },
    ],
    totalAmount: 155000,
    grandTotal: 155000,
    discountAmount: 0,
    paymentMethod: 'sepay',
    orderType: 'dine-in',
    status: 'preparing',
    estimateTime: 'Bếp đang nấu món',
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    source: 'POS',
  },
]

export default function AdminPage() {
  const { isAdminAuthenticated, loginAdmin, logoutAdmin } = useRestaurant()
  const [pass, setPass] = useState('')
  const [passErr, setPassErr] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [orders, setOrders] = useState([])
  
  // Dashboard state
  const [timeRange, setTimeRange] = useState('today') // 'today' | '7days' | 'month'

  // MENU FULL CRUD STATE
  const [menu, setMenu] = useState(() => getActiveMenu())
  const [menuSearch, setMenuSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'available' | 'unavailable'
  const [badgeFilter, setBadgeFilter] = useState('all')
  const [viewMode, setViewMode] = useState('table') // 'table' | 'grid'

  // Menu Modals (Create & Edit)
  const [isDishModalOpen, setIsDishModalOpen] = useState(false)
  const [editingDish, setEditingDish] = useState(null)
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'mi-cay',
    price: '',
    badge: '',
    description: '',
    isAvailable: true,
  })

  // Order Filter
  const [orderFilter, setOrderFilter] = useState('all')

  // Print receipt modal state
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [selectedPrintOrder, setSelectedPrintOrder] = useState(null)

  // SePay config settings state
  const [sepayConfig, setSepayConfig] = useState({
    bank: 'MBBank (Ngân hàng Quân Đội)',
    accountNumber: '0947007881',
    accountName: 'KUTIN FOOD AND DRINK',
    apiKey: 'SEP-98124-SEC-KTN998',
    webhookStatus: 'Đang hoạt động (Connected)',
    autoConfirm: true,
  })

  // Sync orders
  useEffect(() => {
    if (isAdminAuthenticated) {
      let saved = JSON.parse(localStorage.getItem('kutin_orders') || '[]')
      if (saved.length === 0) {
        saved = INITIAL_DEMO_ORDERS
        localStorage.setItem('kutin_orders', JSON.stringify(saved))
      }
      setOrders(saved)
    }
  }, [isAdminAuthenticated])

  const handleLogin = (e) => {
    e.preventDefault()
    if (loginAdmin(pass)) {
      setPassErr(false)
      setPass('')
    } else {
      setPassErr(true)
    }
  }

  // ================= MENU CRUD HANDLERS =================
  const openAddDishModal = () => {
    setEditingDish(null)
    setDishForm({
      name: '',
      category: 'mi-cay',
      price: '',
      badge: '',
      description: '',
      isAvailable: true,
    })
    setIsDishModalOpen(true)
  }

  const openEditDishModal = (dish) => {
    setEditingDish(dish)
    setDishForm({
      name: dish.name,
      category: dish.category,
      price: dish.price,
      badge: dish.badge || '',
      description: dish.description || '',
      isAvailable: dish.isAvailable !== false,
    })
    setIsDishModalOpen(true)
  }

  const handleSaveDish = (e) => {
    e.preventDefault()
    if (!dishForm.name.trim()) {
      toast.error('Vui lòng nhập tên món ăn!')
      return
    }
    const numPrice = Number(dishForm.price)
    if (!numPrice || numPrice <= 0) {
      toast.error('Vui lòng nhập giá bán hợp lệ!')
      return
    }

    let updatedMenu = []
    if (editingDish) {
      // UPDATE
      updatedMenu = menu.map(item =>
        item.id === editingDish.id
          ? {
              ...item,
              name: dishForm.name.trim(),
              category: dishForm.category,
              price: numPrice,
              badge: dishForm.badge || undefined,
              description: dishForm.description.trim(),
              isAvailable: dishForm.isAvailable,
            }
          : item
      )
      toast.success(`Đã cập nhật món "${dishForm.name}"!`)
    } else {
      // CREATE
      const newDish = {
        id: Date.now(),
        name: dishForm.name.trim(),
        category: dishForm.category,
        price: numPrice,
        badge: dishForm.badge || undefined,
        description: dishForm.description.trim(),
        isAvailable: dishForm.isAvailable,
        isFeatured: dishForm.badge === 'Hot' || dishForm.badge === 'Bán chạy',
      }
      updatedMenu = [newDish, ...menu]
      toast.success(`🎉 Đã thêm món mới: "${dishForm.name}"!`)
    }

    setMenu(updatedMenu)
    saveActiveMenu(updatedMenu)
    setIsDishModalOpen(false)
  }

  const handleDeleteDish = (id, name) => {
    if (window.confirm(`Xác nhận xóa món "${name}" khỏi thực đơn?`)) {
      const updatedMenu = menu.filter(item => item.id !== id)
      setMenu(updatedMenu)
      saveActiveMenu(updatedMenu)
      toast.success(`Đã xóa món "${name}"!`)
    }
  }

  const toggleItemAvailability = (id) => {
    const updatedMenu = menu.map(item =>
      item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
    )
    setMenu(updatedMenu)
    saveActiveMenu(updatedMenu)
    toast.success('Đã cập nhật trạng thái bán!')
  }

  const handleResetDefaultMenu = () => {
    if (window.confirm('Khôi phục lại toàn bộ thực đơn 91 món gốc ban đầu?')) {
      localStorage.removeItem('kutin_custom_menu')
      setMenu(menuItems)
      toast.success('Đã khôi phục thực đơn gốc!')
    }
  }

  // Filtered menu computation
  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchSearch = !menuSearch || 
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(menuSearch.toLowerCase()))
      
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter
      
      const matchStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'available' && item.isAvailable) ||
        (statusFilter === 'unavailable' && !item.isAvailable)
      
      const matchBadge = badgeFilter === 'all' || item.badge === badgeFilter

      return matchSearch && matchCat && matchStatus && matchBadge
    })
  }, [menu, menuSearch, categoryFilter, statusFilter, badgeFilter])

  // Order status update
  const updateOrderStatus = (orderNumber, status, estimateTime = null) => {
    const updated = orders.map(o => {
      if (o.orderNumber === orderNumber) {
        return {
          ...o,
          status,
          estimateTime: estimateTime !== null ? estimateTime : o.estimateTime,
          updatedAt: new Date().toISOString(),
        }
      }
      return o
    })
    setOrders(updated)
    localStorage.setItem('kutin_orders', JSON.stringify(updated))
    toast.success(`Đã cập nhật đơn #${orderNumber}${estimateTime ? ` (${estimateTime})` : ''}`)
  }

  const openReceiptPrint = (order) => {
    setSelectedPrintOrder(order)
    setShowPrintModal(true)
  }

  // Revenue & Metrics Calculations
  const validOrders = orders.filter(o => o.status !== 'cancelled')
  const totalRevenue = validOrders.reduce((s, o) => s + (o.grandTotal || o.totalAmount || 0), 0)
  const sepayRevenue = validOrders.filter(o => o.paymentMethod === 'sepay' || o.paymentMethod === 'transfer').reduce((s, o) => s + (o.grandTotal || o.totalAmount || 0), 0)
  const cashRevenue = validOrders.filter(o => o.paymentMethod === 'cash' || o.paymentMethod === 'cod').reduce((s, o) => s + (o.grandTotal || o.totalAmount || 0), 0)
  const pendingOrders = orders.filter(o => o.status === 'pending')
  const preparingOrders = orders.filter(o => o.status === 'preparing')

  // Top best sellers
  const itemFrequency = {}
  orders.forEach(o => {
    (o.items || []).forEach(i => {
      itemFrequency[i.name] = (itemFrequency[i.name] || 0) + i.qty
    })
  })
  const bestSellers = Object.entries(itemFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Unauthenticated screen
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07240f] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-scaleUp">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#f5c518] text-[#1a5c2a] flex items-center justify-center mx-auto mb-3 text-3xl font-black shadow-lg">K</div>
            <h1 className="font-black text-2xl text-[#1a5c2a]">KUTIN Admin</h1>
            <p className="text-gray-500 text-xs mt-1">Hệ Thống Quản Trị Trung Tâm</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 block">Mật khẩu quản trị</label>
              <input
                type="password"
                value={pass}
                onChange={e => { setPass(e.target.value); setPassErr(false) }}
                placeholder="Nhập mật khẩu..."
                className={`w-full px-4 py-3 rounded-2xl border-2 text-sm focus:outline-none transition-colors ${passErr ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c2a]'}`}
              />
              {passErr && <p className="text-red-500 text-xs mt-1">Mật khẩu không đúng!</p>}
            </div>
            <button type="submit" className="w-full bg-[#1a5c2a] text-[#f5c518] py-3.5 rounded-2xl font-black text-sm hover:bg-[#2d7a40] transition-colors shadow-md">
              Đăng Nhập Dashboard
            </button>
          </form>
          <div className="mt-4 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-center">
            <p className="text-amber-800 text-xs font-semibold">Mật khẩu demo: <span className="font-mono font-bold">kutin2024</span></p>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'dashboard', label: 'Doanh Thu & Thống Kê', icon: <BarChart3 size={18} /> },
    { id: 'menu', label: 'Quản Lý Thực Đơn', icon: <Package size={18} />, badge: menu.filter(m => !m.isAvailable).length, badgeColor: 'bg-amber-500' },
    { id: 'orders', label: 'Quản Lý Đơn Hàng', icon: <ShoppingBag size={18} />, badge: pendingOrders.length, badgeColor: 'bg-red-500' },
    { id: 'kitchen', label: 'Màn Hình Bếp (KDS)', icon: <ChefHat size={18} />, badge: preparingOrders.length, badgeColor: 'bg-orange-500' },
    { id: 'sepay', label: 'Cấu Hình SePay QR', icon: <QrCode size={18} /> },
  ]

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#0a2f14] text-white flex flex-col fixed h-full z-40 hidden md:flex border-r border-[#155325]">
        {/* Brand */}
        <div className="p-5 border-b border-[#1b632e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f5c518] flex items-center justify-center font-black text-[#1a5c2a] text-xl shadow-md">K</div>
            <div>
              <p className="font-black text-sm tracking-wide text-white">KUTIN F&B</p>
              <p className="text-[#f5c518] text-[10px] font-bold tracking-wider uppercase">Chủ Quán • Quản Trị</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#f5c518] text-[#1a5c2a] shadow-lg shadow-[#f5c518]/20 scale-[1.02]' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.badge > 0 && (
                <span className={`${tab.badgeColor || 'bg-red-500'} text-white text-[10px] px-2 py-0.5 rounded-full font-black`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Links & Logout */}
        <div className="p-3.5 border-t border-[#1b632e] space-y-2">
          <Link
            to="/pos"
            className="flex items-center justify-center gap-2 bg-[#1a5c2a] hover:bg-[#2d7a40] text-[#f5c518] py-2.5 rounded-xl text-xs font-black transition-all shadow-md border border-[#f5c518]/30 hover:scale-[1.02]"
          >
            💻 Mở Máy Bán Hàng POS
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 text-white/60 hover:text-white text-xs py-1 transition-colors"
          >
            ← Về Website Khách Hàng
          </Link>
          <button
            onClick={logoutAdmin}
            className="w-full flex items-center justify-center gap-1.5 text-red-300 hover:text-red-200 text-xs py-1.5 transition-colors font-semibold"
          >
            <LogOut size={13} /> Khóa Quản Trị / Đăng Xuất
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 md:ml-64 p-5 lg:p-8 overflow-y-auto">
        {/* Mobile Navigation */}
        <div className="md:hidden flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap shadow-sm ${
                activeTab === tab.id ? 'bg-[#1a5c2a] text-[#f5c518]' : 'bg-white text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
              {tab.badge > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">{tab.badge}</span>}
            </button>
          ))}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: EXECUTIVE REVENUE DASHBOARD (NÂNG CẤP VƯỢT TRỘI)          */}
        {/* ============================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header + Time Range Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1a5c2a] bg-emerald-50 px-2.5 py-1 rounded-lg">
                  Trung Tâm Điều Hành F&B
                </span>
                <h2 className="font-black text-2xl lg:text-3xl text-gray-900 mt-1">Báo Cáo Doanh Thu & Hiệu Suất</h2>
                <p className="text-gray-500 text-xs">Tổng hợp dữ liệu theo thời gian thực từ POS tại bàn và Website</p>
              </div>

              {/* Time Range Pills */}
              <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl">
                {[
                  { id: 'today', label: 'Hôm nay' },
                  { id: '7days', label: '7 ngày qua' },
                  { id: 'month', label: 'Tháng này' },
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setTimeRange(r.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      timeRange === r.id
                        ? 'bg-[#1a5c2a] text-white shadow'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Large KPI Cards with Progress & Gradients */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Doanh thu */}
              <div className="bg-gradient-to-br from-emerald-900 to-[#1a5c2a] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Tổng Doanh Thu</p>
                    <p className="text-3xl font-black mt-1 text-[#f5c518]">{formatPrice(totalRevenue)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#f5c518]">
                    <TrendingUp size={22} />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
                  <span className="flex items-center gap-1 text-emerald-300 font-bold">
                    <ArrowUpRight size={14} /> +24.8% tăng trưởng
                  </span>
                  <span>Mục tiêu: 85%</span>
                </div>
              </div>

              {/* Tổng Đơn */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Tổng Số Đơn</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{orders.length} đơn</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <ShoppingBag size={20} />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                  <span>Giá trị TB/đơn:</span>
                  <span className="font-bold text-gray-800">
                    {formatPrice(orders.length ? Math.round(totalRevenue / orders.length) : 0)}
                  </span>
                </div>
              </div>

              {/* SePay VietQR */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-purple-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <QrCode size={13} /> SePay VietQR
                    </p>
                    <p className="text-3xl font-black text-purple-700 mt-1">{formatPrice(sepayRevenue)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Tỷ trọng tự động:</span>
                    <span className="font-bold text-purple-700">
                      {totalRevenue > 0 ? Math.round((sepayRevenue / totalRevenue) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{ width: `${totalRevenue > 0 ? (sepayRevenue / totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tiền mặt */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-amber-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <Banknote size={13} /> Tiền Mặt Tại Quầy
                    </p>
                    <p className="text-3xl font-black text-amber-800 mt-1">{formatPrice(cashRevenue)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
                    <Banknote size={20} />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Tỷ trọng tiền mặt:</span>
                    <span className="font-bold text-amber-800">
                      {totalRevenue > 0 ? Math.round((cashRevenue / totalRevenue) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${totalRevenue > 0 ? (cashRevenue / totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Analytics Chart & Top Best Sellers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 7 Days Revenue Trend */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-lg text-gray-900">Biểu Đồ Doanh Thu 7 Ngày Gần Nhất</h3>
                    <p className="text-gray-400 text-xs">Cập nhật theo chu kỳ bán hàng tuần của KUTIN</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">
                    Đỉnh điểm: Thứ 7 & CN
                  </span>
                </div>

                <div className="flex items-end justify-between h-48 pt-6 px-2 border-b border-gray-100">
                  {[
                    { day: 'T2', amount: 1450000, height: '42%', count: 12 },
                    { day: 'T3', amount: 1890000, height: '52%', count: 16 },
                    { day: 'T4', amount: 2150000, height: '60%', count: 18 },
                    { day: 'T5', amount: 1780000, height: '48%', count: 14 },
                    { day: 'T6', amount: 2890000, height: '82%', count: 24 },
                    { day: 'T7', amount: 3560000, height: '98%', count: 32 },
                    { day: 'CN (Nay)', amount: totalRevenue || 2980000, height: '85%', isToday: true, count: orders.length },
                  ].map(bar => (
                    <div key={bar.day} className="flex flex-col items-center gap-2 group flex-1">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap shadow-md">
                        {formatPrice(bar.amount)} ({bar.count} đơn)
                      </div>
                      <div className="w-9 sm:w-12 bg-gray-100 rounded-t-2xl h-40 flex items-end overflow-hidden p-1">
                        <div
                          style={{ height: bar.height }}
                          className={`w-full rounded-t-xl transition-all duration-700 ${
                            bar.isToday
                              ? 'bg-gradient-to-t from-[#1a5c2a] via-[#2d7a40] to-[#f5c518]'
                              : 'bg-gradient-to-t from-gray-300 to-gray-400 group-hover:from-emerald-600 group-hover:to-emerald-500'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-bold ${bar.isToday ? 'text-[#1a5c2a] font-black' : 'text-gray-500'}`}>
                        {bar.day}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#1a5c2a] to-[#f5c518]"></span>
                    <span>Hôm nay (Thời gian thực)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                    <span>Các ngày trong tuần</span>
                  </div>
                </div>
              </div>

              {/* Best Sellers Leaderboard */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-lg text-gray-900 mb-1">Món Bán Chạy Nhất</h3>
                  <p className="text-gray-400 text-xs mb-4">Top 5 món đóng góp doanh thu cao nhất</p>

                  <div className="space-y-3">
                    {bestSellers.length === 0 ? (
                      <p className="text-gray-400 text-xs text-center py-8">Chưa có đủ dữ liệu đơn hàng</p>
                    ) : (
                      bestSellers.map(([name, qty], idx) => (
                        <div key={name} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                            idx === 0 ? 'bg-[#f5c518] text-[#1a5c2a] shadow-sm' :
                            idx === 1 ? 'bg-gray-200 text-gray-700' :
                            idx === 2 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'
                          }`}>
                            #{idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-gray-800 line-clamp-1">{name}</p>
                            <div className="w-full bg-gray-200 h-1 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className="bg-[#1a5c2a] h-full rounded-full"
                                style={{ width: `${Math.min(100, (qty / 10) * 100)}%` }}
                              />
                            </div>
                          </div>
                          <span className="font-black text-xs text-[#1a5c2a] whitespace-nowrap">
                            {qty} phần
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t mt-4 text-center">
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="text-[#1a5c2a] hover:underline font-bold text-xs flex items-center justify-center gap-1 mx-auto"
                  >
                    Xem toàn bộ 91 món thực đơn →
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Orders Live Feed */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg text-gray-900">Đơn Hàng Mới Nhất</h3>
                  <p className="text-gray-400 text-xs">Các giao dịch phát sinh gần đây</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="bg-[#1a5c2a] hover:bg-[#2d7a40] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Xem Tất Cả ({orders.length})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100 pb-2">
                      <th className="pb-3 font-semibold">Mã Đơn</th>
                      <th className="pb-3 font-semibold">Khu Vực / Bàn</th>
                      <th className="pb-3 font-semibold">Khách Hàng</th>
                      <th className="pb-3 font-semibold">Tổng Tiền</th>
                      <th className="pb-3 font-semibold">Thanh Toán</th>
                      <th className="pb-3 font-semibold">Trạng Thái</th>
                      <th className="pb-3 font-semibold text-right">In Bill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {orders.slice(-5).reverse().map(order => (
                      <tr key={order.orderNumber} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 font-mono font-bold text-[#1a5c2a]">#{order.orderNumber}</td>
                        <td className="py-3">
                          <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-lg font-bold text-[11px]">
                            {order.tableName || 'Giao hàng'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-700">{order.customer?.name || 'Khách tại bàn'}</td>
                        <td className="py-3 font-black text-gray-900">{formatPrice(order.grandTotal || order.totalAmount)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            order.paymentMethod === 'sepay' || order.paymentMethod === 'transfer'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.paymentMethod === 'sepay' || order.paymentMethod === 'transfer' ? '⚡ SePay QR' : '💵 Tiền mặt'}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${
                            order.status === 'done' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status === 'done' ? '✓ Hoàn thành' :
                             order.status === 'preparing' ? '🔥 Đang nấu' :
                             order.status === 'cancelled' ? '✕ Đã hủy' : '⏳ Chờ duyệt'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => openReceiptPrint(order)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#1a5c2a] hover:text-white transition-colors"
                            title="In lại hóa đơn"
                          >
                            <Printer size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: QUẢN LÝ THỰC ĐƠN (FULL CRUD + FILTER CHUYÊN SÂU)        */}
        {/* ============================================================== */}
        {activeTab === 'menu' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header + Stats */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-2xl text-gray-900">Quản Lý Thực Đơn</h2>
                  <span className="bg-[#1a5c2a] text-[#f5c518] px-3 py-0.5 rounded-full text-xs font-black">
                    {menu.length} món
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Đang mở bán: <strong className="text-emerald-600">{menu.filter(m => m.isAvailable).length} món</strong> • Tạm hết hàng: <strong className="text-red-500">{menu.filter(m => !m.isAvailable).length} món</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={openAddDishModal}
                  className="bg-[#1a5c2a] hover:bg-[#2d7a40] text-white px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus size={16} /> Thêm Món Ăn Mới
                </button>
                <button
                  onClick={handleResetDefaultMenu}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Khôi phục lại menu gốc ban đầu"
                >
                  <RotateCcw size={14} /> Khôi Phục Gốc
                </button>
              </div>
            </div>

            {/* Filter Bar (Search + Categories + Status + Badge + View Mode) */}
            <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* Search Input */}
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm tên món, mô tả..."
                    value={menuSearch}
                    onChange={e => setMenuSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:border-[#1a5c2a] focus:bg-white"
                  />
                  {menuSearch && (
                    <button onClick={() => setMenuSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xs">
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Dropdown */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-700 bg-gray-50 focus:outline-none focus:border-[#1a5c2a]"
                  >
                    <option value="all">📂 Tất cả danh mục ({categories.length})</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability Status Dropdown */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-700 bg-gray-50 focus:outline-none focus:border-[#1a5c2a]"
                  >
                    <option value="all">⚡ Trạng thái: Tất cả</option>
                    <option value="available">🟢 Chỉ món ĐANG CÒN BÁN</option>
                    <option value="unavailable">🔴 Chỉ món TẠM HẾT HÀNG</option>
                  </select>
                </div>

                {/* Badge Filter & View Toggle */}
                <div className="flex items-center gap-2">
                  <select
                    value={badgeFilter}
                    onChange={e => setBadgeFilter(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-700 bg-gray-50 focus:outline-none focus:border-[#1a5c2a]"
                  >
                    <option value="all">🏷️ Huy hiệu: Tất cả</option>
                    <option value="Hot">🔥 Món Hot</option>
                    <option value="Bán chạy">⭐ Bán chạy</option>
                    <option value="Mới">✨ Món mới</option>
                    <option value="Đặc biệt">👑 Đặc biệt</option>
                  </select>

                  <div className="flex items-center bg-gray-100 p-1 rounded-2xl">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white shadow text-[#1a5c2a]' : 'text-gray-500'}`}
                      title="Xem dạng Bảng"
                    >
                      <List size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow text-[#1a5c2a]' : 'text-gray-500'}`}
                      title="Xem dạng Lưới"
                    >
                      <LayoutGrid size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Category Chips */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pt-1">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                    categoryFilter === 'all'
                      ? 'bg-[#1a5c2a] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tất cả ({menu.length})
                </button>
                {categories.map(cat => {
                  const count = menu.filter(m => m.category === cat.id).length
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                        categoryFilter === cat.id
                          ? 'bg-[#1a5c2a] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.icon} {cat.name} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Empty Search Result */}
            {filteredMenu.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border text-gray-400 space-y-3">
                <Package size={48} className="mx-auto text-gray-300" />
                <p className="font-bold text-gray-700 text-sm">Không tìm thấy món ăn nào phù hợp với bộ lọc!</p>
                <button
                  onClick={() => {
                    setMenuSearch('')
                    setCategoryFilter('all')
                    setStatusFilter('all')
                    setBadgeFilter('all')
                  }}
                  className="bg-[#1a5c2a] text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            )}

            {/* VIEW MODE 1: DATA TABLE VIEW (Professional F&B POS style) */}
            {viewMode === 'table' && filteredMenu.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50/80 text-gray-500 font-bold border-b border-gray-200">
                        <th className="py-3.5 px-4">Tên Món Ăn</th>
                        <th className="py-3.5 px-3">Danh Mục</th>
                        <th className="py-3.5 px-3">Giá Bán</th>
                        <th className="py-3.5 px-3">Huy Hiệu</th>
                        <th className="py-3.5 px-3 text-center">Trạng Thái Bán</th>
                        <th className="py-3.5 px-4 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredMenu.map(item => (
                        <tr
                          key={item.id}
                          className={`hover:bg-gray-50/80 transition-colors ${!item.isAvailable ? 'bg-red-50/30' : ''}`}
                        >
                          {/* Name & Desc */}
                          <td className="py-3 px-4">
                            <p className="font-bold text-gray-900 text-xs">{item.name}</p>
                            {item.description && (
                              <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{item.description}</p>
                            )}
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3">
                            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-xl font-bold text-[11px] whitespace-nowrap">
                              {categories.find(c => c.id === item.category)?.name || item.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-3">
                            <span className="font-black text-[#1a5c2a] text-sm">
                              {formatPrice(item.price)}
                            </span>
                          </td>

                          {/* Badge */}
                          <td className="py-3 px-3">
                            {item.badge ? (
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                item.badge === 'Hot' ? 'bg-red-100 text-red-700' :
                                item.badge === 'Bán chạy' ? 'bg-amber-100 text-amber-800' :
                                item.badge === 'Mới' ? 'bg-blue-100 text-blue-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {item.badge}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>

                          {/* Available Toggle */}
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => toggleItemAvailability(item.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[11px] transition-all shadow-sm ${
                                item.isAvailable
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              {item.isAvailable ? (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                                  <span>Còn bán</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                  <span>Tạm hết</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Actions (Edit / Delete) */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditDishModal(item)}
                                className="p-2 rounded-xl bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-colors"
                                title="Chỉnh sửa món"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteDish(item.id, item.name)}
                                className="p-2 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 transition-colors"
                                title="Xóa món khỏi thực đơn"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW MODE 2: CARD GRID VIEW */}
            {viewMode === 'grid' && filteredMenu.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {filteredMenu.map(item => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all ${
                      !item.isAvailable ? 'bg-gray-50 opacity-60' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                          {categories.find(c => c.id === item.category)?.name}
                        </span>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.2 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-gray-900 line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className="text-[10px] text-gray-400 line-clamp-2 mt-1">{item.description}</p>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="font-black text-sm text-[#1a5c2a]">
                        {formatPrice(item.price)}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleItemAvailability(item.id)}
                          className={`p-1.5 rounded-xl text-xs font-bold ${
                            item.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                          }`}
                          title="Bật/Tắt còn bán"
                        >
                          {item.isAvailable ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                        <button
                          onClick={() => openEditDishModal(item)}
                          className="p-1.5 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                          title="Sửa"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteDish(item.id, item.name)}
                          className="p-1.5 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600"
                          title="Xóa"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: ORDERS MANAGEMENT                                       */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-gray-200">
              <div>
                <h2 className="font-black text-2xl text-gray-900">Quản Lý Đơn Hàng ({orders.length})</h2>
                <p className="text-gray-500 text-xs">Cập nhật tiến độ nấu nướng và in lại phiếu hóa đơn</p>
              </div>

              {/* Status Filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {['all', 'pending', 'preparing', 'delivering', 'done', 'cancelled'].map(f => (
                  <button
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      orderFilter === f ? 'bg-[#1a5c2a] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'Tất cả' :
                     f === 'pending' ? 'Chờ duyệt' :
                     f === 'preparing' ? 'Đang nấu' :
                     f === 'delivering' ? 'Đang ship' :
                     f === 'done' ? 'Hoàn thành' : 'Đã hủy'}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders list */}
            <div className="space-y-3">
              {[...orders]
                .filter(o => orderFilter === 'all' || o.status === orderFilter)
                .reverse()
                .map(order => (
                  <div key={order.orderNumber} className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-base text-[#1a5c2a]">#{order.orderNumber}</span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg text-xs font-bold">
                            {order.tableName || (order.orderType === 'delivery' ? '🛵 Ship tận nơi' : '🏪 Khách lấy')}
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                            order.paymentMethod === 'sepay' || order.paymentMethod === 'transfer'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {order.paymentMethod === 'sepay' || order.paymentMethod === 'transfer' ? '⚡ SePay VietQR' : '💵 Tiền mặt'}
                          </span>
                        </div>
                        {order.customer?.name && (
                          <p className="text-xs text-gray-500 mt-1">
                            Khách: <span className="font-semibold">{order.customer.name}</span> ({order.customer.phone})
                            {order.customer.address && ` • ${order.customer.address}`}
                          </p>
                        )}
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-xs text-gray-400">Tổng thanh toán</p>
                          <p className="font-black text-lg text-[#1a5c2a]">{formatPrice(order.grandTotal || order.totalAmount)}</p>
                        </div>
                        <button
                          onClick={() => openReceiptPrint(order)}
                          className="p-2.5 rounded-xl bg-gray-100 hover:bg-[#1a5c2a] hover:text-white text-gray-700 transition-colors shadow-sm"
                          title="In lại phiếu hóa đơn K80"
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {order.items?.map((it, idx) => (
                        <span key={idx} className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 font-medium text-gray-700">
                          {it.name} <span className="font-black text-[#1a5c2a]">x{it.qty}</span>
                          {it.spicyLevel !== undefined && it.spicyLevel !== null && ` (Cay ${it.spicyLevel})`}
                          {it.topping && ` (+${it.topping})`}
                        </span>
                      ))}
                    </div>

                    {/* Owner estimated time quick reply */}
                    {order.status !== 'done' && order.status !== 'cancelled' && (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-amber-50 rounded-2xl border border-amber-200 text-xs">
                        <span className="font-bold text-amber-900 flex items-center gap-1">
                          ⏱️ Báo giờ cho khách:
                          {order.estimateTime && (
                            <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-lg text-[11px] font-black">
                              Hiện tại: {order.estimateTime}
                            </span>
                          )}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.orderNumber, 'preparing', 'Dự kiến 10-15 phút')}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded-xl font-bold text-[11px] shadow-sm transition-colors"
                          >
                            + Hẹn 10-15p
                          </button>
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.orderNumber, 'preparing', 'Dự kiến 20-25 phút')}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-xl font-bold text-[11px] shadow-sm transition-colors"
                          >
                            + Hẹn 20-25p
                          </button>
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.orderNumber, 'preparing', 'Bếp đang nấu món')}
                            className="bg-[#1a5c2a] hover:bg-[#2d7a40] text-white px-2.5 py-1 rounded-xl font-bold text-[11px] shadow-sm transition-colors"
                          >
                            👨‍🍳 Đang nấu
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Status updater */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
                      <span className="text-gray-400">Trạng thái:</span>
                      <div className="flex gap-1.5">
                        {['pending', 'confirmed', 'preparing', 'delivering', 'done', 'cancelled'].map(st => (
                          <button
                            key={st}
                            onClick={() => updateOrderStatus(order.orderNumber, st)}
                            className={`px-3 py-1 rounded-lg font-bold transition-all ${
                              order.status === st
                                ? 'bg-[#1a5c2a] text-white shadow'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {st === 'pending' ? 'Chờ xác nhận' :
                             st === 'confirmed' ? 'Đã duyệt' :
                             st === 'preparing' ? 'Đang nấu' :
                             st === 'delivering' ? 'Đang ship' :
                             st === 'done' ? '✅ Hoàn thành' : '❌ Hủy'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: KITCHEN DISPLAY SYSTEM (KDS)                            */}
        {/* ============================================================== */}
        {activeTab === 'kitchen' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white p-5 rounded-3xl border border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="font-black text-2xl text-gray-900 flex items-center gap-2">
                  <ChefHat className="text-[#1a5c2a]" /> Màn Hình Bếp & Pha Chế (KDS)
                </h2>
                <p className="text-gray-500 text-xs">Hiển thị các món đang chờ chế biến với giao diện chữ lớn</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders
                .filter(o => o.status === 'preparing' || o.status === 'pending')
                .map(order => (
                  <div key={order.orderNumber} className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <div>
                          <span className="font-black text-xl text-gray-900">{order.tableName}</span>
                          <p className="text-xs text-gray-400">Đơn #{order.orderNumber}</p>
                        </div>
                        <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-1 rounded-xl animate-pulse">
                          🔥 ĐANG CHỜ NẤU
                        </span>
                      </div>

                      <div className="py-3 space-y-2">
                        {order.items?.map((it, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex justify-between font-bold text-sm text-gray-900">
                              <span>{it.name}</span>
                              <span className="text-[#1a5c2a] font-black text-base">x{it.qty}</span>
                            </div>
                            {it.spicyLevel !== undefined && it.spicyLevel !== null && (
                              <p className="text-xs font-black text-red-600 mt-0.5">🌶️ Cấp độ cay: {it.spicyLevel}</p>
                            )}
                            {it.topping && (
                              <p className="text-xs font-semibold text-amber-700">+ Topping: {it.topping}</p>
                            )}
                            {it.note && (
                              <p className="text-xs text-gray-500 italic">Ghi chú: {it.note}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t flex gap-2">
                      <button
                        onClick={() => updateOrderStatus(order.orderNumber, 'done')}
                        className="w-full bg-[#1a5c2a] hover:bg-[#2d7a40] text-white py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow"
                      >
                        <Check size={16} /> Báo Xong Món (Ra Bàn)
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {orders.filter(o => o.status === 'preparing' || o.status === 'pending').length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border text-gray-400">
                <CheckCircle size={48} className="mx-auto mb-2 text-green-500" />
                <p className="font-bold text-base text-gray-700">Tất cả món đã hoàn thành!</p>
                <p className="text-xs text-gray-400 mt-1">Hiện không có đơn nào đang chờ bếp nấu.</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: SEPAY CONFIGURATION & VIRTUAL BANK CARD                   */}
        {/* ============================================================== */}
        {activeTab === 'sepay' && (
          <div className="max-w-2xl space-y-5 animate-fadeIn">
            <div>
              <h2 className="font-black text-2xl text-gray-900 flex items-center gap-2">
                <QrCode className="text-[#1a5c2a]" /> Cấu Hình Cổng Thanh Toán SePay VietQR
              </h2>
              <p className="text-gray-500 text-xs">Cấu hình tài khoản ngân hàng nhận tiền và Webhook tự động khớp lệnh</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-2.5 text-emerald-800 text-xs font-bold">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <div>
                    <p className="font-bold">Trạng thái kết nối Webhook SePay:</p>
                    <p className="text-[11px] text-emerald-600 font-normal">Sẵn sàng nhận tín hiệu chuyển khoản 24/7</p>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-full">
                  Hoạt Động
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Ngân hàng thụ hưởng</label>
                <input
                  type="text"
                  value={sepayConfig.bank}
                  onChange={e => setSepayConfig({ ...sepayConfig, bank: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Số tài khoản ngân hàng</label>
                <input
                  type="text"
                  value={sepayConfig.accountNumber}
                  onChange={e => setSepayConfig({ ...sepayConfig, accountNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tên chủ tài khoản</label>
                <input
                  type="text"
                  value={sepayConfig.accountName}
                  onChange={e => setSepayConfig({ ...sepayConfig, accountName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">SePay API Token / Secret</label>
                <input
                  type="password"
                  value={sepayConfig.apiKey}
                  onChange={e => setSepayConfig({ ...sepayConfig, apiKey: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              <button
                type="button"
                onClick={() => toast.success('Đã lưu cấu hình SePay thành công!')}
                className="w-full bg-[#1a5c2a] hover:bg-[#2d7a40] text-white py-3 rounded-2xl font-bold text-xs shadow-md transition-colors"
              >
                Lưu Cấu Hình SePay
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: THÊM / CHỈNH SỬA MÓN ĂN (CRUD) ================= */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1a5c2a] flex items-center justify-center font-black">
                  <Utensils size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-gray-900">
                    {editingDish ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Ăn Mới'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {editingDish ? 'Cập nhật giá bán và thông tin món' : 'Món mới sẽ lập tức hiển thị trên web và POS'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDishModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-3.5">
              {/* Tên món */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tên món ăn *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Mì Cay Thập Cẩm Đặc Biệt..."
                  value={dishForm.name}
                  onChange={e => setDishForm({ ...dishForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              {/* Danh mục & Giá */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Danh mục *</label>
                  <select
                    value={dishForm.category}
                    onChange={e => setDishForm({ ...dishForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-800 bg-gray-50 focus:outline-none focus:border-[#1a5c2a]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    placeholder="VD: 55000"
                    value={dishForm.price}
                    onChange={e => setDishForm({ ...dishForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-black text-[#1a5c2a] focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>
              </div>

              {/* Huy hiệu & Trạng thái */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Huy hiệu nổi bật</label>
                  <select
                    value={dishForm.badge}
                    onChange={e => setDishForm({ ...dishForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-medium text-gray-700 bg-gray-50 focus:outline-none focus:border-[#1a5c2a]"
                  >
                    <option value="">(Không có)</option>
                    <option value="Hot">🔥 Món Hot</option>
                    <option value="Bán chạy">⭐ Bán chạy</option>
                    <option value="Mới">✨ Món mới</option>
                    <option value="Đặc biệt">👑 Đặc biệt</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Trạng thái bán</label>
                  <select
                    value={dishForm.isAvailable ? '1' : '0'}
                    onChange={e => setDishForm({ ...dishForm, isAvailable: e.target.value === '1' })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold bg-gray-50 focus:outline-none focus:border-[#1a5c2a]"
                  >
                    <option value="1">🟢 Còn bán (Có sẵn)</option>
                    <option value="0">🔴 Tạm hết món</option>
                  </select>
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Mô tả món ăn</label>
                <textarea
                  rows={2}
                  placeholder="Thành phần, hương vị đặc sắc..."
                  value={dishForm.description}
                  onChange={e => setDishForm({ ...dishForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs resize-none focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              {/* Footer buttons */}
              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-[#1a5c2a] hover:bg-[#2d7a40] text-white text-xs font-black shadow-md transition-all active:scale-95"
                >
                  {editingDish ? 'Lưu Thay Đổi' : 'Thêm Vào Thực Đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Print Receipt Modal */}
      <ReceiptPrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        order={selectedPrintOrder}
      />
    </div>
  )
}
