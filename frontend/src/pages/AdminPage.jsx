import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  BarChart3, ShoppingBag, Users, TrendingUp, Package, Eye, EyeOff, 
  Settings, LogOut, ChefHat, QrCode, Printer, CheckCircle, Clock, 
  Flame, CreditCard, Banknote, ArrowUpRight, Search, ShieldCheck, Check,
  Plus, Edit2, Trash2, Filter, RotateCcw, LayoutGrid, List, AlertTriangle,
  ArrowRight, X, Sparkles, CheckSquare, Coffee, Utensils, Menu as MenuIcon,
  ChevronRight, ExternalLink, HelpCircle, Store, MapPin, Phone, Wifi, Navigation, Globe,
  Upload, Image as ImageIcon, Link2, Ticket, Tag, Copy
} from 'lucide-react'
import toast from 'react-hot-toast'
import { menuItems, formatPrice, categories, getActiveMenu, saveActiveMenu, categoryImages } from '../data/menuData'
import { getActiveVouchers, saveActiveVouchers, INITIAL_VOUCHERS } from '../data/voucherData'
import ReceiptPrintModal from '../components/ReceiptPrintModal'
import { useRestaurant, DEFAULT_STORE_INFO } from '../context/RestaurantContext'

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
  const { 
    isAdminAuthenticated, 
    loginAdmin, 
    logoutAdmin,
    storeInfo,
    updateStoreInfo,
    resetStoreInfo,
  } = useRestaurant()
  const [pass, setPass] = useState('')
  const [passErr, setPassErr] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [orders, setOrders] = useState([])

  // STORE SETTINGS & GOOGLE MAPS STATE (FULL CRUD)
  const [storeForm, setStoreForm] = useState(() => ({ ...(storeInfo || DEFAULT_STORE_INFO) }))

  useEffect(() => {
    if (storeInfo) {
      setStoreForm({ ...storeInfo })
    }
  }, [storeInfo])

  const handleMapEmbedUrlChange = (val) => {
    let cleanUrl = val.trim()
    const iframeSrcMatch = cleanUrl.match(/src=["'](.*?)["']/)
    if (iframeSrcMatch && iframeSrcMatch[1]) {
      cleanUrl = iframeSrcMatch[1]
    }
    setStoreForm(prev => ({ ...prev, mapEmbedUrl: cleanUrl }))
  }

  const handleSaveStoreInfo = (e) => {
    if (e) e.preventDefault()
    if (!storeForm.name.trim()) {
      toast.error('Vui lòng nhập tên quán!')
      return
    }
    if (!storeForm.hotline.trim()) {
      toast.error('Vui lòng nhập số điện thoại hotline!')
      return
    }
    updateStoreInfo({
      ...storeForm,
      deliveryFee: Number(storeForm.deliveryFee) || 0,
      minFreeDelivery: Number(storeForm.minFreeDelivery) || 0,
    })
  }

  const handleResetStoreInfo = () => {
    if (window.confirm('Khôi phục toàn bộ thông tin quán và vị trí bản đồ về mặc định?')) {
      resetStoreInfo()
      setStoreForm({ ...DEFAULT_STORE_INFO })
    }
  }
  
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
  const [isCompressingImg, setIsCompressingImg] = useState(false)
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'mi-cay',
    price: '',
    badge: '',
    description: '',
    image: '',
    isAvailable: true,
  })

  // Order Filter
  const [orderFilter, setOrderFilter] = useState('all')

  // VOUCHER / DISCOUNT FULL CRUD STATE
  const [vouchers, setVouchers] = useState(() => getActiveVouchers())
  const [voucherSearch, setVoucherSearch] = useState('')
  const [voucherTypeFilter, setVoucherTypeFilter] = useState('all') // 'all' | 'percentage' | 'fixed' | 'freeship'
  const [voucherStatusFilter, setVoucherStatusFilter] = useState('all') // 'all' | 'active' | 'inactive'
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState(null)
  const [voucherForm, setVoucherForm] = useState({
    code: '',
    title: '',
    type: 'percentage',
    value: '10',
    minOrder: '100000',
    maxDiscount: '30000',
    usageLimit: '100',
    startDate: '',
    endDate: '',
    description: '',
    isActive: true,
  })

  // Sync vouchers across storage
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'kutin_vouchers') {
        setVouchers(getActiveVouchers())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Bill print modal state
  const [selectedPrintOrder, setSelectedPrintOrder] = useState(null)
  const [showPrintModal, setShowPrintModal] = useState(false)

  // SePay Config
  const [sepayConfig, setSepayConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('kutin_sepay_config')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return {
      bankCode: 'MB',
      bankName: 'MB Bank (Quân Đội)',
      accountNo: '0947007881',
      accountName: 'KUTIN FOOD DRINK',
      prefix: 'KUTIN',
      webhookKey: 'sp_live_demo_key_999',
    }
  })

  // Sync menu across storage
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'kutin_custom_menu') {
        setMenu(getActiveMenu())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Load orders
  useEffect(() => {
    const saved = localStorage.getItem('kutin_orders')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.length > 0) {
          setOrders(parsed)
          return
        }
      } catch (e) {}
    }
    setOrders(INITIAL_DEMO_ORDERS)
    localStorage.setItem('kutin_orders', JSON.stringify(INITIAL_DEMO_ORDERS))
  }, [])

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault()
    if (loginAdmin(pass)) {
      setPassErr(false)
      toast.success('Đăng nhập quản trị KUTIN thành công!')
    } else {
      setPassErr(true)
      toast.error('Mật khẩu không chính xác!')
    }
  }

  // Dish CRUD actions
  const openAddDishModal = () => {
    setEditingDish(null)
    setDishForm({
      name: '',
      category: categoryFilter !== 'all' ? categoryFilter : 'mi-cay',
      price: '',
      badge: '',
      description: '',
      image: '',
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
      image: dish.image || '',
      isAvailable: dish.isAvailable,
    })
    setIsDishModalOpen(true)
  }

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP)!')
      return
    }

    setIsCompressingImg(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        try {
          const maxDim = 600
          let width = img.width
          let height = img.height

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75)
          setDishForm(prev => ({ ...prev, image: compressedDataUrl }))
          toast.success('Đã tải và tối ưu ảnh món ăn thành công!')
        } catch (err) {
          console.error(err)
          toast.error('Không thể tối ưu ảnh!')
        } finally {
          setIsCompressingImg(false)
        }
      }
      img.onerror = () => {
        toast.error('Không thể đọc file ảnh!')
        setIsCompressingImg(false)
      }
      img.src = event.target.result
    }
    reader.onerror = () => {
      toast.error('Lỗi khi mở tệp!')
      setIsCompressingImg(false)
    }
    reader.readAsDataURL(file)
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
              image: dishForm.image?.trim() || undefined,
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
        image: dishForm.image?.trim() || undefined,
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

  // VOUCHER CRUD HANDLERS
  const openAddVoucherModal = () => {
    setEditingVoucher(null)
    setVoucherForm({
      code: '',
      title: '',
      type: 'percentage',
      value: '10',
      minOrder: '100000',
      maxDiscount: '30000',
      usageLimit: '100',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
      isActive: true,
    })
    setIsVoucherModalOpen(true)
  }

  const openEditVoucherModal = (voucher) => {
    setEditingVoucher(voucher)
    setVoucherForm({
      code: voucher.code,
      title: voucher.title || '',
      type: voucher.type || 'percentage',
      value: voucher.value || '',
      minOrder: voucher.minOrder || '',
      maxDiscount: voucher.maxDiscount || '',
      usageLimit: voucher.usageLimit || '',
      startDate: voucher.startDate || '',
      endDate: voucher.endDate || '',
      description: voucher.description || '',
      isActive: voucher.isActive,
    })
    setIsVoucherModalOpen(true)
  }

  const handleSaveVoucher = (e) => {
    e.preventDefault()
    const cleanCode = voucherForm.code.trim().toUpperCase().replace(/\s+/g, '')
    if (!cleanCode) {
      toast.error('Vui lòng nhập mã voucher!')
      return
    }

    const numValue = voucherForm.type === 'freeship' ? 0 : Number(voucherForm.value)
    if (voucherForm.type !== 'freeship' && (!numValue || numValue <= 0)) {
      toast.error('Vui lòng nhập giá trị giảm hợp lệ!')
      return
    }

    if (voucherForm.type === 'percentage' && (numValue < 1 || numValue > 100)) {
      toast.error('Phần trăm giảm phải từ 1% đến 100%!')
      return
    }

    // Check code duplication
    const existing = vouchers.find(v => v.code.toUpperCase() === cleanCode && (!editingVoucher || v.id !== editingVoucher.id))
    if (existing) {
      toast.error(`Mã voucher "${cleanCode}" đã tồn tại! Vui lòng chọn mã khác.`)
      return
    }

    let updated = []
    if (editingVoucher) {
      updated = vouchers.map(v => 
        v.id === editingVoucher.id
          ? {
              ...v,
              code: cleanCode,
              title: voucherForm.title.trim() || `Ưu đãi ${cleanCode}`,
              type: voucherForm.type,
              value: numValue,
              minOrder: Number(voucherForm.minOrder) || 0,
              maxDiscount: voucherForm.type === 'percentage' ? (Number(voucherForm.maxDiscount) || 0) : numValue,
              usageLimit: Number(voucherForm.usageLimit) || 0,
              startDate: voucherForm.startDate || null,
              endDate: voucherForm.endDate || null,
              description: voucherForm.description.trim(),
              isActive: voucherForm.isActive,
            }
          : v
      )
      toast.success(`Đã cập nhật mã "${cleanCode}"!`)
    } else {
      const newVoucher = {
        id: `v_${Date.now()}`,
        code: cleanCode,
        title: voucherForm.title.trim() || `Ưu đãi ${cleanCode}`,
        type: voucherForm.type,
        value: numValue,
        minOrder: Number(voucherForm.minOrder) || 0,
        maxDiscount: voucherForm.type === 'percentage' ? (Number(voucherForm.maxDiscount) || 0) : numValue,
        usageLimit: Number(voucherForm.usageLimit) || 0,
        usedCount: 0,
        startDate: voucherForm.startDate || null,
        endDate: voucherForm.endDate || null,
        description: voucherForm.description.trim(),
        isActive: voucherForm.isActive,
      }
      updated = [newVoucher, ...vouchers]
      toast.success(`🎉 Đã tạo mã giảm giá mới: "${cleanCode}"!`)
    }

    setVouchers(updated)
    saveActiveVouchers(updated)
    setIsVoucherModalOpen(false)
  }

  const handleDeleteVoucher = (id, code) => {
    if (window.confirm(`Xác nhận xóa mã voucher "${code}" khỏi hệ thống?`)) {
      const updated = vouchers.filter(v => v.id !== id)
      setVouchers(updated)
      saveActiveVouchers(updated)
      toast.success(`Đã xóa voucher "${code}"!`)
    }
  }

  const toggleVoucherActive = (id) => {
    const updated = vouchers.map(v =>
      v.id === id ? { ...v, isActive: !v.isActive } : v
    )
    setVouchers(updated)
    saveActiveVouchers(updated)
    toast.success('Đã cập nhật trạng thái voucher!')
  }

  const handleResetSampleVouchers = () => {
    if (window.confirm('Khôi phục danh sách voucher mẫu ban đầu?')) {
      setVouchers(INITIAL_VOUCHERS)
      saveActiveVouchers(INITIAL_VOUCHERS)
      toast.success('Đã khôi phục các mã voucher mẫu!')
    }
  }

  const copyVoucherCode = (code) => {
    navigator.clipboard?.writeText(code)
    toast.success(`Đã sao chép mã "${code}"!`)
  }

  // Filtered vouchers computation
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const matchSearch = !voucherSearch || 
        v.code.toLowerCase().includes(voucherSearch.toLowerCase()) ||
        v.title.toLowerCase().includes(voucherSearch.toLowerCase()) ||
        (v.description && v.description.toLowerCase().includes(voucherSearch.toLowerCase()))

      const matchType = voucherTypeFilter === 'all' || v.type === voucherTypeFilter
      const matchStatus = voucherStatusFilter === 'all' || 
        (voucherStatusFilter === 'active' ? v.isActive : !v.isActive)

      return matchSearch && matchType && matchStatus
    })
  }, [vouchers, voucherSearch, voucherTypeFilter, voucherStatusFilter])

  // Total discount stats
  const totalDiscountGiven = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.discountAmount || 0), 0)
  }, [orders])

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
        <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl animate-scaleUp">
          <div className="text-center mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#f5c518] text-[#1a5c2a] flex items-center justify-center mx-auto mb-3 text-2xl sm:text-3xl font-black shadow-lg">K</div>
            <h1 className="font-black text-xl sm:text-2xl text-[#1a5c2a]">KUTIN Admin</h1>
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
            <button type="submit" className="w-full bg-[#1a5c2a] text-[#f5c518] py-3.5 rounded-2xl font-black text-sm hover:bg-[#2d7a40] transition-colors shadow-md active:scale-95">
              Đăng Nhập Quản Trị Quán
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-gray-400 hover:text-[#1a5c2a] transition-colors font-medium">
              ← Quay về trang chủ khách hàng
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'dashboard', label: 'Báo Cáo', fullLabel: 'Báo Cáo & Thống Kê', icon: <BarChart3 size={17} /> },
    { id: 'menu', label: 'Thực Đơn', fullLabel: 'Quản Lý Thực Đơn', icon: <Package size={17} />, badge: menu.filter(m => !m.isAvailable).length, badgeColor: 'bg-amber-500' },
    { id: 'vouchers', label: 'Mã Giảm Giá', fullLabel: 'Khuyến Mãi & Voucher', icon: <Ticket size={17} />, badge: vouchers.filter(v => v.isActive).length, badgeColor: 'bg-emerald-600' },
    { id: 'orders', label: 'Đơn Hàng', fullLabel: 'Quản Lý Đơn Hàng', icon: <ShoppingBag size={17} />, badge: pendingOrders.length, badgeColor: 'bg-red-500' },
    { id: 'kitchen', label: 'Bếp Nấu', fullLabel: 'Màn Hình Bếp & Chế Biến', icon: <ChefHat size={17} />, badge: preparingOrders.length, badgeColor: 'bg-orange-500' },
    { id: 'store', label: 'Quán & Bản Đồ', fullLabel: 'Thông Tin Quán & Bản Đồ', icon: <Store size={17} /> },
    { id: 'sepay', label: 'Thanh Toán QR', fullLabel: 'Cấu Hình Thanh Toán QR', icon: <QrCode size={17} /> },
  ]

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row font-sans text-gray-900">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="w-64 bg-[#0a2f14] text-white flex-col fixed h-full z-40 hidden md:flex border-r border-[#155325]">
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
              <span className="flex-1 text-left">{tab.fullLabel}</span>
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

      {/* ================= MOBILE HEADER (STICKY) ================= */}
      <header className="md:hidden sticky top-0 z-40 bg-[#0a2f14] text-white border-b border-[#1b632e] shadow-md">
        {/* Top brand row */}
        <div className="px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f5c518] flex items-center justify-center font-black text-[#1a5c2a] text-base shadow">
              K
            </div>
            <div>
              <p className="font-black text-xs text-white leading-tight">KUTIN Quản Trị</p>
              <p className="text-[#f5c518] text-[9px] font-bold">Chủ quán • Online</p>
            </div>
          </div>

          {/* Quick Action Icons for Mobile */}
          <div className="flex items-center gap-1.5">
            <Link
              to="/pos"
              className="flex items-center gap-1 bg-[#1a5c2a] text-[#f5c518] px-2.5 py-1.5 rounded-xl text-[11px] font-black border border-[#f5c518]/30 shadow-sm active:scale-95"
            >
              💻 POS
            </Link>
            <Link
              to="/"
              className="p-1.5 text-white/80 hover:text-white bg-white/10 rounded-xl text-[11px] active:scale-95"
              title="Về web khách"
            >
              🏠
            </Link>
            <button
              onClick={logoutAdmin}
              className="p-1.5 text-red-300 bg-red-500/20 rounded-xl text-[11px] active:scale-95"
              title="Đăng xuất"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Scrollable Tabs */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#07240f] overflow-x-auto scrollbar-none border-t border-[#155325]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#f5c518] text-[#1a5c2a] shadow-sm font-black'
                  : 'bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className={`${tab.badgeColor || 'bg-red-500'} text-white text-[9px] px-1.5 py-0.2 rounded-full font-black`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 md:ml-64 p-3 sm:p-5 lg:p-8 overflow-y-auto max-w-full">

        {/* ============================================================== */}
        {/* TAB 1: EXECUTIVE REVENUE DASHBOARD                             */}
        {/* ============================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            {/* Header + Time Range Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1a5c2a] bg-emerald-50 px-2 py-0.5 rounded-lg">
                  Trung Tâm Điều Hành F&B
                </span>
                <h2 className="font-black text-xl sm:text-2xl lg:text-3xl text-gray-900 mt-1">Báo Cáo Doanh Thu</h2>
                <p className="text-gray-500 text-[11px] sm:text-xs">Dữ liệu thời gian thực từ POS tại quán và Website</p>
              </div>

              {/* Time Range Pills */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl w-full sm:w-auto">
                {[
                  { id: 'today', label: 'Hôm nay' },
                  { id: '7days', label: '7 ngày qua' },
                  { id: 'month', label: 'Tháng này' },
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setTimeRange(r.id)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Doanh thu */}
              <div className="bg-gradient-to-br from-emerald-900 to-[#1a5c2a] text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">Tổng Doanh Thu</p>
                    <p className="text-2xl sm:text-3xl font-black mt-1 text-[#f5c518] break-words">{formatPrice(totalRevenue)}</p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#f5c518] flex-shrink-0">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/80">
                  <span className="flex items-center gap-1 text-emerald-300 font-bold">
                    <ArrowUpRight size={13} /> +24.8% tăng
                  </span>
                  <span>Mục tiêu: 85%</span>
                </div>
              </div>

              {/* Tổng Đơn */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Tổng Số Đơn</p>
                    <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{orders.length} đơn</p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={18} />
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-between text-[11px] text-gray-500">
                  <span>Giá trị TB:</span>
                  <span className="font-bold text-gray-800">
                    {formatPrice(orders.length ? Math.round(totalRevenue / orders.length) : 0)}
                  </span>
                </div>
              </div>

              {/* SePay VietQR */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-purple-600 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <QrCode size={13} /> SePay VietQR
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-purple-700 mt-1 break-words">{formatPrice(sepayRevenue)}</p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
                    <CreditCard size={18} />
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-gray-100">
                  <div className="flex justify-between text-[11px] text-gray-500 mb-1">
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
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-amber-700 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Banknote size={13} /> Tiền Mặt Tại Quầy
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-amber-800 mt-1 break-words">{formatPrice(cashRevenue)}</p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center flex-shrink-0">
                    <Banknote size={18} />
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-gray-100">
                  <div className="flex justify-between text-[11px] text-gray-500 mb-1">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* 7 Days Revenue Trend */}
              <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                  <div>
                    <h3 className="font-black text-base sm:text-lg text-gray-900">Biểu Đồ Doanh Thu 7 Ngày</h3>
                    <p className="text-gray-400 text-xs">Cập nhật chu kỳ bán hàng tuần của KUTIN</p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl self-start sm:self-auto">
                    Đỉnh: Thứ 7 & CN
                  </span>
                </div>

                {/* Bars Container */}
                <div className="overflow-x-auto pb-1 scrollbar-none">
                  <div className="flex items-end justify-between min-w-[320px] sm:min-w-0 h-44 pt-4 px-1 border-b border-gray-100">
                    {[
                      { day: 'T2', amount: 1450000, height: '42%', count: 12 },
                      { day: 'T3', amount: 1890000, height: '52%', count: 16 },
                      { day: 'T4', amount: 2150000, height: '60%', count: 18 },
                      { day: 'T5', amount: 1780000, height: '48%', count: 14 },
                      { day: 'T6', amount: 2890000, height: '82%', count: 24 },
                      { day: 'T7', amount: 3560000, height: '98%', count: 32 },
                      { day: 'CN', amount: totalRevenue || 2980000, height: '85%', isToday: true, count: orders.length },
                    ].map(bar => (
                      <div key={bar.day} className="flex flex-col items-center gap-1.5 flex-1 group">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[9px] font-bold py-0.5 px-1.5 rounded-lg pointer-events-none whitespace-nowrap shadow-md">
                          {formatPrice(bar.amount)}
                        </div>
                        <div className="w-7 sm:w-10 md:w-11 bg-gray-100 rounded-t-xl sm:rounded-t-2xl h-36 flex items-end overflow-hidden p-0.5">
                          <div
                            style={{ height: bar.height }}
                            className={`w-full rounded-t-lg transition-all duration-700 ${
                              bar.isToday
                                ? 'bg-gradient-to-t from-[#1a5c2a] via-[#2d7a40] to-[#f5c518]'
                                : 'bg-gradient-to-t from-gray-300 to-gray-400 group-hover:from-emerald-600 group-hover:to-emerald-500'
                            }`}
                          />
                        </div>
                        <span className={`text-[11px] font-bold ${bar.isToday ? 'text-[#1a5c2a] font-black' : 'text-gray-500'}`}>
                          {bar.day} {bar.isToday && '●'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#1a5c2a] to-[#f5c518]"></span>
                    <span>Hôm nay</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
                    <span>Các ngày trong tuần</span>
                  </div>
                </div>
              </div>

              {/* Best Sellers Leaderboard */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-base sm:text-lg text-gray-900 mb-0.5">Món Bán Chạy Nhất</h3>
                  <p className="text-gray-400 text-xs mb-3">Top 5 món đóng góp doanh thu cao nhất</p>

                  <div className="space-y-2.5">
                    {bestSellers.length === 0 ? (
                      <p className="text-gray-400 text-xs text-center py-6">Chưa có đủ dữ liệu đơn hàng</p>
                    ) : (
                      bestSellers.map(([name, qty], idx) => (
                        <div key={name} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${
                            idx === 0 ? 'bg-[#f5c518] text-[#1a5c2a] shadow-sm' :
                            idx === 1 ? 'bg-gray-200 text-gray-700' :
                            idx === 2 ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-gray-800 truncate">{name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#1a5c2a] h-full rounded-full"
                                  style={{ width: `${Math.min(100, (qty / (bestSellers[0]?.[1] || 1)) * 100)}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">{qty} phần</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Cập nhật: Vừa xong</span>
                  <button onClick={() => setActiveTab('menu')} className="font-bold text-[#1a5c2a] hover:underline flex items-center gap-0.5">
                    Xem Menu <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Orders Live Table with Instant Bill Reprint */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base sm:text-lg text-gray-900">Đơn Hàng Gần Đây</h3>
                  <p className="text-gray-400 text-xs">Cập nhật trực tiếp từ hệ thống POS và Website</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#1a5c2a] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                >
                  Tất Cả ({orders.length}) <ChevronRight size={13} />
                </button>
              </div>

              {/* Table with horizontal scroll on small devices */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[620px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                      <th className="py-3 px-4">Mã Đơn</th>
                      <th className="py-3 px-3">Bàn / Kênh</th>
                      <th className="py-3 px-3">Món Ăn</th>
                      <th className="py-3 px-3">Tổng Tiền</th>
                      <th className="py-3 px-3">Thanh Toán</th>
                      <th className="py-3 px-3">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">In Bill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.slice(0, 6).map(order => (
                      <tr key={order.orderNumber} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-black text-[#1a5c2a]">
                          #{order.orderNumber}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-gray-800">{order.tableName || 'Giao hàng'}</span>
                          <span className="text-[10px] text-gray-400 block font-normal">{order.source || 'POS'}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="max-w-[180px] truncate text-gray-700">
                            {(order.items || []).map(i => `${i.name} (${i.qty})`).join(', ')}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-bold text-gray-900">
                          {formatPrice(order.grandTotal || order.totalAmount)}
                          {order.discountAmount > 0 && (
                            <span className="block text-[10px] text-red-600 font-semibold">
                              🎟️ -{formatPrice(order.discountAmount)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            order.paymentMethod === 'sepay' || order.paymentMethod === 'transfer'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {order.paymentMethod === 'sepay' || order.paymentMethod === 'transfer' ? '⚡ VietQR' : '💵 Tiền mặt'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            order.status === 'done' ? 'bg-green-100 text-green-800' :
                            order.status === 'preparing' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status === 'done' ? 'Hoàn thành' :
                             order.status === 'preparing' ? 'Đang nấu' :
                             order.status === 'cancelled' ? 'Đã hủy' : 'Chờ xử lý'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openReceiptPrint(order)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#1a5c2a] hover:text-white text-gray-600 transition-colors"
                            title="In lại phiếu hóa đơn K80"
                          >
                            <Printer size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-2.5 bg-gray-50/50 text-center text-[10px] text-gray-400 md:hidden border-t border-gray-100">
                ↔ Vuốt ngang để xem đủ thông tin bảng
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: QUẢN LÝ THỰC ĐƠN (FULL CRUD + FILTER CHUYÊN SÂU)        */}
        {/* ============================================================== */}
        {activeTab === 'menu' && (
          <div className="space-y-4 sm:space-y-5 animate-fadeIn">
            {/* Header + Stats */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-xl sm:text-2xl text-gray-900">Quản Lý Thực Đơn</h2>
                  <span className="bg-[#1a5c2a] text-[#f5c518] px-2.5 py-0.5 rounded-full text-xs font-black">
                    {menu.length} món
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-0.5">
                  Đang mở bán: <strong className="text-emerald-600">{menu.filter(m => m.isAvailable).length} món</strong> • Tạm hết hàng: <strong className="text-red-500">{menu.filter(m => !m.isAvailable).length} món</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={openAddDishModal}
                  className="flex-1 sm:flex-initial bg-[#1a5c2a] hover:bg-[#2d7a40] text-white px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus size={16} /> Thêm Món Mới
                </button>
                <button
                  onClick={handleResetDefaultMenu}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  title="Khôi phục lại menu gốc 91 món"
                >
                  <RotateCcw size={14} /> Khôi Phục Gốc
                </button>
              </div>
            </div>

            {/* Filter Bar (Search + Categories + Status + Badge + View Mode) */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* Search Input */}
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm tên món, mô tả..."
                    value={menuSearch}
                    onChange={e => setMenuSearch(e.target.value)}
                    className="w-full pl-8 pr-7 py-2 rounded-xl sm:rounded-2xl border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:border-[#1a5c2a] focus:bg-white"
                  />
                  {menuSearch && (
                    <button onClick={() => setMenuSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xs">
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Dropdown */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl sm:rounded-2xl border border-gray-200 text-xs font-bold text-gray-700 bg-gray-50 focus:outline-none focus:border-[#1a5c2a]"
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
                    className="w-full px-3 py-2 rounded-xl sm:rounded-2xl border border-gray-200 text-xs font-bold text-gray-700 bg-gray-50 focus:outline-none focus:border-[#1a5c2a]"
                  >
                    <option value="all">⚡ Trạng thái: Tất cả</option>
                    <option value="available">🟢 Chỉ món CÒN BÁN</option>
                    <option value="unavailable">🔴 Chỉ món TẠM HẾT</option>
                  </select>
                </div>

                {/* Badge Filter & View Toggle */}
                <div className="flex items-center gap-2">
                  <select
                    value={badgeFilter}
                    onChange={e => setBadgeFilter(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl sm:rounded-2xl border border-gray-200 text-xs font-bold text-gray-700 bg-gray-50 focus:outline-none focus:border-[#1a5c2a]"
                  >
                    <option value="all">🏷️ Huy hiệu: Tất cả</option>
                    <option value="Hot">🔥 Món Hot</option>
                    <option value="Bán chạy">⭐ Bán chạy</option>
                    <option value="Mới">✨ Món mới</option>
                    <option value="Đặc biệt">👑 Đặc biệt</option>
                  </select>

                  <div className="flex items-center bg-gray-100 p-1 rounded-xl sm:rounded-2xl flex-shrink-0">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${viewMode === 'table' ? 'bg-white shadow text-[#1a5c2a]' : 'text-gray-500'}`}
                      title="Xem dạng Bảng"
                    >
                      <List size={15} />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow text-[#1a5c2a]' : 'text-gray-500'}`}
                      title="Xem dạng Lưới"
                    >
                      <LayoutGrid size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Category Chips */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pt-1">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${
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
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${
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
              <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border text-gray-400 space-y-3">
                <Package size={40} className="mx-auto text-gray-300" />
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

            {/* VIEW MODE 1: DATA TABLE VIEW */}
            {viewMode === 'table' && filteredMenu.length > 0 && (
              <>
                {/* Desktop/Tablet Table */}
                <div className="hidden sm:block bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[620px]">
                      <thead>
                        <tr className="bg-gray-50/80 text-gray-500 font-bold border-b border-gray-200">
                          <th className="py-3 px-3 text-center w-14">Hình</th>
                          <th className="py-3 px-4">Tên Món Ăn</th>
                          <th className="py-3 px-3">Danh Mục</th>
                          <th className="py-3 px-3">Giá Bán</th>
                          <th className="py-3 px-3">Huy Hiệu</th>
                          <th className="py-3 px-3 text-center">Trạng Thái Bán</th>
                          <th className="py-3 px-4 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredMenu.map(item => (
                          <tr
                            key={item.id}
                            className={`hover:bg-gray-50/80 transition-colors ${!item.isAvailable ? 'bg-red-50/30' : ''}`}
                          >
                            <td className="py-2.5 px-3 text-center">
                              <div className="w-11 h-11 mx-auto rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm flex items-center justify-center flex-shrink-0">
                                <img
                                  src={item.image || categoryImages[item.category] || categoryImages.default}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.src = categoryImages[item.category] || categoryImages.default }}
                                  loading="lazy"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-gray-900">{item.name}</div>
                              {item.description && (
                                <p className="text-[11px] text-gray-400 line-clamp-1">{item.description}</p>
                              )}
                            </td>
                            <td className="py-3 px-3 text-gray-600 font-semibold whitespace-nowrap">
                              {categories.find(c => c.id === item.category)?.name || item.category}
                            </td>
                            <td className="py-3 px-3 font-black text-[#1a5c2a] whitespace-nowrap">
                              {formatPrice(item.price)}
                            </td>
                            <td className="py-3 px-3">
                              {item.badge ? (
                                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {item.badge}
                                </span>
                              ) : (
                                <span className="text-gray-300 text-[10px]">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              <button
                                onClick={() => toggleItemAvailability(item.id)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shadow-sm ${
                                  item.isAvailable
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                                title="Bấm để đổi trạng thái Còn/Hết"
                              >
                                {item.isAvailable ? (
                                  <>
                                    <Eye size={12} /> Còn bán
                                  </>
                                ) : (
                                  <>
                                    <EyeOff size={12} /> Tạm hết
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEditDishModal(item)}
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-colors"
                                  title="Chỉnh sửa món"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteDish(item.id, item.name)}
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 transition-colors"
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

                {/* Mobile Dedicated Touch Card List (Shown on mobile when viewMode === 'table') */}
                <div className="sm:hidden space-y-2.5">
                  {filteredMenu.map(item => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-3 border border-gray-200 shadow-sm flex flex-col gap-2.5 ${
                        !item.isAvailable ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.image || categoryImages[item.category] || categoryImages.default}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0 shadow-sm"
                          onError={(e) => { e.currentTarget.src = categoryImages[item.category] || categoryImages.default }}
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-gray-900 leading-tight">{item.name}</span>
                            {item.badge && (
                              <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-0.5 block">
                            {categories.find(c => c.id === item.category)?.name}
                          </span>
                          <span className="font-black text-xs text-[#1a5c2a] mt-1 block">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-gray-500 line-clamp-1">{item.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        {/* Toggle Còn / Hết button */}
                        <button
                          onClick={() => toggleItemAvailability(item.id)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            item.isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.isAvailable ? <><Eye size={13} /> Đang bán</> : <><EyeOff size={13} /> Tạm hết</>}
                        </button>

                        {/* Edit & Delete */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditDishModal(item)}
                            className="px-2.5 py-1 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit2 size={12} /> Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteDish(item.id, item.name)}
                            className="p-1 rounded-xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* VIEW MODE 2: CARD GRID VIEW */}
            {viewMode === 'grid' && filteredMenu.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredMenu.map(item => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all ${
                      !item.isAvailable ? 'bg-gray-50 opacity-70' : ''
                    }`}
                  >
                    <div>
                      {/* Dish Photo Banner */}
                      <div className="relative h-36 rounded-xl sm:rounded-2xl overflow-hidden mb-2.5 bg-gray-100 border border-gray-100 group">
                        <img
                          src={item.image || categoryImages[item.category] || categoryImages.default}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => { e.currentTarget.src = categoryImages[item.category] || categoryImages.default }}
                          loading="lazy"
                        />
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                          {categories.find(c => c.id === item.category)?.name}
                        </span>
                        {item.badge && (
                          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow">
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

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
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
        {/* TAB 2.5: VOUCHERS & DISCOUNTS FULL CRUD                        */}
        {/* ============================================================== */}
        {activeTab === 'vouchers' && (
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            {/* Header & Main Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-50 text-[#1a5c2a]">
                    <Ticket size={20} />
                  </span>
                  <h2 className="font-black text-xl sm:text-2xl text-gray-900">
                    Khuyến Mãi & Voucher ({vouchers.length})
                  </h2>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Quản lý mã giảm giá theo %, tiền cố định và Freeship cho khách hàng và máy POS
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleResetSampleVouchers}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Khôi phục các mã voucher mẫu"
                >
                  <RotateCcw size={14} /> Khôi Phục Mẫu
                </button>
                <button
                  type="button"
                  onClick={openAddVoucherModal}
                  className="px-4 py-2.5 rounded-xl bg-[#1a5c2a] hover:bg-[#2d7a40] text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Plus size={16} strokeWidth={2.5} /> Tạo Voucher Mới
                </button>
              </div>
            </div>

            {/* 4 KPI Voucher Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tổng Số Voucher</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-gray-900">{vouchers.length}</span>
                  <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-full">Tất cả</span>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Đang Kích Hoạt</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-emerald-600">
                    {vouchers.filter(v => v.isActive).length}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Sẵn sàng</span>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Lượt Đã Áp Dụng</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-amber-600">
                    {vouchers.reduce((s, v) => s + (v.usedCount || 0), 0)}
                  </span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">Lượt dùng</span>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tổng Đã Giảm Cho Khách</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl sm:text-2xl font-black text-[#1a5c2a]">
                    {formatPrice(totalDiscountGiven)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Khuyến mãi</span>
                </div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm mã voucher (VD: KUTIN10), tiêu đề..."
                  value={voucherSearch}
                  onChange={e => setVoucherSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a5c2a]"
                />
                <Search size={15} className="absolute left-3 top-3 text-gray-400" />
                {voucherSearch && (
                  <button
                    onClick={() => setVoucherSearch('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Type Filter */}
              <div className="flex gap-2">
                <select
                  value={voucherTypeFilter}
                  onChange={e => setVoucherTypeFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-gray-50 focus:outline-none focus:border-[#1a5c2a]"
                >
                  <option value="all">Mọi loại giảm</option>
                  <option value="percentage">% Phần trăm</option>
                  <option value="fixed">💵 Tiền cố định</option>
                  <option value="freeship">🚚 Miễn phí ship</option>
                </select>

                {/* Status Filter */}
                <select
                  value={voucherStatusFilter}
                  onChange={e => setVoucherStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-gray-50 focus:outline-none focus:border-[#1a5c2a]"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">🟢 Đang kích hoạt</option>
                  <option value="inactive">⚪ Đang tạm dừng</option>
                </select>
              </div>
            </div>

            {/* Empty State */}
            {filteredVouchers.length === 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-10 text-center border border-gray-200 shadow-sm space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#1a5c2a] flex items-center justify-center mx-auto text-2xl">
                  🎟️
                </div>
                <h3 className="font-bold text-sm text-gray-700">Không tìm thấy mã giảm giá nào</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Không có mã voucher nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setVoucherSearch('')
                    setVoucherTypeFilter('all')
                    setVoucherStatusFilter('all')
                  }}
                  className="px-4 py-2 bg-[#1a5c2a] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* Voucher Ticket Grid */}
            {filteredVouchers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredVouchers.map(v => {
                  const percentUsed = v.usageLimit > 0 ? Math.min(100, Math.round((v.usedCount / v.usageLimit) * 100)) : null

                  return (
                    <div
                      key={v.id}
                      className={`bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative ${
                        !v.isActive ? 'bg-gray-50/70 opacity-75' : ''
                      }`}
                    >
                      {/* Top banner / ticket notch */}
                      <div className="p-4 sm:p-5 space-y-3 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Code badge */}
                            <button
                              type="button"
                              onClick={() => copyVoucherCode(v.code)}
                              className="px-3 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-[#1a5c2a] font-black text-sm tracking-wider uppercase flex items-center gap-1.5 transition-colors shadow-sm"
                              title="Bấm để sao chép mã"
                            >
                              <span>{v.code}</span>
                              <Copy size={12} className="text-emerald-700" />
                            </button>

                            {/* Type tag */}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {v.type === 'percentage'
                                ? `Giảm ${v.value}%`
                                : v.type === 'freeship'
                                ? 'Freeship 100%'
                                : `Giảm ${formatPrice(v.value)}`}
                            </span>
                          </div>

                          {/* Toggle Active status */}
                          <button
                            type="button"
                            onClick={() => toggleVoucherActive(v.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shadow-sm flex items-center gap-1 ${
                              v.isActive
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                            title="Bấm để bật / tắt voucher"
                          >
                            {v.isActive ? '🟢 Đang áp dụng' : '⚪ Tạm dừng'}
                          </button>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="font-black text-sm text-gray-900 leading-snug">{v.title}</h4>
                          {v.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                              {v.description}
                            </p>
                          )}
                        </div>

                        {/* Detail Chips */}
                        <div className="flex flex-wrap gap-1.5 text-[11px] pt-1">
                          {v.minOrder > 0 && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg font-medium">
                              🛒 Đơn từ: <b>{formatPrice(v.minOrder)}</b>
                            </span>
                          )}
                          {v.type === 'percentage' && v.maxDiscount > 0 && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg font-medium">
                              🏷️ Tối đa: <b>{formatPrice(v.maxDiscount)}</b>
                            </span>
                          )}
                          {v.endDate && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg font-medium">
                              📅 Hạn: <b>{v.endDate}</b>
                            </span>
                          )}
                        </div>

                        {/* Usage Progress Bar */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-1">
                            <span>Lượt dùng</span>
                            <span>
                              {v.usedCount || 0} {v.usageLimit > 0 ? `/ ${v.usageLimit} lượt` : 'lượt (Vô hạn)'}
                            </span>
                          </div>
                          {v.usageLimit > 0 && (
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#1a5c2a] rounded-full transition-all"
                                style={{ width: `${percentUsed}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ticket Footer Action Bar */}
                      <div className="px-4 py-2.5 sm:px-5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-medium">
                          ID: #{v.id}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditVoucherModal(v)}
                            className="px-2.5 py-1 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <Edit2 size={12} /> Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVoucher(v.id, v.code)}
                            className="p-1 rounded-xl bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-600 shadow-sm transition-colors"
                            title="Xóa voucher"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: ORDERS MANAGEMENT                                       */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200">
              <div>
                <h2 className="font-black text-xl sm:text-2xl text-gray-900">Quản Lý Đơn Hàng ({orders.length})</h2>
                <p className="text-gray-500 text-xs">Cập nhật tiến độ nấu nướng và in lại phiếu hóa đơn</p>
              </div>

              {/* Status Filter */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'pending', 'preparing', 'delivering', 'done', 'cancelled'].map(f => (
                  <button
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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
                  <div key={order.orderNumber} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-sm flex flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b pb-3">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
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

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400">Tổng tiền</p>
                          <p className="font-black text-base sm:text-lg text-[#1a5c2a]">{formatPrice(order.grandTotal || order.totalAmount)}</p>
                          {order.discountAmount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200 mt-0.5">
                              🎟️ Giảm -{formatPrice(order.discountAmount)} {order.voucherCode ? `(${order.voucherCode})` : ''}
                            </span>
                          )}
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
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {order.items?.map((it, idx) => (
                        <span key={idx} className="bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200 font-medium text-gray-700 text-[11px]">
                          {it.name} <span className="font-black text-[#1a5c2a]">x{it.qty}</span>
                          {it.spicyLevel !== undefined && it.spicyLevel !== null && ` (Cay ${it.spicyLevel})`}
                          {it.topping && ` (+${it.topping})`}
                        </span>
                      ))}
                    </div>

                    {/* Owner estimated time quick reply */}
                    {order.status !== 'done' && order.status !== 'cancelled' && (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-amber-50 rounded-xl sm:rounded-2xl border border-amber-200 text-xs">
                        <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                          ⏱️ Hẹn giờ:
                          {order.estimateTime && (
                            <span className="bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded-lg text-[10px] font-black">
                              {order.estimateTime}
                            </span>
                          )}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.orderNumber, 'preparing', 'Dự kiến 10-15 phút')}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-0.5 rounded-lg font-bold text-[10px] shadow-sm transition-colors"
                          >
                            + 10-15p
                          </button>
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.orderNumber, 'preparing', 'Dự kiến 20-25 phút')}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded-lg font-bold text-[10px] shadow-sm transition-colors"
                          >
                            + 20-25p
                          </button>
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.orderNumber, 'preparing', 'Bếp đang nấu món')}
                            className="bg-[#1a5c2a] hover:bg-[#2d7a40] text-white px-2 py-0.5 rounded-lg font-bold text-[10px] shadow-sm transition-colors"
                          >
                            👨‍🍳 Đang nấu
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Status updater */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
                      <span className="text-gray-400 text-[11px]">Cập nhật:</span>
                      <div className="flex flex-wrap gap-1">
                        {['pending', 'confirmed', 'preparing', 'delivering', 'done', 'cancelled'].map(st => (
                          <button
                            key={st}
                            onClick={() => updateOrderStatus(order.orderNumber, st)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                              order.status === st
                                ? 'bg-[#1a5c2a] text-white shadow'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {st === 'pending' ? 'Chờ duyệt' :
                             st === 'confirmed' ? 'Đã duyệt' :
                             st === 'preparing' ? 'Đang nấu' :
                             st === 'delivering' ? 'Đang ship' :
                             st === 'done' ? '✅ Xong' : '❌ Hủy'}
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
            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="font-black text-xl sm:text-2xl text-gray-900 flex items-center gap-2">
                  <ChefHat className="text-[#1a5c2a]" /> Bếp & Chế Biến Món Ăn
                </h2>
                <p className="text-gray-500 text-xs">Hiển thị các món đang chờ chế biến</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {orders
                .filter(o => o.status === 'preparing' || o.status === 'pending')
                .map(order => (
                  <div key={order.orderNumber} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <div>
                          <span className="font-black text-lg sm:text-xl text-gray-900">{order.tableName}</span>
                          <p className="text-[10px] text-gray-400">Đơn #{order.orderNumber}</p>
                        </div>
                        <span className="bg-amber-100 text-amber-800 text-[11px] font-black px-2 py-0.5 rounded-xl animate-pulse">
                          🔥 CHỜ NẤU
                        </span>
                      </div>

                      <div className="py-2.5 space-y-2">
                        {order.items?.map((it, idx) => (
                          <div key={idx} className="p-2 sm:p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex justify-between font-bold text-xs sm:text-sm text-gray-900">
                              <span>{it.name}</span>
                              <span className="text-[#1a5c2a] font-black text-sm sm:text-base">x{it.qty}</span>
                            </div>
                            {it.spicyLevel !== undefined && it.spicyLevel !== null && (
                              <p className="text-[11px] font-black text-red-600 mt-0.5">🌶️ Cấp độ cay: {it.spicyLevel}</p>
                            )}
                            {it.topping && (
                              <p className="text-[11px] font-semibold text-amber-700">+ Topping: {it.topping}</p>
                            )}
                            {it.note && (
                              <p className="text-[10px] text-gray-500 italic">Ghi chú: {it.note}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t flex gap-2">
                      <button
                        onClick={() => updateOrderStatus(order.orderNumber, 'done')}
                        className="w-full bg-[#1a5c2a] hover:bg-[#2d7a40] text-white py-2.5 rounded-xl sm:rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow active:scale-95"
                      >
                        <Check size={16} /> Báo Xong Món (Ra Bàn)
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {orders.filter(o => o.status === 'preparing' || o.status === 'pending').length === 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border text-gray-400">
                <CheckCircle size={40} className="mx-auto mb-2 text-green-500" />
                <p className="font-bold text-sm sm:text-base text-gray-700">Tất cả món đã hoàn thành!</p>
                <p className="text-xs text-gray-400 mt-1">Hiện không có đơn nào đang chờ bếp nấu.</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: SEPAY CONFIGURATION & VIRTUAL BANK CARD                   */}
        {/* ============================================================== */}
        {activeTab === 'sepay' && (
          <div className="max-w-2xl space-y-4 sm:space-y-5 animate-fadeIn">
            <div>
              <h2 className="font-black text-xl sm:text-2xl text-gray-900 flex items-center gap-2">
                <QrCode className="text-[#1a5c2a]" /> Cấu Hình Thanh Toán VietQR Tự Động
              </h2>
              <p className="text-gray-500 text-xs">Cấu hình tài khoản ngân hàng và Webhook tự động khớp lệnh</p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0" />
                  <span>Trạng thái: Đang kết nối SePay Gateway</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              </div>

              {/* Virtual Bank Card Preview (Responsive) */}
              <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-[1.586/1] rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col justify-between overflow-hidden bg-gradient-to-tr from-[#0a2f14] via-[#1a5c2a] to-[#2d7a40]">
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#f5c518]/20 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex justify-between items-center z-10">
                  <div>
                    <p className="text-[10px] tracking-widest text-[#f5c518] font-black uppercase">SEPAY VIETQR GATEWAY</p>
                    <p className="font-black text-sm sm:text-base text-white">{sepayConfig.bankName}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-[#f5c518] text-sm">
                    K
                  </div>
                </div>

                <div className="my-auto z-10">
                  <p className="text-[10px] text-white/70">Số Tài Khoản Nhận Tiền</p>
                  <p className="font-mono font-black text-xl sm:text-2xl tracking-wider text-yellow-300">
                    {sepayConfig.accountNo}
                  </p>
                </div>

                <div className="flex justify-between items-end z-10">
                  <div>
                    <p className="text-[9px] text-white/70 uppercase">Chủ Tài Khoản</p>
                    <p className="font-bold text-xs sm:text-sm tracking-wide">{sepayConfig.accountName}</p>
                  </div>
                  <div className="bg-[#f5c518] text-[#1a5c2a] px-2.5 py-1 rounded-lg text-[10px] font-black">
                    NAPAS 24/7
                  </div>
                </div>
              </div>

              {/* Form Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Ngân hàng thụ hưởng</label>
                  <input
                    type="text"
                    value={sepayConfig.bankName}
                    onChange={e => setSepayConfig({ ...sepayConfig, bankName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Số tài khoản</label>
                  <input
                    type="text"
                    value={sepayConfig.accountNo}
                    onChange={e => setSepayConfig({ ...sepayConfig, accountNo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-black text-[#1a5c2a] focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tên chủ tài khoản</label>
                  <input
                    type="text"
                    value={sepayConfig.accountName}
                    onChange={e => setSepayConfig({ ...sepayConfig, accountName: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 uppercase focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Cú pháp tiền tố đơn</label>
                  <input
                    type="text"
                    value={sepayConfig.prefix}
                    onChange={e => setSepayConfig({ ...sepayConfig, prefix: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('kutin_sepay_config', JSON.stringify(sepayConfig))
                  toast.success('Đã lưu cấu hình SePay thành công!')
                }}
                className="w-full bg-[#1a5c2a] hover:bg-[#2d7a40] text-white py-3 rounded-2xl font-black text-xs shadow-md transition-colors active:scale-95"
              >
                Lưu Cấu Hình SePay
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: THÔNG TIN QUÁN & BẢN ĐỒ GOOGLE MAPS (FULL CRUD)          */}
        {/* ============================================================== */}
        {activeTab === 'store' && (
          <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-8">
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1a5c2a] bg-emerald-50 px-2 py-0.5 rounded-lg">
                    Quản Lý Hệ Thống Quán
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    ⚡ Đồng bộ tức thì mọi màn hình
                  </span>
                </div>
                <h2 className="font-black text-xl sm:text-2xl lg:text-3xl text-gray-900 mt-1 flex items-center gap-2">
                  <Store className="text-[#1a5c2a]" /> Thông Tin Quán & Vị Trí Bản Đồ
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  Thay đổi địa chỉ, hotline, giờ mở cửa, phí ship và bản đồ Google Maps tự động cập nhật ngay trên Website, Chân trang và Hóa đơn.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleResetStoreInfo}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={14} /> Khôi Phục Gốc
                </button>
                <button
                  type="button"
                  onClick={handleSaveStoreInfo}
                  className="bg-[#1a5c2a] hover:bg-[#2d7a40] text-[#f5c518] px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Check size={15} /> Lưu Cập Nhật
                </button>
              </div>
            </div>

            {/* Main Form & Preview Grid */}
            <form onSubmit={handleSaveStoreInfo} className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {/* LEFT COLUMN: Store Profile & Contact Info (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Thông Tin Nhận Diện */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-3">
                  <h3 className="font-black text-sm text-gray-800 flex items-center gap-2 border-b pb-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#1a5c2a] flex items-center justify-center text-xs">🏠</span>
                    Thông Tin Nhận Diện Quán
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Tên Quán Ăn *</label>
                      <input
                        type="text"
                        required
                        value={storeForm.name || ''}
                        onChange={e => setStoreForm({ ...storeForm, name: e.target.value })}
                        placeholder="VD: KUTIN Food & Drink"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#1a5c2a]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Khẩu Hiệu / Slogan</label>
                      <input
                        type="text"
                        value={storeForm.slogan || ''}
                        onChange={e => setStoreForm({ ...storeForm, slogan: e.target.value })}
                        placeholder="VD: Ngon - Sạch - Giá Hạt Dẻ"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Câu Chào / Giới Thiệu Ngắn</label>
                    <input
                      type="text"
                      value={storeForm.tagline || ''}
                      onChange={e => setStoreForm({ ...storeForm, tagline: e.target.value })}
                      placeholder="VD: Món ngon đậm vị xứ Hố Nai, phục vụ tận tâm chu đáo!"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Thông Báo Chạy Đầu Trang (Marquee / Banner)</label>
                    <textarea
                      rows={2}
                      value={storeForm.orderNotice || ''}
                      onChange={e => setStoreForm({ ...storeForm, orderNotice: e.target.value })}
                      placeholder="Thông báo ưu đãi hoặc lưu ý cho khách hàng..."
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#1a5c2a] resize-none"
                    />
                  </div>
                </div>

                {/* 2. Liên Hệ & Giờ Phục Vụ */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-3">
                  <h3 className="font-black text-sm text-gray-800 flex items-center gap-2 border-b pb-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center text-xs">📞</span>
                    Liên Hệ & Giờ Phục Vụ
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Hotline Đặt Món / Hỗ Trợ *</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={storeForm.hotline || ''}
                          onChange={e => setStoreForm({ ...storeForm, hotline: e.target.value })}
                          placeholder="0947 007 881"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#1a5c2a] focus:outline-none focus:border-[#1a5c2a]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Số Zalo / Link Zalo Tư Vấn</label>
                      <input
                        type="text"
                        value={storeForm.zalo || ''}
                        onChange={e => setStoreForm({ ...storeForm, zalo: e.target.value })}
                        placeholder="0947 007 881"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-blue-600 focus:outline-none focus:border-[#1a5c2a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Giờ Mở Cửa Hoạt Động</label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={storeForm.openHours || ''}
                        onChange={e => setStoreForm({ ...storeForm, openHours: e.target.value })}
                        placeholder="10:00 - 20:30 (Mở cửa tất cả các ngày trong tuần)"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Địa Chỉ Đầy Đủ (Khu vực, Phường, Thành phố)</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        rows={2}
                        value={storeForm.address || ''}
                        onChange={e => setStoreForm({ ...storeForm, address: e.target.value })}
                        placeholder="1 Ngô Sĩ Liên, Khu Phố 2, Phường Tân Biên, TP. Biên Hòa, Tỉnh Đồng Nai"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#1a5c2a] resize-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Địa Chỉ Rút Gọn (In hóa đơn K80 & chân trang)</label>
                    <input
                      type="text"
                      value={storeForm.shortAddress || ''}
                      onChange={e => setStoreForm({ ...storeForm, shortAddress: e.target.value })}
                      placeholder="1 Ngô Sĩ Liên, KP2, Hố Nai, Đồng Nai"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                    />
                  </div>
                </div>

                {/* 3. Phí Vận Chuyển & WiFi Quán */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-3">
                  <h3 className="font-black text-sm text-gray-800 flex items-center gap-2 border-b pb-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs">🛵</span>
                    Phí Giao Hàng & Tiện Ích Quán
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Phí Giao Hàng Tiêu Chuẩn (VNĐ)</label>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={storeForm.deliveryFee || 0}
                        onChange={e => setStoreForm({ ...storeForm, deliveryFee: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-black text-[#1a5c2a] focus:outline-none focus:border-[#1a5c2a]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Đơn Tối Thiểu Được Miễn Phí Ship (VNĐ)</label>
                      <input
                        type="number"
                        min={0}
                        step={5000}
                        value={storeForm.minFreeDelivery || 0}
                        onChange={e => setStoreForm({ ...storeForm, minFreeDelivery: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-black text-amber-700 focus:outline-none focus:border-[#1a5c2a]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Tên WiFi Tại Quán</label>
                      <div className="relative">
                        <Wifi size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={storeForm.wifiName || ''}
                          onChange={e => setStoreForm({ ...storeForm, wifiName: e.target.value })}
                          placeholder="KUTIN_FOOD_DRINK_GUEST"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Mật Khẩu WiFi</label>
                      <input
                        type="text"
                        value={storeForm.wifiPass || ''}
                        onChange={e => setStoreForm({ ...storeForm, wifiPass: e.target.value })}
                        placeholder="kutinfood2024"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Google Maps Config & Live Interactive Preview (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center text-xs">🗺️</span>
                      Vị Trí Bản Đồ Google Maps
                    </h3>
                    <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-bold">
                      Trực quan
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Đường Dẫn Nhúng Bản Đồ (Google Maps Iframe Embed)
                    </label>
                    <textarea
                      rows={3}
                      value={storeForm.mapEmbedUrl || ''}
                      onChange={e => handleMapEmbedUrlChange(e.target.value)}
                      placeholder="Dán link src hoặc dán toàn bộ mã <iframe> từ Google Maps..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[11px] font-mono text-gray-700 focus:outline-none focus:border-[#1a5c2a] resize-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      💡 Mẹo: Bạn có thể dán toàn bộ thẻ <code>&lt;iframe src="..."&gt;</code> từ Google Maps, hệ thống sẽ tự động tách đường dẫn chuẩn.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Đường Dẫn Mở Chỉ Đường Google Maps (Cho Khách Mở App)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={storeForm.mapDirectionUrl || ''}
                        onChange={e => setStoreForm({ ...storeForm, mapDirectionUrl: e.target.value })}
                        placeholder="https://maps.google.com/?q=..."
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-[#1a5c2a]"
                      />
                      {storeForm.mapDirectionUrl && (
                        <a
                          href={storeForm.mapDirectionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 hover:bg-[#1a5c2a] hover:text-white text-gray-700 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 flex-shrink-0"
                          title="Mở thử nghiệm trên Google Maps"
                        >
                          <ExternalLink size={13} /> Mở Thử
                        </a>
                      )}
                    </div>
                  </div>

                  {/* LIVE PREVIEW CONTAINER */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Khung Xem Trước Trực Tiếp (Live Preview)
                      </p>
                      <span className="text-[10px] text-gray-400">Tọa độ quán KUTIN</span>
                    </div>

                    <div className="rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-md bg-gray-100 h-64 sm:h-72 relative">
                      {storeForm.mapEmbedUrl ? (
                        <iframe
                          src={storeForm.mapEmbedUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Bản đồ quán KUTIN Food & Drink"
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center">
                          <MapPin size={36} className="mb-2 text-gray-300" />
                          <p className="font-bold text-xs">Chưa có liên kết bản đồ</p>
                          <p className="text-[10px]">Vui lòng nhập đường dẫn nhúng iframe phía trên để xem trước</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action card bottom */}
                <div className="bg-gradient-to-r from-[#1a5c2a] to-[#2d7a40] text-white p-5 rounded-2xl sm:rounded-3xl shadow-lg space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#f5c518] text-[#1a5c2a] flex items-center justify-center font-black text-base shadow">
                      ✓
                    </div>
                    <div>
                      <p className="font-black text-sm text-[#f5c518]">Lưu Thay Đổi Ngay</p>
                      <p className="text-[11px] text-white/80">Tất cả khách truy cập sẽ thấy thông tin mới nhất</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleResetStoreInfo}
                      className="flex-1 py-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
                    >
                      Khôi Phục Gốc
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-3 rounded-xl sm:rounded-2xl bg-[#f5c518] hover:bg-[#fdd835] text-[#1a5c2a] font-black text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Check size={16} strokeWidth={3} /> Lưu Thông Tin Quán
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ================= MODAL: THÊM / CHỈNH SỬA MÓN ĂN (CRUD) ================= */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1a5c2a] flex items-center justify-center font-black">
                  <Utensils size={18} />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-gray-900">
                    {editingDish ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Ăn Mới'}
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    {editingDish ? 'Cập nhật giá và thông tin' : 'Sẽ lập tức xuất hiện trên web và POS'}
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

            {/* Modal Body with scrollable content */}
            <form onSubmit={handleSaveDish} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {/* Tên món */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tên món ăn *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Mì Cay Thập Cẩm Đặc Biệt..."
                  value={dishForm.name}
                  onChange={e => setDishForm({ ...dishForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              {/* Danh mục & Giá */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Danh mục *</label>
                  <select
                    value={dishForm.category}
                    onChange={e => setDishForm({ ...dishForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 bg-gray-50 focus:outline-none focus:border-[#1a5c2a]"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-black text-[#1a5c2a] focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>
              </div>

              {/* Huy hiệu & Trạng thái */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Huy hiệu nổi bật</label>
                  <select
                    value={dishForm.badge}
                    onChange={e => setDishForm({ ...dishForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-gray-50 focus:outline-none focus:border-[#1a5c2a]"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold bg-gray-50 focus:outline-none focus:border-[#1a5c2a]"
                  >
                    <option value="1">🟢 Còn bán (Có sẵn)</option>
                    <option value="0">🔴 Tạm hết món</option>
                  </select>
                </div>
              </div>

              {/* Hình ảnh món ăn (Tải từ máy / điện thoại hoặc Dán Link online) */}
              <div className="bg-gray-50/90 p-3 sm:p-3.5 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#1a5c2a]" />
                    Hình ảnh món ăn
                  </label>
                  {dishForm.image ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ Đã có ảnh riêng
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-200/80 px-2 py-0.5 rounded-full">
                      Mặc định theo danh mục
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {/* Khung xem trước trực tiếp */}
                  <div className="relative w-28 h-28 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white border-2 border-dashed border-gray-300 flex-shrink-0 flex items-center justify-center group shadow-sm">
                    <img
                      src={dishForm.image || categoryImages[dishForm.category] || categoryImages.default}
                      alt="Xem trước món"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = categoryImages[dishForm.category] || categoryImages.default
                      }}
                    />
                    {dishForm.image && (
                      <button
                        type="button"
                        onClick={() => setDishForm(prev => ({ ...prev, image: '' }))}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition-colors"
                        title="Xóa ảnh riêng (trở về ảnh mặc định)"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Các tùy chọn nhập ảnh */}
                  <div className="flex-1 w-full space-y-2">
                    {/* Nút bấm tải ảnh từ thiết bị */}
                    <div>
                      <label className="cursor-pointer flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-white border border-dashed border-gray-300 hover:border-[#1a5c2a] hover:bg-emerald-50/40 text-gray-700 hover:text-[#1a5c2a] text-xs font-bold transition-all shadow-sm active:scale-95">
                        <Upload size={14} className="text-[#1a5c2a]" />
                        <span>{isCompressingImg ? 'Đang nén ảnh...' : 'Tải ảnh từ máy / điện thoại'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileChange}
                          disabled={isCompressingImg}
                        />
                      </label>
                      <p className="text-[10px] text-gray-400 mt-0.5 text-center sm:text-left">
                        Hỗ trợ JPG, PNG, WEBP. Tự động nén siêu nhẹ để lưu mượt mà.
                      </p>
                    </div>

                    {/* Ô dán link URL online */}
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Hoặc dán link ảnh online (https://...)"
                        value={dishForm.image}
                        onChange={e => setDishForm(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-gray-200 text-[11px] bg-white focus:outline-none focus:border-[#1a5c2a]"
                      />
                      <Link2 size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                    </div>

                    {/* Nút chọn nhanh ảnh mẫu theo danh mục */}
                    {categoryImages[dishForm.category] && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDishForm(prev => ({ ...prev, image: categoryImages[dishForm.category] }))}
                          className="text-[10px] text-[#1a5c2a] hover:underline font-bold inline-flex items-center gap-1"
                        >
                          ⚡ Gợi ý: Dùng ảnh mẫu chuẩn của {categories.find(c => c.id === dishForm.category)?.name}
                        </button>
                      </div>
                    )}
                  </div>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs resize-none focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              {/* Sticky footer submit buttons */}
              <div className="flex gap-2 pt-2 border-t mt-2">
                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1a5c2a] hover:bg-[#2d7a40] text-white text-xs font-black shadow-md transition-all active:scale-95"
                >
                  {editingDish ? 'Lưu Thay Đổi' : 'Thêm Món'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM / CHỈNH SỬA VOUCHER (CRUD) ================= */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b flex-shrink-0 bg-[#1a5c2a] text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#f5c518] text-[#1a5c2a] flex items-center justify-center font-black">
                  <Ticket size={18} />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base">
                    {editingVoucher ? 'Chỉnh Sửa Mã Giảm Giá' : 'Tạo Mã Giảm Giá Mới'}
                  </h3>
                  <p className="text-[10px] text-white/80">
                    {editingVoucher ? `Cập nhật mã: ${editingVoucher.code}` : 'Sẽ áp dụng cho cả web và máy bán hàng POS'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveVoucher} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {/* Code & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Mã Voucher (Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: KUTIN20, GIAM30K..."
                    value={voucherForm.code}
                    onChange={e => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-wider text-[#1a5c2a] focus:outline-none focus:border-[#1a5c2a]"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">Tự động viết hoa, không dấu</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tiêu đề chương trình *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Giảm 20K Mừng Khai Trương..."
                    value={voucherForm.title}
                    onChange={e => setVoucherForm({ ...voucherForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>
              </div>

              {/* Discount Type */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Loại giảm giá *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVoucherForm({ ...voucherForm, type: 'percentage', value: voucherForm.value || '10' })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      voucherForm.type === 'percentage'
                        ? 'border-[#1a5c2a] bg-emerald-50 text-[#1a5c2a] ring-2 ring-[#1a5c2a]/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>% Phần trăm</span>
                    <span className="text-[10px] text-gray-400 font-normal">Vd: Giảm 10%</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVoucherForm({ ...voucherForm, type: 'fixed', value: voucherForm.value || '20000' })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      voucherForm.type === 'fixed'
                        ? 'border-[#1a5c2a] bg-emerald-50 text-[#1a5c2a] ring-2 ring-[#1a5c2a]/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>💵 Tiền cố định</span>
                    <span className="text-[10px] text-gray-400 font-normal">Vd: Giảm 20.000đ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVoucherForm({ ...voucherForm, type: 'freeship', value: 0 })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      voucherForm.type === 'freeship'
                        ? 'border-[#1a5c2a] bg-emerald-50 text-[#1a5c2a] ring-2 ring-[#1a5c2a]/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>🚚 Freeship</span>
                    <span className="text-[10px] text-gray-400 font-normal">Miễn phí ship</span>
                  </button>
                </div>
              </div>

              {/* Value & Max Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {voucherForm.type !== 'freeship' ? (
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {voucherForm.type === 'percentage' ? 'Mức giảm (%) *' : 'Số tiền giảm (VNĐ) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={voucherForm.type === 'percentage' ? 100 : undefined}
                      step={voucherForm.type === 'percentage' ? 1 : 1000}
                      placeholder={voucherForm.type === 'percentage' ? 'VD: 10' : 'VD: 20000'}
                      value={voucherForm.value}
                      onChange={e => setVoucherForm({ ...voucherForm, value: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-black text-[#1a5c2a] focus:outline-none focus:border-[#1a5c2a]"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex flex-col justify-center">
                    <span className="text-xs font-bold text-gray-700">Miễn phí vận chuyển</span>
                    <span className="text-[10px] text-emerald-700">Tự động giảm 100% phí ship đơn hàng</span>
                  </div>
                )}

                {voucherForm.type === 'percentage' ? (
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Giảm tối đa (VNĐ)</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      placeholder="VD: 30000 (0 = không giới hạn)"
                      value={voucherForm.maxDiscount}
                      onChange={e => setVoucherForm({ ...voucherForm, maxDiscount: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a5c2a]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Giới hạn lượt dùng</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="VD: 100 (0 = không giới hạn)"
                      value={voucherForm.usageLimit}
                      onChange={e => setVoucherForm({ ...voucherForm, usageLimit: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a5c2a]"
                    />
                  </div>
                )}
              </div>

              {/* Min Order & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="VD: 80000 (0 = mọi đơn)"
                    value={voucherForm.minOrder}
                    onChange={e => setVoucherForm({ ...voucherForm, minOrder: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Trạng thái áp dụng</label>
                  <select
                    value={voucherForm.isActive ? '1' : '0'}
                    onChange={e => setVoucherForm({ ...voucherForm, isActive: e.target.value === '1' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold bg-gray-50 focus:outline-none focus:border-[#1a5c2a]"
                  >
                    <option value="1">🟢 Kích hoạt ngay (Có hiệu lực)</option>
                    <option value="0">⚪ Tạm dừng áp dụng</option>
                  </select>
                </div>
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={voucherForm.startDate}
                    onChange={e => setVoucherForm({ ...voucherForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Ngày kết thúc (Hạn dùng)</label>
                  <input
                    type="date"
                    value={voucherForm.endDate}
                    onChange={e => setVoucherForm({ ...voucherForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Mô tả & Điều kiện áp dụng</label>
                <textarea
                  rows={2}
                  placeholder="Điều kiện áp dụng cụ thể cho khách xem..."
                  value={voucherForm.description}
                  onChange={e => setVoucherForm({ ...voucherForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs resize-none focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Xem trước vé voucher:</span>
                  <p className="font-black text-xs text-emerald-950 mt-0.5">
                    🎟️ {voucherForm.code || 'MÃ_VOUCHER'} — {voucherForm.title || 'Tiêu đề ưu đãi'}
                  </p>
                  <p className="text-[10px] text-emerald-700">
                    {voucherForm.type === 'percentage'
                      ? `Giảm ${voucherForm.value || 0}% (Tối đa ${formatPrice(voucherForm.maxDiscount || 0)})`
                      : voucherForm.type === 'freeship'
                      ? 'Miễn phí giao hàng'
                      : `Giảm ${formatPrice(voucherForm.value || 0)}`}
                    {Number(voucherForm.minOrder) > 0 ? ` • Đơn từ ${formatPrice(voucherForm.minOrder)}` : ''}
                  </p>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex gap-2 pt-2 border-t mt-2">
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1a5c2a] hover:bg-[#2d7a40] text-white text-xs font-black shadow-md transition-all active:scale-95"
                >
                  {editingVoucher ? 'Lưu Thay Đổi' : 'Tạo Voucher'}
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
