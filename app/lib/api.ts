// Get API URL from environment variable
// This will automatically use the correct URL based on the environment:
// - Local development: uses .env.local (can be ngrok or cPanel)
// - Production (Vercel): uses .env.production (cPanel HTTPS)
const getApiUrl = () => {
  // Force HTTPS for production (Vercel)
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://mykost-cendana.xyz/api';
  }
  
  // Use environment variable or fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
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

// Fetch wrapper with auth handling
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);
  
  // Check for 401 Unauthorized
  if (response.status === 401) {
    // Get error message first
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
};

export class ApiClient {
  private static getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true', // Bypass Ngrok warning page for mobile
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
          'ngrok-skip-browser-warning': 'true', // Bypass Ngrok warning for mobile
        },
        body: JSON.stringify({ nomor_telepon, password }),
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
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      // Network error (cannot connect to server)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Tidak dapat terhubung ke server di ${API_URL}. Pastikan backend berjalan atau ganti ke ngrok di .env.local`);
      }
      // Re-throw other errors (including our custom errors above)
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
    const response = await fetchWithAuth(`${API_URL}/profile/update`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    return response.json();
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
}
