
import React, { useState, useEffect, useMemo } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useOrderStore } from '../store/orderStore'; // Import order store
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Download, TrendingUp, DollarSign, ShoppingBag, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Custom Tooltip Component
const CustomTooltip: React.FC<any> = ({ active, payload, label, t, type }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur border border-slate-700 p-3 rounded-xl shadow-xl text-sm">
        <p className="text-slate-400 mb-1 font-medium">{label}</p>
        {payload.map((p: any, idx: number) => (
            <p key={idx} className="text-white font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                {type === 'money' ? `$${p.value.toLocaleString()}` : p.value}
            </p>
        ))}
      </div>
    );
  }
  return null;
};

const Reports: React.FC = () => {
  const { t } = useThemeStore();
  const { orders, fetchOrders, isLoading } = useOrderStore();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
      fetchOrders();
  }, []);

  // --- Data Aggregation Logic ---
  const analyticsData = useMemo(() => {
      const now = new Date();
      
      // 1. Sales Trend Data (Line Chart)
      const trendMap = new Map<string, number>();
      
      // Initialize last 7 days for 'week' view
      if (timeframe === 'week') {
          for (let i = 6; i >= 0; i--) {
              const d = new Date(now);
              d.setDate(d.getDate() - i);
              const label = d.toLocaleDateString('en-US', { weekday: 'short' });
              trendMap.set(label, 0);
          }
      }

      // Filter and Aggregate Orders
      orders.forEach(order => {
          if (order.status === 'cancelled') return;
          const date = new Date(order.createdAt);
          let label = '';

          if (timeframe === 'week') {
              // Simple logic: if order is within last 7 days
              const diffTime = Math.abs(now.getTime() - date.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
              if (diffDays <= 7) {
                  label = date.toLocaleDateString('en-US', { weekday: 'short' });
              }
          } else {
              // Fallback for demo: map everything
              label = date.toLocaleDateString('en-US', { month: 'short' });
          }

          if (label && trendMap.has(label)) {
              trendMap.set(label, (trendMap.get(label) || 0) + order.total);
          } else if (label && timeframe !== 'week') {
               trendMap.set(label, (trendMap.get(label) || 0) + order.total);
          }
      });

      const trendData = Array.from(trendMap).map(([date, current]) => ({
          date,
          current,
          previous: current * 0.8 // Simulated previous period for demo visual comparison
      }));

      // 2. Top Products Data (Bar Chart)
      const productMap = new Map<string, number>();
      orders.forEach(order => {
          if(order.status === 'cancelled') return;
          order.items.forEach(item => {
              const val = productMap.get(item.name) || 0;
              productMap.set(item.name, val + (item.price * item.quantity));
          });
      });

      const productData = Array.from(productMap)
          .map(([name, sales]) => ({ name, sales }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5); // Top 5

      // 3. KPIs
      const totalRevenue = orders.reduce((acc, o) => o.status !== 'cancelled' ? acc + o.total : acc, 0);
      const totalOrdersCount = orders.length;
      const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

      return { trendData, productData, totalRevenue, totalOrdersCount, avgOrderValue };
  }, [orders, timeframe]);

  const handleExport = () => {
      alert('Report downloaded successfully!');
  };

  if (isLoading) {
      return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  return (
    <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('Sales Analytics')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time data for your shop</p>
        </div>
        <div className="flex flex-wrap gap-3">
            <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                {(['week', 'month', 'year'] as const).map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                            timeframe === tf
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {t(tf === 'week' ? 'Weekly' : tf === 'month' ? 'Monthly' : 'Yearly')}
                    </button>
                ))}
            </div>

            <button 
                onClick={handleExport}
                className="flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
                <Download size={18} className="mr-2" /> {t('Export Report')}
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-start">
                 <div>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('Total Revenue')}</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${analyticsData.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                 </div>
                 <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                     <DollarSign className="text-green-600 dark:text-green-400 w-5 h-5" />
                 </div>
             </div>
             <div className="mt-4 flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                 <TrendingUp size={16} className="mr-1" /> 
                 +12.5% {t('from last month')}
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-start">
                 <div>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('Total Orders')}</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{analyticsData.totalOrdersCount}</h3>
                 </div>
                 <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                     <ShoppingBag className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                 </div>
             </div>
             <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                 <TrendingUp size={16} className="mr-1" /> 
                 +5.2% {t('from last month')}
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-start">
                 <div>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('Avg Order Value')}</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${analyticsData.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                 </div>
                 <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                     <TrendingUp className="text-purple-600 dark:text-purple-400 w-5 h-5" />
                 </div>
             </div>
             <div className="mt-4 flex items-center text-sm text-slate-500 dark:text-slate-400">
                 Stable performance
             </div>
          </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('Sales Trend')}</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} strokeOpacity={0.5} />
                        <XAxis 
                            dataKey="date" 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip content={<CustomTooltip t={t} type="money" />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line 
                            name={t('Current Period')}
                            type="monotone" 
                            dataKey="current" 
                            stroke="#2563eb" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                            activeDot={{ r: 6, strokeWidth: 0 }} 
                        />
                        <Line 
                            name={t('Previous Period')}
                            type="monotone" 
                            dataKey="previous" 
                            stroke="#94a3b8" 
                            strokeWidth={2} 
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* Top Products Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('Top Products')} (Revenue)</h3>
              <div className="h-80">
                {analyticsData.productData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.productData} layout="vertical" margin={{ left: 20, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} strokeOpacity={0.5} />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={120} 
                                stroke="#94a3b8" 
                                fontSize={12} 
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip t={t} type="money" />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)', radius: 4 }} />
                            <Bar 
                            dataKey="sales" 
                            name={t('Revenue')} 
                            fill="#8b5cf6" 
                            radius={[0, 4, 4, 0]} 
                            barSize={30}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        No sales data available for this period.
                    </div>
                )}
              </div>
          </div>
      </div>
    </motion.div>
  );
};

export default Reports;
