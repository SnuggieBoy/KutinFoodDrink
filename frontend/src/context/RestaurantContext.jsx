import { createContext, useContext, useState, useEffect } from 'react'
import { sound } from '../utils/sound'
import toast from 'react-hot-toast'

// Cấu hình thông tin mặc định của quán KUTIN Food & Drink
export const DEFAULT_STORE_INFO = {
  name: 'KUTIN Food & Drink',
  slogan: 'Ngon - Sạch - Giá Hạt Dẻ',
  tagline: 'Món ngon đậm vị xứ Hố Nai, phục vụ tận tâm chu đáo!',
  hotline: '0947 007 881',
  zalo: '0947 007 881',
  address: '1 Ngô Sĩ Liên, Khu Phố 2, Phường Tân Biên, TP. Biên Hòa, Tỉnh Đồng Nai',
  shortAddress: '1 Ngô Sĩ Liên, KP2, Hố Nai, Đồng Nai',
  openHours: '10:00 - 20:30 (Mở cửa tất cả các ngày trong tuần)',
  deliveryFee: 15000,
  minFreeDelivery: 150000,
  orderNotice: '🎉 Miễn phí giao hàng cho đơn từ 150.000đ trong bán kính 3km! Đặt món nóng hổi ngay hôm nay.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3917.472888523306!2d106.877028!3d10.957519!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174dfb2a472c51f%3A0x6b490d182b8344e2!2zMSBOZ8O0IFMlogsIExpw6puLCBUw6JuIEJpw6puLCBUaMOgbmggcGjhu5EgQmnDqm4gSMOyYSwgxJDhu5NuZyBOYWk!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
  mapDirectionUrl: 'https://maps.google.com/?q=1+Ngô+Sĩ+Liên,+Khu+Phố+2,+Tân+Biên,+Biên+Hòa,+Đồng+Nai',
  bankName: 'MB Bank (Quân Đội)',
  bankAccount: '0947007881',
  bankOwner: 'LE TRONG HIEU',
  wifiName: 'KUTIN_FOOD_DRINK_GUEST',
  wifiPass: 'kutinfood2024',
}

const RestaurantContext = createContext(null)

export function RestaurantProvider({ children }) {
  // Store Information state (Full CRUD persisted in localStorage)
  const [storeInfo, setStoreInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('kutin_store_info')
      if (saved) return { ...DEFAULT_STORE_INFO, ...JSON.parse(saved) }
    } catch (e) {
      console.error('Lỗi đọc cấu hình quán', e)
    }
    return DEFAULT_STORE_INFO
  })

  const updateStoreInfo = (newInfo) => {
    const updated = { ...storeInfo, ...newInfo }
    setStoreInfo(updated)
    localStorage.setItem('kutin_store_info', JSON.stringify(updated))
    toast.success('Đã lưu thông tin quán thành công!')
  }

  const resetStoreInfo = () => {
    setStoreInfo(DEFAULT_STORE_INFO)
    localStorage.setItem('kutin_store_info', JSON.stringify(DEFAULT_STORE_INFO))
    toast.success('Đã khôi phục thông tin quán về mặc định!')
  }

  // Staff / Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('kutin_admin') === '1'
  })

  const loginAdmin = (password) => {
    if (password === 'kutin2024') {
      sessionStorage.setItem('kutin_admin', '1')
      setIsAdminAuthenticated(true)
      return true
    }
    return false
  }

  const logoutAdmin = () => {
    sessionStorage.removeItem('kutin_admin')
    setIsAdminAuthenticated(false)
    toast.success('Đã đăng xuất khỏi hệ thống nhân viên')
  }

  // Current seated table for customer (if scanned table QR)
  const [currentTable, setCurrentTable] = useState(() => {
    // Check URL search params
    const params = new URLSearchParams(window.location.search)
    const tableParam = params.get('table') || params.get('ban')
    if (tableParam) {
      sessionStorage.setItem('kutin_current_table', tableParam)
      return tableParam
    }
    return sessionStorage.getItem('kutin_current_table') || null
  })

  // Service calls queue (e.g. Bàn 03 gọi xin đá, gọi tính tiền)
  const [serviceCalls, setServiceCalls] = useState(() => {
    return JSON.parse(localStorage.getItem('kutin_service_calls') || '[]')
  })

  // Listen for storage events (realtime sync between customer tab and POS/Admin tab!)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'kutin_store_info') {
        try {
          const updated = JSON.parse(e.newValue || '{}')
          setStoreInfo(prev => ({ ...prev, ...updated }))
        } catch (err) {}
      }
      if (e.key === 'kutin_service_calls') {
        const updated = JSON.parse(e.newValue || '[]')
        setServiceCalls(updated)
        // Play bell if new call arrived
        if (updated.length > (serviceCalls.length || 0)) {
          sound.playBell()
        }
      }
      if (e.key === 'kutin_orders') {
        // Play ding dong when new order placed
        sound.playDingDong()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [serviceCalls.length])

  // Call staff function (Customer side)
  const sendServiceCall = (requestType, customNote = '') => {
    const tableLabel = currentTable ? (currentTable.startsWith('Bàn') ? currentTable : `Bàn ${currentTable}`) : 'Bàn chưa chọn'
    const newCall = {
      id: `CALL_${Date.now()}`,
      table: tableLabel,
      type: requestType, // 'ice', 'cutlery', 'bill', 'help'
      note: customNote,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'pending',
    }

    const currentCalls = JSON.parse(localStorage.getItem('kutin_service_calls') || '[]')
    const updated = [newCall, ...currentCalls]
    localStorage.setItem('kutin_service_calls', JSON.stringify(updated))
    setServiceCalls(updated)

    // Play chime sound
    sound.playBell()

    toast.success(`🔔 Đã gửi yêu cầu "${requestType}" tới nhân viên!`, {
      icon: '🔔',
      duration: 3000,
    })
  }

  // Dismiss / complete service call (Staff / POS / Admin side)
  const resolveServiceCall = (callId) => {
    const updated = serviceCalls.filter(c => c.id !== callId)
    localStorage.setItem('kutin_service_calls', JSON.stringify(updated))
    setServiceCalls(updated)
    toast.success('Đã xử lý yêu cầu của bàn!', { duration: 1500 })
  }

  // Set table
  const selectCustomerTable = (tableId) => {
    setCurrentTable(tableId)
    sessionStorage.setItem('kutin_current_table', tableId)
  }

  return (
    <RestaurantContext.Provider
      value={{
        storeInfo,
        updateStoreInfo,
        resetStoreInfo,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        currentTable,
        selectCustomerTable,
        serviceCalls,
        sendServiceCall,
        resolveServiceCall,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  )
}

export const useRestaurant = () => {
  const ctx = useContext(RestaurantContext)
  if (!ctx) throw new Error('useRestaurant must be used within RestaurantProvider')
  return ctx
}
