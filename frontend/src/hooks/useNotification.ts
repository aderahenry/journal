import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (notifications.length > 0) {
      const notification = notifications[0];
      const duration = notification.duration || 5000;

      const timer = setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const showNotification = (
    message: string,
    type: Notification['type'] = 'info',
    duration?: number
  ) => {
    const id = Math.random().toString(36).substring(7);
    const notification: Notification = {
      id,
      message,
      type,
      duration,
    };

    setNotifications((prev) => [...prev, notification]);
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    showNotification,
    clearNotification,
    clearAllNotifications,
  };
}; 