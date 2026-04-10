# Verifikasi Backend Sudah Berjalan

## Status Saat Ini: ✅ BACKEND SUDAH BERJALAN!

Error **405 Method Not Allowed** pada `/api/login` adalah **NORMAL dan BENAR**!

Ini berarti:
- ✅ Laravel sudah berjalan
- ✅ Routing sudah berfungsi
- ✅ Endpoint `/api/login` ada dan berfungsi
- ℹ️ Endpoint hanya menerima POST request (bukan GET dari browser)

## Test Endpoint Backend

### 1. Health Check (GET - bisa via browser)

**URL:**
```
http://mykost-cendana.xyz/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Backend is running",
  "timestamp": "2024-01-01 12:00:00",
  "environment": "production"
}
```

Jika muncul JSON seperti di atas, backend **100% berjalan dengan baik**!

### 2. Login Endpoint (POST - perlu tool seperti Postman)

**URL:**
```
http://mykost-cendana.xyz/api/login
```

**Method:** POST

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Body:**
```json
{
  "nomor_telepon": "081234567890",
  "password": "password123"
}
```

**Expected Response (jika kredensial benar):**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "nama": "Admin",
    "nomor_telepon": "081234567890",
    "role": "admin"
  }
}
```

**Expected Response (jika kredensial salah):**
```json
{
  "error": "Invalid credentials"
}
```

## Test dari Frontend

### 1. Update .env.local (Development)

Jika ingin test dari localhost:

```env
NEXT_PUBLIC_API_URL=http://mykost-cendana.xyz/api
```

Restart development server:
```bash
cd kost-app
npm run dev
```

### 2. Test dari Vercel (Production)

Frontend di Vercel sudah otomatis menggunakan backend cPanel karena `.env.production`:

```env
NEXT_PUBLIC_API_URL=http://mykost-cendana.xyz/api
```

**Test Login:**
1. Buka: https://management-kost.vercel.app/login
2. Masukkan nomor telepon dan password
3. Klik Login

**Expected Result:**
- ✅ Berhasil login dan redirect ke dashboard
- ❌ Jika error, lihat error message di alert

## Troubleshooting

### Error 405 pada /api/login (via browser)

**Ini NORMAL!** Endpoint login hanya menerima POST request.

Untuk test:
- Gunakan Postman/Insomnia
- Atau test langsung dari frontend (login page)

### Error 404 pada /api/health

Backend belum ter-update dengan route baru.

**Solusi:**
1. Upload file `routes/api.php` yang baru ke cPanel
2. Clear cache via setup-helper.php atau terminal:
   ```bash
   php artisan route:clear
   php artisan config:clear
   ```

### CORS Error dari Vercel

**Cek file:** `config/cors.php`

Pastikan domain Vercel ada di `allowed_origins`:
```php
'allowed_origins' => [
    'https://management-kost.vercel.app',
    'http://localhost:3000',
],
```

**Clear cache:**
```bash
php artisan config:cache
```

### Database Connection Error

**Cek:**
1. File `.env` di cPanel sudah benar?
2. Database sudah dibuat dan user sudah di-assign?
3. Migrations sudah dijalankan?

**Test via setup-helper.php:**
```
http://mykost-cendana.xyz/setup-helper.php?action=test-db
```

## Checklist Backend Production Ready

- [x] Backend Laravel berjalan (error 405 pada /api/login = OK)
- [ ] Health check endpoint return JSON
- [ ] Database connection berhasil
- [ ] Migrations sudah dijalankan
- [ ] Test login dari frontend berhasil
- [ ] CORS sudah dikonfigurasi untuk Vercel
- [ ] File setup-helper.php sudah dihapus
- [ ] APP_DEBUG=false di .env

## Next Steps

1. **Test health check endpoint:**
   ```
   http://mykost-cendana.xyz/api/health
   ```

2. **Upload file routes/api.php yang baru** (sudah saya tambahkan health check)

3. **Test login dari Vercel:**
   ```
   https://management-kost.vercel.app/login
   ```

4. **Jika berhasil login, backend production SIAP!** 🎉

## Catatan Penting

- Error 405 pada `/api/login` via browser adalah **NORMAL**
- Endpoint login hanya bisa diakses via POST request
- Test login harus dari frontend atau Postman, bukan browser langsung
- Health check endpoint (`/api/health`) bisa diakses via browser untuk verifikasi cepat
