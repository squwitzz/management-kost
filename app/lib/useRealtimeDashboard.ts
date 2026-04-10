import { useEffect, useState } from 'react';
import { usePageVisibility } from './useRealtime';

/**
 * Custom hook for real-time dashboard data
 * Auto-refreshes when tab is visible
 */
export function useRealtimeDashboard(userId?: number, roomId?: number) {
  const isVisible = usePageVisibility();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);

      // Fetch room data
      let roomData = null;
      if (roomId) {
        const roomResponse = await fetch(`http://127.0.0.1:8000/api/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        if (roomResponse.ok) {
          const roomResult = await roomResponse.json();
          roomData = roomResult.room;
        }
      }

      // Fetch payments data
      let paymentsData = [];
      if (userId) {
        const paymentsResponse = await fetch('http://127.0.0.1:8000/api/payments', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        if (paymentsResponse.ok) {
          const paymentsResult = await paymentsResponse.json();
          paymentsData = paymentsResult.payments.filter((p: any) => p.user_id === userId);
        }
      }

      setData({
        room: roomData,
        payments: paymentsData,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isVisible) return;

    // Initial fetch
    fetchDashboardData();

    // Auto-refresh every 15 seconds when tab is visible
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 15000);

    return () => clearInterval(interval);
  }, [isVisible, userId, roomId]);

  return { data, loading, refetch: fetchDashboardData };
}
