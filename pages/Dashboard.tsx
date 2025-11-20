import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { useStockStore } from '../store/stockStore';
import { useThemeStore } from '../store/themeStore';
import { TrendingUp, AlertTriangle, Users, DollarSign } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { items } = useStockStore();
  const { t } = useThemeStore();

  const lowStockCount = items.filter(i => i.quantity < 5).length;
  const totalStockValue = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const salesData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold text-slate-900 dark:text-white">{t('Overview')}</motion.h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          variants={itemVariants}
          title={t('Total Stock Value')}
          value={`$${totalStockValue.toLocaleString()}`}
          icon={<DollarSign className="text-green-600" />}
          trend="+12%"
        />
        <StatCard
          variants={itemVariants}
          title={t('Low Stock Items')}
          value={lowStockCount.toString()}
          icon={<AlertTriangle className="text-orange-600" />}
          subtext={t('Requires attention')}
        />
        <StatCard
          variants={itemVariants}
          title={t('Active Customers')}
          value="1,204"
          icon={<Users className="text-blue-600" />}
          trend="+5%"
        />
        <StatCard
          variants={itemVariants}
          title={t('Monthly Revenue')}
          value="$45,231"
          icon={<TrendingUp className="text-purple-600" />}
          trend="+18%"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-80"
        >
          <h3 className="text-lg font-semibold mb-4 dark:text-white">{t('Weekly Sales')}</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#94a3b8' }}
                cursor={{ fill: 'rgba(37, 99, 235, 0.1)' }}
              />
              <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-80"
        >
          <h3 className="text-lg font-semibold mb-4 dark:text-white">{t('Revenue Trend')}</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
};

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
    subtext?: string;
    variants?: Variants;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, subtext, variants }) => {
    const { t } = useThemeStore();
    return (
        <motion.div variants={variants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">{icon}</div>
            </div>
            {trend && <span className="text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">{trend} {t('from last month')}</span>}
            {subtext && <span className="text-sm font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">{subtext}</span>}
        </motion.div>
    );
};

export default Dashboard;