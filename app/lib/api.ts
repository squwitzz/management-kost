// Get API URL from environment variable
// This will automatically use the correct URL based on the environment:
// - Local development: uses .env.local (can be ngrok or cPanel)
// - Production (Vercel): uses .env.production (cPanel HTTPS)
export const getApiUrl = () => {
  // Force HTTPS for production (Vercel)
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://mykost-cendana.xyz/api';
  }

  // Use environment variable or fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
};

// Get base URL without /api suffix for storage URLs
export const getBaseUrl = () => {
  const apiUrl = getApiUrl();
  return apiUrl.replace('/api', '');
};

// Safe image retrieval that bypasses cPanel Nginx static block
export const getImageUrl = (path: string | undefined | null) => {
  if (!path) return 'https://via.placeholder.com/150';
  
  // If it's already a full URL, return it
  if (path.startsWith('http')) return path;
  
  // Remove common prefixes if they exist
  let cleanPath = path;
  if (cleanPath.startsWith('storage/')) {
    cleanPath = cleanPath.replace('storage/', '');
  }
  if (cleanPath.startsWith('public/')) {
    cleanPath = cleanPath.replace('public/', '');
  }
  
  return `${getBaseUrl()}/image?file=${cleanPath}`;
};

const API_URL = getApiUrl();

// Handle session expiration
const handleUnauthorized = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Remove cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/login';
  }
};

// Enhanced fetch wrapper with mobile data support
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // Add headers for mobile data compatibility
  const enhancedOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    // Disable cache for mobile data
    cache: 'no-store' as RequestCache,
    // Add credentials for CORS
    credentials: 'include' as RequestCredentials,
  };

  try {
    const response = await fetch(url, enhancedOptions);

    // Check for 401 Unauthorized
    if (response.status === 401) {
      try {
        const errorData = await response.clone().json();
        console.error('Auth error:', errorData);
      } catch (e) {
        // Ignore JSON parse errors
      }

      handleUnauthorized();
      throw new Error('Session expired. Please login again.');
    }

    return response;
  } catch (error) {
    // Enhanced error handling for mobile data
    if (error instanceof TypeError) {
      console.error('Network error:', error);
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    }
    throw error;
  }
};

export class ApiClient {
  private static getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    };

    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  static async login(nomor_telepon: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ nomor_telepon, password }),
        cache: 'no-store' as RequestCache,
        credentials: 'include' as RequestCredentials,
      });

      // Handle 404 - backend not properly configured
      if (response.status === 404) {
        throw new Error('Backend belum dikonfigurasi dengan benar di cPanel. Silakan ikuti panduan di CPANEL_BACKEND_SETUP.md atau gunakan ngrok untuk development.');
      }

      // Handle other HTTP errors
      if (!response.ok) {
        let errorMessage = 'Login gagal';
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      // Network error (cannot connect to server)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Tidak dapat terhubung ke server. Periksa koneksi internet atau pastikan backend berjalan.`);
      }
      throw error;
    }
  }

  static async getMe() {
    const response = await fetchWithAuth(`${API_URL}/me`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return response.json();
  }

  static async logout() {
    const response = await fetchWithAuth(`${API_URL}/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return response.json();
  }

  static async getPayments() {
    const response = await fetchWithAuth(`${API_URL}/payments`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }

    return response.json();
  }

  static async uploadBuktiBayar(paymentId: number, file: File) {
    const formData = new FormData();
    formData.append('payment_id', paymentId.toString());
    formData.append('bukti_bayar', file);

    const token = localStorage.getItem('token');
    const response = await fetchWithAuth(`${API_URL}/payments/upload-bukti`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Bypass Ngrok warning for mobile
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload gagal');
    }

    return response.json();
  }

  static async getFoodItems() {
    const response = await fetchWithAuth(`${API_URL}/food-items`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch food items');
    }

    return response.json();
  }

  static async createFoodOrder(foodId: number, jumlah: number, catatan?: string) {
    const response = await fetchWithAuth(`${API_URL}/food-orders`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ food_id: foodId, jumlah, catatan }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Gagal membuat pesanan');
    }

    return response.json();
  }

  static async getFoodOrders() {
    const response = await fetchWithAuth(`${API_URL}/food-orders`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch food orders');
    }

    return response.json();
  }

  static async getNotifications() {
    const response = await fetchWithAuth(`${API_URL}/notifications`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return response.json();
  }

  static async getUnreadCount() {
    const response = await fetchWithAuth(`${API_URL}/notifications/unread-count`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }

    return response.json();
  }

  static async markNotificationAsRead(id: number) {
    const response = await fetchWithAuth(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });

    return response.json();
  }

  static async updateProfile(data: { nama?: string; email?: string; nomor_telepon?: string }) {
    const endpoints = [
      { url: `${API_URL}/profile/update`, method: 'POST' },
      { url: `${API_URL}/profile`, method: 'PUT' },
      { url: `${API_URL}/profile`, method: 'POST' },
    ];

    let lastError: Error = new Error('Failed to update profile');

    for (const endpoint of endpoints) {
      try {
        const response = await fetchWithAuth(endpoint.url, {
          method: endpoint.method,
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          return response.json();
        }

        const errorBody = await response.json().catch(() => ({}));
        lastError = new Error(
          errorBody.message || errorBody.error || `HTTP ${response.status}`
        );

        // If 404, try next endpoint; otherwise break
        if (response.status !== 404 && response.status !== 405) {
          throw lastError;
        }
      } catch (err: any) {
        if (err.message && !err.message.includes('HTTP 404') && !err.message.includes('HTTP 405')) {
          throw err;
        }
        lastError = err;
      }
    }

    throw lastError;
  }

  static async changePassword(data: { current_password: string; new_password: string; new_password_confirmation: string }) {
    const response = await fetchWithAuth(`${API_URL}/change-password`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }

    return response.json();
  }

  // Resident Management
  static async deleteResident(userId: number) {
    const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete resident');
    }

    return response.json();
  }

  static async getResident(userId: number) {
    const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch resident');
    }

    return response.json();
  }

  static async updateResident(userId: number, data: any) {
    const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update resident');
    }

    return response.json();
  }

  // Assign room to resident (Admin only)
  static async assignRoom(userId: number, roomId: number) {
    const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}/assign-room`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ room_id: roomId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'Failed to assign room');
    }

    return response.json();
  }

  // Room Management
  static async getRooms() {
    const timestamp = new Date().getTime();
    const response = await fetchWithAuth(`${API_URL}/rooms?_t=${timestamp}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch rooms');
    }

    const json = await response.json();
    // Normalize: ensure `rooms` key exists
    if (!json.rooms && (json.data || Array.isArray(json))) {
      json.rooms = json.data || json;
    }
    return json;
  }

  static async getRoom(roomId: number) {
    const response = await fetchWithAuth(`${API_URL}/rooms/${roomId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch room');
    }

    return response.json();
  }

  static async createRoom(data: { nomor_kamar: string; tarif_dasar: number; status?: string }) {
    const response = await fetchWithAuth(`${API_URL}/rooms`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to create room');
    }

    return response.json();
  }

  static async deleteRoom(roomId: number) {
    const response = await fetchWithAuth(`${API_URL}/rooms/${roomId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete room');
    }

    return response.json();
  }

  // Rules Management
  static async getRules() {
    const response = await fetchWithAuth(`${API_URL}/peraturan`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch rules');
    }

    const json = await response.json();
    // Normalize: ensure `peraturan` key exists
    if (!json.peraturan && (json.data || Array.isArray(json))) {
      json.peraturan = json.data || json;
    }
    return json;
  }

  static async createRule(data: { judul: string; deskripsi: string }) {
    const response = await fetchWithAuth(`${API_URL}/peraturan`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create rule');
    }

    return response.json();
  }

  static async updateRule(ruleId: number, data: { judul: string; deskripsi: string }) {
    const response = await fetchWithAuth(`${API_URL}/peraturan/${ruleId}`, {
      method: 'PUT',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update rule');
    }

    return response.json();
  }

  static async deleteRule(ruleId: number) {
    const response = await fetchWithAuth(`${API_URL}/peraturan/${ruleId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete rule');
    }

    return response.json();
  }

  // Maintenance Requests
  static async getMaintenanceRequests() {
    const response = await fetchWithAuth(`${API_URL}/maintenance-requests`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch maintenance requests');
    }

    return response.json();
  }

  static async getMaintenanceRequest(requestId: number) {
    const response = await fetchWithAuth(`${API_URL}/maintenance-requests/${requestId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch maintenance request');
    }

    return response.json();
  }

  static async createMaintenanceRequest(data: FormData) {
    const token = localStorage.getItem('token');
    const response = await fetchWithAuth(`${API_URL}/maintenance-requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: data,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create maintenance request');
    }

    return response.json();
  }

  static async updateMaintenanceRequestStatus(requestId: number, updates: any) {
    const response = await fetchWithAuth(`${API_URL}/maintenance-requests/${requestId}`, {
      method: 'PUT',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update request status');
    }

    return response.json();
  }

  // Admin Dashboard
  static async getAdminDashboard() {
    const response = await fetchWithAuth(`${API_URL}/admin/dashboard`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch dashboard data');
    }

    return response.json();
  }

  // User Dashboard
  static async getUserDashboard() {
    const response = await fetchWithAuth(`${API_URL}/dashboard`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch dashboard data');
    }

    return response.json();
  }

  // Residents (Admin)
  static async getResidents() {
    const response = await fetchWithAuth(`${API_URL}/admin/residents`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch residents');
    }

    return response.json();
  }

  static async registerResident(data: any) {
    const response = await fetchWithAuth(`${API_URL}/admin/register-resident`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register resident');
    }

    return response.json();
  }

  // Admin Payments
  static async getAdminPayments() {
    const response = await fetchWithAuth(`${API_URL}/payments`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch payments');
    }

    const json = await response.json();
    // Normalize: ensure `payments` key exists
    if (!json.payments && (json.data || Array.isArray(json))) {
      json.payments = json.data || json;
    }
    return json;
  }

  static async getPayment(paymentId: number) {
    console.log('Fetching payment:', paymentId);
    const response = await fetchWithAuth(`${API_URL}/payments/${paymentId}`, {
      headers: this.getHeaders(),
    });

    console.log('Payment response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch payment' }));
      console.error('Payment fetch error:', error);
      throw new Error(error.error || error.message || 'Failed to fetch payment');
    }

    const data = await response.json();
    console.log('Payment data received:', data);
    return data;
  }

  static async updatePaymentStatus(paymentId: number, status: string) {
    const response = await fetchWithAuth(`${API_URL}/admin/payments/${paymentId}/status`, {
      method: 'PUT',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update payment status');
    }

    return response.json();
  }

  static async generatePayments(data: any) {
    const response = await fetchWithAuth(`${API_URL}/admin/payments/generate`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate payments');
    }

    return response.json();
  }

  static async getPaymentSettings() {
    const response = await fetchWithAuth(`${API_URL}/admin/payment-settings`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch payment settings');
    }

    return response.json();
  }

  static async updatePaymentSettings(data: any) {
    const response = await fetchWithAuth(`${API_URL}/admin/payment-settings`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update payment settings');
    }

    return response.json();
  }
}
