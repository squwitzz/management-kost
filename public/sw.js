// Service Worker for Push Notifications and Offline Support

const CACHE_NAME = 'kost-app-v3'; // Updated version to force refresh
const urlsToCache = [
  '/',
  '/login',
  '/dashboard',
  '/payments',
  '/requests',
  '/profile',
];

// Install Service Worker - skip waiting for faster activation
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch with network-first strategy for better refresh performance
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // CRITICAL: Skip service worker completely for:
  // 1. API requests (any URL with /api/)
  // 2. Backend server (port 8000)
  // 3. External domains (not same origin)
  if (url.pathname.includes('/api/') || 
      url.port === '8000' || 
      url.hostname === '127.0.0.1' ||
      url.hostname === 'localhost' ||
      url.origin !== self.location.origin) {
    // Don't intercept - let browser handle normally
    return;
  }

  // Skip service worker for non-GET requests (POST, PUT, DELETE, etc)
  if (event.request.method !== 'GET') {
    return;
  }

  // Only handle GET requests for same-origin static assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed - try cache for static assets only
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return a basic offline response
          return new Response('Offline - No cached version available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});

// Activate Service Worker - claim clients immediately
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all([
        ...cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
        self.clients.claim() // Take control immediately
      ]);
    })
  );
});

// Push Notification
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Kost App Notification';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'notification',
    requireInteraction: false,
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: 'open',
        title: 'Open',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    // User clicked close, do nothing
    return;
  }

  // Get URL from notification data
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => {
      // Check if there's already a window open with the app
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        const clientUrl = new URL(client.url);
        const targetUrl = new URL(urlToOpen, client.url);
        
        // If same origin, navigate and focus
        if (clientUrl.origin === targetUrl.origin && 'focus' in client) {
          return client.focus().then(() => {
            // Navigate to the notification URL
            return client.navigate(targetUrl.href);
          });
        }
      }
      
      // If no window open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
