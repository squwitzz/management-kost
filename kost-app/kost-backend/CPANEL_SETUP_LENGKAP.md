# Panduan Lengkap Setup Laravel di cPanel

## Masalah Saat Ini
- URL `http://mykost-cendana.xyz/api` mengembalikan 404 NOT FOUND
- Ini berarti Laravel belum berjalan dengan benar di cPanel

## Langkah-Langkah Setup

### 1. Upload File Backend ke cPanel

**Via File Manager cPanel:**
1. Login ke cPanel Anda
2. Buka "File Manager"
3. Navigasi ke folder `public_html`
4. Upload semua file dari folder `kost-backend` ke `public_html`
   - Atau buat subfolder seperti `public_html/api` jika ingin terpisah

**Via FTP:**
1. Gunakan FileZilla atau FTP client lainnya
2. Connect ke server cPanel Anda
3. Upload semua file backend ke `public_html`

### 2. Set Document Root ke Folder Public

**PENTING:** Laravel harus diakses melalui folder `public`, bukan root folder.

**Opsi A: Menggunakan Subdomain (RECOMMENDED)**
1. Di cPanel, buka "Subdomains"
2. Buat subdomain baru: `api.mykost-cendana.xyz`
3. Set Document Root ke: `/home/username/public_html/public`
4. Save

**Opsi B: Menggunakan Domain Utama**
1. Di cPanel, buka "Domains" atau "Addon Domains"
2. Edit domain `mykost-cendana.xyz`
3. Set Document Root ke: `/home/username/public_html/public`
4. Save

**Opsi C: Manual via .htaccess (jika tidak bisa ubah document root)**
File `.htaccess` di root sudah saya buat untuk redirect ke folder public.

### 3. Setup File .env

1. Di File Manager, navigasi ke folder root backend (bukan public)
2. Copy file `.env.example` menjadi `.env`
3. Edit file `.env`:

```env
APP_NAME=KostManagement
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://mykost-cendana.xyz

LOG_CHANNEL=stack
LOG_LEVEL=error

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=nama_database_anda
DB_USERNAME=username_database_anda
DB_PASSWORD=password_database_anda

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_TTL=60

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://management-kost.vercel.app,http://localhost:3000
```

### 4. Generate Application Key

**Via Terminal SSH (jika tersedia):**
```bash
cd /home/username/public_html
php artisan key:generate
```

**Via cPanel Terminal (jika tersedia):**
1. Buka "Terminal" di cPanel
2. Jalankan:
```bash
cd public_html
php artisan key:generate
```

**Manual (jika tidak ada akses terminal):**
1. Buka website: https://generate-random.org/laravel-key-generator
2. Generate key baru
3. Copy key tersebut
4. Edit file `.env`, set `APP_KEY=base64:xxxxxxxxxxxxx`

### 5. Install Dependencies (Composer)

**Via Terminal SSH:**
```bash
cd /home/username/public_html
composer install --no-dev --optimize-autoloader
```

**Via cPanel Terminal:**
```bash
cd public_html
/usr/local/bin/composer install --no-dev --optimize-autoloader
```

**Jika tidak ada Composer:**
1. Upload folder `vendor` dari lokal Anda (hasil `composer install` di komputer)
2. Zip folder vendor di lokal, upload, lalu extract di cPanel

### 6. Setup Database

1. Di cPanel, buka "MySQL Databases"
2. Buat database baru (misal: `username_kost`)
3. Buat user baru (misal: `username_kost`)
4. Set password untuk user
5. Add user ke database dengan ALL PRIVILEGES
6. Catat nama database, username, dan password
7. Update file `.env` dengan info database

### 7. Run Migrations

**Via Terminal:**
```bash
cd /home/username/public_html
php artisan migrate --force
```

**Via Browser (jika tidak ada terminal):**
Buat file `migrate.php` di folder `public`:

```php
<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$status = $kernel->call('migrate', ['--force' => true]);
echo "Migration completed with status: " . $status;
```

Akses: `http://mykost-cendana.xyz/migrate.php`
Setelah selesai, HAPUS file ini untuk keamanan!

### 8. Set Permissions

**Via File Manager:**
1. Klik kanan folder `storage` → Change Permissions → 755
2. Klik kanan folder `bootstrap/cache` → Change Permissions → 755
3. Apply ke semua subfolder

**Via Terminal:**
```bash
cd /home/username/public_html
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

### 9. Optimize Laravel

**Via Terminal:**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 10. Test Backend

Buka di browser:
- `http://mykost-cendana.xyz/` → Harus tampil halaman Laravel atau JSON
- `http://mykost-cendana.xyz/api/health` → Harus return JSON (jika route ada)

Jika masih 404, cek:
1. Document root sudah benar ke folder `public`?
2. File `.htaccess` ada di folder `public`?
3. Mod_rewrite enabled di server?

## Troubleshooting

### Masih 404 setelah semua langkah
1. Pastikan document root benar-benar mengarah ke folder `public`
2. Cek file `.htaccess` ada di folder `public`
3. Hubungi support hosting untuk enable mod_rewrite

### Error 500
1. Cek file `.env` sudah benar
2. Cek `APP_KEY` sudah di-generate
3. Cek permission folder `storage` dan `bootstrap/cache`
4. Enable `APP_DEBUG=true` sementara untuk lihat error detail

### Database Connection Error
1. Cek kredensial database di `.env`
2. Pastikan user database punya akses ke database
3. Cek `DB_HOST` (biasanya `localhost` di cPanel)

### CORS Error
1. Cek file `config/cors.php`
2. Pastikan domain Vercel ada di `allowed_origins`

## Setelah Backend Berjalan

1. Test login dari Vercel: https://management-kost.vercel.app/login
2. Jika berhasil, backend sudah siap production!
3. Untuk development lokal, tetap bisa gunakan ngrok

## Catatan Keamanan

- Set `APP_DEBUG=false` di production
- Jangan expose file `.env`
- Hapus file `migrate.php` jika dibuat
- Gunakan HTTPS jika memungkinkan (SSL certificate)
