import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Shield, ArrowRight, X, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRestaurant } from '../context/RestaurantContext'

export default function StaffLoginModal({ isOpen, onClose }) {
  const { loginAdmin } = useRestaurant()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [loggedInSuccess, setLoggedInSuccess] = useState(false)

  if (!isOpen) return null

  const handleLogin = (e) => {
    e.preventDefault()
    const ok = loginAdmin(password)
    if (ok) {
      setError(false)
      setLoggedInSuccess(true)
      toast.success('Xác thực quản trị viên thành công!')
    } else {
      setError(true)
      toast.error('Mật khẩu không chính xác!')
    }
  }

  const handleNavigate = (path) => {
    onClose()
    setLoggedInSuccess(false)
    setPassword('')
    navigate(path)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1a5c2a] text-[#f5c518] flex items-center justify-center font-black text-xl shadow">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-black text-base text-gray-900 leading-tight">Khu Vực Quản Trị</h3>
              <p className="text-[11px] text-gray-400">Dành riêng cho chủ quán & thu ngân</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>

        {loggedInSuccess ? (
          <div className="py-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl animate-bounce">
              ✓
            </div>
            <div>
              <h4 className="font-black text-lg text-gray-800">Xin Chào Quản Trị Viên!</h4>
              <p className="text-xs text-gray-500 mt-1">Chọn phân hệ bạn muốn làm việc ngay:</p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleNavigate('/pos')}
                className="w-full bg-[#1a5c2a] hover:bg-[#2d7a40] text-[#f5c518] py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                💻 Mở Máy Bán Hàng POS Thu Ngân
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/admin')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                📊 Trung Tâm Báo Cáo & Quản Trị
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5 flex items-center gap-1">
                <Lock size={13} className="text-gray-500" /> Nhập mật khẩu xác thực:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value)
                    setError(false)
                  }}
                  placeholder="Mật khẩu quản trị..."
                  className={`w-full px-4 py-3 rounded-2xl border-2 text-sm focus:outline-none transition-colors pr-10 ${
                    error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c2a]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-1.5 font-medium">Mật khẩu không chính xác!</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-[#1a5c2a] hover:bg-[#2d7a40] text-white py-3 rounded-2xl font-black text-xs shadow-md transition-all active:scale-95"
            >
              Xác Thực & Mở Khóa
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
