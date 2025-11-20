import React, { useEffect, Suspense, lazy, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';
import { Smartphone, Mail, Lock, ArrowRight, Sun, Moon, Globe, ShieldAlert, User, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SubscriptionTier } from './types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Lazy Load Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Stock = lazy(() => import('./pages/Stock'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Payments = lazy(() => import('./pages/Payments'));
const AiTools = lazy(() => import('./pages/AiTools'));

// Mock Login Component
const Login = () => {
  const { login, isAuthenticated } = useAuthStore();
  const { theme, t, toggleTheme, language, setLanguage } = useThemeStore(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login('user@smartpos.com');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 transition-colors duration-300 relative">
       <div className="absolute top-6 right-6 flex items-center space-x-2">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button 
          onClick={() => setLanguage(language === 'en' ? 'km' : 'en')}
          className="flex items-center space-x-1 p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
        >
          <Globe size={20} />
          <span className="text-xs font-bold uppercase">{language}</span>
        </button>
       </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 w-full max-w-md relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        <div className="flex justify-center mb-8">
            <div className="bg-blue-50 dark:bg-slate-700 p-3 rounded-2xl">
                <Smartphone className="w-8 h-8 text-primary dark:text-blue-400" />
            </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">{t('Welcome back')}</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">{t('Enter credentials')}</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('Email Address')}</label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="email" 
                    defaultValue="user@smartpos.com" 
                    className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                    placeholder="name@company.com"
                />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('Password')}</label>
                <a href="#" className="text-sm text-primary dark:text-blue-400 font-medium hover:underline">{t('Forgot password?')}</a>
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="password" 
                    defaultValue="password" 
                    className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                    placeholder="••••••••"
                />
            </div>
          </div>

          <button type="submit" className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center group">
            <span>{t('Sign In')}</span>
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="text-center mt-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('No account')} <Link to="/register" className="text-primary dark:text-blue-400 font-bold hover:underline">{t('Sign up')}</Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Register = () => {
  const { t, toggleTheme, theme, language, setLanguage } = useThemeStore();
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);

  const registerSchema = z.object({
    username: z.string().min(3, t('Username min length')),
    email: z.string().email(t('Invalid email')),
    password: z.string().min(6, t('Password min length')),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('Passwords do not match'),
    path: ["confirmPassword"],
  });

  type RegisterForm = z.infer<typeof registerSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsVerifying(true);
    
    // Mock API simulation (Gmail verification)
    // In a real app, this would trigger an email or OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock "isVerify" check
    const isVerify = true; 

    if (isVerify) {
        login(data.email, data.username);
        navigate('/dashboard');
    }
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 transition-colors duration-300 relative">
       <div className="absolute top-6 right-6 flex items-center space-x-2">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button 
          onClick={() => setLanguage(language === 'en' ? 'km' : 'en')}
          className="flex items-center space-x-1 p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
        >
          <Globe size={20} />
          <span className="text-xs font-bold uppercase">{language}</span>
        </button>
       </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 w-full max-w-md relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        <div className="flex justify-center mb-6">
            <div className="bg-blue-50 dark:bg-slate-700 p-3 rounded-2xl">
                <Smartphone className="w-8 h-8 text-primary dark:text-blue-400" />
            </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">{t('Create Account')}</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">{t('Join thousands')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('Username')}</label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    {...register('username')}
                    className={`w-full border ${errors.username ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} dark:bg-slate-700 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                    placeholder="johndoe"
                />
            </div>
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('Email Address')}</label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    {...register('email')}
                    className={`w-full border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} dark:bg-slate-700 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                    placeholder="name@company.com"
                />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          
          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('Password')}</label>
             <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    {...register('password')}
                    type="password" 
                    className={`w-full border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} dark:bg-slate-700 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                    placeholder="••••••••"
                />
             </div>
             {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('Confirm Password')}</label>
             <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    {...register('confirmPassword')}
                    type="password" 
                    className={`w-full border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} dark:bg-slate-700 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                    placeholder="••••••••"
                />
             </div>
             {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isVerifying} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed">
            {isVerifying ? (
                <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    <span>{t('Verifying')}</span>
                </>
            ) : (
                <>
                    <span>{t('Create Account')}</span>
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
            )}
          </button>

          <div className="text-center mt-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('Already have an account?')} <Link to="/login" className="text-primary dark:text-blue-400 font-bold hover:underline">{t('Sign In')}</Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

// Tier Requirement Guard
const TIER_LEVELS: Record<SubscriptionTier, number> = {
  'starter': 1,
  'pro': 2,
  'enterprise': 3
};

const RequireTier: React.FC<{ children: React.ReactNode; tier: SubscriptionTier }> = ({ children, tier }) => {
  const { user } = useAuthStore();
  const { t } = useThemeStore();
  const userLevel = user ? TIER_LEVELS[user.plan] : 0;
  const requiredLevel = TIER_LEVELS[tier];

  if (userLevel < requiredLevel) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-6">
            <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('Access Restricted')}</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
          {t('Feature requires')} <span className="font-bold capitalize">{tier}</span> {t('plan or higher')}
        </p>
        <Link 
          to="/subscriptions" 
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          {t('View Upgrade Options')}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes with Tier Gating */}
            <Route path="/dashboard" element={<ProtectedRoute><RequireTier tier="starter"><Dashboard /></RequireTier></ProtectedRoute>} />
            <Route path="/stock" element={<ProtectedRoute><RequireTier tier="starter"><Stock /></RequireTier></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><RequireTier tier="starter"><Subscriptions /></RequireTier></ProtectedRoute>} />
            
            {/* Pro Tier Route */}
            <Route path="/payments" element={<ProtectedRoute><RequireTier tier="pro"><Payments /></RequireTier></ProtectedRoute>} />
            
            {/* Enterprise Tier Route */}
            <Route path="/ai-tools" element={<ProtectedRoute><RequireTier tier="enterprise"><AiTools /></RequireTier></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
};

export default App;