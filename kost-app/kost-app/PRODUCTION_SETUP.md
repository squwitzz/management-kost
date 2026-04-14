# Production Setup - cPanel Backend

## 🌐 Production URLs

- **Frontend (Vercel)**: https://management-kost.vercel.app
- **Backend (cPanel)**: http://mykost-cendana.xyz
- **API Endpoint**: http://mykost-cendana.xyz/api

---

## ✅ Configuration Applied

### 1. Environment Variables

**Frontend (.env.production)**:
```env
NEXT_PUBLIC_API_URL=http://mykost-cendana.xyz/api
NEXT_PUBLIC_APP_URL=https://management-kost.vercel.app
```

### 2. CORS Configuration

**Backend (config/cors.php)**:
```php
'allowed_origins' => [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://management-kost.vercel.app',
    'http://mykost-cendana.xyz',
],

'allowed_origins_patterns' => [
    '/\.vercel\.app$/',
],
```

---

## 🚀 Vercel Environment Variables Setup

### Via Vercel Dashboard:

1. Go to: https://vercel.com/dashboard
2. Select project: **management-kost**
3. Settings > Environment Variables
4. Add/Update:

```
Name: NEXT_PUBLIC_API_URL
Value: http://mykost-cendana.xyz/api
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name: NEXT_PUBLIC_APP_URL
Value: https://management-kost.vercel.app
Environments: ✅ Production ✅ Preview ✅ Development
```

5. Click **Save**
6. Go to Deployments > Latest > **Redeploy**

### Via Vercel CLI (Alternative):

```bash
cd kost-app

# Set production environment variable
vercel env add NEXT_PUBLIC_API_URL production
# Enter: http://mykost-cendana.xyz/api

vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://management-kost.vercel.app

# Redeploy
vercel --prod
```

---

## 🔧 Backend Setup (cPanel)

### 1. Update CORS

File: `config/cors.php` (already updated)

### 2. Clear Cache

```bash
cd /home/username/public_html
php artisan config:cache
php artisan cache:clear
php artisan route:cache
```

### 3. Set Permissions

```bash
chmod -R 755 storage bootstrap/cache
chmod -R 775 storage/logs
```

### 4. Test API

```bash
curl http://mykost-cendana.xyz/api/health
```

Should return JSON response.

---

## 🧪 Testing

### 1. Test Backend API

Open browser:
```
http://mykost-cendana.xyz/api/health
```

Expected: JSON response (not 404)

### 2. Test CORS

Open browser console at Vercel URL:
```javascript
fetch('http://mykost-cendana.xyz/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Expected: No CORS error

### 3. Test Login

1. Go to: https://management-kost.vercel.app/login
2. Open DevTools > Network tab
3. Try login
4. Check request goes to: `http://mykost-cendana.xyz/api/login`
5. Should return 200 or 401 (not network error)

---

## 🐛 Troubleshooting

### Issue: CORS Error

**Error**: "Access to fetch has been blocked by CORS policy"

**Fix**:
1. Check `config/cors.php` includes Vercel URL
2. Clear backend cache: `php artisan config:cache`
3. Restart PHP-FPM (if available)

### Issue: 404 Not Found

**Error**: "The route api/... could not be found"

**Fix**:
1. Check `.htaccess` in `public/` folder
2. Ensure mod_rewrite is enabled
3. Check routes in `routes/api.php`

### Issue: Mixed Content (HTTP/HTTPS)

**Error**: "Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure resource 'http://...'"

**Fix**:
1. Install SSL certificate on cPanel
2. Update backend URL to HTTPS
3. Update environment variables

**To install SSL**:
- cPanel > SSL/TLS Status
- Run AutoSSL or install Let's Encrypt

### Issue: Environment Variables Not Working

**Symptoms**: Still connecting to old URL

**Fix**:
1. Verify env vars in Vercel dashboard
2. Redeploy after changing env vars
3. Hard refresh browser (Ctrl+Shift+R)
4. Clear browser cache

---

## 🔒 Security Recommendations

### 1. Enable HTTPS

Install SSL certificate on cPanel:
```
cPanel > SSL/TLS Status > Run AutoSSL
```

Then update URLs to HTTPS:
```env
NEXT_PUBLIC_API_URL=https://mykost-cendana.xyz/api
```

### 2. Restrict CORS

Only allow specific origins:
```php
'allowed_origins' => [
    'https://management-kost.vercel.app',
],
```

### 3. Environment Variables

Never commit `.env` files with real credentials.

### 4. API Rate Limiting

Consider adding rate limiting in Laravel:
```php
Route::middleware('throttle:60,1')->group(function () {
    // API routes
});
```

---

## 📊 Monitoring

### Backend Logs

```bash
tail -f storage/logs/laravel.log
```

### Vercel Logs

```bash
vercel logs
```

Or via dashboard: Deployments > [Latest] > Logs

### Error Tracking

Consider adding:
- Sentry for error tracking
- Uptime monitoring (UptimeRobot)
- Performance monitoring

---

## 🔄 Update Workflow

### When Backend Changes:

1. Upload changes to cPanel
2. Run migrations: `php artisan migrate --force`
3. Clear cache: `php artisan config:cache`
4. Test endpoints

### When Frontend Changes:

1. Commit to GitHub: `git push origin main`
2. Vercel auto-deploys
3. Test on production URL

---

## ✅ Deployment Checklist

### Backend (cPanel)
- [x] Files uploaded to cPanel
- [x] Database configured
- [x] Migrations run
- [x] CORS configured
- [x] Permissions set
- [ ] SSL certificate installed (recommended)
- [ ] Cron jobs configured (if needed)

### Frontend (Vercel)
- [x] Repository pushed to GitHub
- [x] Vercel project connected
- [ ] Environment variables set in Vercel
- [ ] Redeploy after env vars update
- [x] Custom domain (optional)

### Testing
- [ ] Backend API accessible
- [ ] CORS working
- [ ] Login working
- [ ] All features tested
- [ ] Mobile tested
- [ ] PWA working

---

## 🎯 Next Steps

1. **Set environment variables in Vercel** (most important!)
2. **Redeploy Vercel** after setting env vars
3. **Test login** on production
4. **Install SSL** on cPanel (recommended)
5. **Update to HTTPS** after SSL installed

---

## 📞 Support

**Backend URL**: http://mykost-cendana.xyz
**Frontend URL**: https://management-kost.vercel.app

**Common Issues**:
- CORS errors → Check backend CORS config
- 404 errors → Check .htaccess and routes
- Connection errors → Check backend is running
- Env vars not working → Redeploy Vercel

---

**Status**: ⚠️ Needs Vercel Environment Variables Update

**Action Required**: Set `NEXT_PUBLIC_API_URL` in Vercel Dashboard

**ETA**: 5 minutes to complete setup
