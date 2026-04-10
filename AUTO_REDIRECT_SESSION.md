# Auto Redirect ke Login Saat Session Habis

## Overview
Sistem telah diupdate untuk otomatis redirect ke halaman login ketika:
- Token expired (backend return 401 Unauthorized)
- Token tidak ada di localStorage atau cookies
- User mencoba akses protected route tanpa login
- User dengan role salah mencoba akses halaman (Admin ke user page, atau sebaliknya)

## File yang Dibuat/Diubah

### 1. File Baru

#### `middleware.ts`
Server-side route protection menggunakan Next.js middleware.
- Cek token di cookies sebelum akses halaman
- Protected routes: `/dashboard/*`, `/admin/*`, `/payments/*`, `/profile/*`, `/requests/*`
- Auto redirect ke `/login` jika tidak ada token
- Redirect ke dashboard jika sudah login dan akses `/login`

#### `app/lib/useAuth.ts`
Custom React hook untuk client-side authentication guard.
- Validasi token dan user data di localStorage
- Support role-based access control (Admin/Penghuni)
- Auto redirect jika session invalid atau role tidak sesuai
- Return: `{ isAuthenticated, isLoading, user }`

### 2. File yang Diupdate

#### `app/lib/api.ts`
- Tambah `handleUnauthorized()` function untuk clear storage & redirect
- Tambah `fetchWithAuth()` wrapper untuk semua API calls
- Otomatis detect 401 response dan trigger redirect
- Update semua API methods untuk menggunakan `fetchWithAuth()`
- Clear localStorage dan cookies saat unauthorized

#### `app/(auth)/login/page.tsx`
- Simpan token di cookies (untuk middleware) selain localStorage
- Cookie expires dalam 7 hari
- Format: `document.cookie = 'token=${token}; path=/; max-age=${60*60*24*7}'`

#### `app/components/UserHeader.tsx`
- Update `handleLogout()` untuk hapus cookies
- Format: `document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'`

#### `app/components/AdminHeader.tsx`
- Update `handleLogout()` untuk hapus cookies (sama seperti UserHeader)

#### `app/(dashboard)/dashboard/page.tsx`
- Implementasi `useAuth('Penghuni')` hook
- Remove manual token checking logic
- Simplified authentication flow

#### `app/(admin)/admin/dashboard/page.tsx`
- Implementasi `useAuth('Admin')` hook
- Remove manual token checking logic
- Simplified authentication flow

#### `app/lib/hooks.ts`
- Rename `useAuth()` menjadi `useToken()` (untuk avoid conflict)
- Re-export `useAuth` dari `useAuth.ts` untuk convenience

## Cara Kerja

### Flow 1: API Call dengan Token Expired
```
User → API Request → Backend (401) → fetchWithAuth detect 401
→ handleUnauthorized() → Clear storage → Redirect /login
```

### Flow 2: Akses Protected Route (Server-Side)
```
User → /dashboard → Middleware check cookies → No token
→ Redirect /login?redirect=/dashboard
```

### Flow 3: Component Mount (Client-Side)
```
Component mount → useAuth() hook → Check localStorage
→ No token or invalid → Redirect /login
```

### Flow 4: Role-Based Access
```
Penghuni → /admin/dashboard → useAuth('Admin')
→ Role mismatch → Redirect /login
```

## Implementasi di Halaman

### User Page (Penghuni)
```typescript
import { useAuth } from '@/app/lib/useAuth';

export default function UserPage() {
  const { isAuthenticated, isLoading, user } = useAuth('Penghuni');
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Render page jika authenticated
  return <div>Welcome {user?.nama}</div>;
}
```

### Admin Page
```typescript
import { useAuth } from '@/app/lib/useAuth';

export default function AdminPage() {
  const { isAuthenticated, isLoading, user } = useAuth('Admin');
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Render page jika authenticated dan role Admin
  return <div>Admin Dashboard</div>;
}
```

### Public Page (No Auth Required)
```typescript
// Tidak perlu useAuth hook
export default function PublicPage() {
  return <div>Public content</div>;
}
```

## Login & Logout Flow

### Login
1. User submit credentials
2. Backend return token
3. Save token di localStorage: `localStorage.setItem('token', token)`
4. Save token di cookies: `document.cookie = 'token=...'`
5. Save user data: `localStorage.setItem('user', JSON.stringify(user))`
6. Redirect berdasarkan role

### Logout
1. User click logout
2. Remove token dari localStorage: `localStorage.removeItem('token')`
3. Remove user dari localStorage: `localStorage.removeItem('user')`
4. Remove token dari cookies: `document.cookie = 'token=; expires=...'`
5. Redirect ke `/login`

## Testing Scenarios

### Test 1: Session Expired
1. Login ke aplikasi
2. Tunggu token expired atau hapus token di backend
3. Lakukan API call (misal: refresh dashboard)
4. Expected: Auto redirect ke `/login`

### Test 2: Direct Access Protected Route
1. Logout dari aplikasi
2. Coba akses `/dashboard` langsung via URL
3. Expected: Redirect ke `/login?redirect=/dashboard`

### Test 3: Role-Based Access
1. Login sebagai Penghuni
2. Coba akses `/admin/dashboard` via URL
3. Expected: Redirect ke `/login`

### Test 4: Already Logged In
1. Login ke aplikasi
2. Coba akses `/login` via URL
3. Expected: Redirect ke `/dashboard` atau `/admin/dashboard`

## Security Features

1. **Double Protection**: Server-side (middleware) + Client-side (useAuth hook)
2. **Token Storage**: localStorage (API calls) + cookies (middleware)
3. **Role Validation**: Automatic role checking di useAuth hook
4. **Auto Cleanup**: Clear all auth data saat unauthorized
5. **Redirect Preservation**: Middleware save redirect URL untuk after-login

## Troubleshooting

### Issue: Infinite redirect loop
- Check: Pastikan `/login` tidak di-protect di middleware
- Check: Pastikan login page tidak call `useAuth()` hook

### Issue: Redirect tidak jalan
- Check: Token ada di cookies (bukan hanya localStorage)
- Check: Cookie path dan domain settings
- Check: Browser console untuk error messages

### Issue: Role check tidak jalan
- Check: User data di localStorage punya field `role`
- Check: Role value exact match ('Admin' atau 'Penghuni')
- Check: useAuth hook dipanggil dengan parameter role yang benar

## Best Practices

1. Selalu gunakan `useAuth()` hook di protected pages
2. Jangan manual check token di component
3. Gunakan `fetchWithAuth()` untuk semua API calls (sudah otomatis di ApiClient)
4. Set cookie saat login, clear saat logout
5. Handle loading state dari useAuth hook
6. Test semua scenarios sebelum deploy

## Dokumentasi Tambahan

- `SESSION_EXPIRATION.md` - Detailed technical documentation
- `QUICK_SESSION_GUIDE.md` - Quick reference guide
