
import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Plus, Search, Trash2, Edit, Loader2, User, Shield, Mail, Phone, Lock, AlertTriangle } from 'lucide-react';
import { User as UserType, SubscriptionTier } from '../types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../store/notificationStore';

// Limits definition
const PLAN_LIMITS: Record<SubscriptionTier, number> = {
    'starter': 2, 
    'pro': 5,
    'enterprise': 9999
};

const Users: React.FC = () => {
  const { users, fetchUsers, addUser, updateUser, deleteUser, isLoading } = useUserStore();
  const { user: currentUser } = useAuthStore();
  const { t } = useThemeStore();
  const { addNotification } = useNotificationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate Limit
  const userLimit = currentUser ? PLAN_LIMITS[currentUser.plan] : 1;
  const currentCount = users.length;
  
  // RBAC: Staff cannot create users
  const isManagerOrAdmin = currentUser?.role === 'manager' || currentUser?.role === 'admin';
  const canAddUser = isManagerOrAdmin && (currentCount < userLimit || currentUser?.role === 'admin');

  const handleEdit = (user: UserType) => {
    if (!isManagerOrAdmin) {
        addNotification({ type: 'error', message: 'Access Denied: Staff cannot edit users.' });
        return;
    }
    // Prevent Manager from editing Admin
    if (currentUser?.role !== 'admin' && user.role === 'admin') {
        addNotification({ type: 'error', message: 'Access Denied: Cannot edit Administrator.' });
        return;
    }
    setEditingUser(user);
    setShowModal(true);
  };

  const handleAdd = () => {
    if (!canAddUser) {
        if (!isManagerOrAdmin) {
             addNotification({ type: 'error', message: 'Access Denied: Staff cannot create users.' });
        } else {
             addNotification({
                type: 'error',
                title: 'Limit Reached',
                message: `Your ${currentUser?.plan} plan allows a maximum of ${userLimit} users. Please upgrade to add more.`
            });
        }
        return;
    }
    setEditingUser(null);
    setShowModal(true);
  };

  const handleFormSubmit = async (data: Partial<UserType>) => {
    if (editingUser) {
      await updateUser(editingUser.id, data);
    } else {
      await addUser(data);
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (!isManagerOrAdmin) {
        addNotification({ type: 'error', message: 'Access Denied.' });
        return;
    }
    if (id === currentUser?.id) {
        addNotification({ type: 'error', message: 'You cannot delete your own account.' });
        return;
    }
    const targetUser = users.find(u => u.id === id);
    if (targetUser?.role === 'admin' && currentUser?.role !== 'admin') {
        addNotification({ type: 'error', message: 'Access Denied: Cannot delete Administrator.' });
        return;
    }

    if (confirm(t('Are you sure you want to delete'))) {
      await deleteUser(id);
    }
  };

  return (
    <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('User Management')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {currentUser?.role === 'admin' 
                    ? 'Global Admin View'
                    : `${currentCount} / ${userLimit === 9999 ? '∞' : userLimit} users used in your plan`
                }
            </p>
        </div>
        <button
          onClick={handleAdd}
          className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors shadow-sm ${
              canAddUser 
              ? 'bg-primary text-white hover:bg-blue-700 hover:shadow-md' 
              : 'bg-primary text-white hover:bg-blue-700' // Keep active style for access denied click
          }`}
        >
            {canAddUser ? <Plus size={20} className="mr-2" /> : <Lock size={18} className="mr-2" />} 
            {t('Add User')}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder={t('Search placeholder')}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
            {isLoading && (
                <div className="col-span-full flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            )}
            {!isLoading && filteredUsers.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
                    {t('No users found')}
                </div>
            )}
            {filteredUsers.map((user) => (
                <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col relative overflow-hidden group"
                >
                    {/* Status Stripe */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        user.status === 'active' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}></div>

                    <div className="flex items-start justify-between mb-4 pl-3">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <img 
                                    src={user.avatar} 
                                    alt={user.name} 
                                    className="w-14 h-14 rounded-full bg-slate-200 object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                                />
                                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${
                                    user.status === 'active' ? 'bg-green-500' : 'bg-slate-400'
                                }`}></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{user.name}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize border
                                        ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800' :
                                          user.role === 'manager' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' :
                                          'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                                        }`}>
                                        {t(user.role)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Only allow edit/delete if not acting on a higher privilege role */}
                            {!(currentUser?.role !== 'admin' && user.role === 'admin') && (
                                <>
                                    <button 
                                        onClick={() => handleEdit(user)}
                                        className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(user.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-2.5 mt-2 pl-3">
                        <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                            <Mail size={15} className="mr-3 shrink-0 text-slate-400" />
                            <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                            <Phone size={15} className="mr-3 shrink-0 text-slate-400" />
                            <span className="truncate">{user.phone || 'N/A'}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          >
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-xl font-bold mb-4 dark:text-white">{editingUser ? t('Edit User') : t('Add User')}</h2>
              <UserForm 
                  onClose={() => setShowModal(false)} 
                  onSubmit={handleFormSubmit} 
                  initialData={editingUser || undefined}
                  isEditing={!!editingUser}
                  currentUserRole={currentUser?.role || 'staff'}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface UserFormProps {
    onClose: () => void;
    onSubmit: (data: Partial<UserType>) => void;
    initialData?: UserType;
    isEditing?: boolean;
    currentUserRole: 'admin' | 'manager' | 'staff';
}

const UserForm: React.FC<UserFormProps> = ({ onClose, onSubmit, initialData, isEditing, currentUserRole }) => {
  const { t } = useThemeStore();
  
  const userSchema = z.object({
    name: z.string().min(2, t('Name required')),
    email: z.string().email(t('Invalid email')),
    role: z.enum(['admin', 'manager', 'staff']),
    phone: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional()
  });

  type FormValues = z.infer<typeof userSchema>;
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: initialData ? {
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
        phone: initialData.phone,
        status: initialData.status || 'active'
    } : {
        name: '',
        email: '',
        role: 'staff',
        phone: '',
        status: 'active'
    }
  });

  const onValidSubmit = (data: FormValues) => {
    onSubmit(data as Partial<UserType>);
  };

  const inputBaseClass = "w-full border bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none transition-colors";
  const getInputClass = (hasError: boolean) => 
    `${inputBaseClass} ${hasError ? 'border-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-primary'}`;

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Name')}</label>
            <input 
                {...register('name')}
                className={getInputClass(!!errors.name)}
                placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Email')}</label>
            <input 
                type="email"
                {...register('email')}
                className={getInputClass(!!errors.email)}
                placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        
        <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Phone')}</label>
            <input 
                type="tel"
                {...register('phone')}
                className={getInputClass(!!errors.phone)}
                placeholder="+1 (555) 123-4567"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Role')}</label>
            <select 
                {...register('role')}
                className={getInputClass(!!errors.role)}
            >
                <option value="staff">{t('Staff')}</option>
                <option value="manager">{t('Manager')}</option>
                {/* Only Admin can assign Admin role */}
                {currentUserRole === 'admin' && <option value="admin">{t('Admin')}</option>}
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('Status')}</label>
            <select 
                {...register('status')}
                className={getInputClass(!!errors.status)}
            >
                <option value="active">{t('Active')}</option>
                <option value="inactive">{t('Inactive')}</option>
            </select>
        </div>
      </div>

      {currentUserRole !== 'admin' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-start space-x-2 text-xs text-blue-700 dark:text-blue-300">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <p>Managers can only create or edit Staff and Manager roles within their shop.</p>
          </div>
      )}

      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">{t('Cancel')}</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            {isEditing ? t('Edit User') : t('Add User')}
        </button>
      </div>
    </form>
  )
}

export default Users;
