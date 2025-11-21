

import React, { useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Camera, Mail, User as UserIcon, Shield, Calendar, Save, Loader2, Upload, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const Profile: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const { t } = useThemeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const profileSchema = z.object({
    name: z.string().min(2, t('Name required')),
    email: z.string().email(t('Invalid email')),
    phone: z.string().optional(),
  });

  type ProfileForm = z.infer<typeof profileSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    await updateProfile({
      ...data,
      ...(previewImage ? { avatar: previewImage } : {})
    });
  };

  if (!user) return null;

  return (
    <motion.div 
        className="max-w-2xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('User Profile')}</h1>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header / Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative"></div>
        
        <div className="px-8 pb-8 relative">
            {/* Avatar Section */}
            <div className="relative -mt-16 mb-6 inline-block group">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-slate-200">
                    <img 
                        src={previewImage || user.avatar} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 p-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-full shadow-lg border border-slate-200 dark:border-slate-600 hover:text-primary transition-colors"
                    title={t('Change Photo')}
                >
                    <Camera size={18} />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*"
                />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('Name')}</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                {...register('name')}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white dark:bg-slate-700 dark:text-white
                                    ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-primary'}`}
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('Email')}</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                {...register('email')}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white dark:bg-slate-700 dark:text-white
                                    ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-primary'}`}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Phone Field */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('Phone')}</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                {...register('phone')}
                                placeholder="+1 (555) 123-4567"
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white dark:bg-slate-700 dark:text-white border-slate-200 dark:border-slate-600 focus:border-primary`}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                     {/* Role (Read Only) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">{t('Role')}</label>
                        <div className="flex items-center px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300">
                            <Shield size={18} className="mr-3 text-slate-400" />
                            <span className="capitalize font-medium">{user.role}</span>
                        </div>
                    </div>

                    {/* Plan (Read Only) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">{t('Plan')}</label>
                        <div className="flex items-center px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300">
                            <Calendar size={18} className="mr-3 text-slate-400" />
                            <span className="capitalize font-medium">{user.plan}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex items-center px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
                        {t('Save Changes')}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;