// Service Worker for EcoCambio Push Notifications

const CACHE_NAME = 'ecocambio-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  let data = {
    title: 'Alerta de Bajo Voltaje',
    body: 'El panel solar está generando menos energía de lo esperado',
    voltage: null
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'low-voltage-alert',
    renotify: true,
    requireInteraction: true,
    data: {
      voltage: data.voltage,
      timestamp: Date.now()
    },
    actions: [
      { action: 'view', title: 'Ver Dashboard' },
      { action: 'dismiss', title: 'Cerrar' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked');
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
