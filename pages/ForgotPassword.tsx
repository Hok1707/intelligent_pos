
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { Smartphone, Mail, ArrowRight, ArrowLeft, Sun, Moon, Globe, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotificationStore } from '../store/notificationStore';

const ForgotPassword = () => {
  const { t, toggleTheme, theme, language, setLanguage } = useThemeStore();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const forgotSchema = z.object({
    email: z.string().email(t('Invalid email')),
  });

  type ForgotForm = z.infer<typeof forgotSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    addNotification({
        type: 'success',
        title: t('Email sent'),
        message: t('Check email')
    });
    
    setIsEmailSent(true);
    setIsSubmitting(false);
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
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        <div className="flex justify-center mb-6">
            <div className="bg-blue-50 dark:bg-slate-700 p-3 rounded-2xl">
                <Smartphone className="w-8 h-8 text-primary dark:text-blue-400" />
            </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">{t('Forgot Password')}</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">{t('Enter email reset')}</p>

        {!isEmailSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        <span>{t('Sending...')}</span>
                    </>
                ) : (
                    <>
                        <span>{t('Send Reset Link')}</span>
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
            </form>
        ) : (
            <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4 rounded-xl text-center">
                    <p className="text-green-700 dark:text-green-400 font-medium">{t('Email sent')}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('Check email')}</p>
                </div>
                <button 
                    onClick={() => navigate('/reset-password')}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg flex items-center justify-center"
                >
                    {t('Open Email (Simulated)')}
                </button>
            </div>
        )}

        <div className="text-center mt-6">
            <Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 flex items-center justify-center font-medium transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> {t('Back to Login')}
            </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default ForgotPassword;
