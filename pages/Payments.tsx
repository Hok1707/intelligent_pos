

import React, { useState, useEffect } from 'react';
import { Calculator, Search, Eye, MoreHorizontal, FileText, Download, X, FileSpreadsheet, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { InstallmentPlan } from '../types';
import Pagination from '../components/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../store/notificationStore';

const MOCK_INSTALLMENTS: InstallmentPlan[] = Array.from({ length: 25 }, (_, i) => ({
  id: (i + 1).toString(),
  shopId: 'shop_1',
  customerName: `Customer ${i + 1}`,
  deviceName: i % 3 === 0 ? 'iPhone 15 Pro' : i % 3 === 1 ? 'Samsung S24' : 'Pixel 8',
  totalAmount: i % 3 === 0 ? 1200 : i % 3 === 1 ? 1100 : 800,
  interestRate: 5,
  months: 12,
  monthlyPayment: (i % 3 === 0 ? 1200 : 800) / 12 * 1.05,
  remainingBalance: (i % 3 === 0 ? 1200 : 800) * (Math.random() * 0.8), // Random remaining
  nextDueDate: new Date(2024, 5, (i % 28) + 1).toISOString().split('T')[0],
  status: i % 5 === 0 ? 'Overdue' : i % 4 === 0 ? 'Paid' : 'Pending' // Mock statuses
}));

const Payments: React.FC = () => {
  const { t } = useThemeStore();
  // Calculator state
  const [calcAmount, setCalcAmount] = useState(1000);
  const [calcMonths, setCalcMonths] = useState(12);
  const [calcRate, setCalcRate] = useState(5);

  // Table state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Modal State
  const [selectedPlan, setSelectedPlan] = useState<InstallmentPlan | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const monthlyPaymentCalc = (calcAmount * (1 + calcRate / 100)) / calcMonths;
  const totalRepayCalc = calcAmount * (1 + calcRate / 100);

  // Pagination Logic
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredInstallments = MOCK_INSTALLMENTS.filter(item => 
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.deviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredInstallments.length / ITEMS_PER_PAGE);
  const paginatedInstallments = filteredInstallments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleViewDetails = (plan: InstallmentPlan) => {
    setSelectedPlan(plan);
    setShowDetailModal(true);
  };

  const inputClass = "w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold text-slate-900 dark:text-white">{t('Payments & Installments')}</motion.h1>

      {/* Calculator Section */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
         <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><Calculator className="text-purple-600 dark:text-purple-400 h-5 w-5" /></div>
            <h2 className="text-xl font-bold dark:text-white">{t('Installment Calculator')}</h2>
         </div>
         <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Device Price')}</label>
                    <input type="number" value={calcAmount} onChange={e => setCalcAmount(Number(e.target.value))} className={inputClass} />
                </div>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Duration')}</label>
                        <select value={calcMonths} onChange={e => setCalcMonths(Number(e.target.value))} className={inputClass}>
                            <option value="3">3 {t('Months')}</option>
                            <option value="6">6 {t('Months')}</option>
                            <option value="12">12 {t('Months')}</option>
                            <option value="24">24 {t('Months')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Interest Rate')}</label>
                        <input type="number" value={calcRate} onChange={e => setCalcRate(Number(e.target.value))} className={inputClass} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600 flex flex-col justify-center">
                <div className="flex justify-between mb-2">
                    <span className="text-slate-600 dark:text-slate-400">{t('Monthly Payment')}</span>
                    <span className="font-bold text-primary text-lg">${monthlyPaymentCalc.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-2">
                    <span className="text-slate-600 dark:text-slate-400">{t('Total Repayment')}</span>
                    <span className="font-bold text-slate-900 dark:text-white">${totalRepayCalc.toFixed(2)}</span>
                </div>
            </div>
         </div>
      </motion.div>

      {/* Installment Table Section */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('Installment Management')}</h2>
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder={t('Search installments...')}
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
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Customer')}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Device')}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Total Amount')}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Remaining')}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Next Due')}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Status')}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">{t('Actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    <AnimatePresence mode="wait">
                    {paginatedInstallments.map((plan, index) => (
                        <motion.tr 
                            key={plan.id} 
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{plan.customerName}</td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{plan.deviceName}</td>
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">${plan.totalAmount.toFixed(2)}</td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">${plan.remainingBalance.toFixed(2)}</td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{plan.nextDueDate}</td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center
                                    ${plan.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                      plan.status === 'Overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 
                                         ${plan.status === 'Paid' ? 'bg-green-500' :
                                           plan.status === 'Overdue' ? 'bg-red-500' :
                                           'bg-yellow-500'}`}></span>
                                    {t(plan.status || 'Pending')}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                    <button 
                                        onClick={() => handleViewDetails(plan)}
                                        className="text-slate-400 hover:text-primary transition-colors p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                        title={t('View Details')}
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button className="text-slate-400 hover:text-primary transition-colors p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                    </AnimatePresence>
                    {filteredInstallments.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                {t('No installments found')}
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
            totalItems={filteredInstallments.length}
            itemsPerPage={ITEMS_PER_PAGE}
        />
      </motion.div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailModal && selectedPlan && (
            <InstallmentDetailModal 
                plan={selectedPlan} 
                onClose={() => setShowDetailModal(false)} 
            />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface ScheduleItem {
    installmentNumber: number;
    dueDate: string;
    amount: number;
    principal: number;
    interest: number;
    status: 'Paid' | 'Pending' | 'Overdue';
}

const InstallmentDetailModal: React.FC<{ plan: InstallmentPlan; onClose: () => void }> = ({ plan, onClose }) => {
    const { t } = useThemeStore();
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

    // Helper to generate schedule
    const generateSchedule = (plan: InstallmentPlan) => {
        const sched: ScheduleItem[] = [];
        const monthlyPay = plan.monthlyPayment;
        
        // Calculate breakdown components (Flat rate assumption based on mock generation)
        // Total Interest = Total Repay - Original Principal
        const totalPrincipal = plan.totalAmount;
        const monthlyPrincipal = totalPrincipal / plan.months;
        const monthlyInterest = monthlyPay - monthlyPrincipal;

        const totalRepay = plan.totalAmount * (1 + plan.interestRate/100);
        const paidAmount = totalRepay - plan.remainingBalance;
        const paidInstallments = Math.round(paidAmount / monthlyPay);

        // Estimate start date based on next due date 
        let currentDate = new Date(plan.nextDueDate);
        
        // Reset date to first installment (backward calculation to reconstruct schedule)
        currentDate.setMonth(currentDate.getMonth() - paidInstallments);

        for (let i = 1; i <= plan.months; i++) {
            const isPaid = i <= paidInstallments;
            let status: 'Paid' | 'Pending' | 'Overdue' = 'Pending';
            
            if (isPaid) status = 'Paid';
            else if (plan.status === 'Overdue' && i === paidInstallments + 1) status = 'Overdue';

            sched.push({
                installmentNumber: i,
                dueDate: currentDate.toISOString().split('T')[0],
                amount: monthlyPay,
                principal: monthlyPrincipal,
                interest: monthlyInterest,
                status
            });
            // Next month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        return sched;
    };

    useEffect(() => {
        setSchedule(generateSchedule(plan));
    }, [plan]);

    const handleExportCSV = () => {
        const headers = [t('Installment'), t('Due Date'), t('Principal'), t('Interest'), t('Total Amount'), t('Status')];
        const rows = schedule.map(item => [
            item.installmentNumber,
            item.dueDate,
            item.principal.toFixed(2),
            item.interest.toFixed(2),
            item.amount.toFixed(2),
            item.status
        ].join(','));
        
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `schedule_${plan.customerName.replace(/\s/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        useNotificationStore.getState().addNotification({
            type: 'success',
            title: t('Export Successful'),
            message: t('Schedule PDF has been downloaded.')
        });
    };

    const totalRepay = plan.totalAmount * (1 + plan.interestRate/100);
    const paidAmount = totalRepay - plan.remainingBalance;

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
                className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('Payment Schedule')}</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{plan.customerName} - {plan.deviceName}</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t('Total Amount')}</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">${totalRepay.toFixed(2)}</p>
                            <p className="text-xs text-slate-400 mt-1">{t('Total Interest')}: ${(totalRepay - plan.totalAmount).toFixed(2)}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                            <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">{t('Paid Amount')}</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">${paidAmount.toFixed(2)}</p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
                            <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase">{t('Remaining')}</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">${plan.remainingBalance.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Schedule Table */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                                <Calendar size={18} className="mr-2 text-primary" /> {t('Schedule Details')}
                            </h3>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={handleExportCSV}
                                    className="flex items-center px-3 py-1.5 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors"
                                >
                                    <FileSpreadsheet size={14} className="mr-2 text-green-600 dark:text-green-400" /> CSV
                                </button>
                                <button 
                                    onClick={handleExportPDF}
                                    className="flex items-center px-3 py-1.5 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors"
                                >
                                    <FileText size={14} className="mr-2 text-red-600 dark:text-red-400" /> PDF
                                </button>
                            </div>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">{t('Due Date')}</th>
                                    <th className="px-4 py-3">{t('Principal')}</th>
                                    <th className="px-4 py-3">{t('Interest')}</th>
                                    <th className="px-4 py-3">{t('Total Amount')}</th>
                                    <th className="px-4 py-3 text-right">{t('Status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                                {schedule.map((item) => (
                                    <tr key={item.installmentNumber} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{item.installmentNumber}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.dueDate}</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">${item.principal.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">${item.interest.toFixed(2)}</td>
                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">${item.amount.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${item.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                  item.status === 'Overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                {item.status === 'Paid' && <CheckCircle size={12} className="mr-1" />}
                                                {item.status === 'Pending' && <Clock size={12} className="mr-1" />}
                                                {t(item.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                     <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        {t('Close')}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Payments;