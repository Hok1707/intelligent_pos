

import React, { useState, useEffect } from 'react';
import { useStockStore } from '../store/stockStore';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { Plus, Search, Trash2, Edit, AlertCircle, CheckSquare, Square, Layers, X, ChevronDown, Loader2, Settings, Download, Check } from 'lucide-react';
import { StockItem } from '../types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Pagination from '../components/Pagination';
import { motion, AnimatePresence } from 'framer-motion';

const Stock: React.FC = () => {
  const { 
    items, 
    addItem, 
    deleteItem, 
    updateItem, 
    deleteItems, 
    updateQuantities, 
    fetchItems, 
    isLoading, 
    lowStockThreshold, 
    setLowStockThreshold,
    categories,
    addCategory,
    removeCategory,
    renameCategory
  } = useStockStore();
  const { user } = useAuthStore();
  const { t } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkQuantity, setBulkQuantity] = useState(0);
  const [newThreshold, setNewThreshold] = useState(lowStockThreshold);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  
  // Category Editing State
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');
  
  // Enhanced Dropdown State
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Sync threshold state when store changes
  useEffect(() => {
    setNewThreshold(lowStockThreshold);
  }, [lowStockThreshold]);

  // Ensure selected category exists (e.g. if deleted)
  useEffect(() => {
    if (selectedCategory !== 'All' && !categories.includes(selectedCategory)) {
        setSelectedCategory('All');
    }
  }, [categories, selectedCategory]);

  const closeDropdown = () => {
    setIsCategoryDropdownOpen(false);
    setCategorySearchTerm('');
  };

  // Filtered items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter Categories for Dropdown
  const categoryOptions = ['All', ...categories];
  const filteredCategoryOptions = categoryOptions.filter(cat => {
      const label = cat === 'All' ? t('All Categories') : cat;
      return label.toLowerCase().includes(categorySearchTerm.toLowerCase());
  });

  // Paginated items
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Selection Logic
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    const pageIds = paginatedItems.map(i => i.id);
    const allSelected = pageIds.every(id => selectedIds.has(id));
    
    const newSelected = new Set(selectedIds);
    if (allSelected) {
      pageIds.forEach(id => newSelected.delete(id));
    } else {
      pageIds.forEach(id => newSelected.add(id));
    }
    setSelectedIds(newSelected);
  };

  const isAllPageSelected = paginatedItems.length > 0 && paginatedItems.every(i => selectedIds.has(i.id));

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleFormSubmit = async (data: Partial<StockItem>) => {
    if (editingItem) {
      await updateItem(editingItem.id, data);
    } else {
      await addItem(data as Omit<StockItem, 'id' | 'status'>);
    }
    setShowModal(false);
  };

  const handleDelete = (item: StockItem) => {
    setItemToDelete(item);
    setShowDeleteConfirmation(true);
  };

  const handleBulkDelete = () => {
    setItemToDelete(null);
    setIsActionMenuOpen(false);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
        await deleteItem(itemToDelete.id);
        // Clean up selection if the deleted item was selected
        if (selectedIds.has(itemToDelete.id)) {
            const newSet = new Set(selectedIds);
            newSet.delete(itemToDelete.id);
            setSelectedIds(newSet);
        }
    } else {
        await deleteItems(Array.from(selectedIds));
        setSelectedIds(new Set());
    }
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
      setShowDeleteConfirmation(false);
      setItemToDelete(null);
  };

  const openBulkUpdateModal = () => {
    setBulkQuantity(0);
    setShowBulkUpdateModal(true);
  };

  const handleBulkUpdate = async () => {
    await updateQuantities(Array.from(selectedIds), bulkQuantity);
    setShowBulkUpdateModal(false);
    setSelectedIds(new Set());
  };

  const handleSaveSettings = () => {
    setLowStockThreshold(newThreshold);
    setShowSettingsModal(false);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryInput.trim()) {
      addCategory(newCategoryInput.trim());
      setNewCategoryInput('');
    }
  };

  const startEditingCategory = (cat: string) => {
    setEditingCategory(cat);
    setEditCategoryValue(cat);
  };

  const saveCategoryRename = () => {
    if (editingCategory && editCategoryValue.trim()) {
        renameCategory(editingCategory, editCategoryValue.trim());
        setEditingCategory(null);
    }
  };

  // Helper to determine status based on configured threshold
  const getItemStatus = (quantity: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < lowStockThreshold) return 'Low Stock';
    return 'In Stock';
  };

  const handleExportCSV = () => {
    const headers = [t('Item Name'), 'SKU', t('Category'), t('Brand'), t('Price'), t('Quantity'), t('Status')];
    
    const rows = filteredItems.map(item => {
      const status = getItemStatus(item.quantity);
      return [
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.sku.replace(/"/g, '""')}"`,
        `"${item.category.replace(/"/g, '""')}"`,
        `"${item.brand.replace(/"/g, '""')}"`,
        item.price,
        item.quantity,
        `"${status}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `stock_export_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('Inventory Management')}</h1>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            title={t('Inventory Settings')}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Download size={20} className="mr-2" /> {t('Export CSV')}
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            <Plus size={20} className="mr-2" /> {t('Add Item')}
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder={t('Search placeholder')}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-64 relative">
             {/* Backdrop for click-outside */}
             {isCategoryDropdownOpen && (
                <div className="fixed inset-0 z-30" onClick={closeDropdown}></div>
             )}
             
            <button
                onClick={() => {
                    if (isCategoryDropdownOpen) closeDropdown();
                    else setIsCategoryDropdownOpen(true);
                }}
                className="w-full h-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-between relative z-30 transition-colors"
            >
                <span className="truncate mr-2 text-left block flex-1">
                    {selectedCategory === 'All' ? t('All Categories') : selectedCategory}
                </span>
                <ChevronDown size={16} className={`text-slate-500 transition-transform shrink-0 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isCategoryDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-40 overflow-hidden flex flex-col max-h-80"
                    >
                        <div className="p-2 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder={t('Search...')}
                                    value={categorySearchTerm}
                                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:border-primary placeholder:text-slate-400 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {categorySearchTerm && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCategorySearchTerm('');
                                        }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
                            {filteredCategoryOptions.length > 0 ? (
                                filteredCategoryOptions.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            closeDropdown();
                                        }}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors ${
                                            selectedCategory === cat
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <span className="truncate">{cat === 'All' ? t('All Categories') : cat}</span>
                                        {selectedCategory === cat && <Check size={14} className="shrink-0 ml-2" />}
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                                    {t('No items found')}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3 flex items-center justify-between overflow-visible relative z-20"
          >
             <div className="flex items-center space-x-2 px-2">
                <Layers className="text-primary dark:text-blue-400" size={20} />
                <span className="font-medium text-blue-900 dark:text-blue-300">
                    {selectedIds.size} {t('items selected')}
                </span>
             </div>
             <div className="flex items-center space-x-2 relative">
                <div className="relative">
                    <button 
                        onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                        className="px-3 py-1.5 text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center"
                    >
                        {t('Bulk Actions')} <ChevronDown size={16} className={`ml-1.5 transition-transform ${isActionMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isActionMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
                            >
                                <button 
                                    onClick={() => { openBulkUpdateModal(); setIsActionMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center"
                                >
                                    <Edit size={16} className="mr-2 text-slate-400" /> {t('Update Stock')}
                                </button>
                                {/* Staff cannot delete */}
                                {user?.role !== 'staff' && (
                                    <button 
                                        onClick={handleBulkDelete}
                                        className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center border-t border-slate-100 dark:border-slate-700"
                                    >
                                        <Trash2 size={16} className="mr-2" /> {t('Delete Selected')}
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button 
                    onClick={() => setSelectedIds(new Set())}
                    className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <X size={16} />
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory List Container (Responsive) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col relative min-h-[400px]">
        
        {isLoading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-30 backdrop-blur-sm">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">Loading inventory...</span>
                </div>
            </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 w-12 text-center">
                    <button onClick={handleSelectAll} className="text-slate-500 hover:text-primary transition-colors">
                        {isAllPageSelected ? <CheckSquare size={20} className="text-primary" /> : <Square size={20} />}
                    </button>
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Item Name')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">SKU</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Category')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Price')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Stock Level')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Status')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              <AnimatePresence mode="wait">
                {paginatedItems.map((item, index) => {
                  // Calculate status dynamically based on quantity and configured threshold
                  const status = getItemStatus(item.quantity);
                  
                  return (
                  <motion.tr 
                    key={item.id} 
                    className={`transition-colors ${selectedIds.has(item.id) ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <td className="px-4 py-4 text-center">
                        <button onClick={() => toggleSelection(item.id)} className="text-slate-400 hover:text-primary transition-colors">
                            {selectedIds.has(item.id) ? <CheckSquare size={20} className="text-primary" /> : <Square size={20} />}
                        </button>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.name}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.sku}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-xs">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">${item.price}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.quantity} units</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                        ${status === 'In Stock' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          status === 'Low Stock' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {t(status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                          <button
                          onClick={() => handleEdit(item)}
                          className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                          title={t('Edit Item')}
                          >
                          <Edit size={18} />
                          </button>
                          {/* Staff cannot delete */}
                          {user?.role !== 'staff' && (
                            <button
                            onClick={() => handleDelete(item)}
                            className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                            title={t('Delete Item')}
                            >
                            <Trash2 size={18} />
                            </button>
                          )}
                      </div>
                    </td>
                  </motion.tr>
                )})}
              </AnimatePresence>
              {!isLoading && filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    {t('No items found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
             {/* Mobile Header with Select All */}
             {paginatedItems.length > 0 && (
                 <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                    <button onClick={handleSelectAll} className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                        {isAllPageSelected ? <CheckSquare size={18} className="text-primary mr-2" /> : <Square size={18} className="text-slate-400 mr-2" />}
                        {t('Select All')}
                    </button>
                    <span className="text-xs text-slate-500">{paginatedItems.length} items on page</span>
                 </div>
             )}

             <div className="p-4 space-y-4">
                <AnimatePresence mode="popLayout">
                    {paginatedItems.map((item) => {
                         const status = getItemStatus(item.quantity);
                         return (
                            <motion.div 
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`bg-white dark:bg-slate-800 rounded-xl border ${selectedIds.has(item.id) ? 'border-primary ring-1 ring-primary/20' : 'border-slate-200 dark:border-slate-700'} shadow-sm overflow-hidden`}
                            >
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-start gap-3">
                                            <button onClick={() => toggleSelection(item.id)} className="mt-1 text-slate-400 hover:text-primary">
                                                {selectedIds.has(item.id) ? <CheckSquare size={20} className="text-primary" /> : <Square size={20} />}
                                            </button>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white">{item.name}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">SKU: {item.sku}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                                            ${status === 'In Stock' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            status === 'Low Stock' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {t(status)}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-4 pl-8">
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{t('Category')}</p>
                                            <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs text-slate-700 dark:text-slate-300">{item.category}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{t('Brand')}</p>
                                            <span className="text-slate-900 dark:text-white font-medium">{item.brand}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{t('Price')}</p>
                                            <span className="text-slate-900 dark:text-white font-bold">${item.price}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{t('Stock Level')}</p>
                                            <span className="text-slate-900 dark:text-white font-medium">{item.quantity} units</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700 pt-3 pl-8">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                        >
                                            <Edit size={14} className="mr-1.5" /> {t('Edit')}
                                        </button>
                                        {user?.role !== 'staff' && (
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="flex items-center px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} className="mr-1.5" /> {t('Delete')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                         );
                    })}
                </AnimatePresence>
                
                {!isLoading && filteredItems.length === 0 && (
                   <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <Search size={32} className="mb-2 opacity-50" />
                        <p>{t('No items found')}</p>
                      </div>
                   </div>
                )}
             </div>
        </div>
        
        {/* Pagination */}
        <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredItems.length}
            itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>

      {/* Add/Edit Item Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          >
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <h2 className="text-xl font-bold mb-4 dark:text-white">{editingItem ? t('Edit Item') : t('Add Item')}</h2>
              <StockForm 
                  onClose={() => setShowModal(false)} 
                  onSubmit={handleFormSubmit} 
                  initialData={editingItem || undefined}
                  isEditing={!!editingItem}
                  categories={categories}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Update Modal */}
      <AnimatePresence>
        {showBulkUpdateModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          >
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <h2 className="text-xl font-bold mb-4 dark:text-white">{t('Set New Quantity')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {t('Update stock quantity for')} {selectedIds.size} {t('selected items')}.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('Quantity')}</label>
                <input 
                    autoFocus
                    type="number" 
                    min="0"
                    value={bulkQuantity}
                    onChange={(e) => setBulkQuantity(parseInt(e.target.value) || 0)}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                    onClick={() => setShowBulkUpdateModal(false)} 
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    {t('Cancel')}
                </button>
                <button 
                    onClick={handleBulkUpdate} 
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    {t('Apply')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal (Unified for Single and Bulk) */}
      <AnimatePresence>
        {showDeleteConfirmation && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          >
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                  <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <h2 className="text-xl font-bold mb-2 text-center dark:text-white">
                {itemToDelete ? t('Delete Item') : t('Delete Selected')}
              </h2>
              <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
                {itemToDelete ? (
                    <>
                        {t('Are you sure you want to delete')} <span className="font-bold text-slate-900 dark:text-white">{itemToDelete.name}</span>?
                    </>
                ) : (
                    <>
                        {t('Are you sure you want to delete')} <span className="font-bold text-slate-900 dark:text-white">{selectedIds.size}</span> {t('items')}?
                    </>
                )}
                <br/>
                <span className="text-xs text-red-500 mt-2 block">{t('This action cannot be undone.')}</span>
              </p>
              
              <div className="flex justify-end space-x-3">
                <button 
                    onClick={cancelDelete} 
                    className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    {t('Cancel')}
                </button>
                <button 
                    onClick={confirmDelete} 
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                    {t('Delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          >
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-700 max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center space-x-2 mb-4 text-slate-900 dark:text-white">
                 <Settings size={24} className="text-primary" />
                 <h2 className="text-xl font-bold">{t('Inventory Settings')}</h2>
              </div>
              
              <div className="space-y-6">
                {/* Low Stock Section */}
                <div>
                    <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3">Low Stock Alerts</h3>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Low Stock Threshold</label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Items with quantity below this value will be marked as "Low Stock".</p>
                        <input 
                            type="number" 
                            min="1"
                            value={newThreshold}
                            onChange={(e) => setNewThreshold(parseInt(e.target.value) || 0)}
                            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        />
                    </div>
                </div>

                <hr className="border-slate-200 dark:border-slate-700" />

                {/* Categories Section */}
                <div>
                    <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3">{t('Manage Categories')}</h3>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                            <input 
                                type="text"
                                value={newCategoryInput}
                                onChange={(e) => setNewCategoryInput(e.target.value)}
                                placeholder={t('Add New Category')}
                                className="flex-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
                            />
                            <button 
                                type="submit"
                                disabled={!newCategoryInput.trim()}
                                className="bg-primary text-white px-3 py-2 rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                        </form>

                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {categories.map(cat => (
                                <div key={cat} className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-full text-sm shadow-sm group">
                                    {editingCategory === cat ? (
                                        <div className="flex items-center">
                                            <input 
                                                className="w-24 px-2 py-0.5 text-sm border border-slate-300 dark:border-slate-500 rounded bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                value={editCategoryValue}
                                                onChange={(e) => setEditCategoryValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if(e.key === 'Enter') saveCategoryRename();
                                                    if(e.key === 'Escape') setEditingCategory(null);
                                                }}
                                                autoFocus
                                            />
                                            <button onClick={saveCategoryRename} className="ml-2 text-green-600 hover:text-green-700 p-0.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/30"><Check size={14} /></button>
                                            <button onClick={() => setEditingCategory(null)} className="ml-1 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-slate-700 dark:text-slate-300 mr-2 font-medium">{cat}</span>
                                            <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity border-l border-slate-200 dark:border-slate-600 pl-2">
                                                <button 
                                                    onClick={() => startEditingCategory(cat)}
                                                    className="text-slate-500 hover:text-primary transition-colors p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    title={t('Rename Category')}
                                                >
                                                    <Edit size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => removeCategory(cat)}
                                                    className="text-slate-500 hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title={t('Remove Category')}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button 
                    onClick={() => setShowSettingsModal(false)} 
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    {t('Cancel')}
                </button>
                <button 
                    onClick={handleSaveSettings} 
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    {t('Apply')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface StockFormProps {
    onClose: () => void;
    onSubmit: (data: Partial<StockItem>) => void;
    initialData?: StockItem;
    isEditing?: boolean;
    categories: string[];
}

const StockForm: React.FC<StockFormProps> = ({ onClose, onSubmit, initialData, isEditing, categories }) => {
  const { t } = useThemeStore();
  
  // Defined inside component to use 't'
  const stockSchema = z.object({
    name: z.string().min(2, t('Name required')),
    sku: z.string().min(3, t('SKU required')),
    brand: z.string().min(2, t('Brand required')),
    category: z.string().min(1, 'Category required'),
    price: z.coerce.number().min(0.01, t('Price required')),
    quantity: z.coerce.number().int().min(0, t('Quantity required')),
  });

  type FormValues = z.infer<typeof stockSchema>;
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(stockSchema) as any,
    defaultValues: initialData ? {
        name: initialData.name,
        sku: initialData.sku,
        brand: initialData.brand,
        price: initialData.price,
        quantity: initialData.quantity,
        category: initialData.category
    } : {
        name: '',
        sku: '',
        brand: '',
        price: 0,
        quantity: 0,
        category: categories[0] || ''
    }
  });

  const onValidSubmit = (data: FormValues) => {
    // Pass data to parent (Partial<StockItem>)
    onSubmit(data as Partial<StockItem>);
  };

  const inputBaseClass = "w-full border bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none transition-colors";
  const getInputClass = (hasError: boolean) => 
    `${inputBaseClass} ${hasError ? 'border-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-primary'}`;

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Product Name')}</label>
        <input 
            {...register('name')}
            className={getInputClass(!!errors.name)}
            placeholder="e.g. iPhone 15 Pro"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle size={12} className="mr-1"/> {errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
            <input 
                {...register('sku')}
                className={getInputClass(!!errors.sku)}
                placeholder="e.g. APL-15P"
            />
            {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Brand')}</label>
            <input 
                {...register('brand')}
                className={getInputClass(!!errors.brand)}
                placeholder="e.g. Apple"
            />
            {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Category')}</label>
        <select 
            {...register('category')}
            className={getInputClass(!!errors.category)}
        >
            {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
            ))}
        </select>
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Price')} ($)</label>
            <input 
                type="number" 
                step="0.01"
                {...register('price')}
                className={getInputClass(!!errors.price)}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Quantity')}</label>
            <input 
                type="number" 
                {...register('quantity')}
                className={getInputClass(!!errors.quantity)}
            />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">{t('Cancel')}</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            {isEditing ? t('Update Item') : t('Add Item')}
        </button>
      </div>
    </form>
  )
}

export default Stock;
