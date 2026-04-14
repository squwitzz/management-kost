# Quick Guide: Session Expiration

## Ringkasan
Sistem otomatis redirect ke `/login` ketika:
- Token expired (401 dari backend)
- Token tidak ada di localStorage/cookies
- User akses protected route tanpa login
- Role tidak sesuai (Admin akses user page, atau sebaliknya)

## File yang Diubah

### 1. `app/lib/api.ts`
Tambah interceptor untuk handle 401:
```typescript
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);
  if (response.status === 401) {
    handleUnauthorized(); // Clear storage & redirect
  }
  return response;
};
```

### 2. `middleware.ts` (NEW)
Proteksi route di server-side:
```typescript
// Protected routes: /dashboard, /admin, /payments, /profile, /requests
// Cek token di cookies, redirect ke /login jika tidak ada
```

### 3. `app/lib/useAuth.ts` (NEW)
Custom hook untuk client-side protection:
```typescript
const { isAuthenticated, isLoading, user } = useAuth('Admin');
// Auto redirect jika tidak authenticated atau role salah
```

### 4. Login & Logout
- Login: Simpan token di localStorage + cookies
- Logout: Hapus token dari localStorage + cookies

## Cara Pakai

### Protect User Page
```typescript
import { useAuth } from '@/app/lib/useAuth';

export default function UserPage() {
  const { isAuthenticated, isLoading, user } = useAuth('Penghuni');
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>Welcome {user?.nama}</div>;
}
```

### Protect Admin Page
```typescript
import { useAuth } from '@/app/lib/useAuth';

export default function AdminPage() {
  const { isAuthenticated, isLoading, user } = useAuth('Admin');
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>Admin Dashboard</div>;
}
```

## Testing

1. Login → Buka dashboard → Hapus token di backend → Refresh page
   → Harus redirect ke `/login`

2. Logout → Coba akses `/dashboard` langsung
   → Harus redirect ke `/login`

3. Login sebagai Penghuni → Coba akses `/admin/dashboard`
   → Harus redirect ke `/login`

## Catatan
- Middleware berjalan di server (cek cookies)
- useAuth berjalan di client (cek localStorage)
- Semua API call otomatis handle 401
- Token expires dalam 7 hari (cookie)
