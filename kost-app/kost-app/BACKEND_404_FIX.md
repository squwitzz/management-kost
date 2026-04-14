# Solusi Error 404 Backend cPanel

## Masalah
Backend di `http://mykost-cendana.xyz/api` mengembalikan error 404. Ini berarti Laravel belum dikonfigurasi dengan benar di cPanel.

## Solusi Cepat: Gunakan Ngrok untuk Development

Karena backend cPanel belum siap, gunakan ngrok untuk development:

### 1. Jalankan Backend Lokal
```bash
cd kost-backend
php artisan serve
```

### 2. Jalankan Ngrok (di terminal baru)
```bash
ngrok http 8000
```

### 3. Update .env.local
Edit file `kost-app/.env.local` dan ganti dengan URL ngrok Anda:
```env
NEXT_PUBLIC_API_URL=https://xxxx-xxxx-xxxx.ngrok-free.app/api
```

### 4. Restart Development Server
```bash
cd kost-app
# Tekan Ctrl+C untuk stop server yang sedang berjalan
npm run dev
```

### 5. Test Login
Sekarang coba login lagi - seharusnya sudah bisa.

## Solusi Permanen: Perbaiki Backend cPanel

Untuk memperbaiki backend di cPanel, ikuti panduan lengkap di `CPANEL_BACKEND_SETUP.md`.

### Checklist Cepat:
- [ ] Upload semua file backend ke cPanel
- [ ] Set document root ke folder `public` (bukan root folder)
- [ ] Pastikan file `.htaccess` ada di folder `public`
- [ ] Jalankan `composer install --no-dev`
- [ ] Copy `.env.example` ke `.env` dan konfigurasi database
- [ ] Jalankan `php artisan key:generate`
- [ ] Jalankan `php artisan migrate`
- [ ] Set permission folder `storage` dan `bootstrap/cache` ke 755
- [ ] Test endpoint: http://mykost-cendana.xyz/api/health

## Verifikasi Backend Berjalan

Test dengan curl atau browser:
```bash
# Harus return JSON, bukan 404
curl http://mykost-cendana.xyz/api/health
```

Jika masih 404, berarti Laravel routing belum berfungsi - periksa kembali document root dan .htaccess.

## Catatan Penting

- **Development**: Gunakan ngrok (lebih mudah untuk testing)
- **Production**: Perbaiki cPanel backend (untuk deployment final)
- Vercel production akan otomatis menggunakan cPanel backend setelah diperbaiki
- Tidak perlu push perubahan `.env.local` ke GitHub (file ini hanya untuk lokal)
