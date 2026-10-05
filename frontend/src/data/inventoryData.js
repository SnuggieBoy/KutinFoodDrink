export const INVENTORY_CATEGORIES = [
  { id: 'meat_seafood', name: 'Thịt & Hải sản', icon: 'Beef' },
  { id: 'veg_spices', name: 'Rau củ & Gia vị', icon: 'Carrot' },
  { id: 'noodles_bread', name: 'Bún/Mì/Bánh', icon: 'Croissant' },
  { id: 'cheese_sauce', name: 'Phô mai & Sốt', icon: 'Droplet' },
  { id: 'beverages_mixers', name: 'Đồ uống & Nguyên liệu pha chế', icon: 'Coffee' },
  { id: 'packaging_tools', name: 'Bao bì & Dụng cụ', icon: 'Package' },
  { id: 'gas_energy', name: 'Gas & Năng lượng', icon: 'Flame' },
  { id: 'other', name: 'Khác', icon: 'Box' }
];

export const INITIAL_INVENTORY = [
  { id: 'inv_1', name: 'Thịt bò (Ba chỉ)', category: 'meat_seafood', unit: 'kg', currentStock: 5.5, minStock: 2, costPerUnit: 180000, supplier: 'Chợ đầu mối', lastRestocked: '2026-10-01T08:00:00Z', notes: 'Dùng cho mì cay, cơm trộn' },
  { id: 'inv_2', name: 'Mực ống nhỏ', category: 'meat_seafood', unit: 'kg', currentStock: 3, minStock: 1.5, costPerUnit: 150000, supplier: 'Chợ hải sản', lastRestocked: '2026-10-02T07:30:00Z', notes: 'Dùng cho mì cay hải sản' },
  { id: 'inv_3', name: 'Tôm thẻ', category: 'meat_seafood', unit: 'kg', currentStock: 4, minStock: 2, costPerUnit: 160000, supplier: 'Chợ hải sản', lastRestocked: '2026-10-02T07:30:00Z', notes: 'Mì cay hải sản' },
  { id: 'inv_4', name: 'Gà phi lê', category: 'meat_seafood', unit: 'kg', currentStock: 10, minStock: 3, costPerUnit: 85000, supplier: 'CP Food', lastRestocked: '2026-10-03T09:00:00Z', notes: 'Làm gà xù' },
  { id: 'inv_5', name: 'Kim chi Hàn Quốc', category: 'veg_spices', unit: 'kg', currentStock: 8, minStock: 3, costPerUnit: 60000, supplier: 'Nhà cung cấp A', lastRestocked: '2026-10-04T08:00:00Z', notes: 'Món kèm, mì cay' },
  { id: 'inv_6', name: 'Mì Koreno', category: 'noodles_bread', unit: 'gói', currentStock: 150, minStock: 50, costPerUnit: 6500, supplier: 'Đại lý B', lastRestocked: '2026-09-28T10:00:00Z', notes: 'Mì cay các loại' },
  { id: 'inv_7', name: 'Bánh gạo Tokpokki', category: 'noodles_bread', unit: 'kg', currentStock: 6, minStock: 2, costPerUnit: 45000, supplier: 'Đại lý B', lastRestocked: '2026-09-30T09:00:00Z', notes: 'Món Tokpokki' },
  { id: 'inv_8', name: 'Phô mai sợi Mozzarella', category: 'cheese_sauce', unit: 'kg', currentStock: 4, minStock: 1.5, costPerUnit: 180000, supplier: 'Nhà cung cấp Phô Mai', lastRestocked: '2026-09-29T14:00:00Z', notes: 'Mì cay phô mai, gà cay phô mai' },
  { id: 'inv_9', name: 'Sốt cay Hàn Quốc (Gochujang)', category: 'cheese_sauce', unit: 'hộp', currentStock: 5, minStock: 2, costPerUnit: 90000, supplier: 'Đại lý gia vị Hàn', lastRestocked: '2026-09-25T11:00:00Z', notes: 'Gia vị chính' },
  { id: 'inv_10', name: 'Bột chiên xù', category: 'veg_spices', unit: 'gói', currentStock: 12, minStock: 4, costPerUnit: 25000, supplier: 'Tạp hóa C', lastRestocked: '2026-09-26T08:00:00Z', notes: 'Làm gà xù' },
  { id: 'inv_11', name: 'Trà đen pha trà sữa', category: 'beverages_mixers', unit: 'kg', currentStock: 2.5, minStock: 1, costPerUnit: 110000, supplier: 'Đại lý trà', lastRestocked: '2026-09-20T10:00:00Z', notes: 'Trà sữa truyền thống' },
  { id: 'inv_12', name: 'Trân châu đen', category: 'beverages_mixers', unit: 'kg', currentStock: 5, minStock: 2, costPerUnit: 35000, supplier: 'Đại lý nguyên liệu pha chế', lastRestocked: '2026-10-01T09:00:00Z', notes: 'Topping trà sữa' },
  { id: 'inv_13', name: 'Sữa đặc', category: 'beverages_mixers', unit: 'lon', currentStock: 15, minStock: 6, costPerUnit: 22000, supplier: 'Tạp hóa C', lastRestocked: '2026-09-28T08:00:00Z', notes: 'Pha chế đồ uống' },
  { id: 'inv_14', name: 'Hộp nhựa đen 2 ngăn', category: 'packaging_tools', unit: 'cái', currentStock: 120, minStock: 50, costPerUnit: 2000, supplier: 'Đại lý bao bì', lastRestocked: '2026-09-15T15:00:00Z', notes: 'Đựng cơm trộn, gà xù' },
  { id: 'inv_15', name: 'Tô giấy kraft (đựng mì)', category: 'packaging_tools', unit: 'cái', currentStock: 80, minStock: 30, costPerUnit: 3500, supplier: 'Đại lý bao bì', lastRestocked: '2026-09-15T15:00:00Z', notes: 'Đựng mì cay mang đi' },
  { id: 'inv_16', name: 'Túi nilon chữ T (đựng ly)', category: 'packaging_tools', unit: 'kg', currentStock: 2, minStock: 0.5, costPerUnit: 40000, supplier: 'Đại lý bao bì', lastRestocked: '2026-09-10T10:00:00Z', notes: 'Mang đi' },
  { id: 'inv_17', name: 'Gas công nghiệp 45kg', category: 'gas_energy', unit: 'bình', currentStock: 1, minStock: 1, costPerUnit: 1200000, supplier: 'Đại lý Gas D', lastRestocked: '2026-09-05T08:00:00Z', notes: 'Bếp chính' },
  { id: 'inv_18', name: 'Gas dân dụng 12kg', category: 'gas_energy', unit: 'bình', currentStock: 2, minStock: 1, costPerUnit: 400000, supplier: 'Đại lý Gas D', lastRestocked: '2026-09-20T08:00:00Z', notes: 'Bếp phụ' }
];

export const INITIAL_IMPORT_RECORDS = [
  {
    id: 'imp_1',
    date: '2026-10-01T08:00:00Z',
    items: [
      { inventoryId: 'inv_1', name: 'Thịt bò (Ba chỉ)', qty: 5, costPerUnit: 180000, totalCost: 900000 },
      { inventoryId: 'inv_12', name: 'Trân châu đen', qty: 5, costPerUnit: 35000, totalCost: 175000 }
    ],
    totalCost: 1075000,
    supplier: 'Nhiều nhà cung cấp',
    notes: 'Nhập hàng đầu tháng',
    createdAt: '2026-10-01T08:15:00Z'
  },
  {
    id: 'imp_2',
    date: '2026-10-02T07:30:00Z',
    items: [
      { inventoryId: 'inv_2', name: 'Mực ống nhỏ', qty: 3, costPerUnit: 150000, totalCost: 450000 },
      { inventoryId: 'inv_3', name: 'Tôm thẻ', qty: 4, costPerUnit: 160000, totalCost: 640000 }
    ],
    totalCost: 1090000,
    supplier: 'Chợ hải sản',
    notes: 'Hải sản tươi sống',
    createdAt: '2026-10-02T08:00:00Z'
  },
  {
    id: 'imp_3',
    date: '2026-10-04T08:00:00Z',
    items: [
      { inventoryId: 'inv_5', name: 'Kim chi Hàn Quốc', qty: 5, costPerUnit: 60000, totalCost: 300000 },
      { inventoryId: 'inv_4', name: 'Gà phi lê', qty: 10, costPerUnit: 85000, totalCost: 850000 }
    ],
    totalCost: 1150000,
    supplier: 'CP Food & NCC A',
    notes: 'Bổ sung cuối tuần',
    createdAt: '2026-10-04T08:20:00Z'
  }
];

export const getActiveInventory = () => {
  try {
    const data = localStorage.getItem('kutin_inventory');
    return data ? JSON.parse(data) : INITIAL_INVENTORY;
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu kho từ localStorage:', error);
    return INITIAL_INVENTORY;
  }
};

export const saveActiveInventory = (items) => {
  try {
    localStorage.setItem('kutin_inventory', JSON.stringify(items));
    window.dispatchEvent(new Event('kutin_inventory_updated'));
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu kho vào localStorage:', error);
  }
};

export const getImportRecords = () => {
  try {
    const data = localStorage.getItem('kutin_import_records');
    return data ? JSON.parse(data) : INITIAL_IMPORT_RECORDS;
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu nhập hàng từ localStorage:', error);
    return INITIAL_IMPORT_RECORDS;
  }
};

export const saveImportRecords = (records) => {
  try {
    localStorage.setItem('kutin_import_records', JSON.stringify(records));
    window.dispatchEvent(new Event('kutin_import_records_updated'));
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu nhập hàng vào localStorage:', error);
  }
};

export const getLowStockItems = (inventory) => {
  return inventory.filter(item => item.currentStock <= item.minStock);
};

export const calculateInventoryValue = (inventory) => {
  return inventory.reduce((total, item) => total + (item.currentStock * item.costPerUnit), 0);
};
