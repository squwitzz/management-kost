import { useEffect, useRef, useState } from 'react';

interface UseRealtimeOptions {
  interval?: number; // in milliseconds
  enabled?: boolean;
  onUpdate?: () => void;
}

/**
 * Hook for real-time data updates
 * Auto-fetches data at specified intervals
 */
export function useRealtime<T>(
  fetchFunction: () => Promise<T>,
  options: UseRealtimeOptions = {}
) {
  const {
    interval = 5000, // Default 5 seconds
    enabled = true,
    onUpdate,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchData = async () => {
    try {
      const result = await fetchFunction();
      if (isMountedRef.current) {
        setData(result);
        setError(null);
        onUpdate?.();
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) {
      return;
    }

    // Initial fetch
    fetchData();

    // Setup interval for real-time updates
    intervalRef.current = setInterval(() => {
      fetchData();
    }, interval);

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}

/**
 * Hook for real-time notification count
 */
export function useRealtimeNotifications(interval: number = 10000) {
  const fetchNotifications = async () => {
    if (typeof window === 'undefined') return { count: 0, notifications: [] };

    const token = localStorage.getItem('token');
    if (!token) return { count: 0, notifications: [] };

    try {
      const [countRes, notifRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/notifications/unread-count', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }),
        fetch('http://127.0.0.1:8000/api/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }),
      ]);

      const countData = await countRes.json();
      const notifData = await notifRes.json();

      return {
        count: countData.unread_count || 0,
        notifications: notifData.notifications || [],
      };
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return { count: 0, notifications: [] };
    }
  };

  return useRealtime(fetchNotifications, { interval });
}

/**
 * Hook for real-time payments data
 */
export function useRealtimePayments(userId?: number, interval: number = 15000) {
  const fetchPayments = async () => {
    if (typeof window === 'undefined') return [];

    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
      const response = await fetch('http://127.0.0.1:8000/api/payments', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const payments = data.payments || [];
        
        // Filter by userId if provided
        if (userId) {
          return payments.filter((p: any) => p.user_id === userId);
        }
        
        return payments;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      return [];
    }
  };

  return useRealtime(fetchPayments, { interval });
}

/**
 * Hook for real-time maintenance requests
 */
export function useRealtimeRequests(interval: number = 15000) {
  const fetchRequests = async () => {
    if (typeof window === 'undefined') return [];

    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
      const response = await fetch('http://127.0.0.1:8000/api/maintenance-requests', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.requests || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      return [];
    }
  };

  return useRealtime(fetchRequests, { interval });
}

/**
 * Hook for visibility change detection
 * Pauses updates when tab is not visible
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
