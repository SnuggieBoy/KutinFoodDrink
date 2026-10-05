// Quản lý dữ liệu Voucher / Mã Giảm Giá cho KUTIN Food & Drink

export const INITIAL_VOUCHERS = [
  {
    id: 'v1',
    code: 'KUTIN10',
    title: 'Giảm 10% Toàn Thực Đơn',
    type: 'percentage', // 'percentage' | 'fixed' | 'freeship'
    value: 10, // 10%
    minOrder: 80000,
    maxDiscount: 30000,
    usageLimit: 100,
    usedCount: 14,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: 'Áp dụng cho đơn từ 80.000đ, mức giảm tối đa 30.000đ',
    isActive: true,
  },
  {
    id: 'v2',
    code: 'GIAM20K',
    title: 'Giảm Trực Tiếp 20.000đ',
    type: 'fixed',
    value: 20000,
    minOrder: 100000,
    maxDiscount: 20000,
    usageLimit: 50,
    usedCount: 22,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: 'Áp dụng cho mọi đơn hàng từ 100.000đ',
    isActive: true,
  },
  {
    id: 'v3',
    code: 'FREESHIP',
    title: 'Miễn Phí Giao Hàng Tận Nơi',
    type: 'freeship',
    value: 0,
    minOrder: 120000,
    maxDiscount: 15000,
    usageLimit: 200,
    usedCount: 38,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: 'Miễn 100% phí giao hàng cho đơn từ 120.000đ',
    isActive: true,
  },
  {
    id: 'v4',
    code: 'CHAOMOI',
    title: 'Ưu Đãi Khách Mới 15.000đ',
    type: 'fixed',
    value: 15000,
    minOrder: 60000,
    maxDiscount: 15000,
    usageLimit: 50,
    usedCount: 9,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: 'Tặng 15.000đ cho khách hàng mới với đơn từ 60.000đ',
    isActive: true,
  },
  {
    id: 'v5',
    code: 'KUTINVIP',
    title: 'Đại Tiệc Mì Cay Giảm 50.000đ',
    type: 'fixed',
    value: 50000,
    minOrder: 250000,
    maxDiscount: 50000,
    usageLimit: 30,
    usedCount: 6,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: 'Giảm ngay 50.000đ cho đơn tiệc, hội nhóm từ 250.000đ',
    isActive: true,
  },
]

export const getActiveVouchers = () => {
  try {
    const saved = localStorage.getItem('kutin_vouchers')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Lỗi đọc vouchers từ localStorage:', e)
  }
  return INITIAL_VOUCHERS
}

export const saveActiveVouchers = (vouchers) => {
  try {
    localStorage.setItem('kutin_vouchers', JSON.stringify(vouchers))
    window.dispatchEvent(new Event('storage'))
  } catch (e) {
    console.error('Lỗi lưu vouchers vào localStorage:', e)
  }
}

export const validateVoucher = (code, orderAmount, shippingFee = 0) => {
  if (!code || !code.trim()) {
    return { valid: false, message: 'Vui lòng nhập mã giảm giá!' }
  }

  const cleanCode = code.trim().toUpperCase()
  const vouchers = getActiveVouchers()
  const voucher = vouchers.find(v => v.code.toUpperCase() === cleanCode)

  if (!voucher) {
    return { valid: false, message: `Mã giảm giá "${cleanCode}" không tồn tại!` }
  }

  if (!voucher.isActive) {
    return { valid: false, message: `Mã "${cleanCode}" hiện đang tạm dừng áp dụng!` }
  }

  // Kiểm tra ngày hết hạn
  if (voucher.endDate) {
    const end = new Date(voucher.endDate)
    end.setHours(23, 59, 59, 999)
    if (Date.now() > end.getTime()) {
      return { valid: false, message: `Mã "${cleanCode}" đã hết hạn sử dụng!` }
    }
  }

  // Kiểm tra ngày bắt đầu
  if (voucher.startDate) {
    const start = new Date(voucher.startDate)
    start.setHours(0, 0, 0, 0)
    if (Date.now() < start.getTime()) {
      return { valid: false, message: `Mã "${cleanCode}" chưa đến ngày áp dụng!` }
    }
  }

  // Kiểm tra số lượt dùng
  if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
    return { valid: false, message: `Mã "${cleanCode}" đã đạt giới hạn lượt sử dụng!` }
  }

  // Kiểm tra đơn tối thiểu
  if (voucher.minOrder && orderAmount < voucher.minOrder) {
    return {
      valid: false,
      message: `Đơn hàng chưa đạt mức tối thiểu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.minOrder)} để dùng mã này!`,
    }
  }

  // Tính số tiền giảm
  let discountAmount = 0
  if (voucher.type === 'freeship') {
    discountAmount = shippingFee > 0 ? shippingFee : 15000
  } else if (voucher.type === 'percentage') {
    const calculated = Math.round((orderAmount * voucher.value) / 100)
    discountAmount = voucher.maxDiscount > 0 ? Math.min(calculated, voucher.maxDiscount) : calculated
  } else {
    // Fixed amount
    discountAmount = Math.min(voucher.value, orderAmount)
  }

  return {
    valid: true,
    voucher,
    discountAmount,
    message: `Áp dụng thành công mã "${voucher.code}"!`,
  }
}

export const incrementVoucherUsage = (code) => {
  if (!code) return
  try {
    const cleanCode = code.trim().toUpperCase()
    const vouchers = getActiveVouchers()
    const updated = vouchers.map(v => 
      v.code.toUpperCase() === cleanCode 
        ? { ...v, usedCount: (v.usedCount || 0) + 1 } 
        : v
    )
    saveActiveVouchers(updated)
  } catch (e) {
    console.error('Lỗi cập nhật lượt dùng voucher:', e)
  }
}
