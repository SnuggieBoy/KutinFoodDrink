import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fdf8f0] flex items-center justify-center p-4 text-center font-sans">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-gray-100 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h2 className="font-black text-xl text-gray-900">Đã xảy ra lỗi tải trang</h2>
            <p className="text-gray-500 text-xs">
              Hệ thống vừa gặp sự cố nhỏ trong việc xử lý giao diện. Vui lòng thử tải lại trang hoặc quay về trang chủ.
            </p>
            {this.state.error && (
              <div className="p-3 bg-red-50 text-red-700 text-[11px] rounded-xl font-mono text-left overflow-x-auto max-h-24">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-[#1a5c2a] hover:bg-[#2d7a40] text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <RotateCcw size={14} /> Tải Lại Trang
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false })}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Home size={14} /> Trang Chủ
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
