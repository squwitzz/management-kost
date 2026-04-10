'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(requiredRole?: 'Admin' | 'Penghuni') {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        router.push('/login');
        return;
      }

      try {
        const userData = JSON.parse(userStr);
        
        // Check role if required
        if (requiredRole && userData.role !== requiredRole) {
          router.push('/login');
          return;
        }

        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  return { isAuthenticated, isLoading, user };
}
