# Setup Cepat Backend di cPanel

## Masalah: Backend 404

Backend Anda di `http://mykost-cendana.xyz/api` mengembalikan 404 karena Laravel belum ter-setup.

## Solusi Tercepat

### Opsi 1: Gunakan Ngrok (RECOMMENDED untuk development)

Ini cara paling cepat untuk development:

1. **Jalankan backend lokal:**
   ```bash
   cd kost-backend
   php artisan serve
   ```

2. **Jalankan ngrok (terminal baru):**
   ```bash
   ngrok http 8000
   ```

3. **Update .env.local frontend:**
   ```bash
   cd kost-app
   # Edit .env.local, ganti NEXT_PUBLIC_API_URL dengan URL ngrok
   ```

4. **Restart frontend:**
   ```bash
   npm run dev
   ```

✅ Selesai! Sekarang bisa login.

### Opsi 2: Setup Backend di cPanel (untuk production)

Jika ingin backend production berjalan di cPanel:

#### A. Upload File
1. Login cPanel → File Manager
2. Upload semua file `kost-backend` ke `public_html`

#### B. Setup via Browser (MUDAH - tidak perlu SSH)
1. Upload file `setup-helper.php` ke folder `public`
2. Buka: `http://mykost-cendana.xyz/setup-helper.php`
3. Ikuti wizard setup:
   - Check environment
   - Run migrations
   - Cache config
4. **HAPUS file `setup-helper.php` setelah selesai!**

#### C. Konfigurasi Penting

**1. Set Document Root:**
- Di cPanel → Domains
- Edit domain `mykost-cendana.xyz`
- Set Document Root ke: `/home/username/public_html/public`
- Atau buat subdomain `api.mykost-cendana.xyz` yang point ke folder `public`

**2. File .env:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=http://mykost-cendana.xyz

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

JWT_SECRET=your-jwt-secret
```

**3. Database:**
- cPanel → MySQL Databases
- Buat database baru
- Buat user dan assign ke database
- Update .env dengan info database

#### D. Test Backend
Buka: `http://mykost-cendana.xyz/api/health`

Jika masih 404:
- Pastikan document root sudah benar
- Cek file `.htaccess` ada di folder `public`
- Hubungi support hosting untuk enable mod_rewrite

## Rekomendasi

**Untuk Development Sekarang:**
→ Gunakan Ngrok (Opsi 1) - paling cepat dan mudah

**Untuk Production Nanti:**
→ Setup cPanel dengan benar (Opsi 2) - ikuti panduan lengkap di `CPANEL_SETUP_LENGKAP.md`

## File Bantuan

- `CPANEL_SETUP_LENGKAP.md` - Panduan detail setup cPanel
- `setup-helper.php` - Tool untuk setup via browser (tanpa SSH)
- `.htaccess` - Sudah dikonfigurasi untuk Laravel

## Troubleshooting Cepat

**Error 404:**
- Document root belum diset ke folder `public`
- File `.htaccess` tidak ada atau tidak berfungsi

**Error 500:**
- File `.env` belum dikonfigurasi
- Permission folder `storage` dan `bootstrap/cache` salah (harus 755)

**Database Error:**
- Kredensial database di `.env` salah
- Database belum dibuat di cPanel

**CORS Error:**
- Update `config/cors.php` dengan domain Vercel
