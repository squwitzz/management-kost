# Fix Payment Upload Error - Final Solution

## Problem
Error "Session Expired" / 401 Unauthorized ketika upload payment, padahal sudah login.

## Root Cause
JWT token validation terlalu strict setelah regenerate JWT secret.

## Solution

### Step 1: Upload File Backend yang Sudah Diupdate

Upload 2 file ini ke cPanel:

1. **kost-backend/app/Http/Controllers/Api/PaymentController.php**
   - Upload ke: `/home/intg7785/api-kost/app/Http/Controllers/Api/PaymentController.php`
   - File ini sudah diupdate dengan JWT validation yang lebih permissive

2. **kost-backend/public/.htaccess**
   - Upload ke: `/home/intg7785/api-kost/public/.htaccess`
   - File ini menambahkan CORS headers

### Step 2: Clear Cache di Backend

SSH ke cPanel dan jalankan:

```bash
cd /home/intg7785/api-kost
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### Step 3: Clear Browser Cache & Login Ulang

1. Buka aplikasi di browser
2. Tekan F12 (Developer Tools)
3. Console tab
4. Ketik: `localStorage.clear()`
5. Enter
6. Refresh page (Ctrl+F5)
7. Login ulang dengan user bakri

### Step 4: Test Upload Payment

1. Buka halaman Payments
2. Pilih payment yang mau diupload bukti
3. Upload file gambar
4. Submit

## Jika Masih Error

Cek log di backend:

```bash
tail -f /home/intg7785/api-kost/storage/logs/laravel.log
```

Atau test langsung dengan curl:

```bash
# Get token dari localStorage dulu
# Terus jalankan:
curl -X GET "https://mykost-cendana.xyz/api/payments/20" \
  -H "Authorization: Bearer TOKEN_DISINI" \
  -H "Accept: application/json"
```

Kalau curl berhasil (dapat data payment), berarti masalahnya di frontend/CORS.
Kalau curl gagal (401), berarti masalahnya di backend JWT validation.

## Files Changed

1. `kost-backend/app/Http/Controllers/Api/PaymentController.php` - JWT validation lebih permissive
2. `kost-backend/public/.htaccess` - CORS headers ditambahkan

---
**Created:** 14 April 2026
**Status:** Ready to deploy
