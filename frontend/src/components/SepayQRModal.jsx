import { useState, useEffect } from 'react'
import { CheckCircle2, Copy, AlertCircle, RefreshCw, QrCode, ArrowRight, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice } from '../data/menuData'

export default function SepayQRModal({
  isOpen,
  onClose,
  amount,
  orderCode,
  customerName = 'Khách hàng',
  onSuccess,
}) {
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes countdown
  const [isPaid, setIsPaid] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)

  // Default demo bank info for KUTIN
  const bankConfig = {
    bank: 'MBBank',
    bankBin: '970422',
    accountNumber: '0947007881',
    accountName: 'KUTIN FOOD AND DRINK',
  }

  const transferContent = `KUTIN ${orderCode}`

  // VietQR / SePay QR image URL
  const qrUrl = `https://qr.sepay.vn/img?bank=${bankConfig.bank}&acc=${bankConfig.accountNumber}&template=compact&amount=${amount}&des=${encodeURIComponent(transferContent)}`

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isPaid) return
    setTimeLeft(300)
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen, isPaid])

  if (!isOpen) return null

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`Đã sao chép ${label}!`)
  }

  // Simulate SePay Webhook trigger
  const handleSimulateWebhook = () => {
    setIsSimulating(true)
    setTimeout(() => {
      setIsSimulating(false)
      setIsPaid(true)
      toast.success('🎉 SePay Webhook: Đã nhận tiền thành công!', {
        duration: 4000,
        icon: '💰',
      })
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 1500)
      }
    }, 1200)
  }

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a5c2a] to-[#2d7a40] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f5c518] text-[#1a5c2a] flex items-center justify-center font-black text-xl shadow-md">
              K
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base leading-tight">Thanh Toán SePay VietQR</h3>
                <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-400/30">
                  Tự Động 24/7
                </span>
              </div>
              <p className="text-white/70 text-xs">Mã đơn: <span className="font-mono font-bold text-[#f5c518]">#{orderCode}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {isPaid ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 size={48} />
              </div>
              <div>
                <h4 className="text-2xl font-black text-gray-800">Thanh Toán Hoàn Tất!</h4>
                <p className="text-gray-500 text-sm mt-1">
                  SePay đã xác nhận thanh toán <span className="font-bold text-[#1a5c2a]">{formatPrice(amount)}</span>
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-2xl border border-green-200 text-xs text-green-700 flex items-center justify-center gap-2">
                <ShieldCheck size={16} /> Giao dịch đã được ghi nhận tự động vào hệ thống
              </div>
            </div>
          ) : (
            <>
              {/* QR Image Box */}
              <div className="bg-gradient-to-b from-gray-50 to-emerald-50/40 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center">
                <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100 relative group">
                  <img
                    src={qrUrl}
                    alt="VietQR SePay"
                    className="w-56 h-56 object-contain rounded-lg"
                    onError={(e) => {
                      // Fallback to VietQR API if SePay proxy has issues
                      e.target.src = `https://img.vietqr.io/image/${bankConfig.bank}-${bankConfig.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankConfig.accountName)}`
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold backdrop-blur-[2px]">
                    Quét bằng app ngân hàng
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between w-full text-xs text-gray-500 px-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Tự động khớp lệnh tức thì</span>
                  </div>
                  <div className="font-mono font-bold text-orange-600 flex items-center gap-1">
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Hết hạn: {formatTimer(timeLeft)}</span>
                  </div>
                </div>
              </div>

              {/* Bank Transfer Details */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="text-gray-500">Ngân hàng:</span>
                  <span className="font-bold text-gray-800 flex items-center gap-1">
                    <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black">MB</span>
                    {bankConfig.bank}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="text-gray-500">Chủ tài khoản:</span>
                  <span className="font-bold text-gray-800">{bankConfig.accountName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="text-gray-500">Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-gray-900 text-sm">{bankConfig.accountNumber}</span>
                    <button
                      onClick={() => copyToClipboard(bankConfig.accountNumber, 'Số tài khoản')}
                      className="text-gray-400 hover:text-[#1a5c2a]"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="text-gray-500">Số tiền:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#1a5c2a] text-sm">{formatPrice(amount)}</span>
                    <button
                      onClick={() => copyToClipboard(amount.toString(), 'Số tiền')}
                      className="text-gray-400 hover:text-[#1a5c2a]"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1 bg-amber-50 p-2 rounded-xl border border-amber-200">
                  <div>
                    <span className="text-amber-800 font-semibold block text-[11px]">Nội dung chuyển khoản (bắt buộc):</span>
                    <span className="font-mono font-black text-amber-950 text-sm">{transferContent}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(transferContent, 'Nội dung chuyển khoản')}
                    className="bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-1 rounded-lg text-[11px] font-bold transition-colors"
                  >
                    Sao chép
                  </button>
                </div>
              </div>

              {/* Demo Special Feature: Webhook Simulator */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-blue-800 leading-tight">
                    <span className="font-bold">Dành cho Demo:</span> Bấm nút dưới để giả lập SePay gửi Webhook báo tiền đã về tài khoản ngay lập tức!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateWebhook}
                  disabled={isSimulating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Đang nhận Webhook SePay...
                    </>
                  ) : (
                    <>
                      <span>⚡ Giả lập: Khách đã quét chuyển tiền thành công</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-between items-center text-xs">
          <span className="text-gray-400">Tích hợp cổng SePay F&B</span>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
