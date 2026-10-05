import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Search, Filter, Plus, Edit, Trash2, Box, 
  FileText, AlertTriangle, CheckCircle, X, 
  DollarSign, Calendar, Truck, ArrowUpCircle, ChevronDown, ChevronUp, Package
} from 'lucide-react';
import { 
  INVENTORY_CATEGORIES, saveActiveInventory, saveImportRecords, 
  getLowStockItems, calculateInventoryValue 
} from '../../data/inventoryData';

const formatPrice = (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + 'đ';

export default function AdminInventory({ inventory, setInventory, importRecords, setImportRecords }) {
  const [activeTab, setActiveTab] = useState('inventory');
  
  // Inventory Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockItem, setRestockItem] = useState(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form States
  const defaultItemForm = {
    name: '',
    categoryId: 'thit',
    unit: 'kg',
    currentStock: 0,
    minStock: 5,
    costPerUnit: 0,
    supplier: '',
    notes: ''
  };
  const [itemForm, setItemForm] = useState(defaultItemForm);

  const [restockQty, setRestockQty] = useState(0);

  const defaultImportForm = {
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    notes: '',
    items: []
  };
  const [importForm, setImportForm] = useState(defaultImportForm);
  const [expandedRecord, setExpandedRecord] = useState(null);

  // KPIs
  const totalItems = inventory.length;
  const totalValue = calculateInventoryValue(inventory);
  const lowStockCount = getLowStockItems(inventory).length;
  const totalImportCost = importRecords.reduce((sum, record) => sum + record.totalCost, 0);

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'all' || item.categoryId === categoryFilter;
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
    let updatedInventory;
    if (editingItem) {
      updatedInventory = inventory.map(i => i.id === editingItem.id ? { ...itemForm, id: i.id } : i);
      toast.success('Đã cập nhật nguyên liệu');
    } else {
      const newItem = {
        ...itemForm,
        id: `inv_${Date.now()}`,
        lastRestocked: new Date().toISOString().split('T')[0]
      };
      updatedInventory = [...inventory, newItem];
      toast.success('Đã thêm nguyên liệu mới');
    }
    setInventory(updatedInventory);
    saveActiveInventory(updatedInventory);
    setIsItemModalOpen(false);
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa nguyên liệu này?')) {
      const updatedInventory = inventory.filter(i => i.id !== id);
      setInventory(updatedInventory);
      saveActiveInventory(updatedInventory);
      toast.success('Đã xóa nguyên liệu');
    }
  };

  const handleQuickRestock = (e) => {
    e.preventDefault();
    if (!restockItem || restockQty <= 0) return;
    
    const updatedInventory = inventory.map(i => {
      if (i.id === restockItem.id) {
        return {
          ...i,
          currentStock: Number(i.currentStock) + Number(restockQty),
          lastRestocked: new Date().toISOString().split('T')[0]
        };
      }
      return i;
    });
    
    setInventory(updatedInventory);
    saveActiveInventory(updatedInventory);
    toast.success(`Đã thêm ${restockQty} ${restockItem.unit} vào kho`);
    setIsRestockModalOpen(false);
    setRestockQty(0);
  };

  const handleSaveImportRecord = (e) => {
    e.preventDefault();
    if (importForm.items.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 nguyên liệu');
      return;
    }

    const totalCost = importForm.items.reduce((sum, item) => sum + (item.qty * item.cost), 0);
    const newRecord = {
      id: `imp_${Date.now()}`,
      date: importForm.date,
      supplier: importForm.supplier,
      notes: importForm.notes,
      items: importForm.items,
      totalCost
    };

    // Update inventory
    const updatedInventory = [...inventory];
    importForm.items.forEach(impItem => {
      const idx = updatedInventory.findIndex(i => i.id === impItem.itemId);
      if (idx !== -1) {
        updatedInventory[idx] = {
          ...updatedInventory[idx],
          currentStock: Number(updatedInventory[idx].currentStock) + Number(impItem.qty),
          costPerUnit: Number(impItem.cost), // update cost
          lastRestocked: importForm.date
        };
      }
    });

    const updatedRecords = [newRecord, ...importRecords];
    
    setImportRecords(updatedRecords);
    saveImportRecords(updatedRecords);
    setInventory(updatedInventory);
    saveActiveInventory(updatedInventory);
    
    toast.success('Đã lưu phiếu nhập kho');
    setIsImportModalOpen(false);
  };

  const handleDeleteImport = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa phiếu nhập này? (Số lượng kho sẽ không tự động trừ đi)')) {
      const updatedRecords = importRecords.filter(r => r.id !== id);
      setImportRecords(updatedRecords);
      saveImportRecords(updatedRecords);
      toast.success('Đã xóa phiếu nhập');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setItemForm({ ...item });
    setIsItemModalOpen(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setItemForm(defaultItemForm);
    setIsItemModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 text-[#1a5c2a] rounded-full flex items-center justify-center shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng nguyên liệu</p>
            <p className="text-xl font-black text-[#1a5c2a]">{totalItems}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 text-[#1a5c2a] rounded-full flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Giá trị tồn kho</p>
            <p className="text-xl font-black text-[#1a5c2a]">{formatPrice(totalValue)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Sắp hết hàng</p>
            <p className="text-xl font-black text-red-600">{lowStockCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-[#f5c518]/20 text-[#b58c00] rounded-full flex items-center justify-center shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng chi nhập hàng</p>
            <p className="text-xl font-black text-[#1a5c2a]">{formatPrice(totalImportCost)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-3 font-black text-lg transition-colors ${
            activeTab === 'inventory' 
              ? 'text-[#1a5c2a] border-b-2 border-[#1a5c2a]' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Kho Hàng
        </button>
        <button
          onClick={() => setActiveTab('imports')}
          className={`px-6 py-3 font-black text-lg transition-colors ${
            activeTab === 'imports' 
              ? 'text-[#1a5c2a] border-b-2 border-[#1a5c2a]' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Phiếu Nhập
        </button>
      </div>

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 gap-2 flex-wrap md:flex-nowrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm nguyên liệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5c2a] min-w-[150px]"
              >
                <option value="all">Tất cả danh mục</option>
                {INVENTORY_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5c2a] min-w-[150px]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="ok">Còn đủ</option>
                <option value="low">Sắp hết</option>
                <option value="out">Đã hết</option>
              </select>
            </div>
            <button
              onClick={openAddModal}
              className="bg-[#1a5c2a] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#154620] transition-colors flex items-center justify-center shrink-0 shadow-md shadow-green-900/20"
            >
              <Plus size={20} className="mr-2" />
              Thêm Nguyên Liệu
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold">
                    <th className="p-4 whitespace-nowrap">Tên Nguyên Liệu</th>
                    <th className="p-4 whitespace-nowrap">Danh Mục</th>
                    <th className="p-4 whitespace-nowrap">Tồn Kho</th>
                    <th className="p-4 whitespace-nowrap">Đơn Giá</th>
                    <th className="p-4 whitespace-nowrap">Cập Nhật Lần Cuối</th>
                    <th className="p-4 whitespace-nowrap text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map(item => {
                    const category = INVENTORY_CATEGORIES.find(c => c.id === item.categoryId);
                    const isLow = item.currentStock > 0 && item.currentStock <= item.minStock;
                    const isOut = item.currentStock <= 0;
                    
                    return (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.supplier}</p>
                        </td>
                        <td className="p-4">
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                            {category?.name || 'Khác'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-lg">
                                {item.currentStock} <span className="text-sm text-gray-500 font-normal">{item.unit}</span>
                              </span>
                              {isOut ? (
                                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">Hết</span>
                              ) : isLow ? (
                                <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded text-xs font-bold">Sắp hết</span>
                              ) : (
                                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-bold">Đủ</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">Min: {item.minStock}</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-[#1a5c2a]">
                          {formatPrice(item.costPerUnit)}/{item.unit}
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {item.lastRestocked}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setRestockItem(item); setIsRestockModalOpen(true); }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger relative group"
                              title="Nhập thêm"
                            >
                              <ArrowUpCircle size={20} />
                            </button>
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredInventory.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">
                        Không tìm thấy nguyên liệu nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* IMPORTS TAB */}
      {activeTab === 'imports' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setImportForm(defaultImportForm); setIsImportModalOpen(true); }}
              className="bg-[#1a5c2a] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#154620] transition-colors flex items-center justify-center shadow-md shadow-green-900/20"
            >
              <Plus size={20} className="mr-2" />
              Phiếu Nhập Mới
            </button>
          </div>

          <div className="space-y-3">
            {importRecords.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-100 shadow-sm">
                Chưa có phiếu nhập hàng nào.
              </div>
            ) : (
              importRecords.map(record => (
                <div key={record.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 text-[#1a5c2a] rounded-full flex items-center justify-center">
                        <Truck size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{record.date}</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">
                            {record.items.length} mặt hàng
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{record.supplier || 'Không có nhà cung cấp'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-[#1a5c2a] text-lg">{formatPrice(record.totalCost)}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteImport(record.id); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                      {expandedRecord === record.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                  
                  {expandedRecord === record.id && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-500 border-b border-gray-200">
                            <th className="text-left pb-2">Nguyên liệu</th>
                            <th className="text-center pb-2">Số lượng</th>
                            <th className="text-right pb-2">Đơn giá</th>
                            <th className="text-right pb-2">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {record.items.map((item, idx) => {
                            const invItem = inventory.find(i => i.id === item.itemId);
                            return (
                              <tr key={idx}>
                                <td className="py-2 font-medium">{invItem ? invItem.name : 'Nguyên liệu đã xóa'}</td>
                                <td className="py-2 text-center">{item.qty}</td>
                                <td className="py-2 text-right">{formatPrice(item.cost)}</td>
                                <td className="py-2 text-right font-bold text-gray-800">{formatPrice(item.qty * item.cost)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {record.notes && (
                        <p className="mt-4 text-sm text-gray-500"><span className="font-bold">Ghi chú:</span> {record.notes}</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ITEM MODAL */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-black text-gray-800">
                {editingItem ? 'Sửa Nguyên Liệu' : 'Thêm Nguyên Liệu Mới'}
              </h2>
              <button onClick={() => setIsItemModalOpen(false)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tên nguyên liệu *</label>
                  <input
                    required
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a5c2a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Danh mục</label>
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm({...itemForm, categoryId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a5c2a] focus:outline-none"
                  >
                    {INVENTORY_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Đơn vị tính (kg, lít, chai...)</label>
                  <input
                    required
                    type="text"
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({...itemForm, unit: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a5c2a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Số lượng tồn hiện tại</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={itemForm.currentStock}
                    onChange={(e) => setItemForm({...itemForm, currentStock: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a5c2a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mức tồn kho tối thiểu</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={itemForm.minStock}
                    onChange={(e) => setItemForm({...itemForm, minStock: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a5c2a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Đơn giá tham khảo (VNĐ)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={itemForm.costPerUnit}
                    onChange={(e) => setItemForm({...itemForm, costPerUnit: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a5c2a] focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nhà cung cấp</label>
                  <input
                    type="text"
                    value={itemForm.supplier}
                    onChange={(e) => setItemForm({...itemForm, supplier: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a5c2a] focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={itemForm.notes}
                    onChange={(e) => setItemForm({...itemForm, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a5c2a] focus:outline-none"
                    rows="2"
                  ></textarea>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-6 py-2 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl font-bold bg-[#1a5c2a] text-white hover:bg-[#154620] transition-colors"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK RESTOCK MODAL */}
      {isRestockModalOpen && restockItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6">
            <h2 className="text-xl font-black text-gray-800 mb-4">Nhập Nhanh</h2>
            <p className="text-gray-600 mb-4">
              Thêm số lượng cho <span className="font-bold text-gray-800">{restockItem.name}</span>
            </p>
            <form onSubmit={handleQuickRestock} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Số lượng thêm ({restockItem.unit})</label>
                <input
                  required
                  type="number"
                  min="0.1"
                  step="any"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a5c2a] focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-[#1a5c2a] text-white hover:bg-[#154620] transition-colors"
                >
                  Xác Nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-2xl font-black text-gray-800">Phiếu Nhập Hàng Mới</h2>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Ngày nhập</label>
                  <input
                    type="date"
                    required
                    value={importForm.date}
                    onChange={(e) => setImportForm({...importForm, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a5c2a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nhà cung cấp</label>
                  <input
                    type="text"
                    value={importForm.supplier}
                    onChange={(e) => setImportForm({...importForm, supplier: e.target.value})}
                    placeholder="VD: Chợ đầu mối..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a5c2a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Ghi chú</label>
                  <input
                    type="text"
                    value={importForm.notes}
                    onChange={(e) => setImportForm({...importForm, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a5c2a]"
                  />
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-hidden mb-4">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 font-bold text-gray-600">Nguyên liệu</th>
                      <th className="p-3 font-bold text-gray-600 w-32">Số lượng</th>
                      <th className="p-3 font-bold text-gray-600 w-40">Đơn giá (VNĐ)</th>
                      <th className="p-3 font-bold text-gray-600 text-right w-40">Thành tiền</th>
                      <th className="p-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {importForm.items.map((item, index) => {
                      const selectedInv = inventory.find(i => i.id === item.itemId);
                      return (
                        <tr key={index}>
                          <td className="p-3">
                            <select
                              value={item.itemId}
                              onChange={(e) => {
                                const newItems = [...importForm.items];
                                const inv = inventory.find(i => i.id === e.target.value);
                                newItems[index].itemId = e.target.value;
                                if (inv && newItems[index].cost === 0) newItems[index].cost = inv.costPerUnit;
                                setImportForm({...importForm, items: newItems});
                              }}
                              className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                              <option value="">Chọn nguyên liệu...</option>
                              {inventory.map(inv => (
                                <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.qty}
                              onChange={(e) => {
                                const newItems = [...importForm.items];
                                newItems[index].qty = e.target.value;
                                setImportForm({...importForm, items: newItems});
                              }}
                              className="w-full p-2 border border-gray-300 rounded-lg text-center"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="0"
                              value={item.cost}
                              onChange={(e) => {
                                const newItems = [...importForm.items];
                                newItems[index].cost = e.target.value;
                                setImportForm({...importForm, items: newItems});
                              }}
                              className="w-full p-2 border border-gray-300 rounded-lg text-right"
                            />
                          </td>
                          <td className="p-3 text-right font-bold text-gray-800">
                            {formatPrice((item.qty || 0) * (item.cost || 0))}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                const newItems = importForm.items.filter((_, i) => i !== index);
                                setImportForm({...importForm, items: newItems});
                              }}
                              className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                            >
                              <X size={20} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setImportForm({
                        ...importForm,
                        items: [...importForm.items, { itemId: '', qty: 1, cost: 0 }]
                      });
                    }}
                    className="flex items-center text-[#1a5c2a] font-bold hover:underline"
                  >
                    <Plus size={20} className="mr-1" /> Thêm dòng
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center shrink-0">
              <div className="text-xl">
                Tổng cộng: <span className="font-black text-[#1a5c2a]">
                  {formatPrice(importForm.items.reduce((s, i) => s + (i.qty * i.cost), 0))}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-6 py-2 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveImportRecord}
                  className="px-6 py-2 rounded-xl font-bold bg-[#1a5c2a] text-white hover:bg-[#154620] transition-colors"
                >
                  Lưu Phiếu Nhập
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
