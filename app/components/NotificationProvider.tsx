'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  registerServiceWorker, 
  requestNotificationPermission,
  showNotification,
  subscribeToPushNotifications
} from '@/app/lib/notifications';
import { usePageVisibility } from '@/app/lib/useRealtime';
import { getNotificationRoute } from '@/app/lib/notificationRouter';
import { getApiUrl } from '@/app/lib/api';

export default function NotificationProvider() {
  const pathname = usePathname();
  const isVisible = usePageVisibility();
  const [isRegistered, setIsRegistered] = useState(false);
  const [lastNotificationId, setLastNotificationId] = useState<number>(0);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Defer service worker registration to avoid blocking initial load
    const timer = setTimeout(() => {
      const initServiceWorker = async () => {
        const reg = await registerServiceWorker();
        if (reg) {
          setRegistration(reg);
          setIsRegistered(true);
          console.log('Service Worker registered');
        }
      };

      initServiceWorker();
    }, 2000); // Wait 2 seconds after page load

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Request notification permission and subscribe to push after user is logged in
    if (typeof window === 'undefined' || !registration) return;
    
    const token = localStorage.getItem('token');
    if (token && isRegistered) {
      requestNotificationPermission().then(async (granted) => {
        if (granted) {
          console.log('Notification permission granted');
          
          // Subscribe to push notifications
          const API_URL = getApiUrl();
          const subscribed = await subscribeToPushNotifications(registration, API_URL, token);
          if (subscribed) {
            console.log('Subscribed to push notifications');
          }
        }
      });
    }
  }, [isRegistered, registration, pathname]);

  useEffect(() => {
    if (!isVisible || !isRegistered) return;

    // Poll for new notifications every 10 seconds when tab is visible
    const interval = setInterval(async () => {
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const API_URL = getApiUrl();
        const response = await fetch(`${API_URL}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const notifications = data.notifications || [];
          
          // Get the latest unread notification
          const latestUnread = notifications.find((n: any) => !n.is_read);
          
          if (latestUnread && latestUnread.id !== lastNotificationId) {
            // New notification detected
            setLastNotificationId(latestUnread.id);
            
            // Show browser notification
            const userData = JSON.parse(localStorage.getItem('user') || '{"role":"Penghuni"}');
            const notificationUrl = getNotificationRoute(latestUnread, userData);
            
            showNotification(latestUnread.judul, {
              body: latestUnread.pesan,
              tag: `notification-${latestUnread.id}`,
              data: {
                url: notificationUrl,
              },
            });

            // Dispatch custom event for components to update
            window.dispatchEvent(new CustomEvent('newNotification', {
              detail: latestUnread
            }));
          }
        }
      } catch (error) {
        console.error('Failed to check notifications:', error);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isVisible, isRegistered, lastNotificationId]);

  return null;
}
