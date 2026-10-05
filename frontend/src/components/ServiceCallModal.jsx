import { useState } from 'react'
import { Bell, X, Check, Coffee, Utensils, Sparkles, Receipt, HelpCircle } from 'lucide-react'
import { useRestaurant } from '../context/RestaurantContext'

const SERVICE_OPTIONS = [
  { id: 'Xin thêm đá', label: 'Xin thêm xô đá / đá lạnh', icon: '🧊', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'Xin chén đũa muỗng', label: 'Xin thêm chén, đũa, muỗng', icon: '🥢', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'Xin khăn lạnh', label: 'Xin khăn lạnh / khăn giấy', icon: '🧻', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'Gọi tính tiền', label: 'Gọi nhân viên tính tiền tại bàn', icon: '💵', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'Nhân viên đến bàn', label: 'Cần nhân viên hỗ trợ tại bàn', icon: '🙋', color: 'bg-rose-50 text-rose-700 border-rose-200' },
]

export default function ServiceCallModal({ isOpen, onClose }) {
  const { currentTable, selectCustomerTable, sendServiceCall } = useRestaurant()
  const [selectedTable, setSelectedTable] = useState(currentTable || '1')
  const [customNote, setCustomNote] = useState('')
  const [sentSuccess, setSentSuccess] = useState(false)

  if (!isOpen) return null

  const handleSend = (optionTitle) => {
    selectCustomerTable(selectedTable)
    sendServiceCall(optionTitle, customNote)
    setSentSuccess(true)
    setTimeout(() => {
      setSentSuccess(false)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
              🔔
            </div>
            <div>
              <h3 className="font-black text-base text-gray-900 leading-tight">Chuông Gọi Phục Vụ</h3>
              <p className="text-[11px] text-gray-400">Nhân viên sẽ có mặt hỗ trợ bạn ngay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>

        {sentSuccess ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl animate-bounce">
              ✓
            </div>
            <h4 className="font-black text-lg text-gray-800">Đã Gửi Chuông Thành Công!</h4>
            <p className="text-xs text-gray-500">Nhân viên đang tới hỗ trợ Bàn {selectedTable}.</p>
          </div>
        ) : (
          <>
            {/* Table Selection Picker */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Bạn đang ngồi ở bàn số mấy?
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(tbl => (
                  <button
                    key={tbl}
                    type="button"
                    onClick={() => setSelectedTable(tbl.toString())}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      selectedTable.toString().replace('Bàn ', '') === tbl.toString()
                        ? 'bg-[#1a5c2a] text-white shadow-md scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Bàn {tbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Request Buttons (Big touch targets for touchscreen) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                Chọn yêu cầu bạn cần:
              </label>
              <div className="space-y-1.5">
                {SERVICE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSend(opt.id)}
                    className={`w-full p-3 rounded-2xl border text-left font-bold text-xs flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${opt.color}`}
                  >
                    <span className="text-xl flex-shrink-0">{opt.icon}</span>
                    <span className="flex-1">{opt.label}</span>
                    <span className="text-[11px] font-black opacity-60">Gửi →</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-[10px] text-gray-400">
              Chuông sẽ reo trực tiếp trên máy thu ngân của KUTIN
            </p>
          </>
        )}
      </div>
    </div>
  )
}
