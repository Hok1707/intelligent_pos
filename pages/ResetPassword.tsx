
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { Smartphone, Lock, CheckCircle, Sun, Moon, Globe, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotificationStore } from '../store/notificationStore';

const ResetPassword = () => {
  const { t, toggleTheme, theme, language, setLanguage } = useThemeStore();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetSchema = z.object({
    password: z.string().min(6, t('Password min length')),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('Passwords do not match'),
    path: ["confirmPassword"],
  });

  type ResetForm = z.infer<typeof resetSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema)
  });

  const onSubmit = async (data: ResetForm) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    addNotification({
        type: 'success',
        title: 'Success',
        message: t('Password Reset Successful')
    });

    setTimeout(() => {
        navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 transition-colors duration-300 relative">
       {/* Theme/Lang Controls */}
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
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-blue-500"></div>
        
        <div className="flex justify-center mb-6">
            <div className="bg-blue-50 dark:bg-slate-700 p-3 rounded-2xl">
                <Smartphone className="w-8 h-8 text-primary dark:text-blue-400" />
            </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">{t('Reset Password')}</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">{t('Enter your new password below.')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('New Password')}</label>
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
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('Confirm New Password')}</label>
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

          <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed">
            {isSubmitting ? (
                <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    <span>{t('Resetting...')}</span>
                </>
            ) : (
                <span>{t('Reset Password')}</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
