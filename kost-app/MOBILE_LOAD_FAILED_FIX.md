# Fix: Mobile "Load Failed" Error

## 🐛 Problem

- ✅ Desktop browser: Bisa login dan akses dashboard
- ❌ Mobile browser: "Load failed" error

## 🔍 Penyebab

### Ngrok Free Tier Limitation

Ngrok free tier menampilkan **warning page** sebelum akses API:
- Desktop browser: User bisa klik "Visit Site" untuk bypass
- Mobile browser: Fetch API tidak bisa bypass warning page otomatis
- Result: Request gagal dengan "Load failed"

**Warning page Ngrok:**
```
You are about to visit: https://xxx.ngrok-free.app
This site is served for free through ngrok.com
[Visit Site] [Don't warn me again]
```

## ✅ Solusi

### Opsi 1: Bypass Ngrok Warning (Quick Fix)

Tambahkan header `ngrok-skip-browser-warning` ke semua API requests.

**Update `app/lib/api.ts`:**

```typescript
private static getHeaders(includeAuth: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Bypass Ngrok warning
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}
```

**Juga update di login method:**

```typescript
static async login(nomor_telepon: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Add this
      },
      body: JSON.stringify({ nomor_telepon, password }),
    });
    // ... rest of code
  }
}
```

### Opsi 2: Deploy Backend ke Hosting Permanent (Recommended)

Ngrok hanya untuk development/testing. Untuk production, deploy backend ke:

#### A. Railway (Free Tier)

1. Sign up: https://railway.app
2. New Project > Deploy from GitHub
3. Select `kost-backend` repository
4. Add environment variables
5. Deploy!

**Pros:**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ No warning page
- ✅ Persistent URL

#### B. cPanel Hosting

Lihat tutorial lengkap di `DEPLOY_CPANEL.md`

**Pros:**
- ✅ Full control
- ✅ Custom domain
- ✅ Production ready

#### C. Heroku

```bash
cd kost-backend
heroku create kost-backend-api
git push heroku main
```

### Opsi 3: Ngrok Paid Plan

Upgrade ke Ngrok paid plan ($8/month):
- No warning page
- Custom domain
- More concurrent connections

---

## 🚀 Quick Fix Implementation

Saya akan implement Opsi 1 (bypass Ngrok warning):

### Step 1: Update API Client

File yang perlu diupdate: `app/lib/api.ts`

### Step 2: Test di Mobile

1. Deploy changes ke Vercel
2. Test di mobile browser
3. Should work! ✅

### Step 3: (Optional) Deploy Backend Permanent

Untuk production yang proper, deploy backend ke hosting permanent.

---

## 🧪 Testing

### Test di Desktop
```bash
# Open browser console
fetch('https://your-ngrok-url.ngrok-free.app/api/health', {
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
})
.then(r => r.json())
.then(console.log)
```

### Test di Mobile
1. Open app di mobile browser
2. Try login
3. Check if dashboard loads
4. No "Load failed" error

---

## 📱 Mobile-Specific Issues

### Issue 1: Service Worker Cache

Mobile browser might cache old responses.

**Fix:**
```javascript
// Clear service worker cache
if ('serviceWorker' in navigator) {
  caches.keys().then(keys => {
    keys.forEach(key => caches.delete(key));
  });
}
```

### Issue 2: Network Timeout

Mobile networks slower than desktop.

**Fix:** Add timeout handling:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

fetch(url, {
  signal: controller.signal,
  headers: { ... }
})
.finally(() => clearTimeout(timeoutId));
```

### Issue 3: HTTPS Mixed Content

Vercel uses HTTPS, Ngrok uses HTTPS - should be OK.

**Check:** Make sure `NEXT_PUBLIC_API_URL` uses `https://` not `http://`

---

## 🔧 Implementation

Let me implement the fix now...

---

## 📊 Comparison

| Solution | Speed | Cost | Reliability | Mobile Support |
|----------|-------|------|-------------|----------------|
| Ngrok + Header | ⚡ Fast | Free | ⭐⭐ | ✅ |
| Railway | ⚡ Fast | Free | ⭐⭐⭐⭐ | ✅ |
| cPanel | 🐌 Medium | $$ | ⭐⭐⭐⭐⭐ | ✅ |
| Heroku | ⚡ Fast | Free | ⭐⭐⭐⭐ | ✅ |

---

## 🎯 Recommended Path

**For Now (Testing):**
1. ✅ Add `ngrok-skip-browser-warning` header
2. ✅ Test di mobile
3. ✅ Should work!

**For Production:**
1. Deploy backend ke Railway/cPanel
2. Update `NEXT_PUBLIC_API_URL` di Vercel
3. Remove Ngrok dependency

---

## 🆘 If Still Not Working

### Check 1: Network Tab

Open mobile browser DevTools (if available):
- Chrome mobile: chrome://inspect
- Safari iOS: Connect to Mac > Safari > Develop

Check:
- Request URL correct?
- Headers sent?
- Response status?

### Check 2: Try Different Mobile Browser

- Chrome mobile
- Safari mobile
- Firefox mobile
- In-app browser (WhatsApp, Instagram)

### Check 3: Clear Everything

```javascript
// In mobile browser console
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

---

**Status**: 🔧 Implementing fix...

**ETA**: 2 minutes

**Expected Result**: Mobile browser works like desktop
