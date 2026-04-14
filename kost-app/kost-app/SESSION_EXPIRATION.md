# Session Expiration & Auto Redirect

Sistem otomatis redirect ke halaman login ketika session habis atau token tidak valid.

## Fitur

### 1. API Interceptor (`app/lib/api.ts`)
- Semua API calls menggunakan `fetchWithAuth` wrapper
- Otomatis mendeteksi response 401 Unauthorized
- Membersihkan localStorage dan cookies
- Redirect ke `/login` secara otomatis

```typescript
// Contoh penggunaan
const response = await fetchWithAuth(`${API_URL}/payments`, {
  headers: this.getHeaders(),
});
```

### 2. Middleware Protection (`middleware.ts`)
- Proteksi route-level menggunakan Next.js middleware
- Cek token di cookies sebelum akses halaman
- Redirect ke login jika tidak ada token
- Redirect ke dashboard jika sudah login dan akses `/login`

Protected routes:
- `/dashboard/*`
- `/admin/*`
- `/payments/*`
- `/profile/*`
- `/requests/*`

### 3. Client-Side Auth Guard (`app/lib/useAuth.ts`)
- Custom hook untuk proteksi component-level
- Validasi token dan user data di localStorage
- Support role-based access (Admin/Penghuni)
- Auto redirect jika session invalid

```typescript
// Contoh penggunaan
const { isAuthenticated, isLoading, user } = useAuth('Penghuni');
```

## Cara Kerja

### Skenario 1: API Call dengan Token Expired
1. User melakukan request ke backend
2. Backend return 401 Unauthorized
3. `fetchWithAuth` mendeteksi status 401
4. Membersihkan localStorage dan cookies
5. Redirect ke `/login`

### Skenario 2: Akses Protected Route Tanpa Token
1. User coba akses `/dashboard`
2. Middleware cek cookie token
3. Tidak ada token → redirect ke `/login?redirect=/dashboard`
4. Setelah login, redirect kembali ke halaman tujuan

### Skenario 3: Component Mount dengan Invalid Session
1. Component mount dan call `useAuth()`
2. Hook cek localStorage token dan user
3. Token tidak ada atau invalid
4. Auto redirect ke `/login`

## Implementasi di Halaman

### Contoh: Dashboard Page
```typescript
import { useAuth } from '@/app/lib/useAuth';

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth('Penghuni');
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Render halaman jika authenticated
  return <div>Welcome {user?.nama}</div>;
}
```

### Contoh: Admin Page
```typescript
import { useAuth } from '@/app/lib/useAuth';

export default function AdminDashboard() {
  const { isAuthenticated, isLoading, user } = useAuth('Admin');
  
  // Auto redirect jika bukan Admin
  // ...
}
```

## Login Flow

1. User submit form login
2. Simpan token di localStorage
3. Simpan token di cookies (untuk middleware)
4. Redirect berdasarkan role:
   - Admin → `/admin/dashboard`
   - Penghuni → `/dashboard`

```typescript
// Set cookie saat login
document.cookie = `token=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`;
```

## Logout Flow

1. Call API logout endpoint
2. Hapus token dari localStorage
3. Hapus token dari cookies
4. Redirect ke `/login`

```typescript
// Clear cookie saat logout
document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
```

## Testing

### Test Session Expiration
1. Login ke aplikasi
2. Hapus token di backend atau tunggu token expired
3. Lakukan API call (misal: refresh dashboard)
4. Harus auto redirect ke `/login`

### Test Protected Route
1. Logout dari aplikasi
2. Coba akses `/dashboard` langsung
3. Harus redirect ke `/login`

### Test Role-Based Access
1. Login sebagai Penghuni
2. Coba akses `/admin/dashboard`
3. Harus redirect ke `/login`

## Catatan

- Token disimpan di localStorage (untuk API calls) dan cookies (untuk middleware)
- Cookie expires dalam 7 hari
- Middleware berjalan di server-side (Next.js edge runtime)
- useAuth hook berjalan di client-side
- Semua protected pages harus menggunakan `useAuth()` hook
