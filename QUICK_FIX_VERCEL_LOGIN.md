# ⚡ Quick Fix: Vercel Login Error

## 🎯 Problem

Error: "Tidak dapat terhubung ke server. Periksa backend berjalan di http://127.0.0.1:8000"

## ✅ Solution (5 Menit)

### 1️⃣ Pastikan Backend Running & Accessible

**Cek backend Anda:**

```bash
# Test backend URL di browser atau curl
curl https://hortense-galvanotactic-rodger.ngrok-free.dev/api/health
```

Jika error atau tidak response:
- Backend tidak running
- Ngrok expired/stopped
- URL berubah

**Fix:**
```bash
# Start Laravel backend
cd kost-backend
php artisan serve

# Start Ngrok (terminal baru)
ngrok http 8000

# Copy URL baru yang muncul
```

### 2️⃣ Set Environment Variable di Vercel

**Via Vercel Dashboard:**

1. Buka: https://vercel.com/dashboard
2. Pilih project "management-kost"
3. Settings > Environment Variables
4. Add New:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://hortense-galvanotactic-rodger.ngrok-free.dev/api
   
   ✅ Production
   ✅ Preview  
   ✅ Development
   ```
5. Save

**Via Vercel CLI (Alternatif):**

```bash
cd kost-app

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL

# Paste URL saat diminta:
# https://hortense-galvanotactic-rodger.ngrok-free.dev/api

# Select: Production, Preview, Development (all)
```

### 3️⃣ Redeploy

**Opsi A: Via Dashboard**
- Deployments > Latest > "..." > Redeploy

**Opsi B: Via Git**
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

**Opsi C: Via CLI**
```bash
vercel --prod
```

### 4️⃣ Update CORS di Backend

```bash
cd kost-backend
nano config/cors.php
```

Pastikan ada:
```php
'allowed_origins' => [
    'https://management-kost.vercel.app', // URL Vercel Anda
    'http://localhost:3000',
],

'allowed_origins_patterns' => [
    '/\.vercel\.app$/',
],
```

Clear cache:
```bash
php artisan config:cache
```

### 5️⃣ Test

1. Buka: https://management-kost.vercel.app/login
2. Open Console (F12)
3. Try login
4. Check Network tab - request harus ke backend URL Anda

---

## 🔍 Verify Setup

### Check 1: Environment Variable

```bash
# Via Vercel CLI
vercel env ls

# Should show:
# NEXT_PUBLIC_API_URL (Production, Preview, Development)
```

### Check 2: Backend Accessible

```bash
curl https://your-backend-url.com/api/health
# Should return JSON response
```

### Check 3: CORS Working

Open browser console di Vercel URL, run:
```javascript
fetch('https://your-backend-url.com/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

No CORS error = ✅ Working

---

## 🐛 Still Not Working?

### Error: "CORS policy"

Backend CORS belum di-update. Fix:
```bash
cd kost-backend
php artisan config:cache
php artisan cache:clear
```

### Error: "Failed to fetch"

Backend tidak accessible. Check:
- Backend running?
- Ngrok running?
- URL benar?

### Error: Still localhost

Environment variable belum loaded. Fix:
- Redeploy Vercel
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache

---

## 📱 Your Current Setup

**Frontend (Vercel):**
- URL: https://management-kost.vercel.app
- Status: ✅ Deployed

**Backend (Ngrok):**
- URL: https://hortense-galvanotactic-rodger.ngrok-free.dev
- Status: ❓ Need to verify

**Action Needed:**
1. ✅ Set `NEXT_PUBLIC_API_URL` di Vercel
2. ✅ Redeploy
3. ✅ Update CORS
4. ✅ Test login

---

## 💡 Pro Tips

### Permanent Solution

Deploy backend ke hosting permanent:
- cPanel (lihat DEPLOY_CPANEL.md)
- Railway (free tier)
- Heroku
- VPS

Ngrok URL berubah setiap restart (free tier).

### Check Logs

**Vercel Logs:**
```bash
vercel logs
```

**Backend Logs:**
```bash
tail -f storage/logs/laravel.log
```

---

**Time to Fix**: 5-10 menit

**Difficulty**: Easy ⭐

**Next**: Test login dan semua fitur!
