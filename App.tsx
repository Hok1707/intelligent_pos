
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
const Reports = lazy(() => import('./pages/Reports'));
const Stock = lazy(() => import('./pages/Stock'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Payments = lazy(() => import('./pages/Payments'));
const Invoices = lazy(() => import('./pages/Invoices'));
const AiTools = lazy(() => import('./pages/AiTools'));
const Users = lazy(() => import('./pages/Users'));
const Customers = lazy(() => import('./pages/Customers'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));

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
                <Link to="/forgot-password" className="text-sm text-primary dark:text-blue-400 font-medium hover:underline">{t('Forgot password?')}</Link>
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
  const { register: registerUser, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

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
    await registerUser({
      username: data.username,
      email: data.email,
      password: data.password
    });
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
                    type="password"
                    {...register('password')}
                    className={`w-full border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} dark:bg-slate-700 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                    placeholder="••••••••"
                />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('Confirm Password')}</label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="password"
                    {...register('confirmPassword')}
                    className={`w-full border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} dark:bg-slate-700 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                    placeholder="••••••••"
                />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? (
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

// Protected Route Component
interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: ('admin' | 'manager' | 'staff')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to dashboard if not authorized for this route
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  
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
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
            <Route path="/stock" element={<ProtectedRoute><Layout><Stock /></Layout></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><Layout><Subscriptions /></Layout></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Layout><Payments /></Layout></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><Layout><Invoices /></Layout></ProtectedRoute>} />
            <Route path="/ai-tools" element={<ProtectedRoute><Layout><AiTools /></Layout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Users /></Layout></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
