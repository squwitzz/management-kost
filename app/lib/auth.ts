/**
 * Authentication helper functions
 */

export interface AuthUser {
  id: number;
  nama: string;
  email: string;
  role: 'Admin' | 'Penghuni';
  nomor_telepon: string;
  room_id?: number;
  room?: any;
}

/**
 * Check if user is authenticated and has valid session
 * Returns user data if authenticated, null otherwise
 * Also validates JSON parsing
 */
export const checkAuth = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (!token || !userData) {
    return null;
  }

  try {
    const user = JSON.parse(userData);
    return user;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    // Clear corrupted data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
};

/**
 * Clear authentication data and redirect to login
 */
export const clearAuthAndRedirect = () => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  
  window.location.href = '/login';
};

/**
 * Check if user is admin
 */
export const isAdmin = (user: AuthUser | null): boolean => {
  return user?.role === 'Admin';
};

/**
 * Check if user is resident (Penghuni)
 */
export const isResident = (user: AuthUser | null): boolean => {
  return user?.role === 'Penghuni';
};

/**
 * Require authentication - redirect to login if not authenticated
 * Returns user data if authenticated
 * This is the safest way to check auth - always redirects to login if no valid session
 */
export const requireAuth = (): AuthUser | null => {
  const user = checkAuth();
  
  if (!user) {
    clearAuthAndRedirect();
    return null;
  }
  
  return user;
};

/**
 * Require admin role - redirect to login if not authenticated, to user dashboard if not admin
 * Returns user data if admin
 */
export const requireAdmin = (): AuthUser | null => {
  const user = checkAuth();
  
  // No auth data - redirect to login
  if (!user) {
    clearAuthAndRedirect();
    return null;
  }
  
  // Has auth but not admin - redirect to user dashboard
  if (!isAdmin(user)) {
    window.location.href = '/dashboard';
    return null;
  }
  
  return user;
};

/**
 * Require resident role - redirect to login if not authenticated, to admin dashboard if not resident
 * Returns user data if resident
 */
export const requireResident = (): AuthUser | null => {
  const user = checkAuth();
  
  // No auth data - redirect to login
  if (!user) {
    clearAuthAndRedirect();
    return null;
  }
  
  // Has auth but not resident - redirect to admin dashboard
  if (!isResident(user)) {
    window.location.href = '/admin/dashboard';
    return null;
  }
  
  return user;
};
