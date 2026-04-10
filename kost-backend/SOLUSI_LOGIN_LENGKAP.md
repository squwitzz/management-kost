# Solusi Lengkap - Sampai Bisa Login

## Status Saat Ini

✅ Backend berjalan dengan baik di `http://mykost-cendana.xyz`
✅ Database terkoneksi dan ada 3 user
✅ Endpoint `/api/health` berfungsi
✅ Endpoint `/api/login` berfungsi
❌ Login gagal karena password tidak cocok

## Masalah

User sudah ada di database, tapi password-nya tidak cocok dengan yang Anda coba. Ini bisa terjadi karena:
1. Password di database ter-hash dengan cara yang berbeda
2. Password yang Anda coba salah
3. Ada masalah dengan password hash

## Solusi: Reset Password User

### Langkah 1: Upload File Helper

Upload file ini ke cPanel:
- `public/reset-password.php` (sudah saya buat)

Upload ke: `public_html/mykost-cendana.xyz/public/reset-password.php`

### Langkah 2: Akses Reset Password Tool

Buka di browser:
```
http://mykost-cendana.xyz/reset-password.php
```

### Langkah 3: Reset Password User Admin

1. Anda akan melihat daftar semua user
2. Cari user dengan nomor telepon `081234567890` (Admin Kost)
3. Klik tombol "Reset Password"
4. Set password baru (default: `password123`)
5. Klik "Reset Password"

### Langkah 4: Test Login

Setelah password di-reset, test login dari Vercel:

1. Buka: https://management-kost.vercel.app/login
2. Masukkan:
   - Nomor Telepon: `081234567890`
   - Password: `password123` (atau password yang Anda set)
3. Klik Login

**Seharusnya sekarang BERHASIL LOGIN!** 🎉

### Langkah 5: Hapus File Helper (PENTING!)

Setelah berhasil login, HAPUS file ini untuk keamanan:
- `public/reset-password.php`
- `public/create-admin.php`
- `public/setup-helper.php`

## Alternatif: Buat User Baru

Jika Anda ingin membuat user baru dengan password yang pasti:

1. Akses: `http://mykost-cendana.xyz/create-admin.php`
2. Isi form dengan kredensial baru
3. Klik "Create Admin User"
4. Test login dengan kredensial baru

## Troubleshooting

### Error: "Nomor telepon atau password salah"

Ini berarti:
- ✅ Backend berfungsi dengan baik
- ✅ Database terkoneksi
- ❌ Kredensial salah

**Solusi:**
- Reset password via `reset-password.php`
- Atau buat user baru via `create-admin.php`

### Error: "Tidak dapat terhubung ke server"

Ini berarti backend tidak bisa diakses.

**Solusi:**
1. Cek apakah backend berjalan: `http://mykost-cendana.xyz/api/health`
2. Jika 404, cek document root sudah benar ke folder `public`
3. Jika masih error, cek file `.htaccess` ada di folder `public`

### Error: CORS

Jika muncul error CORS di console browser:

**Solusi:**
1. Pastikan file `config/cors.php` sudah benar
2. Clear cache via setup-helper.php
3. Cache config lagi

## Checklist Sampai Bisa Login

- [x] Backend berjalan (`/api/health` return JSON)
- [x] Database terkoneksi (`/api/db-check` return OK)
- [x] User ada di database (3 users)
- [ ] Password user di-reset via `reset-password.php`
- [ ] Test login dari Vercel berhasil
- [ ] File helper sudah dihapus

## File Helper yang Sudah Dibuat

1. **reset-password.php** - Reset password user yang sudah ada
2. **create-admin.php** - Buat user admin baru
3. **setup-helper.php** - Tool untuk migrations dan setup
4. **routes/api.php** - Sudah ditambahkan endpoint `/api/db-check`

## Setelah Berhasil Login

1. ✅ Hapus semua file helper (reset-password.php, create-admin.php, setup-helper.php)
2. ✅ Ganti password dari profile page
3. ✅ Set `APP_DEBUG=false` di `.env`
4. ✅ Backend production SIAP! 🎉

## Kontak Jika Masih Error

Jika masih ada error setelah mengikuti langkah di atas:

1. Screenshot error yang muncul
2. Cek error log di cPanel: `storage/logs/laravel.log`
3. Test endpoint:
   - `http://mykost-cendana.xyz/api/health`
   - `http://mykost-cendana.xyz/api/db-check`
4. Berikan info error detail

---

## Quick Start (Ringkasan)

1. Upload `reset-password.php` ke cPanel
2. Akses: `http://mykost-cendana.xyz/reset-password.php`
3. Reset password user `081234567890`
4. Login di: `https://management-kost.vercel.app/login`
5. Hapus file `reset-password.php`

**SELESAI!** 🚀
