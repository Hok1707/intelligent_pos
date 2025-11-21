
import React, { useState, useEffect, useRef } from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Plus, Search, FileText, Download, Trash2, CheckCircle, MoreVertical, Calendar, DollarSign, Loader2, X, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Pagination from '../components/Pagination';

const Invoices: React.FC = () => {
  const { invoices, fetchInvoices, createInvoice, deleteInvoice, markAsPaid, isLoading } = useInvoiceStore();
  const { t } = useThemeStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    // Reset to first page on search
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    // Close export menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setShowExportMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((acc, curr) => acc + curr.total, 0);
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.total, 0);

  const handleExportExcel = () => {
    const headers = [t('Invoice #'), t('Customer'), t('Date'), t('Due Date'), t('Amount'), t('Status')];
    const rows = filteredInvoices.map(inv => [
        `"${inv.number}"`,
        `"${inv.customerName.replace(/"/g, '""')}"`,
        inv.date,
        inv.dueDate,
        inv.total.toFixed(2),
        `"${t(inv.status)}"`
    ].join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `invoices_export_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
     // Mock PDF export
     useNotificationStore.getState().addNotification({
        type: 'success',
        title: t('Export Successful'),
        message: t('Invoices PDF has been downloaded.')
    });
    setShowExportMenu(false);
  };

  return (
    <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('Billing & Invoices')}</h1>
        <div className="flex items-center space-x-3">
            <div className="relative" ref={exportMenuRef}>
                <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                    <Download size={20} className="mr-2" /> {t('Export')} <ChevronDown size={16} className="ml-2" />
                </button>
                <AnimatePresence>
                    {showExportMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 overflow-hidden"
                        >
                            <button 
                                onClick={handleExportExcel}
                                className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center"
                            >
                                <FileSpreadsheet size={16} className="mr-2 text-green-600" /> {t('Export Excel')}
                            </button>
                            <button 
                                onClick={handleExportPDF}
                                className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center border-t border-slate-100 dark:border-slate-700"
                            >
                                <FileText size={16} className="mr-2 text-red-600" /> {t('Export PDF')}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
            <Plus size={20} className="mr-2" /> {t('Create Invoice')}
            </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('Total Receivables')}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${pendingAmount.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <DollarSign className="text-orange-600 dark:text-orange-400 w-5 h-5" />
                </div>
            </div>
            <div className="text-xs text-slate-500">{invoices.filter(i => i.status === 'pending').length} pending invoices</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('Total Paid')}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${paidAmount.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="text-green-600 dark:text-green-400 w-5 h-5" />
                </div>
            </div>
            <div className="text-xs text-slate-500">{invoices.filter(i => i.status === 'paid').length} paid invoices</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('Total Invoices')}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{invoices.length}</h3>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                </div>
            </div>
             <div className="text-xs text-slate-500">All time record</div>
        </div>
      </div>

      {/* Filter & List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-[400px]">
         <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('Invoice List')}</h2>
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder={t('Search invoices...')}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Invoice #')}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Customer')}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Date')}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Due Date')}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Amount')}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Status')}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">{t('Actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                           <tr>
                               <td colSpan={7} className="py-12 text-center">
                                   <div className="flex justify-center items-center text-slate-500">
                                       <Loader2 className="animate-spin mr-2" /> {t('Loading...')}
                                   </div>
                               </td>
                           </tr>
                        ) : filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-slate-500">
                                    {t('No invoices found')}
                                </td>
                            </tr>
                        ) : (
                           paginatedInvoices.map((invoice) => (
                               <motion.tr 
                                   key={invoice.id}
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   exit={{ opacity: 0 }}
                                   className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                               >
                                   <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{invoice.number}</td>
                                   <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{invoice.customerName}</td>
                                   <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{invoice.date}</td>
                                   <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{invoice.dueDate}</td>
                                   <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">${invoice.total.toLocaleString()}</td>
                                   <td className="px-6 py-4">
                                       <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                           ${invoice.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                             invoice.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                             'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                           {t(invoice.status)}
                                       </span>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                       <div className="flex items-center justify-end space-x-2">
                                           {invoice.status !== 'paid' && (
                                               <button 
                                                   onClick={() => markAsPaid(invoice.id)}
                                                   className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                                   title={t('Mark as Paid')}
                                               >
                                                   <CheckCircle size={18} />
                                               </button>
                                           )}
                                           <button 
                                               onClick={handleExportPDF}
                                               className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                               title={t('Download PDF')}
                                           >
                                               <Download size={18} />
                                           </button>
                                           {user?.role !== 'staff' && (
                                               <button 
                                                   onClick={() => deleteInvoice(invoice.id)}
                                                   className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                   title={t('Delete')}
                                               >
                                                   <Trash2 size={18} />
                                               </button>
                                           )}
                                       </div>
                                   </td>
                               </motion.tr>
                           ))
                        )}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>

        {/* Pagination */}
        <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredInvoices.length}
            itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
            <CreateInvoiceModal onClose={() => setShowCreateModal(false)} onCreate={createInvoice} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CreateInvoiceModal: React.FC<{ onClose: () => void, onCreate: (data: any) => Promise<void> }> = ({ onClose, onCreate }) => {
    const { t } = useThemeStore();
    
    const itemSchema = z.object({
        description: z.string().min(1, t('Description required')),
        quantity: z.number().min(1),
        price: z.number().min(0)
    });
    
    const invoiceSchema = z.object({
        customerName: z.string().min(1, t('Customer Name required')),
        date: z.string(),
        dueDate: z.string(),
        items: z.array(itemSchema).min(1, t('At least one item required'))
    });

    type InvoiceForm = z.infer<typeof invoiceSchema>;

    const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<InvoiceForm>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items: [{ description: '', quantity: 1, price: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const watchedItems = watch("items");
    const subtotal = watchedItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const tax = subtotal * 0.1; // 10% Tax default
    const total = subtotal + tax;

    const onSubmit = async (data: InvoiceForm) => {
        await onCreate({
            ...data,
            number: `INV-${Math.floor(Math.random() * 10000)}`,
            subtotal,
            tax,
            total,
            status: 'pending'
        });
        onClose();
    };

    return (
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
                className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('New Invoice')}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <form id="invoice-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Customer Name')}</label>
                                <input 
                                    {...register('customerName')}
                                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2.5 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                    placeholder="Enter customer name"
                                />
                                {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Date')}</label>
                                    <input 
                                        type="date"
                                        {...register('date')}
                                        className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2.5 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Due Date')}</label>
                                    <input 
                                        type="date"
                                        {...register('dueDate')}
                                        className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2.5 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{t('Items')}</h3>
                                <button 
                                    type="button" 
                                    onClick={() => append({ description: '', quantity: 1, price: 0 })}
                                    className="text-sm text-primary hover:underline font-medium flex items-center"
                                >
                                    <Plus size={16} className="mr-1" /> {t('Add Item')}
                                </button>
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                <div className="grid grid-cols-12 gap-4 mb-2 text-sm font-medium text-slate-500 dark:text-slate-400 px-2">
                                    <div className="col-span-6">{t('Description')}</div>
                                    <div className="col-span-2 text-center">{t('Qty')}</div>
                                    <div className="col-span-3 text-right">{t('Price')}</div>
                                    <div className="col-span-1"></div>
                                </div>
                                
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-4 mb-3 items-start">
                                        <div className="col-span-6">
                                            <input 
                                                {...register(`items.${index}.description`)}
                                                placeholder="Item description"
                                                className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-primary/50 text-sm"
                                            />
                                            {errors.items?.[index]?.description && <p className="text-red-500 text-[10px] mt-0.5">{errors.items[index]?.description?.message}</p>}
                                        </div>
                                        <div className="col-span-2">
                                            <input 
                                                type="number"
                                                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-primary/50 text-center text-sm"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                                                <input 
                                                    type="number"
                                                    step="0.01"
                                                    {...register(`items.${index}.price`, { valueAsNumber: true })}
                                                    className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2 pl-5 rounded-lg focus:ring-2 focus:ring-primary/50 text-right text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-1 flex justify-center pt-2">
                                            <button 
                                                type="button" 
                                                onClick={() => remove(index)}
                                                disabled={fields.length === 1}
                                                className="text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>{t('Subtotal')}</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>{t('Tax (10%)')}</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2">
                                    <span>{t('Total')}</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                    >
                        {t('Cancel')}
                    </button>
                    <button 
                        type="submit"
                        form="invoice-form"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-bold flex items-center"
                    >
                        {isSubmitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                        {t('Create Invoice')}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Invoices;
