import React, { useState, useEffect } from 'react';
import { useStockStore } from '../store/stockStore';
import { useThemeStore } from '../store/themeStore';
import { Plus, Search, Trash2, Edit, AlertCircle, CheckSquare, Square, Layers, X, ChevronDown, Loader2 } from 'lucide-react';
import { StockItem } from '../types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Pagination from '../components/Pagination';
import { motion, AnimatePresence } from 'framer-motion';

const Stock: React.FC = () => {
  const { items, addItem, deleteItem, updateItem, deleteItems, updateQuantities, fetchItems, isLoading } = useStockStore();
  const { t } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkQuantity, setBulkQuantity] = useState(0);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filtered items
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleBulkDelete = async () => {
    if (confirm(`${t('Are you sure you want to delete')} ${selectedIds.size} ${t('items')}?`)) {
      await deleteItems(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsActionMenuOpen(false);
    }
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

  return (
    <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('Inventory Management')}</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto justify-center shadow-sm hover:shadow-md"
        >
          <Plus size={20} className="mr-2" /> {t('Add Item')}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder={t('Search placeholder')}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
                                <button 
                                    onClick={() => { handleBulkDelete(); setIsActionMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center border-t border-slate-100 dark:border-slate-700"
                                >
                                    <Trash2 size={16} className="mr-2" /> {t('Delete Selected')}
                                </button>
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

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col relative min-h-[400px]">
        
        {isLoading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-30 backdrop-blur-sm">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">Loading inventory...</span>
                </div>
            </div>
        )}

        <div className="overflow-x-auto">
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
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Brand')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Price')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Stock Level')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Status')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              <AnimatePresence mode="wait">
                {paginatedItems.map((item, index) => (
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
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.brand}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">${item.price}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.quantity} units</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                        ${item.status === 'In Stock' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          item.status === 'Low Stock' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {t(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                          <button
                          onClick={() => handleEdit(item)}
                          className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Edit Item"
                          >
                          <Edit size={18} />
                          </button>
                          <button
                          onClick={() => deleteItem(item.id)}
                          className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete Item"
                          >
                          <Trash2 size={18} />
                          </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
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
    </motion.div>
  );
};

interface StockFormProps {
    onClose: () => void;
    onSubmit: (data: Partial<StockItem>) => void;
    initialData?: StockItem;
    isEditing?: boolean;
}

const StockForm: React.FC<StockFormProps> = ({ onClose, onSubmit, initialData, isEditing }) => {
  const { t } = useThemeStore();
  
  // Defined inside component to use 't'
  const stockSchema = z.object({
    name: z.string().min(2, t('Name required')),
    sku: z.string().min(3, t('SKU required')),
    brand: z.string().min(2, t('Brand required')),
    category: z.enum(['Phone', 'Accessory', 'Part']),
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
        category: 'Phone'
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
            <option value="Phone">Phone</option>
            <option value="Accessory">Accessory</option>
            <option value="Part">Part</option>
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