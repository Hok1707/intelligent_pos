import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Box, CreditCard, Calendar, LogOut, Sparkles, Smartphone, Sun, Moon, Globe, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { ToastContainer } from './Toast';
import { useSimulation } from '../hooks/useSimulation';
import { SubscriptionTier } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  'starter': 1,
  'pro': 2,
  'enterprise': 3
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const { theme, toggleTheme, language, setLanguage, t } = useThemeStore();
  
  // Start simulation when layout is mounted (authenticated user)
  useSimulation(!!user);

  const currentTierLevel = user ? TIER_LEVELS[user.plan] : 0;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requiredTier: 'starter' },
    { path: '/stock', label: 'Stock', icon: Box, requiredTier: 'starter' },
    { path: '/payments', label: 'Installments', icon: CreditCard, requiredTier: 'pro' },
    { path: '/ai-tools', label: 'AI Studio', icon: Sparkles, requiredTier: 'enterprise' },
    { path: '/subscriptions', label: 'Plans', icon: Calendar, requiredTier: 'starter' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col transition-colors duration-300">
        <div className="p-6 flex items-center space-x-2 border-b border-slate-100 dark:border-slate-700">
          <div className="bg-primary p-2 rounded-lg">
            <Smartphone className="text-white h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-white">SmartPOS</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const requiredLevel = TIER_LEVELS[item.requiredTier as SubscriptionTier];
            const isLocked = currentTierLevel < requiredLevel;

            if (isLocked) {
               return (
                <div key={item.path} className="group relative">
                   <div className="flex items-center justify-between px-4 py-3 rounded-lg text-slate-400 dark:text-slate-600 cursor-not-allowed">
                      <div className="flex items-center space-x-3">
                        <item.icon size={20} />
                        <span>{t(item.label)}</span>
                      </div>
                      <Lock size={16} />
                   </div>
                   <div className="hidden group-hover:block absolute left-10 bottom-full mb-2 w-48 bg-slate-900 text-white text-xs rounded py-1 px-2 z-50">
                      Upgrade to {item.requiredTier} to access
                   </div>
                </div>
               )
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <item.icon size={20} />
                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
          {/* Plan Badge */}
          {user && (
            <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
               <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Current Plan</p>
               <div className="flex items-center justify-between">
                  <span className={`font-bold capitalize ${
                      user.plan === 'enterprise' ? 'text-purple-600' : 
                      user.plan === 'pro' ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {user.plan}
                  </span>
                  <Link to="/subscriptions" className="text-xs text-primary hover:underline">Upgrade</Link>
               </div>
            </div>
          )}

          {/* Settings Toggles */}
          <div className="flex items-center justify-between px-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <button 
              onClick={() => setLanguage(language === 'en' ? 'km' : 'en')}
              className="flex items-center space-x-1 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
              title="Switch Language"
            >
              <Globe size={20} />
              <span className="text-xs font-bold uppercase">{language}</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 px-4 py-3">
            <img src={user?.avatar} alt="User" className="w-8 h-8 rounded-full bg-slate-200" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-2 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>{t('Sign Out')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 md:hidden flex items-center justify-between sticky top-0 z-10">
           <div className="flex items-center space-x-2">
            <Smartphone className="text-primary h-6 w-6" />
            <span className="text-lg font-bold text-slate-800 dark:text-white">SmartPOS</span>
          </div>
           <div className="flex items-center space-x-3">
             <button onClick={toggleTheme} className="text-slate-600 dark:text-slate-300"><Moon size={20} /></button>
             <button onClick={logout} className="text-slate-600 dark:text-slate-300"><LogOut size={20} /></button>
           </div>
        </header>
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
        
        {/* Global Notifications */}
        <ToastContainer />
      </main>
    </div>
  );
};

export default Layout;