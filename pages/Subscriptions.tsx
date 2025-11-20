import React, { useState } from 'react';
import { Check, Clock, X, Shield, Zap, Star } from 'lucide-react';
import { SubscriptionPlan, SubscriptionTier } from '../types';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';

interface DetailedPlan extends SubscriptionPlan {
  longDescription: string;
  idealFor: string;
  tier: SubscriptionTier;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 50 }
  }
};

const Subscriptions: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<DetailedPlan | null>(null);
  const { t } = useThemeStore();
  const { user, setSubscription } = useAuthStore();

  // Data defined inside component to use 't'
  const PLANS: DetailedPlan[] = [
    { 
      id: '1', 
      tier: 'starter',
      name: t('Starter'), 
      price: 0, 
      durationMonths: 1, 
      features: [t('Basic Dashboard'), t('Inventory Management'), t('Standard Support'), t('1 Admin User')], 
      longDescription: t('Starter Desc'),
      idealFor: t('Ideal Small'),
    },
    { 
      id: '2', 
      tier: 'pro',
      name: t('Pro Growth'), 
      price: 79, 
      durationMonths: 1, 
      features: [t('Everything in Starter'), t('Installment Management'), t('Customer CRM'), t('Advanced Analytics'), t('Email Support')], 
      longDescription: t('Pro Desc'),
      idealFor: t('Ideal Growing'),
    },
    { 
      id: '3', 
      tier: 'enterprise',
      name: t('Enterprise AI'), 
      price: 299, 
      durationMonths: 1, 
      features: [t('Everything in Pro'), t('Gemini 3 Pro AI Assistant'), t('Image Generation Studio'), t('Unlimited AI Tokens'), t('Priority 24/7 Support')], 
      longDescription: t('Enterprise Desc'),
      idealFor: t('Ideal Enterprise'),
    },
  ];

  const handleSubscribe = (tier: SubscriptionTier) => {
    setSubscription(tier);
    setSelectedPlan(null);
  };

  return (
    <motion.div 
        className="space-y-8 relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      <div className="text-center max-w-2xl mx-auto">
        <motion.h1 variants={cardVariants} className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('Choose your plan')}</motion.h1>
        <motion.p variants={cardVariants} className="text-slate-600 dark:text-slate-400">{t('Manage your shop')}</motion.p>
        
        <motion.div variants={cardVariants} className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 inline-flex items-center space-x-3">
          <Star className="text-yellow-500 fill-yellow-500" />
          <span className="font-medium text-blue-900 dark:text-blue-300">{t('Current Plan Label')} <span className="capitalize font-bold">{user?.plan}</span></span>
        </motion.div>
      </div>

      <motion.div variants={containerVariants} className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {PLANS.map((plan) => {
          const isCurrent = user?.plan === plan.tier;
          return (
            <motion.div 
              key={plan.id}
              variants={cardVariants}
              whileHover={{ y: -12, transition: { duration: 0.2 } }}
              className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border p-8 flex flex-col transition-all relative overflow-hidden group ${
                isCurrent 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'border-slate-200 dark:border-slate-700 hover:border-primary hover:shadow-xl'
              }`}
            >
               {plan.tier === 'enterprise' && (
                   <div className="absolute top-0 right-0 bg-gradient-to-bl from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">{t('AI POWERED')}</div>
               )}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">${plan.price}</span>
                <span className="text-slate-500 dark:text-slate-400">/mo</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-slate-600 dark:text-slate-300">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                {isCurrent ? (
                   <button disabled className="w-full py-3 rounded-xl font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default flex items-center justify-center">
                     <Check className="mr-2 h-5 w-5" /> {t('Active Plan')}
                   </button>
                ) : (
                  <button 
                    onClick={() => handleSubscribe(plan.tier)}
                    className={`w-full py-3 rounded-xl font-bold transition-colors ${
                      plan.tier === 'enterprise'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200' 
                      : 'bg-primary text-white hover:bg-blue-700'
                    }`}
                  >
                    {t('Switch to')} {plan.name}
                  </button>
                )}
                <button 
                    onClick={() => setSelectedPlan(plan)}
                    className="w-full py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                    {t('View Details')}
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Plan Details Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ margin: 0 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlan(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{selectedPlan.name}</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{selectedPlan.idealFor}</p>
                </div>
                <button 
                    onClick={() => setSelectedPlan(null)}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
                >
                    <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className="flex items-baseline mb-6">
                    <span className="text-5xl font-extrabold text-slate-900 dark:text-white">${selectedPlan.price}</span>
                    <span className="text-xl text-slate-500 dark:text-slate-400 ml-2">/mo</span>
                </div>

                <p className="text-lg text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">
                    {selectedPlan.longDescription}
                </p>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                    <Zap size={16} className="mr-2 text-primary" />
                    {t('Included Features')}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {selectedPlan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            <Check className="h-5 w-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-200 font-medium">{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm">{t('Enterprise Security')}</h4>
                        <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">{t('Security Desc')}</p>
                    </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end space-x-4">
                <button 
                    onClick={() => setSelectedPlan(null)}
                    className="px-6 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                    {t('Close')}
                </button>
                {user?.plan !== selectedPlan.tier && (
                    <button 
                        onClick={() => handleSubscribe(selectedPlan.tier)}
                        className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105"
                    >
                        {t('Switch to')} {selectedPlan.name}
                    </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Subscriptions;