'use client';

import { useRouter } from 'next/navigation';
import { User } from '@/app/types';
import { useState, useEffect, useRef } from 'react';
import { getNotificationRoute } from '@/app/lib/notificationRouter';
import { getApiUrl, getBaseUrl } from '@/app/lib/api';

interface Notification {
  id: number;
  judul: string;
  pesan: string;
  tipe: string;
  is_read: boolean;
  created_at: string;
}

interface UserHeaderProps {
  user?: User | null;
  title?: string;
  showBackButton?: boolean;
  showMenu?: boolean;
}

export default function UserHeader({ 
  user,
  title = 'Cendana Kost',
  showBackButton = false,
  showMenu = true
}: UserHeaderProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    fetchUnreadCount();
    
    // Listen for new notifications from NotificationProvider
    const handleNewNotification = () => {
      fetchUnreadCount();
      if (showNotifications) {
        fetchNotifications();
      }
    };

    window.addEventListener('newNotification', handleNewNotification);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Auto-refresh unread count every 10 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 10000);

    return () => {
      window.removeEventListener('newNotification', handleNewNotification);
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(interval);
    };
  }, [showNotifications]);

  const fetchUnreadCount = async () => {
    if (typeof window === 'undefined') return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const fetchNotifications = async () => {
    if (typeof window === 'undefined') return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

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
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationBellClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchNotifications();
    }
  };

  const markAsRead = async (id: number) => {
    if (typeof window === 'undefined') return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, is_read: true } : n
        ));
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Get user data for routing
    const userData = user || JSON.parse(localStorage.getItem('user') || '{}');
    
    // Navigate to appropriate page using router helper
    const url = getNotificationRoute(notification as any, userData);
    router.push(url);
    
    // Close dropdown
    setShowNotifications(false);
  };

  const getNotificationUrl = (tipe: string, notification?: Notification): string => {
    // Fallback function (kept for compatibility)
    const userData = user || JSON.parse(localStorage.getItem('user') || '{}');
    return getNotificationRoute({ tipe } as any, userData);
  };

  const markAllAsRead = async () => {
    if (typeof window === 'undefined') return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationIcon = (tipe: string) => {
    switch (tipe) {
      case 'Tagihan':
        return 'receipt_long';
      case 'Pembayaran':
        return 'payments';
      case 'Pesanan':
        return 'restaurant';
      default:
        return 'notifications';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };  const handleLogout = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Remove cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  return (
    <header className="bg-[#F7F9FB] dark:bg-[#191C1E] sticky top-0 z-40">
      <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 w-full">
        <div className="flex items-center gap-3 md:gap-4">
          {showBackButton ? (
            <button
              onClick={() => router.back()}
              className="text-[#4C4E50] active:scale-95 duration-150 transition-opacity hover:opacity-80"
            >
              <span className="material-symbols-outlined text-xl md:text-2xl">arrow_back</span>
            </button>
          ) : (
            <>
              <button className="md:hidden text-[#4C4E50] active:scale-95 duration-150 transition-opacity hover:opacity-80">
               
              </button>
              
            </>
          )}
          <h1 className="text-lg md:text-xl font-bold font-headline tracking-tight text-[#4C4E50] dark:text-[#E2E2E6]">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-6">
          {/* Desktop Nav */}
          {showMenu && (
            <nav className="hidden md:flex gap-8 items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-[#4C4E50] font-label text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/payments')}
                className="text-[#4C4E50] font-label text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Payments
              </button>
              <button
                onClick={() => router.push('/requests')}
                className="text-[#4C4E50] font-label text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Requests
              </button>
              <button
                onClick={() => router.push('/rules')}
                className="text-[#4C4E50] font-label text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Rules
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="text-[#4C4E50] font-label text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Profile
              </button>
            </nav>
          )}
          <div className="flex items-center gap-1 md:gap-2" ref={dropdownRef}>
            <div className="relative">
              <button 
                onClick={handleNotificationBellClick}
                className="p-1.5 md:p-2 rounded-full hover:bg-[#F2F4F6] dark:hover:bg-[#2E3133] transition-colors duration-300 scale-95 active:opacity-80 relative"
              >
                <span className="material-symbols-outlined text-[#4C4E50] dark:text-[#E2E2E6] text-xl md:text-2xl">
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/10 z-50 max-h-[500px] overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
                    <h3 className="font-headline font-bold text-primary">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-label font-bold text-secondary hover:opacity-70 transition-opacity"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="overflow-y-auto max-h-[400px]">
                    {loading ? (
                      <div className="p-8 text-center">
                        <p className="text-on-surface-variant text-sm">Loading...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-5xl text-outline-variant mb-2">notifications_off</span>
                        <p className="text-on-surface-variant text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-4 border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors cursor-pointer ${
                            !notif.is_read ? 'bg-secondary/5' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              notif.tipe === 'Tagihan' ? 'bg-error/10' :
                              notif.tipe === 'Pembayaran' ? 'bg-secondary/10' :
                              'bg-tertiary/10'
                            }`}>
                              <span className={`material-symbols-outlined text-lg ${
                                notif.tipe === 'Tagihan' ? 'text-error' :
                                notif.tipe === 'Pembayaran' ? 'text-secondary' :
                                'text-tertiary'
                              }`}>
                                {getNotificationIcon(notif.tipe)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-headline font-bold text-sm text-primary truncate">
                                  {notif.judul}
                                </h4>
                                {!notif.is_read && (
                                  <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-1"></div>
                                )}
                              </div>
                              <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                                {notif.pesan}
                              </p>
                              <p className="text-[10px] text-outline font-label mt-1">
                                {getTimeAgo(notif.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className="md:hidden p-1.5 rounded-full hover:bg-[#F2F4F6] dark:hover:bg-[#2E3133] transition-colors duration-300 scale-95 active:opacity-80"
              title="Logout"
            >
              <span className="material-symbols-outlined text-[#4C4E50] dark:text-[#E2E2E6] text-xl">
                logout
              </span>
            </button>

            {/* Desktop Only - Logout and Profile */}
            <button
              onClick={handleLogout}
              className="hidden md:block p-1.5 md:p-2 rounded-full hover:bg-[#F2F4F6] dark:hover:bg-[#2E3133] transition-colors duration-300 scale-95 active:opacity-80"
            >
              <span className="material-symbols-outlined text-[#4C4E50] dark:text-[#E2E2E6] text-xl md:text-2xl">
                logout
              </span>
            </button>
            <div className="hidden md:block w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden ring-2 ring-outline-variant/15">
              <img
                alt="User Profile"
                className="w-full h-full object-cover"
                src={
                  user?.foto_penghuni
                    ? `${getBaseUrl()}/storage/${user.foto_penghuni}`
                    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUe_fqSs_mEXImBn1Td_tce-oeWCz2RBOuzeAboY3q2ZSX3x1uhrrYkxyULXIOX-K8gQ7Gwf_Fewm-Dv05BdoAqlylRvBeuzeOje2aH2__JR3wjlyUbdLvM57eBZW52YNy7NHprIBSPZdV0nAq9pgCb4ALVjfkw_NqusJdPlOsrujJK-1utnB_yWit4dwKrwmjHjTlCZQAjqxk3wcTGByTJZPI6r1j8XXvOCoUDWUFX7jxjK0OPESkDug1XkKIWMg9cYssyxUnL40'
                }
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
