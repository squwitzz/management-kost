# Setup Backend Laravel di Subdomain cPanel

## Struktur Direktori Anda

```
public_html/
└── mykost-cendana.xyz/          ← Root folder Laravel
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── public/                   ← Document root HARUS point ke sini!
    │   ├── index.php
    │   ├── .htaccess
    │   └── setup-helper.php
    ├── routes/
    ├── storage/
    ├── vendor/
    ├── .env
    └── .htaccess                 ← Backup redirect (jika document root salah)
```

## Masalah Saat Ini

Subdomain `mykost-cendana.xyz` kemungkinan document root-nya mengarah ke:
- ❌ `public_html/mykost-cendana.xyz/` (SALAH - ini root Laravel)

Seharusnya mengarah ke:
- ✅ `public_html/mykost-cendana.xyz/public/` (BENAR - ini public folder)

## Langkah Perbaikan

### 1. Set Document Root Subdomain

**Di cPanel:**

1. Login ke cPanel
2. Cari menu **"Domains"** atau **"Subdomains"**
3. Cari subdomain `mykost-cendana.xyz`
4. Klik **"Manage"** atau icon pensil untuk edit
5. Ubah **Document Root** dari:
   ```
   public_html/mykost-cendana.xyz
   ```
   Menjadi:
   ```
   public_html/mykost-cendana.xyz/public
   ```
6. Klik **Save** atau **Update**

**Screenshot lokasi (biasanya):**
- cPanel → Domains → klik domain → Document Root field

### 2. Verifikasi File .htaccess

Pastikan file `.htaccess` ada di folder `public`:

**Lokasi:** `public_html/mykost-cendana.xyz/public/.htaccess`

**Isi file:**
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Handle X-XSRF-Token Header
    RewriteCond %{HTTP:x-xsrf-token} .
    RewriteRule .* - [E=HTTP_X_XSRF_TOKEN:%{HTTP:X-XSRF-Token}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

# Disable directory browsing
Options -Indexes

# Prevent access to .env file
<Files .env>
    Order allow,deny
    Deny from all
</Files>
```

### 3. Setup File .env

**Lokasi:** `public_html/mykost-cendana.xyz/.env`

```env
APP_NAME=KostManagement
APP_ENV=production
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
APP_DEBUG=false
APP_URL=http://mykost-cendana.xyz

LOG_CHANNEL=stack
LOG_LEVEL=error

# Database Configuration (dari cPanel MySQL)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=cpanel_username_dbname
DB_USERNAME=cpanel_username_dbuser
DB_PASSWORD=your_database_password

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here
JWT_TTL=60

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://management-kost.vercel.app,http://localhost:3000
```

**Cara generate APP_KEY:**
1. Buka: https://generate-random.org/laravel-key-generator
2. Copy key yang dihasilkan (format: `base64:xxxxxxxx`)
3. Paste ke `APP_KEY=`

### 4. Setup Database di cPanel

1. **Buat Database:**
   - cPanel → MySQL Databases
   - Create New Database: `cpanel_username_kost` (contoh)
   - Klik "Create Database"

2. **Buat User:**
   - Di halaman yang sama, scroll ke "MySQL Users"
   - Create New User: `cpanel_username_kost`
   - Set password yang kuat
   - Klik "Create User"

3. **Assign User ke Database:**
   - Scroll ke "Add User To Database"
   - Pilih user yang baru dibuat
   - Pilih database yang baru dibuat
   - Klik "Add"
   - Centang "ALL PRIVILEGES"
   - Klik "Make Changes"

4. **Update .env:**
   ```env
   DB_DATABASE=cpanel_username_kost
   DB_USERNAME=cpanel_username_kost
   DB_PASSWORD=password_yang_anda_buat
   ```

### 5. Set Permissions

Via File Manager cPanel:

1. Klik kanan folder `storage` → Change Permissions
   - Set ke: **755**
   - Centang "Recurse into subdirectories"
   - Apply

2. Klik kanan folder `bootstrap/cache` → Change Permissions
   - Set ke: **755**
   - Centang "Recurse into subdirectories"
   - Apply

### 6. Run Setup Helper

1. **Akses Setup Helper:**
   ```
   http://mykost-cendana.xyz/setup-helper.php
   ```

2. **Ikuti langkah-langkah:**
   - ✅ Check Environment
   - ✅ Test Database Connection
   - ✅ Run Migrations
   - ✅ Cache Configuration

3. **HAPUS file setup-helper.php setelah selesai!**
   - Via File Manager: delete `public_html/mykost-cendana.xyz/public/setup-helper.php`

### 7. Test Backend

Buka di browser:

1. **Test root:**
   ```
   http://mykost-cendana.xyz/
   ```
   Harus tampil halaman Laravel (bukan 404)

2. **Test API endpoint:**
   ```
   http://mykost-cendana.xyz/api/login
   ```
   Harus return JSON error (bukan 404)

3. **Test dari frontend:**
   - Buka: https://management-kost.vercel.app/login
   - Coba login
   - Seharusnya tidak ada error "404" lagi

## Troubleshooting

### Masih 404 setelah ubah document root

**Kemungkinan 1: Document root belum ter-update**
- Tunggu 1-2 menit
- Clear browser cache (Ctrl+Shift+Delete)
- Coba akses lagi

**Kemungkinan 2: mod_rewrite tidak aktif**
- Hubungi support hosting
- Minta aktifkan mod_rewrite untuk subdomain

**Kemungkinan 3: .htaccess tidak terbaca**
- Pastikan file `.htaccess` ada di folder `public`
- Cek permission file (harus 644)

### Error 500 Internal Server Error

**Cek:**
1. File `.env` sudah benar?
2. `APP_KEY` sudah di-generate?
3. Permission folder `storage` dan `bootstrap/cache` sudah 755?
4. Vendor folder sudah ada? (jika belum, upload dari lokal atau run composer install)

**Debug:**
- Sementara set `APP_DEBUG=true` di `.env`
- Akses website, lihat error detail
- Setelah selesai, set kembali `APP_DEBUG=false`

### Database Connection Error

**Cek:**
1. Nama database, username, password di `.env` sudah benar?
2. User sudah di-assign ke database dengan ALL PRIVILEGES?
3. `DB_HOST=localhost` (bukan 127.0.0.1)

**Test via setup-helper.php:**
- Akses: `http://mykost-cendana.xyz/setup-helper.php?action=test-db`
- Lihat error message detail

### CORS Error dari Vercel

**Cek file:** `config/cors.php`

Pastikan ada:
```php
'allowed_origins' => [
    'https://management-kost.vercel.app',
    'http://localhost:3000',
],
```

Jika sudah benar, run:
```
http://mykost-cendana.xyz/setup-helper.php?action=cache
```

## Checklist Setup

- [ ] Document root subdomain sudah diubah ke folder `public`
- [ ] File `.htaccess` ada di folder `public`
- [ ] File `.env` sudah dikonfigurasi dengan benar
- [ ] Database sudah dibuat di cPanel
- [ ] User database sudah di-assign dengan ALL PRIVILEGES
- [ ] Permission folder `storage` dan `bootstrap/cache` sudah 755
- [ ] Migrations sudah dijalankan via setup-helper.php
- [ ] Config sudah di-cache via setup-helper.php
- [ ] File `setup-helper.php` sudah dihapus
- [ ] Test akses `http://mykost-cendana.xyz/` → tidak 404
- [ ] Test login dari Vercel → berhasil

## Setelah Selesai

1. **Hapus file setup-helper.php** untuk keamanan
2. **Set APP_DEBUG=false** di `.env`
3. **Test login** dari Vercel
4. **Backend production siap!** 🎉

## Catatan Penting

- Jangan expose file `.env` (sudah diprotect di `.htaccess`)
- Gunakan HTTPS jika memungkinkan (install SSL certificate di cPanel)
- Backup database secara berkala
- Monitor error logs di cPanel
