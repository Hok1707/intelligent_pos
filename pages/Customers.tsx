
import React, { useState, useEffect } from 'react';
import { useCustomerStore } from '../store/customerStore';
import { useInvoiceStore } from '../store/invoiceStore';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { Plus, Search, Trash2, Edit, Loader2, Mail, Phone, MapPin, User, DollarSign, Calendar, Eye, FileText, ShoppingBag, Save, X } from 'lucide-react';
import { Customer, Invoice } from '../types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';

const Customers: React.FC = () => {
  const { customers, fetchCustomers, addCustomer, updateCustomer, deleteCustomer, isLoading } = useCustomerStore();
  const { t } = useThemeStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const term = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      customer.phone.includes(term)
    );
  });

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleFormSubmit = async (data: Partial<Customer>) => {
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, data);
    } else {
      await addCustomer(data as any);
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('Are you sure you want to delete'))) {
      await deleteCustomer(id);
    }
  };

  return (
    <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('Customer Management')}</h1>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus size={20} className="mr-2" /> {t('Add Customer')}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder={t('Search customers...')}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
            {isLoading && (
                <div className="col-span-full flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            )}
            {!isLoading && filteredCustomers.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
                    {t('No customers found')}
                </div>
            )}
            {filteredCustomers.map((customer) => (
                <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow"
                >
                    {/* Status Stripe */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        customer.status === 'active' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}></div>

                    <div className="flex items-start justify-between mb-4 pl-3">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300">
                                    <User size={24} />
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${
                                    customer.status === 'active' ? 'bg-green-500' : 'bg-slate-400'
                                }`}></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{customer.name}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize border
                                        ${customer.status === 'active' 
                                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' 
                                            : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                                        }`}>
                                        {t(customer.status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => handleViewDetails(customer)}
                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title={t('View Details')}
                            >
                                <Eye size={16} />
                            </button>
                            <button 
                                onClick={() => handleEdit(customer)}
                                className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title={t('Edit Customer')}
                            >
                                <Edit size={16} />
                            </button>
                            {user?.role !== 'staff' && (
                                <button 
                                    onClick={() => handleDelete(customer.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title={t('Delete')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-2.5 mt-2 pl-3 flex-1">
                        <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                            <Mail size={15} className="mr-3 shrink-0 text-slate-400" />
                            <span className="truncate">{customer.email}</span>
                        </div>
                        <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                            <Phone size={15} className="mr-3 shrink-0 text-slate-400" />
                            <span className="truncate">{customer.phone}</span>
                        </div>
                        {customer.address && (
                             <div className="flex items-start text-slate-600 dark:text-slate-400 text-sm">
                                <MapPin size={15} className="mr-3 shrink-0 text-slate-400 mt-0.5" />
                                <span className="truncate">{customer.address}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4 pl-3">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">{t('Total Spent')}</p>
                            <div className="flex items-center font-bold text-slate-900 dark:text-white">
                                <DollarSign size={14} className="mr-1 text-green-500" />
                                {customer.totalSpent.toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">{t('Join Date')}</p>
                             <div className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                                <Calendar size={14} className="mr-1.5 text-slate-400" />
                                {customer.joinDate}
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => handleViewDetails(customer)}
                        className="mt-4 w-full py-2 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        {t('View Details')}
                    </button>
                </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Add/Edit Customer Modal */}
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
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-xl font-bold mb-4 dark:text-white">{editingCustomer ? t('Edit Customer') : t('Add Customer')}</h2>
              <CustomerForm 
                  onClose={() => setShowModal(false)} 
                  onSubmit={handleFormSubmit} 
                  initialData={editingCustomer || undefined}
                  isEditing={!!editingCustomer}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

       {/* CRM Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedCustomer && (
            <CustomerDetailModal 
                customer={selectedCustomer} 
                onClose={() => setShowDetailModal(false)} 
                onEdit={() => {
                    setShowDetailModal(false);
                    handleEdit(selectedCustomer);
                }}
            />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CustomerDetailModal: React.FC<{ customer: Customer; onClose: () => void; onEdit: () => void }> = ({ customer, onClose, onEdit }) => {
    const { t } = useThemeStore();
    const { updateCustomer } = useCustomerStore();
    const { invoices, fetchInvoices } = useInvoiceStore();
    const [notes, setNotes] = useState(customer.notes || '');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    useEffect(() => {
        // Ensure we have invoices for history
        fetchInvoices();
    }, []);

    // Simple logic to link invoices to customers by name. 
    // In a real app, this should use customerId.
    const customerInvoices = invoices.filter(inv => 
        inv.customerName.toLowerCase() === customer.name.toLowerCase()
    );

    const lastPurchaseDate = customerInvoices.length > 0 
        ? customerInvoices.reduce((a, b) => (a.date > b.date ? a : b)).date 
        : 'N/A';

    const handleSaveNotes = async () => {
        setIsSavingNotes(true);
        await updateCustomer(customer.id, { notes });
        setIsSavingNotes(false);
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
                className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-primary shadow-sm border border-slate-200 dark:border-slate-600">
                             <User size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{customer.name}</h2>
                            <div className="flex items-center space-x-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                <span className="flex items-center"><Mail size={14} className="mr-1.5" /> {customer.email}</span>
                                <span className="hidden md:inline text-slate-300">|</span>
                                <span className="flex items-center"><Phone size={14} className="mr-1.5" /> {customer.phone}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={onEdit}
                            className="p-2 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors shadow-sm border border-slate-200 dark:border-slate-600"
                            title={t('Edit Customer')}
                        >
                            <Edit size={18} />
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col: Stats & Notes */}
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                             <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                                <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">{t('Total Spent')}</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">${customer.totalSpent.toLocaleString()}</p>
                             </div>
                             <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">{t('Last Purchase')}</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1 truncate">{lastPurchaseDate}</p>
                             </div>
                        </div>

                        {/* CRM Notes */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center space-x-2 mb-3">
                                <FileText className="text-primary" size={18} />
                                <h3 className="font-bold text-slate-900 dark:text-white">{t('Customer Notes')}</h3>
                            </div>
                            <textarea 
                                className="w-full h-40 p-3 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white resize-none"
                                placeholder={t('Notes placeholder')}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            ></textarea>
                            <div className="mt-3 flex justify-end">
                                <button 
                                    onClick={handleSaveNotes}
                                    disabled={isSavingNotes}
                                    className="flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                                >
                                    {isSavingNotes ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                    {t('Save Changes')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Purchase History */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center space-x-2">
                             <ShoppingBag className="text-primary" size={18} />
                             <h3 className="font-bold text-slate-900 dark:text-white">{t('Purchase History')}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">{t('Date')}</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">{t('Invoice #')}</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">{t('Items')}</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-right">{t('Amount')}</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">{t('Status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {customerInvoices.length > 0 ? (
                                        customerInvoices.map(inv => (
                                            <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{inv.date}</td>
                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{inv.number}</td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-xs">
                                                    {inv.items.map(i => i.description).join(', ')}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">${inv.total.toLocaleString()}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize
                                                        ${inv.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                          inv.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                        {t(inv.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                                {t('No purchase history')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

interface CustomerFormProps {
    onClose: () => void;
    onSubmit: (data: Partial<Customer>) => void;
    initialData?: Customer;
    isEditing?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onClose, onSubmit, initialData, isEditing }) => {
  const { t } = useThemeStore();
  
  const customerSchema = z.object({
    name: z.string().min(2, t('Name required')),
    email: z.string().email(t('Invalid email')),
    phone: z.string().min(5, 'Phone is required'),
    address: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional()
  });

  type FormValues = z.infer<typeof customerSchema>;
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: initialData ? {
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        address: initialData.address || '',
        status: initialData.status || 'active'
    } : {
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'active'
    }
  });

  const onValidSubmit = (data: FormValues) => {
    onSubmit(data as Partial<Customer>);
  };

  const inputBaseClass = "w-full border bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none transition-colors";
  const getInputClass = (hasError: boolean) => 
    `${inputBaseClass} ${hasError ? 'border-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-primary'}`;

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
      <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Name')}</label>
            <input 
                {...register('name')}
                className={getInputClass(!!errors.name)}
                placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Email')}</label>
            <input 
                type="email"
                {...register('email')}
                className={getInputClass(!!errors.email)}
                placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        
        <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Phone')}</label>
            <input 
                type="tel"
                {...register('phone')}
                className={getInputClass(!!errors.phone)}
                placeholder="+1 (555) 123-4567"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Address')}</label>
            <input 
                {...register('address')}
                className={getInputClass(!!errors.address)}
                placeholder="123 Main St, City"
            />
        </div>

        <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Status')}</label>
            <select 
                {...register('status')}
                className={getInputClass(!!errors.status)}
            >
                <option value="active">{t('Active')}</option>
                <option value="inactive">{t('Inactive')}</option>
            </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">{t('Cancel')}</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            {isEditing ? t('Edit Customer') : t('Add Customer')}
        </button>
      </div>
    </form>
  )
}

export default Customers;
