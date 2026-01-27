import { useState, useEffect, useCallback } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  isEnabled: boolean;
  permission: NotificationPermission | 'default';
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isEnabled: false,
    permission: 'default'
  });
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      
      if (isSupported) {
        // Register service worker
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          setRegistration(reg);
          console.log('Service Worker registered');
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }

      setState(prev => ({
        ...prev,
        isSupported,
        permission: isSupported ? Notification.permission : 'default',
        isEnabled: isSupported && Notification.permission === 'granted'
      }));
    };

    checkSupport();
  }, []);

  // Request permission for notifications
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission,
        isEnabled: permission === 'granted'
      }));

      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [state.isSupported]);

  // Send a local notification (for when the app triggers it)
  const sendNotification = useCallback(async (title: string, body: string, data?: Record<string, unknown>) => {
    if (!state.isEnabled || !registration) {
      console.warn('Notifications not enabled or service worker not ready');
      return false;
    }

    try {
      // Use service worker notification API which supports more options
      await registration.showNotification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'low-voltage-alert',
        renotify: true,
        requireInteraction: true,
        data
      } as NotificationOptions);
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }, [state.isEnabled, registration]);

  // Send low voltage alert notification
  const sendLowVoltageAlert = useCallback(async (voltage: number) => {
    return sendNotification(
      '⚠️ Alerta de Bajo Voltaje',
      `El panel solar está a ${voltage.toFixed(1)}V (mínimo recomendado: 50V)`,
      { voltage, timestamp: Date.now() }
    );
  }, [sendNotification]);

  return {
    isSupported: state.isSupported,
    isEnabled: state.isEnabled,
    permission: state.permission,
    requestPermission,
    sendNotification,
    sendLowVoltageAlert
  };
};
