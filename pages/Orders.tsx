
import React, { useState, useEffect, useMemo } from 'react';
import { useOrderStore } from '../store/orderStore';
import { useThemeStore } from '../store/themeStore';
import { Search, Calendar, Loader2, CheckCircle, Clock, XCircle, Eye, Trash2, User, CreditCard, X, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../components/Pagination';
import { Order } from '../types';

const Orders: React.FC = () => {
    const { orders, fetchOrders, updateOrderStatus, deleteOrder, isLoading } = useOrderStore();
    const { t } = useThemeStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    
    // Filter & Sort State
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Order; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const handleSort = (key: keyof Order) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Derived Data: Filter -> Sort -> Paginate
    const processedOrders = useMemo(() => {
        // 1. Filter
        let data = orders.filter(order => {
            const matchesSearch = 
                order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        // 2. Sort
        data.sort((a, b) => {
            const { key, direction } = sortConfig;
            let aValue: any = a[key];
            let bValue: any = b[key];

            // Handle specific types
            if (key === 'total') {
                aValue = Number(aValue);
                bValue = Number(bValue);
            } else if (key === 'createdAt') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            } else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        return data;
    }, [orders, searchTerm, statusFilter, sortConfig]);

    const totalPages = Math.ceil(processedOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = processedOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleDelete = async (id: string) => {
        if (window.confirm(t('Are you sure you want to delete'))) {
            await deleteOrder(id);
        }
    };

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
    };

    // Helper component for Table Headers
    const SortableHeader = ({ label, sortKey, align = 'left' }: { label: string, sortKey: keyof Order, align?: 'left' | 'right' | 'center' }) => {
        const isActive = sortConfig.key === sortKey;
        return (
            <th 
                className={`px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors select-none text-${align}`}
                onClick={() => handleSort(sortKey)}
            >
                <div className={`flex items-center ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    {label}
                    <span className="ml-1.5">
                        {isActive ? (
                            sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />
                        ) : (
                            <ArrowUpDown size={14} className="text-slate-400 opacity-50" />
                        )}
                    </span>
                </div>
            </th>
        );
    };

    return (
        <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('Orders & Transactions')}</h1>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    {/* Status Filter */}
                    <div className="bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 flex">
                        {(['all', 'paid', 'pending', 'cancelled'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                                    statusFilter === status
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                {t(status)}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search order # or customer..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <SortableHeader label="Order #" sortKey="orderNumber" />
                                <SortableHeader label="Date" sortKey="createdAt" />
                                <SortableHeader label="Customer" sortKey="customerName" />
                                <SortableHeader label="Total" sortKey="total" />
                                <SortableHeader label="Payment" sortKey="paymentMethod" />
                                <SortableHeader label="Status" sortKey="status" />
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                             <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center">
                                            <div className="flex justify-center items-center text-slate-500">
                                                <Loader2 className="animate-spin mr-2" /> Loading orders...
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <Filter size={32} className="mb-2 opacity-20" />
                                                <p>No orders found matching your criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedOrders.map((order) => (
                                        <motion.tr 
                                            key={order.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{order.orderNumber}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                                                <div className="flex items-center">
                                                    <Calendar size={14} className="mr-1.5 opacity-70" />
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{order.customerName}</td>
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">${order.total.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className="uppercase text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">
                                                    {order.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border
                                                    ${order.status === 'paid' 
                                                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                                                    : order.status === 'cancelled' 
                                                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' 
                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'}`}>
                                                    {order.status === 'paid' && <CheckCircle size={12} className="mr-1" />}
                                                    {order.status === 'pending' && <Clock size={12} className="mr-1" />}
                                                    {order.status === 'cancelled' && <XCircle size={12} className="mr-1" />}
                                                    {t(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    {order.status === 'pending' && (
                                                        <button 
                                                            onClick={() => updateOrderStatus(order.id, 'paid')}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                                            title={t('Mark Paid')}
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleViewDetails(order)}
                                                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                                        title={t('View Details')}
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(order.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                        title={t('Delete Order')}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                             </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={processedOrders.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                />
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <OrderDetailsModal 
                        order={selectedOrder} 
                        onClose={() => setSelectedOrder(null)} 
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

interface OrderDetailsModalProps {
    order: Order;
    onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
    const { t } = useThemeStore();

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
                className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('Order Details')}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">#{order.orderNumber}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center">
                                <User size={14} className="mr-1" /> {t('Customer')}
                            </h3>
                            <p className="font-medium text-slate-900 dark:text-white text-lg">{order.customerName}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center">
                                <CreditCard size={14} className="mr-1" /> {t('Payment')}
                            </h3>
                            <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm font-medium uppercase text-slate-600 dark:text-slate-300">
                                    {order.paymentMethod}
                                </span>
                                <span className={`px-2 py-1 rounded text-sm font-medium capitalize
                                    ${order.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                    {t(order.status)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">{t('Order Items')}</h3>
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Item</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-center">Qty</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Price</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {order.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                            <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{item.name}</td>
                                            <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">${item.price.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">${(item.price * item.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50 dark:bg-slate-700/50 font-bold text-slate-900 dark:text-white">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-right">Subtotal</td>
                                        <td className="px-4 py-3 text-right">${order.subtotal.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-right">Total</td>
                                        <td className="px-4 py-3 text-right text-primary text-lg">${order.total.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
                    >
                        {t('Close')}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Orders;
