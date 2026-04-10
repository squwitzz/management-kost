# 🚨 QUICK FIX - Login Error "Tidak dapat terhubung ke server"

## Masalah
Error: "Tidak dapat terhubung ke server. Pastikan backend berjalan di http://127.0.0.1:8000"

## Penyebab
Service Worker lama masih aktif dan memblokir request API

## ✅ SOLUSI CEPAT (Pilih salah satu)

### Opsi 1: Gunakan Incognito Mode (TERCEPAT!)
1. Buka browser dalam mode Incognito/Private
2. Akses: http://localhost:3002/login
3. Login akan langsung berhasil (service worker tidak aktif di incognito)

### Opsi 2: Clear Service Worker via Browser
1. Buka DevTools (tekan F12)
2. Pergi ke tab **Application** (Chrome) atau **Storage** (Firefox)
3. Klik **Service Workers** di sidebar kiri
4. Klik **Unregister** pada semua service worker
5. Klik **Clear storage** → Centang semua → **Clear site data**
6. Hard refresh: **Ctrl + Shift + R**
7. Coba login lagi

### Opsi 3: Gunakan Clear Tool
1. Buka: http://localhost:3002/clear-sw.html
2. Klik tombol **"Clear Service Worker & Cache"**
3. Tunggu sampai selesai
4. Coba login lagi

### Opsi 4: Via Console Browser
1. Buka DevTools (F12)
2. Pergi ke tab **Console**
3. Copy-paste dan jalankan:
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
setTimeout(() => location.reload(), 1000);
```

### Opsi 5: Restart Development Server
```bash
# Stop server (Ctrl+C)
npm run clear-cache
npm run dev
```

## Verifikasi Backend Berjalan
```bash
# Check apakah backend aktif
curl http://127.0.0.1:8000/api/login

# Atau buka di browser
http://127.0.0.1:8000
```

## Setelah Clear Service Worker
1. Hard refresh browser: **Ctrl + Shift + R**
2. Buka http://localhost:3002/login
3. Login seharusnya berhasil!

## Jika Masih Error
1. Pastikan backend Laravel berjalan:
   ```bash
   cd kost-backend
   php artisan serve
   ```

2. Test API langsung:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/login \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{"nomor_telepon":"081234567890","password":"password123"}'
   ```

3. Check CORS di backend:
   - File: `kost-backend/config/cors.php`
   - Pastikan `allowed_origins` include `http://localhost:3002`

## Debug Info
Buka: http://localhost:3002/debug
- Check "Can Reach API" status
- Klik "Clear Service Worker" jika ada
- Klik "Refresh Status"

## Tips
- **Selalu gunakan Incognito mode untuk testing** saat develop dengan service worker
- Service worker cache sangat persistent, butuh clear manual
- Setelah clear, login akan langsung cepat dan berhasil
