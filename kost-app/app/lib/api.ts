// Get API URL from environment variable
const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
};

const API_URL = getApiUrl();

export class ApiClient {
  private static getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/json',
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
        },
        body: JSON.stringify({ nomor_telepon, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login gagal');
      }

      return response.json();
    } catch (error) {
      // Better error handling for network issues
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan di http://127.0.0.1:8000');
      }
      throw error;
    }
  }

  static async getMe() {
    const response = await fetch(`${API_URL}/me`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return response.json();
  }

  static async logout() {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return response.json();
  }

  static async getPayments() {
    const response = await fetch(`${API_URL}/payments`, {
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
    const response = await fetch(`${API_URL}/payments/upload-bukti`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
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
    const response = await fetch(`${API_URL}/food-items`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch food items');
    }

    return response.json();
  }

  static async createFoodOrder(foodId: number, jumlah: number, catatan?: string) {
    const response = await fetch(`${API_URL}/food-orders`, {
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
    const response = await fetch(`${API_URL}/food-orders`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch food orders');
    }

    return response.json();
  }

  static async getNotifications() {
    const response = await fetch(`${API_URL}/notifications`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return response.json();
  }

  static async getUnreadCount() {
    const response = await fetch(`${API_URL}/notifications/unread-count`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }

    return response.json();
  }

  static async markNotificationAsRead(id: number) {
    const response = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });

    return response.json();
  }
}
