# cPanel Backend Setup - Troubleshooting 404

## ❌ Problem

Backend URL returns 404:
```
http://mykost-cendana.xyz/api → 404 Not Found
```

## 🔍 Root Cause

Laravel backend belum di-setup dengan benar di cPanel.

---

## ✅ Solution: Setup Laravel di cPanel

### Option 1: Root Domain Setup

#### Step 1: Upload Laravel Files

Upload semua file Laravel ke folder:
```
/home/username/public_html/
```

Struktur harus seperti ini:
```
public_html/
├── app/
├── bootstrap/
├── config/
├── database/
├── public/          ← Document root
│   ├── index.php
│   └── .htaccess
├── resources/
├── routes/
├── storage/
├── vendor/
├── .env
├── artisan
└── composer.json
```

#### Step 2: Set Document Root

1. cPanel > **Domains**
2. Find `mykost-cendana.xyz`
3. Click **Manage**
4. **Document Root**: Change to `/public_html/public`
5. **Save**

#### Step 3: Create .htaccess

File: `public_html/public/.htaccess`

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

#### Step 4: Setup .env

File: `public_html/.env`

```env
APP_NAME="Kost Management"
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=http://mykost-cendana.xyz

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

JWT_SECRET=your_jwt_secret_here
```

#### Step 5: Run Setup Commands

Via SSH or Terminal in cPanel:

```bash
cd /home/username/public_html

# Install dependencies
composer install --optimize-autoloader --no-dev

# Generate app key (if not set)
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Run migrations
php artisan migrate --force

# Cache config
php artisan config:cache
php artisan route:cache

# Set permissions
chmod -R 755 storage bootstrap/cache
chmod -R 775 storage/logs
```

#### Step 6: Test

```
http://mykost-cendana.xyz/
```

Should show Laravel welcome page or your app.

```
http://mykost-cendana.xyz/api/health
```

Should return JSON.

---

### Option 2: Subdomain Setup (Recommended)

Lebih mudah dan lebih clean.

#### Step 1: Create Subdomain

1. cPanel > **Subdomains**
2. **Subdomain**: `api`
3. **Domain**: `mykost-cendana.xyz`
4. **Document Root**: `/public_html/api/public`
5. **Create**

#### Step 2: Upload Laravel

Upload ke: `/public_html/api/`

Struktur:
```
public_html/
└── api/
    ├── app/
    ├── config/
    ├── public/      ← Subdomain points here
    ├── routes/
    └── ...
```

#### Step 3: Setup (Same as Option 1)

Follow steps 3-6 from Option 1, but in `/public_html/api/` folder.

#### Step 4: Update Frontend URL

```env
NEXT_PUBLIC_API_URL=http://api.mykost-cendana.xyz/api
```

---

## 🧪 Testing Checklist

### Test 1: Root URL
```
http://mykost-cendana.xyz/
```
✅ Should show Laravel page (not 404)

### Test 2: API Health
```
http://mykost-cendana.xyz/api/health
```
✅ Should return JSON

### Test 3: Login Endpoint
```bash
curl -X POST http://mykost-cendana.xyz/api/login \
  -H "Content-Type: application/json" \
  -d '{"nomor_telepon":"08123456789","password":"password"}'
```
✅ Should return JSON (200 or 401)

### Test 4: From Vercel
Open: https://management-kost.vercel.app/login
Try login
✅ Should connect to backend

---

## 🐛 Common Issues

### Issue 1: 500 Internal Server Error

**Check Laravel logs:**
```bash
tail -f storage/logs/laravel.log
```

**Common causes:**
- Missing .env file
- Wrong database credentials
- Missing APP_KEY
- Permission issues

**Fix:**
```bash
php artisan key:generate
chmod -R 755 storage bootstrap/cache
```

### Issue 2: 404 on All Routes

**Cause:** .htaccess not working or mod_rewrite disabled

**Fix:**
1. Check .htaccess exists in `public/`
2. Contact hosting support to enable mod_rewrite

### Issue 3: Blank Page

**Cause:** PHP errors hidden

**Fix:**
```env
APP_DEBUG=true
```

Check error, then set back to `false`.

### Issue 4: Database Connection Failed

**Check:**
- Database exists
- User has privileges
- Credentials correct in .env

**Test connection:**
```bash
php artisan tinker
DB::connection()->getPdo();
```

---

## 🔒 Security

### After Setup:

1. **Set APP_DEBUG=false**
2. **Remove .env from public access**
3. **Set proper file permissions**
4. **Install SSL certificate**
5. **Update to HTTPS**

---

## 📝 Quick Commands Reference

```bash
# Navigate to Laravel
cd /home/username/public_html

# Install dependencies
composer install --no-dev

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Cache for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Check routes
php artisan route:list

# Run migrations
php artisan migrate --force

# Set permissions
chmod -R 755 storage bootstrap/cache
chmod -R 775 storage/logs
```

---

## 🆘 Still Not Working?

### Check These:

1. **PHP Version**: Laravel 12 requires PHP 8.2+
   - cPanel > Select PHP Version
   
2. **Composer**: Make sure composer installed
   ```bash
   composer --version
   ```

3. **Extensions**: Required PHP extensions
   - OpenSSL
   - PDO
   - Mbstring
   - Tokenizer
   - XML
   - Ctype
   - JSON

4. **File Permissions**:
   ```bash
   ls -la storage/
   ls -la bootstrap/cache/
   ```

5. **Apache Logs**:
   ```bash
   tail -f /home/username/logs/error_log
   ```

---

## 🎯 Current Workaround

Frontend sudah di-update untuk hardcode URL production:
- Vercel akan otomatis gunakan `http://mykost-cendana.xyz/api`
- Tidak perlu set environment variables di Vercel

**Status**: ⚠️ Waiting for backend setup di cPanel

**Next**: Setup Laravel di cPanel mengikuti guide di atas

**ETA**: 15-30 menit untuk setup backend
