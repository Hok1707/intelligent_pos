import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';

const EVENTS = [
  {
    type: 'warning',
    title: 'Low Stock Alert',
    message: 'Samsung S24 Ultra inventory is below 3 units.'
  },
  {
    type: 'info',
    title: 'Upcoming Installment',
    message: 'Payment of $89.99 due tomorrow for Customer: John Doe.'
  },
  {
    type: 'success',
    title: 'New Subscription',
    message: 'New user registered for "Quarterly Pro" plan.'
  },
  {
    type: 'info',
    title: 'System Update',
    message: 'Daily backup completed successfully.'
  },
  {
    type: 'warning',
    title: 'Installment Overdue',
    message: 'Mike Johnson missed payment for Pixel 8.'
  },
  {
    type: 'success',
    title: 'Stock Replenished',
    message: 'Shipment of iPhone 15 Pro accessories arrived.'
  }
] as const;

export const useSimulation = (isActive: boolean) => {
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!isActive) return;

    // Trigger an initial event shortly after load for demo purposes
    const initialTimeout = setTimeout(() => {
      addNotification({
        type: 'info',
        title: 'System Online',
        message: 'Real-time monitoring services connected.'
      });
    }, 3000);

    // Random event interval
    const interval = setInterval(() => {
      // 40% chance to trigger an event every 12 seconds
      if (Math.random() > 0.6) {
        const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        addNotification({
          type: randomEvent.type,
          title: randomEvent.title,
          message: randomEvent.message
        });
      }
    }, 12000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isActive, addNotification]);
};