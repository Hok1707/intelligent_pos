import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useNotificationStore, Notification } from '../store/notificationStore';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-orange-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const borderColors = {
  success: 'border-green-500',
  error: 'border-red-500',
  warning: 'border-orange-500',
  info: 'border-blue-500',
};

const ToastItem: React.FC<{ notification: Notification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className={`flex items-start p-4 mb-3 bg-white rounded-lg shadow-lg border-l-4 ${borderColors[notification.type]} w-80 md:w-96 relative pointer-events-auto`}
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {icons[notification.type]}
      </div>
      <div className="flex-1 mr-2">
        {notification.title && (
          <h4 className="text-sm font-bold text-slate-900 mb-1">{notification.title}</h4>
        )}
        <p className="text-sm text-slate-600 leading-tight">{notification.message}</p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors absolute top-2 right-2"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <ToastItem
            key={notification.id}
            notification={notification}
            onDismiss={removeNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;