# Setup Environment Variables di Vercel

## ❌ Error yang Terjadi

```
Tidak dapat terhubung ke server. 
Periksa backend berjalan di http://127.0.0.1:8000
```

## 🔍 Penyebab

1. Environment variable `NEXT_PUBLIC_API_URL` tidak di-set di Vercel
2. App menggunakan default URL `http://127.0.0.1:8000` (localhost)
3. Localhost tidak accessible dari Vercel production

## ✅ Solusi

### Step 1: Setup Backend URL

Anda perlu URL backend yang accessible dari internet. Pilih salah satu:

#### Opsi A: Ngrok (Temporary - untuk testing)

```bash
# Di komputer yang running Laravel backend
cd kost-backend
php artisan serve

# Di terminal lain
ngrok http 8000
```

Copy URL yang muncul, contoh:
```
https://abc123.ngrok-free.app
```

#### Opsi B: Deploy Backend ke Hosting

Deploy backend Laravel ke:
- cPanel (lihat DEPLOY_CPANEL.md)
- Railway
- Heroku
- VPS

Contoh URL:
```
https://api.yourdomain.com
```

### Step 2: Set Environment Variables di Vercel

1. **Buka Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Pilih project "management-kost"

2. **Buka Settings**
   - Klik tab "Settings"
   - Pilih "Environment Variables" di sidebar

3. **Add Variable**
   - Klik "Add New"
   - Isi form:

   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://your-backend-url.com/api
   
   Environment: 
   ☑ Production
   ☑ Preview
   ☑ Development
   ```

   **PENTING**: 
   - Jangan lupa `/api` di akhir URL
   - Gunakan HTTPS (bukan HTTP)
   - Pastikan backend accessible dari internet

4. **Save**
   - Klik "Save"

### Step 3: Redeploy

Setelah add environment variable, Vercel perlu redeploy:

**Opsi A: Trigger Redeploy**
1. Vercel Dashboard > Deployments
2. Klik "..." pada deployment terakhir
3. Pilih "Redeploy"

**Opsi B: Push Dummy Commit**
```bash
cd kost-app
git commit --allow-empty -m "Trigger redeploy after env setup"
git push origin main
```

### Step 4: Update Backend CORS

Backend Laravel perlu allow Vercel domain:

```bash
# SSH ke server backend atau edit local
cd kost-backend
nano config/cors.php
```

Update:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        'https://management-kost.vercel.app', // Ganti dengan URL Vercel Anda
        'https://your-custom-domain.com',     // Jika pakai custom domain
        'http://localhost:3000',              // Untuk development
    ],
    
    'allowed_origins_patterns' => [
        '/\.vercel\.app$/', // Allow semua Vercel preview deployments
    ],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => true,
];
```

Clear cache backend:

```bash
php artisan config:cache
php artisan cache:clear
```

---

## 🧪 Testing

### 1. Check Environment Variable

Di Vercel Dashboard > Settings > Environment Variables:
- ✅ `NEXT_PUBLIC_API_URL` ada
- ✅ Value benar (dengan `/api`)
- ✅ Checked untuk Production

### 2. Test Backend URL

Buka di browser:
```
https://your-backend-url.com/api/health
```

Harus return response (bukan error).

### 3. Test Login

1. Buka Vercel URL: `https://management-kost.vercel.app/login`
2. Buka Browser Console (F12)
3. Coba login
4. Check Network tab:
   - Request URL harus ke backend Anda (bukan localhost)
   - Status harus 200 atau 401 (bukan network error)

---

## 🐛 Troubleshooting

### Error: "CORS policy"

```
Access to fetch at 'https://api.example.com' from origin 
'https://management-kost.vercel.app' has been blocked by CORS policy
```

**Fix:**
- Update `config/cors.php` di backend
- Add Vercel URL ke `allowed_origins`
- Clear cache: `php artisan config:cache`

### Error: "Failed to fetch"

```
TypeError: Failed to fetch
```

**Possible causes:**
1. Backend tidak running
2. Backend URL salah
3. Backend tidak accessible dari internet
4. SSL certificate issue

**Fix:**
- Test backend URL di browser
- Pastikan backend running
- Check firewall/security groups

### Error: "net::ERR_NAME_NOT_RESOLVED"

```
GET https://your-backend-url.com/api/login net::ERR_NAME_NOT_RESOLVED
```

**Fix:**
- Check DNS settings
- Pastikan domain sudah propagate
- Test dengan `ping your-backend-url.com`

### Environment Variable Tidak Terdetect

**Symptoms:**
- Masih connect ke localhost
- Console log shows `http://127.0.0.1:8000`

**Fix:**
1. Pastikan variable name: `NEXT_PUBLIC_API_URL` (exact)
2. Redeploy setelah add variable
3. Clear browser cache
4. Hard refresh (Ctrl+Shift+R)

---

## 📋 Checklist

- [ ] Backend deployed dan accessible dari internet
- [ ] Backend URL dicatat (dengan `/api`)
- [ ] Environment variable di-set di Vercel
- [ ] Vercel di-redeploy
- [ ] CORS di-update di backend
- [ ] Backend cache di-clear
- [ ] Test backend URL di browser
- [ ] Test login di Vercel URL
- [ ] No CORS errors di console
- [ ] Login berhasil

---

## 🎯 Quick Fix (Ngrok)

Jika butuh cepat untuk testing:

```bash
# Terminal 1: Run Laravel
cd kost-backend
php artisan serve

# Terminal 2: Run Ngrok
ngrok http 8000

# Copy URL yang muncul, contoh:
# https://abc123.ngrok-free.app

# Set di Vercel:
# NEXT_PUBLIC_API_URL = https://abc123.ngrok-free.app/api

# Update CORS di backend:
# allowed_origins = ['https://management-kost.vercel.app']

# Redeploy Vercel
```

**Note**: Ngrok URL berubah setiap restart (free tier).

---

## 📚 Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Laravel CORS](https://laravel.com/docs/cors)
- [Ngrok Documentation](https://ngrok.com/docs)

---

## 🆘 Need Help?

Jika masih error:
1. Screenshot error di browser console
2. Check Network tab untuk request details
3. Share backend URL (untuk test)
4. Share Vercel URL
5. Tanya di chat dengan detail error

---

**Status**: ⚠️ Needs Configuration

**Action Required**: Set `NEXT_PUBLIC_API_URL` di Vercel

**ETA**: 5-10 menit untuk setup
