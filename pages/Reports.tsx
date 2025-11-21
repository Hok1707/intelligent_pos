
import React, { useState, useMemo } from 'react';
import { useThemeStore } from '../store/themeStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Download, TrendingUp, DollarSign, ShoppingBag, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Types ---
export interface SalesTrendData {
  date: string;
  current: number;
  previous: number;
}

export interface ProductPerformance {
  name: string;
  sales: number;
}

// --- Mock Data ---
const MOCK_DATA = {
  week: {
    trend: [
      { date: 'Mon', current: 4200, previous: 3800 },
      { date: 'Tue', current: 3800, previous: 4100 },
      { date: 'Wed', current: 5100, previous: 3900 },
      { date: 'Thu', current: 4800, previous: 4600 },
      { date: 'Fri', current: 5900, previous: 5200 },
      { date: 'Sat', current: 7200, previous: 6800 },
      { date: 'Sun', current: 6400, previous: 6100 },
    ],
    products: [
      { name: 'iPhone 15 Pro', sales: 14500 },
      { name: 'Samsung S24', sales: 12000 },
      { name: 'AirPods Pro', sales: 4500 },
      { name: 'Pixel 8', sales: 3200 },
      { name: 'USB-C Cable', sales: 1200 },
    ]
  },
  month: {
    trend: [
      { date: 'Week 1', current: 28000, previous: 25000 },
      { date: 'Week 2', current: 32000, previous: 29000 },
      { date: 'Week 3', current: 35000, previous: 31000 },
      { date: 'Week 4', current: 29000, previous: 33000 },
    ],
    products: [
      { name: 'iPhone 15 Pro', sales: 45000 },
      { name: 'Samsung S24', sales: 38000 },
      { name: 'iPad Air', sales: 15000 },
      { name: 'Pixel 8', sales: 12000 },
      { name: 'Galaxy Watch', sales: 8500 },
    ]
  },
  year: {
    trend: [
      { date: 'Jan', current: 120000, previous: 100000 },
      { date: 'Feb', current: 135000, previous: 110000 },
      { date: 'Mar', current: 125000, previous: 115000 },
      { date: 'Apr', current: 140000, previous: 120000 },
      { date: 'May', current: 155000, previous: 130000 },
      { date: 'Jun', current: 160000, previous: 140000 },
      { date: 'Jul', current: 175000, previous: 150000 },
      { date: 'Aug', current: 165000, previous: 155000 },
      { date: 'Sep', current: 180000, previous: 160000 },
      { date: 'Oct', current: 195000, previous: 170000 },
      { date: 'Nov', current: 210000, previous: 180000 },
      { date: 'Dec', current: 240000, previous: 200000 },
    ],
    products: [
      { name: 'iPhone 15 Pro', sales: 520000 },
      { name: 'Samsung S24', sales: 480000 },
      { name: 'MacBook Air', sales: 350000 },
      { name: 'Pixel 8', sales: 210000 },
      { name: 'iPad Pro', sales: 180000 },
    ]
  }
};

// Custom interface for Tooltip props to resolve type errors with Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  t: (k: string) => string;
}

// Custom Tooltip Component for Line Chart
const CustomLineTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, t }) => {
  if (active && payload && payload.length >= 2) {
    const current = payload[0].value || 0;
    const previous = payload[1].value || 0;
    const growth = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
    const isPositive = growth >= 0;

    return (
      <div className="bg-slate-900/95 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-xl text-sm min-w-[200px]">
        <p className="text-slate-400 mb-3 border-b border-slate-700 pb-2 font-medium">{label}</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-blue-400 flex items-center text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
              {t('Current Period')}
            </span>
            <span className="font-bold text-white">${current.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center text-xs">
              <div className="w-2 h-2 rounded-full bg-slate-500 mr-2"></div>
              {t('Previous Period')}
            </span>
            <span className="font-medium text-slate-300">${previous.toLocaleString()}</span>
          </div>
          <div className="pt-2 mt-2 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-500">{t('Growth')}</span>
            <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
              {Math.abs(growth).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip Component for Bar Chart
const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, t }) => {
  if (active && payload && payload.length) {
    const sales = payload[0].value || 0;
    
    return (
      <div className="bg-slate-900/95 backdrop-blur border border-slate-700 p-3 rounded-xl shadow-xl text-sm">
        <p className="font-bold text-white mb-1">{label}</p>
        <p className="text-purple-300 text-xs flex items-center">
          {t('Revenue')}: <span className="ml-2 font-bold text-white text-sm">${sales.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

const Reports: React.FC = () => {
  const { t } = useThemeStore();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');

  // Derived Data based on timeframe
  const currentData = MOCK_DATA[timeframe];

  // Calculate KPI totals dynamically from the chart data for consistency
  const totalRevenue = useMemo(() => 
    currentData.trend.reduce((acc, curr) => acc + curr.current, 0), 
    [currentData]
  );

  const previousRevenue = useMemo(() => 
    currentData.trend.reduce((acc, curr) => acc + curr.previous, 0), 
    [currentData]
  );

  // Estimate orders based on mock revenue (avg order ~ $400)
  const totalOrders = Math.floor(totalRevenue / 400);
  const previousOrders = Math.floor(previousRevenue / 400);

  const revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
  const ordersGrowth = ((totalOrders - previousOrders) / previousOrders) * 100;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Static Staff Data for display
  const staffPerformance = [
      { name: 'Sarah Staff', sales: totalRevenue * 0.45, orders: Math.floor(totalOrders * 0.4) },
      { name: 'Alex Manager', sales: totalRevenue * 0.35, orders: Math.floor(totalOrders * 0.35) },
      { name: 'Mike Technician', sales: totalRevenue * 0.20, orders: Math.floor(totalOrders * 0.25) },
  ];

  const handleExport = () => {
      alert('Report downloaded successfully!');
  };

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
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('Sales Reports')} & {t('Performance')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
            {/* Timeframe Selector */}
            <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                {(['week', 'month', 'year'] as const).map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                            timeframe === tf
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {tf === 'week' ? t('Weekly') : tf === 'month' ? t('Monthly') : t('Yearly')}
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
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                 </div>
                 <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                     <DollarSign className="text-green-600 dark:text-green-400 w-5 h-5" />
                 </div>
             </div>
             <div className={`mt-4 flex items-center text-sm font-medium ${revenueGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                 <TrendingUp size={16} className={`mr-1 ${revenueGrowth < 0 ? 'rotate-180' : ''}`} /> 
                 {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}% {t('from last month')}
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-start">
                 <div>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('Total Orders')}</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalOrders.toLocaleString()}</h3>
                 </div>
                 <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                     <ShoppingBag className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                 </div>
             </div>
             <div className={`mt-4 flex items-center text-sm font-medium ${ordersGrowth >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                 <TrendingUp size={16} className={`mr-1 ${ordersGrowth < 0 ? 'rotate-180' : ''}`} /> 
                 {ordersGrowth >= 0 ? '+' : ''}{ordersGrowth.toFixed(1)}% {t('from last month')}
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-start">
                 <div>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('Avg Order Value')}</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
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
                    <LineChart data={currentData.trend}>
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
                        <Tooltip content={<CustomLineTooltip t={t} />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Legend 
                            wrapperStyle={{ paddingTop: '20px' }}
                        />
                        <Line 
                            name={t('Current Period')}
                            type="monotone" 
                            dataKey="current" 
                            stroke="#2563eb" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                            activeDot={{ r: 6, strokeWidth: 0 }} 
                            animationDuration={1500}
                        />
                        <Line 
                            name={t('Previous Period')}
                            type="monotone" 
                            dataKey="previous" 
                            stroke="#94a3b8" 
                            strokeWidth={2} 
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={false}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* Top Products Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('Top Products')} (Revenue)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentData.products} layout="vertical" margin={{ left: 40, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} strokeOpacity={0.5} />
                        <XAxis type="number" hide />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={100} 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomBarTooltip t={t} />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)', radius: 4 }} />
                        <Bar 
                          dataKey="sales" 
                          name={t('Revenue')} 
                          fill="#8b5cf6" 
                          radius={[0, 4, 4, 0]} 
                          barSize={30}
                          animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* Staff Performance Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('Staff Performance')}</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                      <tr>
                          <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">{t('Name')}</th>
                          <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">{t('Role')}</th>
                          <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">{t('Orders')}</th>
                          <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">{t('Revenue')}</th>
                          <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">{t('Status')}</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {staffPerformance.map((staff, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center mr-3 text-xs font-bold">
                                      {staff.name.charAt(0)}
                                  </div>
                                  {staff.name}
                              </td>
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                  {idx === 0 ? 'Staff' : idx === 1 ? 'Manager' : 'Staff'}
                              </td>
                              <td className="px-6 py-4 text-slate-900 dark:text-white">{staff.orders}</td>
                              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">${staff.sales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="px-6 py-4">
                                  <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                                      Excellent
                                  </span>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </motion.div>
  );
};

export default Reports;
