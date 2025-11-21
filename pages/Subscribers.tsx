
import React, { useState, useEffect, useMemo } from 'react';
import { useUserStore } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';
import { Search, Loader2, Crown, TrendingUp, Users, Building2, CheckCircle, XCircle, Ban, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../components/Pagination';
import { SubscriptionTier } from '../types';

const Subscribers: React.FC = () => {
  const { users, fetchUsers, isLoading } = useUserStore();
  const { t } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'staff'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | SubscriptionTier>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, planFilter, statusFilter]);

  // Stats Calculation
  const stats = useMemo(() => {
      return {
          total: users.length,
          enterprise: users.filter(u => u.plan === 'enterprise').length,
          revenue: users.reduce((acc, u) => {
              // Mock revenue calc based on plan price
              const price = u.plan === 'enterprise' ? 299 : u.plan === 'pro' ? 79 : 0;
              return acc + price;
          }, 0)
      }
  }, [users]);

  // Filter Data
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.shopId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesPlan = planFilter === 'all' || user.plan === planFilter;
      const matchesStatus = statusFilter === 'all' || (user.status || 'active') === statusFilter;

      return matchesSearch && matchesRole && matchesPlan && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, planFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPlanBadgeColor = (plan: string) => {
      switch(plan) {
          case 'enterprise': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300';
          case 'pro': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
          default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300';
      }
  };

  return (
    <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('Subscriber Management')}</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('Total Subscribers')}</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</h3>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Users className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                  </div>
              </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('Enterprise Users')}</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.enterprise}</h3>
                  </div>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Crown className="text-purple-600 dark:text-purple-400 w-5 h-5" />
                  </div>
              </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('Monthly Revenue (Est)')}</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${stats.revenue.toLocaleString()}</h3>
                  </div>
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <TrendingUp className="text-green-600 dark:text-green-400 w-5 h-5" />
                  </div>
              </div>
          </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                  type="text"
                  placeholder="Search by name, email, or shop ID..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex flex-wrap gap-3">
              <select 
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
              </select>
              <select 
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value as any)}
              >
                  <option value="all">{t('All Plans')}</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
              </select>
              <select 
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
              >
                  <option value="all">{t('All Roles')}</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
              </select>
          </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-[400px]">
          <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                          <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">{t('User')}</th>
                          <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">{t('Shop ID')}</th>
                          <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">{t('Role')}</th>
                          <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">{t('Plan')}</th>
                          <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">{t('Status')}</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      <AnimatePresence mode="wait">
                          {isLoading ? (
                              <tr>
                                  <td colSpan={5} className="py-12 text-center">
                                      <div className="flex justify-center items-center text-slate-500">
                                          <Loader2 className="animate-spin mr-2" /> Loading subscribers...
                                      </div>
                                  </td>
                              </tr>
                          ) : paginatedUsers.length === 0 ? (
                              <tr>
                                  <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                                      <div className="flex flex-col items-center justify-center">
                                          <Filter size={32} className="mb-2 opacity-20" />
                                          <p>{t('No subscribers found')}</p>
                                      </div>
                                  </td>
                              </tr>
                          ) : (
                              paginatedUsers.map((user) => (
                                  <motion.tr 
                                      key={user.id}
                                      layout
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                  >
                                      <td className="px-6 py-4">
                                          <div className="flex items-center">
                                              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-slate-200 mr-3 object-cover border border-slate-200 dark:border-slate-600" />
                                              <div>
                                                  <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                                          <span className="flex items-center gap-1">
                                              <Building2 size={12} className="opacity-50" />
                                              {user.shopId}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium capitalize border
                                              ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800' :
                                              user.role === 'manager' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' :
                                              'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'}`}>
                                              {user.role}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${getPlanBadgeColor(user.plan)}`}>
                                              {user.plan === 'enterprise' && <Crown size={10} className="mr-1" />}
                                              {user.plan}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4">
                                          {user.status === 'active' ? (
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                  <CheckCircle size={12} className="mr-1" /> Active
                                              </span>
                                          ) : (
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                                                  <Ban size={12} className="mr-1" /> Inactive
                                              </span>
                                          )}
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
              totalItems={filteredUsers.length}
              itemsPerPage={ITEMS_PER_PAGE}
          />
      </div>
    </motion.div>
  );
};

export default Subscribers;
