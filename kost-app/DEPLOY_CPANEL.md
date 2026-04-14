# Tutorial Deploy ke cPanel

Tutorial lengkap untuk deploy aplikasi Kost Management System (Next.js + Laravel) ke cPanel.

## 📋 Persyaratan

### Server Requirements
- cPanel dengan akses SSH (opsional tapi direkomendasikan)
- PHP 8.2 atau lebih tinggi
- MySQL/MariaDB
- Node.js 18+ (untuk build Next.js)
- Composer
- SSL Certificate (direkomendasikan)

### Domain Setup
Anda memerlukan 2 subdomain atau domain:
- `app.domain.com` - untuk frontend Next.js
- `api.domain.com` - untuk backend Laravel

---

## 🎯 Bagian 1: Persiapan

### 1.1 Setup Database di cPanel

1. Login ke cPanel
2. Buka **MySQL Database Wizard**
3. Buat database baru:
   - Nama database: `kost_db` (atau nama lain)
   - Catat nama lengkap: `username_kost_db`
4. Buat user database:
   - Username: `kost_user`
   - Password: [buat password yang kuat]
   - Catat credentials ini
5. Berikan semua privileges ke user

### 1.2 Setup Subdomain

1. Di cPanel, buka **Subdomains**
2. Buat subdomain untuk API:
   - Subdomain: `api`
   - Document Root: `/public_html/api/public`
3. Buat subdomain untuk App:
   - Subdomain: `app`
   - Document Root: `/public_html/app`

---

## 🚀 Bagian 2: Deploy Backend Laravel

### 2.1 Upload File Backend

**Opsi A: Via SSH (Direkomendasikan)**

```bash
# Di komputer lokal, compress backend
cd kost-backend
tar -czf backend.tar.gz .

# Upload ke server via SCP
scp backend.tar.gz username@your-server.com:~/

# SSH ke server
ssh username@your-server.com

# Extract ke folder api
cd ~/public_html
mkdir -p api
cd api
tar -xzf ~/backend.tar.gz
rm ~/backend.tar.gz
```

**Opsi B: Via File Manager cPanel**

1. Compress folder `kost-backend` menjadi ZIP
2. Upload via File Manager ke `/public_html/api`
3. Extract file ZIP
4. Hapus file ZIP

### 2.2 Install Dependencies Backend

```bash
# SSH ke server
cd ~/public_html/api

# Install Composer dependencies
composer install --optimize-autoloader --no-dev

# Atau jika composer tidak tersedia globally
php composer.phar install --optimize-autoloader --no-dev
```

### 2.3 Konfigurasi Environment Backend

```bash
cd ~/public_html/api

# Copy environment file
cp .env.example .env

# Edit .env file
nano .env
```

Isi konfigurasi `.env`:

```env
APP_NAME="Kost Management"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

# Database
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=username_kost_db
DB_USERNAME=username_kost_user
DB_PASSWORD=your_database_password

# JWT Secret (akan di-generate)
JWT_SECRET=

# Session & Cache
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# CORS - Allow frontend domain
CORS_ALLOWED_ORIGINS=https://app.yourdomain.com

# Log
LOG_CHANNEL=daily
LOG_LEVEL=error
```

### 2.4 Generate Keys & Migrate Database

```bash
cd ~/public_html/api

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Run migrations
php artisan migrate --force

# Seed database (jika ada)
php artisan db:seed --force

# Clear & cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chmod -R 755 storage bootstrap/cache
```

### 2.5 Setup .htaccess untuk Laravel

File `.htaccess` di `/public_html/api/public/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

### 2.6 Test Backend API

Buka browser dan akses:
```
https://api.yourdomain.com/api/health
```

Jika berhasil, Anda akan melihat response JSON.

---

## 🎨 Bagian 3: Deploy Frontend Next.js

### 3.1 Build Next.js di Local

```bash
# Di komputer lokal
cd kost-app

# Update environment untuk production
nano .env.production
```

Isi `.env.production`:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

```bash
# Install dependencies
npm install

# Build untuk production
npm run build

# Hasil build ada di folder .next dan out (jika static export)
```

### 3.2 Setup untuk Static Export (Recommended untuk cPanel)

Edit `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static export
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true, // Important for static hosting
};

export default nextConfig;
```

Build ulang:

```bash
npm run build
```

Folder `out` akan berisi static files.

### 3.3 Upload Frontend ke cPanel

**Opsi A: Via SSH**

```bash
# Di komputer lokal
cd kost-app
tar -czf frontend.tar.gz out

# Upload
scp frontend.tar.gz username@your-server.com:~/

# SSH ke server
ssh username@your-server.com
cd ~/public_html/app
tar -xzf ~/frontend.tar.gz --strip-components=1
rm ~/frontend.tar.gz
```

**Opsi B: Via File Manager**

1. Compress folder `kost-app/out` menjadi ZIP
2. Upload ke `/public_html/app`
3. Extract semua file
4. Pastikan file `index.html` ada di root `/public_html/app`

### 3.4 Setup .htaccess untuk Next.js Static

File `.htaccess` di `/public_html/app/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # HTTPS redirect
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Handle Next.js static files
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ /$1.html [L,QSA]

  # Fallback to index.html for client-side routing
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Caching for static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/json "access plus 0 seconds"
</IfModule>
```

---

## 🔧 Bagian 4: Konfigurasi Tambahan

### 4.1 Setup SSL Certificate

1. Di cPanel, buka **SSL/TLS Status**
2. Install SSL untuk kedua subdomain:
   - `api.yourdomain.com`
   - `app.yourdomain.com`
3. Gunakan Let's Encrypt (gratis) atau SSL berbayar

### 4.2 Setup Cron Jobs untuk Laravel

Di cPanel, buka **Cron Jobs** dan tambahkan:

```bash
* * * * * cd /home/username/public_html/api && php artisan schedule:run >> /dev/null 2>&1
```

### 4.3 Setup Queue Worker (Opsional)

Jika menggunakan queue, tambahkan cron job:

```bash
* * * * * cd /home/username/public_html/api && php artisan queue:work --stop-when-empty >> /dev/null 2>&1
```

### 4.4 File Permissions

```bash
# Set correct permissions
cd ~/public_html/api
chmod -R 755 storage bootstrap/cache
chmod -R 775 storage/logs
chown -R username:username storage bootstrap/cache
```

---

## ✅ Bagian 5: Testing & Verifikasi

### 5.1 Test Backend API

```bash
# Test health endpoint
curl https://api.yourdomain.com/api/health

# Test login endpoint
curl -X POST https://api.yourdomain.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### 5.2 Test Frontend

1. Buka `https://app.yourdomain.com`
2. Cek apakah halaman login muncul
3. Test login dengan credentials
4. Cek console browser untuk error

### 5.3 Common Issues & Solutions

**Issue: 500 Internal Server Error**
```bash
# Check Laravel logs
tail -f ~/public_html/api/storage/logs/laravel.log

# Clear cache
php artisan cache:clear
php artisan config:clear
```

**Issue: CORS Error**
- Pastikan `CORS_ALLOWED_ORIGINS` di `.env` backend sudah benar
- Check file `config/cors.php`

**Issue: Database Connection Failed**
- Verifikasi credentials database di `.env`
- Pastikan database user memiliki privileges

**Issue: 404 Not Found**
- Check `.htaccess` file
- Pastikan mod_rewrite enabled di server

---

## 🔄 Bagian 6: Update & Maintenance

### Update Backend

```bash
cd ~/public_html/api

# Backup database
php artisan db:backup

# Pull latest code atau upload file baru
# ...

# Update dependencies
composer install --optimize-autoloader --no-dev

# Run migrations
php artisan migrate --force

# Clear cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Update Frontend

```bash
# Di local, build ulang
cd kost-app
npm run build

# Upload folder out ke server
# Replace files di /public_html/app
```

---

## 📊 Monitoring & Logs

### Laravel Logs
```bash
tail -f ~/public_html/api/storage/logs/laravel.log
```

### Apache Error Logs
```bash
tail -f ~/logs/error_log
```

### Database Backup
```bash
# Manual backup
mysqldump -u username_kost_user -p username_kost_db > backup_$(date +%Y%m%d).sql

# Setup automated backup via cron
0 2 * * * mysqldump -u username_kost_user -p'password' username_kost_db > ~/backups/db_$(date +\%Y\%m\%d).sql
```

---

## 🎉 Selesai!

Aplikasi Anda sekarang sudah live di:
- Frontend: `https://app.yourdomain.com`
- Backend API: `https://api.yourdomain.com`

### Next Steps:
1. Setup monitoring (Uptime Robot, etc.)
2. Configure backup strategy
3. Setup error tracking (Sentry, etc.)
4. Performance optimization
5. Security hardening

---

## 📞 Troubleshooting

Jika mengalami masalah, check:
1. Laravel logs: `storage/logs/laravel.log`
2. Apache error logs via cPanel
3. Browser console untuk frontend errors
4. Network tab untuk API request/response

Untuk bantuan lebih lanjut, dokumentasikan error message dan environment details.
