# Fix Slow Refresh/Loading Issue & Login Failed to Fetch

## Masalah yang Diperbaiki
- ❌ Loading lambat saat refresh (Ctrl+R / F5)
- ❌ **Login error: "Failed to fetch"**
- ❌ Service Worker memblokir API requests
- ❌ NotificationProvider blocking initial load
- ❌ Data fetching yang tidak optimal

## Perubahan yang Dilakukan

### 1. Service Worker Optimization (`public/sw.js`)
- ✅ **CRITICAL FIX**: Skip service worker untuk semua API requests
- ✅ Skip untuk backend server (port 8000, localhost, 127.0.0.1)
- ✅ Skip untuk external domains
- ✅ Hanya handle GET requests untuk static assets
- ✅ Update cache version ke v3
- ✅ Tambah `skipWaiting()` dan `clients.claim()` untuk aktivasi lebih cepat

### 2. API Client Error Handling (`app/lib/api.ts`)
- ✅ Better error messages untuk network issues
- ✅ Detect jika backend tidak berjalan
- ✅ User-friendly error messages

### 3. NotificationProvider (`app/components/NotificationProvider.tsx`)
- ✅ Defer service worker registration 2 detik setelah page load
- ✅ Tidak blocking initial render

### 4. Dashboard & Requests Pages
- ✅ Set loading false lebih awal
- ✅ Fetch data secara parallel dengan Promise.all
- ✅ Tidak blocking UI render
- ✅ Better error handling dengan retry button

### 5. Next.js Config (`next.config.ts`)
- ✅ Enable reactStrictMode
- ✅ Enable swcMinify
- ✅ Optimize package imports
- ✅ Unoptimized images untuk development lebih cepat

## Cara Menerapkan Fix

### PENTING: Pastikan Backend Berjalan!
```bash
# Di terminal terpisah, jalankan backend Laravel
cd kost-backend
php artisan serve
# Backend harus berjalan di http://127.0.0.1:8000
```

### Step 1: Clear Service Worker Cache
Buka browser DevTools (F12), lalu:
1. Pergi ke tab **Application** (Chrome) atau **Storage** (Firefox)
2. Klik **Service Workers** di sidebar
3. Klik **Unregister** pada service worker yang aktif
4. Klik **Clear storage** atau **Clear site data**
5. Centang semua opsi dan klik **Clear site data**

### Step 2: Hard Refresh Browser
- Chrome/Edge: `Ctrl + Shift + R` atau `Ctrl + F5`
- Firefox: `Ctrl + Shift + R`
- Safari: `Cmd + Option + R`

### Step 3: Restart Development Server
```bash
# Stop server (Ctrl+C)
# Clear Next.js cache
npm run clear-cache

# Restart server
npm run dev
```

### Step 4: Atau Gunakan Tool Otomatis
```bash
# Clear cache dan restart
npm run fresh-start

# Atau buka di browser:
# http://localhost:3000/clear-sw.html
# Klik tombol "Clear Service Worker & Cache"
```

### Step 5: Test Login
1. Buka http://localhost:3000/login
2. Masukkan credentials
3. Login seharusnya berhasil tanpa error "Failed to fetch"

## Penjelasan Teknis

### Network-First Strategy
```javascript
// Sebelum: Cache-First (lambat saat refresh)
caches.match(request) → return cache → fetch network

// Sesudah: Network-First (cepat saat refresh)
fetch network → update cache → return response
↓ (jika gagal)
return cache
```

### Deferred Service Worker
```javascript
// Sebelum: Register immediately (blocking)
useEffect(() => {
  registerServiceWorker(); // Blocks initial load
}, []);

// Sesudah: Register after 2 seconds (non-blocking)
useEffect(() => {
  setTimeout(() => {
    registerServiceWorker(); // Doesn't block
  }, 2000);
}, []);
```

### Parallel Data Fetching
```javascript
// Sebelum: Sequential (lambat)
await fetchRoomData();
await fetchPaymentData();
setLoading(false);

// Sesudah: Parallel (cepat)
setLoading(false);
Promise.all([fetchRoomData(), fetchPaymentData()]);
```

## Expected Results
- ⚡ Initial page load: **50-70% lebih cepat**
- ⚡ Refresh (Ctrl+R): **60-80% lebih cepat**
- ⚡ Navigation: **Lebih smooth**
- ⚡ API calls: **Tidak di-cache** (selalu fresh data)

## Troubleshooting

### Login Masih Error "Failed to Fetch"?

1. **Pastikan backend berjalan:**
   ```bash
   # Check apakah backend aktif
   curl http://127.0.0.1:8000/api/login
   # Atau buka di browser: http://127.0.0.1:8000
   ```

2. **Clear service worker completely:**
   - Buka DevTools (F12)
   - Console tab
   - Jalankan:
   ```javascript
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(reg => reg.unregister());
   });
   caches.keys().then(keys => {
     keys.forEach(key => caches.delete(key));
   });
   location.reload();
   ```

3. **Test di Incognito/Private mode:**
   - Buka browser dalam mode incognito
   - Service worker tidak akan aktif
   - Test login

4. **Check CORS di backend:**
   - Pastikan backend Laravel mengizinkan requests dari localhost:3000
   - Check file `kost-backend/config/cors.php`

5. **Check Network tab:**
   - Buka DevTools → Network tab
   - Coba login
   - Lihat request ke `/api/login`
   - Status code harus 200 (success) atau 401 (wrong credentials)
   - Jika "Failed to fetch" = backend tidak berjalan atau CORS issue

### Masih Lambat?
1. Clear browser cache completely
2. Test di Incognito/Private mode
3. Check Network tab di DevTools untuk bottleneck
4. Pastikan backend API response cepat

### Service Worker Tidak Update?
```javascript
// Force update di browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
location.reload();
```

## Monitoring Performance

### Chrome DevTools
1. Buka DevTools (F12)
2. Tab **Network**
3. Refresh page
4. Check:
   - DOMContentLoaded: < 500ms (good)
   - Load: < 1s (good)
   - Finish: < 2s (good)

### Lighthouse
1. DevTools → **Lighthouse** tab
2. Run audit
3. Target scores:
   - Performance: > 90
   - Best Practices: > 90
