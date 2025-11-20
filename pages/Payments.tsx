import React, { useState, useEffect } from 'react';
import { Calculator, Search, Eye, MoreHorizontal } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { InstallmentPlan } from '../types';
import Pagination from '../components/Pagination';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_INSTALLMENTS: InstallmentPlan[] = Array.from({ length: 25 }, (_, i) => ({
  id: (i + 1).toString(),
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
                                    <button className="text-slate-400 hover:text-primary transition-colors p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
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
    </motion.div>
  );
};

export default Payments;