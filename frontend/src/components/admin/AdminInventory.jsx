import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Search, Filter, Plus, Edit2, Trash2, Box, 
  FileText, AlertTriangle, CheckCircle, X, 
  DollarSign, Calendar, Truck, ArrowUpCircle, ChevronDown, ChevronUp, Package,
  Warehouse, LayoutGrid, List, RotateCcw, Flame, Check, Sparkles, ChevronRight
} from 'lucide-react';
import { 
  INVENTORY_CATEGORIES, INITIAL_INVENTORY, INITIAL_IMPORT_RECORDS,
  saveActiveInventory, saveImportRecords, 
  getLowStockItems, calculateInventoryValue 
} from '../../data/inventoryData';

const formatPrice = (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + 'đ';

export default function AdminInventory({ inventory, setInventory, importRecords, setImportRecords }) {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'imports'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  
  // Inventory Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'ok' | 'low' | 'out'

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState('');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState(null);

  // Form States
  const defaultItemForm = {
    name: '',
    category: 'meat_seafood',
    unit: 'kg',
    currentStock: '5',
    minStock: '2',
    costPerUnit: '50000',
    supplier: '',
    notes: ''
  };
  const [itemForm, setItemForm] = useState(defaultItemForm);

  const defaultImportForm = {
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    notes: '',
    items: []
  };
  const [importForm, setImportForm] = useState(defaultImportForm);

  // KPIs
  const totalItems = inventory.length;
  const totalValue = calculateInventoryValue(inventory);
  const lowStockCount = getLowStockItems(inventory).length;
  const totalImportCost = importRecords.reduce((sum, record) => sum + (record.totalCost || 0), 0);

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      
      let matchStatus = true;
      if (statusFilter === 'low') matchStatus = item.currentStock > 0 && item.currentStock <= item.minStock;
      if (statusFilter === 'out') matchStatus = item.currentStock <= 0;
      if (statusFilter === 'ok') matchStatus = item.currentStock > item.minStock;
      
      return matchSearch && matchCat && matchStatus;
    });
  }, [inventory, searchTerm, categoryFilter, statusFilter]);

  // Handlers
  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!itemForm.name.trim()) {
      toast.error('Vui lòng nhập tên nguyên liệu!');
      return;
    }

    const curStock = parseFloat(itemForm.currentStock) || 0;
    const minStk = parseFloat(itemForm.minStock) || 0;
    const cost = parseFloat(itemForm.costPerUnit) || 0;

    let updatedInventory;
    if (editingItem) {
      updatedInventory = inventory.map(i => i.id === editingItem.id ? {
        ...i,
        name: itemForm.name.trim(),
        category: itemForm.category,
        unit: itemForm.unit.trim(),
        currentStock: curStock,
        minStock: minStk,
        costPerUnit: cost,
        supplier: itemForm.supplier.trim(),
        notes: itemForm.notes.trim()
      } : i);
      toast.success(`Đã cập nhật nguyên liệu "${itemForm.name}"!`);
    } else {
      const newItem = {
        id: `inv_${Date.now()}`,
        name: itemForm.name.trim(),
        category: itemForm.category,
        unit: itemForm.unit.trim(),
        currentStock: curStock,
        minStock: minStk,
        costPerUnit: cost,
        supplier: itemForm.supplier.trim(),
        notes: itemForm.notes.trim(),
        lastRestocked: new Date().toISOString()
      };
      updatedInventory = [newItem, ...inventory];
      toast.success(`Đã thêm mới "${itemForm.name}" vào kho!`);
    }

    setInventory(updatedInventory);
    saveActiveInventory(updatedInventory);
    setIsItemModalOpen(false);
  };

  const handleDeleteItem = (id, name) => {
    if (window.confirm(`Xác nhận xóa nguyên liệu "${name}" khỏi kho?`)) {
      const updatedInventory = inventory.filter(i => i.id !== id);
      setInventory(updatedInventory);
      saveActiveInventory(updatedInventory);
      toast.success(`Đã xóa nguyên liệu "${name}"!`);
    }
  };

  const handleQuickRestock = (e) => {
    e.preventDefault();
    const addQty = parseFloat(restockQty);
    if (!restockItem || isNaN(addQty) || addQty <= 0) {
      toast.error('Vui lòng nhập số lượng hợp lệ!');
      return;
    }
    
    const updatedInventory = inventory.map(i => {
      if (i.id === restockItem.id) {
        return {
          ...i,
          currentStock: (Number(i.currentStock) || 0) + addQty,
          lastRestocked: new Date().toISOString()
        };
      }
      return i;
    });
    
    setInventory(updatedInventory);
    saveActiveInventory(updatedInventory);
    toast.success(`Đã nhập thêm +${addQty} ${restockItem.unit} cho "${restockItem.name}"!`);
    setIsRestockModalOpen(false);
    setRestockQty('');
  };

  const handleAddImportItem = () => {
    if (inventory.length === 0) return;
    const firstItem = inventory[0];
    setImportForm({
      ...importForm,
      items: [
        ...importForm.items,
        {
          inventoryId: firstItem.id,
          name: firstItem.name,
          qty: 1,
          costPerUnit: firstItem.costPerUnit || 10000,
          totalCost: firstItem.costPerUnit || 10000
        }
      ]
    });
  };

  const handleUpdateImportItem = (index, field, value) => {
    const updatedItems = [...importForm.items];
    const target = { ...updatedItems[index] };

    if (field === 'inventoryId') {
      const selected = inventory.find(i => i.id === value);
      if (selected) {
        target.inventoryId = selected.id;
        target.name = selected.name;
        target.costPerUnit = selected.costPerUnit || 0;
        target.totalCost = (target.qty || 1) * (selected.costPerUnit || 0);
      }
    } else if (field === 'qty') {
      const q = parseFloat(value) || 0;
      target.qty = q;
      target.totalCost = q * (target.costPerUnit || 0);
    } else if (field === 'costPerUnit') {
      const c = parseFloat(value) || 0;
      target.costPerUnit = c;
      target.totalCost = (target.qty || 0) * c;
    }

    updatedItems[index] = target;
    setImportForm({ ...importForm, items: updatedItems });
  };

  const handleRemoveImportItem = (index) => {
    const updated = importForm.items.filter((_, i) => i !== index);
    setImportForm({ ...importForm, items: updated });
  };

  const handleSaveImportRecord = (e) => {
    e.preventDefault();
    if (importForm.items.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 mặt hàng vào phiếu nhập!');
      return;
    }

    const totalCost = importForm.items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
    const newRecord = {
      id: `imp_${Date.now()}`,
      date: importForm.date,
      supplier: importForm.supplier || 'Nhà cung cấp tổng hợp',
      notes: importForm.notes || '',
      items: importForm.items,
      totalCost,
      createdAt: new Date().toISOString()
    };

    // Auto update currentStock in inventory
    const updatedInventory = [...inventory];
    importForm.items.forEach(impItem => {
      const idx = updatedInventory.findIndex(i => i.id === impItem.inventoryId);
      if (idx !== -1) {
        updatedInventory[idx] = {
          ...updatedInventory[idx],
          currentStock: (Number(updatedInventory[idx].currentStock) || 0) + (Number(impItem.qty) || 0),
          costPerUnit: Number(impItem.costPerUnit) || updatedInventory[idx].costPerUnit,
          lastRestocked: importForm.date
        };
      }
    });

    const updatedRecords = [newRecord, ...importRecords];
    setImportRecords(updatedRecords);
    saveImportRecords(updatedRecords);
    setInventory(updatedInventory);
    saveActiveInventory(updatedInventory);

    toast.success(`Đã lưu phiếu nhập kho #${newRecord.id.slice(-4)} (${formatPrice(totalCost)})!`);
    setIsImportModalOpen(false);
  };

  const handleDeleteImport = (id) => {
    if (window.confirm('Xác nhận xóa phiếu nhập này? (Số lượng tồn kho hiện tại sẽ được giữ nguyên)')) {
      const updatedRecords = importRecords.filter(r => r.id !== id);
      setImportRecords(updatedRecords);
      saveImportRecords(updatedRecords);
      toast.success('Đã xóa phiếu nhập hàng!');
    }
  };

  const handleResetDefaultInventory = () => {
    if (window.confirm('Khôi phục lại kho mẫu 18 nguyên liệu và vật tư ban đầu?')) {
      localStorage.removeItem('kutin_inventory');
      localStorage.removeItem('kutin_import_records');
      setInventory(INITIAL_INVENTORY);
      setImportRecords(INITIAL_IMPORT_RECORDS);
      toast.success('Đã khôi phục dữ liệu kho chuẩn!');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      category: item.category || 'meat_seafood',
      unit: item.unit,
      currentStock: String(item.currentStock),
      minStock: String(item.minStock),
      costPerUnit: String(item.costPerUnit),
      supplier: item.supplier || '',
      notes: item.notes || ''
    });
    setIsItemModalOpen(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setItemForm(defaultItemForm);
    setIsItemModalOpen(true);
  };

  const openRestockModal = (item) => {
    setRestockItem(item);
    setRestockQty('5');
    setIsRestockModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-12">
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-[#1a5c2a]">
              <Warehouse size={20} />
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1a5c2a] bg-emerald-50 px-2.5 py-0.5 rounded-lg">
              Kho Bãi & Vật Tư Quán
            </span>
          </div>
          <h2 className="font-black text-xl sm:text-2xl lg:text-3xl text-gray-900">
            Quản Lý Kho & Nhập Hàng
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Theo dõi nguyên liệu tươi sống, gia vị, bao bì và chi phí bình Gas theo thời gian thực
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaultInventory}
            className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Khôi phục nguyên liệu chuẩn"
          >
            <RotateCcw size={14} /> Khôi Phục Mẫu
          </button>
          
          {activeTab === 'inventory' ? (
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-[#1a5c2a] hover:bg-[#2d7a40] text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} /> Thêm Nguyên Liệu
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setImportForm({
                  date: new Date().toISOString().split('T')[0],
                  supplier: '',
                  notes: '',
                  items: inventory.length > 0 ? [{
                    inventoryId: inventory[0].id,
                    name: inventory[0].name,
                    qty: 5,
                    costPerUnit: inventory[0].costPerUnit || 50000,
                    totalCost: 5 * (inventory[0].costPerUnit || 50000)
                  }] : []
                });
                setIsImportModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#1a5c2a] hover:bg-[#2d7a40] text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} /> Lập Phiếu Nhập Mới
            </button>
          )}
        </div>
      </div>

      {/* ================= 4 KPI CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Items */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tổng Mặt Hàng</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">{totalItems}</span>
            <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-full">Nguyên liệu</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">8 danh mục quản lý</p>
        </div>

        {/* Inventory Value */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Giá Trị Tồn Kho</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#1a5c2a]">{formatPrice(totalValue)}</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">Vốn hàng hóa lưu kho</p>
        </div>

        {/* Low Stock Warning */}
        <div className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-sm relative overflow-hidden ${
          lowStockCount > 0 ? 'bg-red-50/80 border-red-200' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cần Nhập Thêm</p>
            {lowStockCount > 0 && <AlertTriangle size={15} className="text-red-500 animate-bounce" />}
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl sm:text-3xl font-black ${lowStockCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {lowStockCount}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              lowStockCount > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {lowStockCount > 0 ? 'Dưới mức an toàn' : 'Kho ổn định'}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Cảnh báo tồn kho tối thiểu</p>
        </div>

        {/* Total Import Spending */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tổng Tiền Nhập Hàng</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black text-amber-600">{formatPrice(totalImportCost)}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{importRecords.length} đợt nhập hàng</p>
        </div>
      </div>

      {/* ================= SUB-TABS NAVIGATION (PILL SWITCH) ================= */}
      <div className="bg-white p-2 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-[#1a5c2a] text-[#f5c518] shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            <Box size={16} />
            <span>Kho Nguyên Liệu ({inventory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('imports')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === 'imports'
                ? 'bg-[#1a5c2a] text-[#f5c518] shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            <Truck size={16} />
            <span>Phiếu Nhập Hàng ({importRecords.length})</span>
          </button>
        </div>

        {/* View Mode Toggle (Only for inventory tab) */}
        {activeTab === 'inventory' && (
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white text-[#1a5c2a] shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Xem dạng thẻ lưới"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#1a5c2a] shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Xem dạng bảng chi tiết"
            >
              <List size={15} />
            </button>
          </div>
        )}
      </div>

      {/* ================= TAB 1: KHO NGUYÊN LIỆU (INVENTORY) ================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-2.5">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm nguyên liệu, vật tư, nhà cung cấp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[#1a5c2a]"
              >
                <option value="all">Tất cả tình trạng</option>
                <option value="ok">🟢 Còn đủ kho</option>
                <option value="low">🟡 Sắp hết (Cần nhập)</option>
                <option value="out">🔴 Đã hết hàng</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[#1a5c2a]"
              >
                <option value="all">Tất cả danh mục (8)</option>
                {INVENTORY_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Quick Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-[#1a5c2a] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tất cả ({inventory.length})
              </button>
              {INVENTORY_CATEGORIES.map(c => {
                const count = inventory.filter(i => i.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryFilter(c.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                      categoryFilter === c.id
                        ? 'bg-[#1a5c2a] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {c.name} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items Display: Grid or Table */}
          {filteredInventory.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 text-gray-400">
              <Box size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="font-bold text-sm">Không tìm thấy nguyên liệu phù hợp bộ lọc</p>
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setStatusFilter('all'); }}
                className="mt-3 text-xs text-[#1a5c2a] font-bold hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredInventory.map(item => {
                const cat = INVENTORY_CATEGORIES.find(c => c.id === item.category);
                const isOut = item.currentStock <= 0;
                const isLow = !isOut && item.currentStock <= item.minStock;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top badges */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 truncate max-w-[140px]">
                          {cat?.name || 'Vật tư'}
                        </span>

                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isOut ? 'bg-red-100 text-red-700' :
                          isLow ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isOut ? 'Đã hết' : isLow ? 'Sắp hết' : 'Đủ dùng'}
                        </span>
                      </div>

                      {/* Name */}
                      <h4 className="font-black text-base text-gray-900 group-hover:text-[#1a5c2a] transition-colors line-clamp-1">
                        {item.name}
                      </h4>

                      {/* Stock Highlight */}
                      <div className="mt-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Tồn Hiện Tại</p>
                          <p className="font-black text-xl text-gray-900 mt-0.5">
                            {item.currentStock} <span className="text-xs font-semibold text-gray-500">{item.unit}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Mức Tối Thiểu</p>
                          <p className="text-xs font-bold text-gray-600 mt-1">
                            {item.minStock} {item.unit}
                          </p>
                        </div>
                      </div>

                      {/* Cost & Supplier */}
                      <div className="mt-2.5 text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Đơn giá vốn:</span>
                          <span className="font-bold text-[#1a5c2a]">{formatPrice(item.costPerUnit)} / {item.unit}</span>
                        </div>
                        {item.supplier && (
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-400">Nguồn hàng:</span>
                            <span className="font-medium truncate max-w-[140px]">{item.supplier}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => openRestockModal(item)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1a5c2a] text-xs font-black flex items-center gap-1 transition-colors"
                        title="Nhập thêm hàng nhanh"
                      >
                        <ArrowUpCircle size={14} /> Nhập Nhanh
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
                          title="Sửa"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="p-1.5 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                      <th className="py-3 px-4">Tên Nguyên Liệu</th>
                      <th className="py-3 px-3">Danh Mục</th>
                      <th className="py-3 px-3">Tồn Kho</th>
                      <th className="py-3 px-3">Đơn Giá Vốn</th>
                      <th className="py-3 px-3">Nhà Cung Cấp</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInventory.map(item => {
                      const cat = INVENTORY_CATEGORIES.find(c => c.id === item.category);
                      const isOut = item.currentStock <= 0;
                      const isLow = !isOut && item.currentStock <= item.minStock;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-black text-sm text-gray-900 block">{item.name}</span>
                            {item.notes && <span className="text-[10px] text-gray-400 block">{item.notes}</span>}
                          </td>
                          <td className="py-3 px-3">
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[11px] font-bold">
                              {cat?.name || 'Khác'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-sm text-gray-900">{item.currentStock} {item.unit}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isOut ? 'bg-red-100 text-red-700' :
                                isLow ? 'bg-amber-100 text-amber-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isOut ? 'Hết' : isLow ? 'Sắp hết' : 'Đủ'}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 block">Min: {item.minStock} {item.unit}</span>
                          </td>
                          <td className="py-3 px-3 font-bold text-[#1a5c2a]">
                            {formatPrice(item.costPerUnit)} / {item.unit}
                          </td>
                          <td className="py-3 px-3 text-gray-600">
                            {item.supplier || '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openRestockModal(item)}
                                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#1a5c2a] font-bold text-[11px] flex items-center gap-1"
                                title="Nhập thêm"
                              >
                                <ArrowUpCircle size={13} /> Nhập
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="p-1 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                                title="Sửa"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id, item.name)}
                                className="p-1 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600"
                                title="Xóa"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PHIẾU NHẬP HÀNG (IMPORTS) ================= */}
      {activeTab === 'imports' && (
        <div className="space-y-4">
          {importRecords.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 text-gray-400">
              <Truck size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="font-bold text-sm">Chưa có phiếu nhập hàng nào</p>
              <p className="text-xs text-gray-400 mt-1">Bấm "Lập Phiếu Nhập Mới" để lưu thông tin hóa đơn mua nguyên liệu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {importRecords.map(record => {
                const isExpanded = expandedRecord === record.id;

                return (
                  <div
                    key={record.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    {/* Record Header Card */}
                    <div
                      onClick={() => setExpandedRecord(isExpanded ? null : record.id)}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1a5c2a] flex items-center justify-center font-black flex-shrink-0">
                          <Truck size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm text-gray-900">
                              Phiếu #{record.id.slice(-6).toUpperCase()}
                            </span>
                            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              📅 {record.date}
                            </span>
                            <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {record.items?.length || 0} mặt hàng
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Nhà cung cấp: <span className="font-bold text-gray-700">{record.supplier || 'Tổng hợp'}</span>
                            {record.notes && ` • ${record.notes}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0">
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Tổng Chi Tiền</p>
                          <p className="font-black text-base sm:text-lg text-[#1a5c2a]">
                            {formatPrice(record.totalCost)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteImport(record.id); }}
                            className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Xóa phiếu nhập"
                          >
                            <Trash2 size={15} />
                          </button>
                          <span className="text-gray-400">
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Items Table */}
                    {isExpanded && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 bg-gray-50 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-700 py-2.5">
                          Chi tiết các mặt hàng trong phiếu:
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <thead>
                              <tr className="bg-gray-100/70 text-gray-600 font-bold border-b border-gray-200">
                                <th className="py-2 px-3">Mặt hàng</th>
                                <th className="py-2 px-3 text-center">Số lượng</th>
                                <th className="py-2 px-3 text-right">Đơn giá nhập</th>
                                <th className="py-2 px-3 text-right">Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {(record.items || []).map((it, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50">
                                  <td className="py-2 px-3 font-bold text-gray-800">{it.name}</td>
                                  <td className="py-2 px-3 text-center font-bold text-gray-900">{it.qty}</td>
                                  <td className="py-2 px-3 text-right text-gray-600">{formatPrice(it.costPerUnit || it.cost)}</td>
                                  <td className="py-2 px-3 text-right font-black text-[#1a5c2a]">
                                    {formatPrice(it.totalCost || (it.qty * (it.costPerUnit || it.cost)))}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: THÊM / SỬA NGUYÊN LIỆU ================= */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-base sm:text-lg text-gray-900 flex items-center gap-2">
                <Box size={18} className="text-[#1a5c2a]" />
                {editingItem ? 'Sửa Thông Tin Nguyên Liệu' : 'Thêm Nguyên Liệu / Vật Tư Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tên nguyên liệu / vật tư *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thịt bò ba chỉ, Bình gas 45kg..."
                  value={itemForm.name}
                  onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Danh mục</label>
                  <select
                    value={itemForm.category}
                    onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-700 bg-white focus:outline-none focus:border-[#1a5c2a]"
                  >
                    {INVENTORY_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    required
                    placeholder="kg, lít, hộp, bình, gói..."
                    value={itemForm.unit}
                    onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-medium text-gray-900 focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tồn kho hiện tại</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={itemForm.currentStock}
                    onChange={e => setItemForm({ ...itemForm, currentStock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mức tồn tối thiểu (Báo động)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={itemForm.minStock}
                    onChange={e => setItemForm({ ...itemForm, minStock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Đơn giá vốn ước tính (VNĐ)</label>
                <input
                  type="number"
                  step="1000"
                  required
                  placeholder="50000"
                  value={itemForm.costPerUnit}
                  onChange={e => setItemForm({ ...itemForm, costPerUnit: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-bold text-[#1a5c2a] focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nhà cung cấp / Nguồn nhập</label>
                <input
                  type="text"
                  placeholder="VD: Chợ đầu mối, CP Food, Đại lý Gas..."
                  value={itemForm.supplier}
                  onChange={e => setItemForm({ ...itemForm, supplier: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Ghi chú thêm</label>
                <input
                  type="text"
                  placeholder="VD: Dùng cho mì cay, cơm trộn..."
                  value={itemForm.notes}
                  onChange={e => setItemForm({ ...itemForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1a5c2a] hover:bg-[#2d7a40] text-white font-black shadow-md transition-all active:scale-95"
                >
                  {editingItem ? 'Lưu Thay Đổi' : 'Thêm Vào Kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: NHẬP NHANH ================= */}
      {isRestockModalOpen && restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-base text-gray-900 flex items-center gap-1.5">
                <ArrowUpCircle className="text-emerald-600" size={18} /> Nhập Thêm Hàng Nhanh
              </h3>
              <button
                type="button"
                onClick={() => setIsRestockModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-500">Mặt hàng:</p>
              <p className="font-black text-base text-gray-900">{restockItem.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                Tồn hiện tại: <b className="text-[#1a5c2a]">{restockItem.currentStock} {restockItem.unit}</b>
              </p>
            </div>

            <form onSubmit={handleQuickRestock} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Số lượng nhập thêm ({restockItem.unit}) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  autoFocus
                  placeholder="Nhập số lượng..."
                  value={restockQty}
                  onChange={e => setRestockQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-lg font-black text-[#1a5c2a] focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1a5c2a] text-[#f5c518] text-xs font-black shadow-md transition-all active:scale-95"
                >
                  Cộng Dồn Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LẬP PHIẾU NHẬP MỚI ================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-base sm:text-lg text-gray-900 flex items-center gap-2">
                <Truck size={18} className="text-[#1a5c2a]" />
                Lập Phiếu Nhập Hàng Mới
              </h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveImportRecord} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ngày nhập hàng *</label>
                  <input
                    type="date"
                    required
                    value={importForm.date}
                    onChange={e => setImportForm({ ...importForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nhà cung cấp</label>
                  <input
                    type="text"
                    placeholder="VD: Chợ đầu mối, CP Food..."
                    value={importForm.supplier}
                    onChange={e => setImportForm({ ...importForm, supplier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <label className="font-black text-gray-800 text-sm">Danh sách mặt hàng nhập ({importForm.items.length})</label>
                  <button
                    type="button"
                    onClick={handleAddImportItem}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#1a5c2a] font-bold text-xs flex items-center gap-1 hover:bg-emerald-100"
                  >
                    <Plus size={13} /> Thêm Món
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {importForm.items.map((it, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-wrap items-center gap-2">
                      <div className="flex-1 min-w-[160px]">
                        <select
                          value={it.inventoryId}
                          onChange={e => handleUpdateImportItem(idx, 'inventoryId', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-800 bg-white"
                        >
                          {inventory.map(inv => (
                            <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-20">
                        <input
                          type="number"
                          step="0.5"
                          min="0.1"
                          placeholder="SL"
                          value={it.qty}
                          onChange={e => handleUpdateImportItem(idx, 'qty', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-center"
                        />
                      </div>

                      <div className="w-28">
                        <input
                          type="number"
                          step="1000"
                          placeholder="Giá"
                          value={it.costPerUnit}
                          onChange={e => handleUpdateImportItem(idx, 'costPerUnit', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-right text-[#1a5c2a]"
                        />
                      </div>

                      <span className="font-black text-gray-800 min-w-[70px] text-right">
                        {formatPrice(it.totalCost)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveImportItem(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Import Total Amount */}
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900">Tổng Tiền Phiếu Nhập:</span>
                  <span className="font-black text-base text-[#1a5c2a]">
                    {formatPrice(importForm.items.reduce((s, i) => s + (i.totalCost || 0), 0))}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Ghi chú phiếu nhập</label>
                <input
                  type="text"
                  placeholder="VD: Đợt hàng chuẩn bị cho cuối tuần..."
                  value={importForm.notes}
                  onChange={e => setImportForm({ ...importForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1a5c2a] hover:bg-[#2d7a40] text-white font-black shadow-md transition-all active:scale-95"
                >
                  Lưu Phiếu & Cập Nhật Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
