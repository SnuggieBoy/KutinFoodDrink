import { createContext, useContext, useState, useEffect } from 'react'
import { sound } from '../utils/sound'
import toast from 'react-hot-toast'

const RestaurantContext = createContext(null)

export function RestaurantProvider({ children }) {
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
