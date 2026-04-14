'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if running on client
    if (typeof window === 'undefined') return;

    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        
        // Redirect based on role
        if (user.role === 'Admin') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/dashboard');
        }
      } catch (error) {
        // If parsing fails, clear storage and go to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
      }
    } else {
      // No token or user data, go to login
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-on-surface-variant font-label text-sm">Loading...</p>
      </div>
    </div>
  );
}
