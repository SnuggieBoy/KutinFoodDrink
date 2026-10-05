// Cấu hình thuế cho Hộ kinh doanh cá thể (Áp dụng từ 01/01/2026)
// Dựa trên quy định mới: 
// - Miễn thuế nếu doanh thu <= 1 tỷ VNĐ/năm
// - Ngành dịch vụ ăn uống: GTGT 3%, TNCN 1.5% (Tổng 4.5%)
// - Bỏ lệ phí môn bài từ 2026
// - Bắt buộc khai thuế điện tử và ghi sổ doanh thu bán hàng hóa, dịch vụ (Mẫu S1a-HKD)
// - Bắt buộc xuất hóa đơn điện tử

export const TAX_CONFIG = {
  vatRate: 0.03, // 3%
  pitRate: 0.015, // 1.5%
  totalRate: 0.045, // 4.5%
  exemptionThreshold: 1000000000, // 1 tỷ VNĐ / năm
  effectiveDate: '2026-01-01'
};

export const TAX_PERIODS = [
  { id: 'monthly', label: 'Hàng tháng' },
  { id: 'quarterly', label: 'Hàng quý' },
  { id: 'yearly', label: 'Hàng năm' }
];

export const INITIAL_TAX_RECORDS = [
  {
    id: 'tx-001',
    period: '2026-01',
    periodLabel: 'Tháng 01/2026',
    revenue: 95000000,
    deductibleCosts: 40000000,
    vatAmount: 2850000,
    pitAmount: 1425000,
    totalTax: 4275000,
    status: 'paid',
    paidDate: '2026-02-15',
    notes: 'Kê khai thuế điện tử tháng 01/2026'
  },
  {
    id: 'tx-002',
    period: '2026-02',
    periodLabel: 'Tháng 02/2026',
    revenue: 110000000,
    deductibleCosts: 55000000,
    vatAmount: 3300000,
    pitAmount: 1650000,
    totalTax: 4950000,
    status: 'paid',
    paidDate: '2026-03-12',
    notes: 'Doanh thu tăng đợt Tết Nguyên Đán'
  },
  {
    id: 'tx-003',
    period: '2026-03',
    periodLabel: 'Tháng 03/2026',
    revenue: 85000000,
    deductibleCosts: 30000000,
    vatAmount: 2550000,
    pitAmount: 1275000,
    totalTax: 3825000,
    status: 'pending',
    paidDate: null,
    notes: 'Chưa nộp, chờ quyết toán'
  },
  {
    id: 'tx-004',
    period: '2026-04',
    periodLabel: 'Tháng 04/2026',
    revenue: 90000000,
    deductibleCosts: 35000000,
    vatAmount: 2700000,
    pitAmount: 1350000,
    totalTax: 4050000,
    status: 'overdue',
    paidDate: null,
    notes: 'Quá hạn nộp thuế'
  }
];

export const getTaxRecords = () => {
  try {
    const data = localStorage.getItem('kutin_tax_records');
    return data ? JSON.parse(data) : INITIAL_TAX_RECORDS;
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu thuế:', error);
    return INITIAL_TAX_RECORDS;
  }
};

export const saveTaxRecords = (records) => {
  try {
    localStorage.setItem('kutin_tax_records', JSON.stringify(records));
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu thuế:', error);
  }
};

export const calculateTax = (revenue) => {
  // Kiểm tra miễn thuế nếu doanh thu không vượt ngưỡng quy định 
  // (Lưu ý: Ngưỡng 1 tỷ thường áp dụng cho tổng doanh thu cả năm)
  const isExempt = revenue <= TAX_CONFIG.exemptionThreshold;
  
  const vatAmount = isExempt ? 0 : revenue * TAX_CONFIG.vatRate;
  const pitAmount = isExempt ? 0 : revenue * TAX_CONFIG.pitRate;
  const totalTax = isExempt ? 0 : revenue * TAX_CONFIG.totalRate;
  
  return {
    isExempt,
    vatAmount,
    pitAmount,
    totalTax,
    effectiveRate: isExempt ? 0 : TAX_CONFIG.totalRate
  };
};

export const getTaxSummary = (records) => {
  return records.reduce((acc, record) => {
    acc.totalRevenue += record.revenue || 0;
    acc.totalDeductions += record.deductibleCosts || 0;
    acc.totalVat += record.vatAmount || 0;
    acc.totalPit += record.pitAmount || 0;
    acc.totalTax += record.totalTax || 0;
    
    if (record.status === 'paid') {
      acc.totalPaid += record.totalTax || 0;
    } else if (record.status === 'pending' || record.status === 'overdue') {
      acc.totalPending += record.totalTax || 0;
    }
    
    return acc;
  }, {
    totalRevenue: 0,
    totalDeductions: 0,
    totalVat: 0,
    totalPit: 0,
    totalTax: 0,
    totalPaid: 0,
    totalPending: 0
  });
};

export const formatTaxPeriod = (periodId) => {
  const period = TAX_PERIODS.find(p => p.id === periodId);
  return period ? period.label : periodId;
};
