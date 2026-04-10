# Tutorial Deploy ke Vercel

Tutorial lengkap untuk deploy aplikasi Kost Management System ke Vercel (Frontend Next.js) dan hosting backend Laravel terpisah.

## 📋 Arsitektur Deployment

- **Frontend (Next.js)**: Deploy ke Vercel
- **Backend (Laravel)**: Deploy ke hosting lain (cPanel, VPS, Railway, dll)
- **Database**: MySQL di hosting backend

---

## 🎯 Bagian 1: Persiapan

### 1.1 Persyaratan

- Akun GitHub (untuk connect dengan Vercel)
- Akun Vercel (gratis di [vercel.com](https://vercel.com))
- Backend Laravel sudah di-deploy (lihat DEPLOY_CPANEL.md untuk backend)
- Git installed di komputer

### 1.2 Push Project ke GitHub

```bash
# Di root project (bukan di kost-app)
git init
git add .
git commit -m "Initial commit"

# Buat repository di GitHub, lalu:
git remote add origin https://github.com/username/kost-management.git
git branch -M main
git push -u origin main
```

**Penting**: Buat file `.gitignore` di root jika belum ada:

```gitignore
# Dependencies
node_modules/
vendor/

# Environment files
.env
.env.local
.env.production
.env.*.local

# Build outputs
.next/
out/
dist/
build/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Laravel specific
kost-backend/storage/*.key
kost-backend/storage/logs/*
kost-backend/bootstrap/cache/*
```

---

## 🚀 Bagian 2: Deploy Frontend ke Vercel

### 2.1 Setup Project di Vercel

**Opsi A: Via Vercel Dashboard (Recommended)**

1. Login ke [vercel.com](https://vercel.com)
2. Klik **"Add New Project"**
3. Import repository GitHub Anda
4. Vercel akan auto-detect Next.js

**Konfigurasi Project:**

- **Framework Preset**: Next.js
- **Root Directory**: `kost-app` (karena Next.js ada di subfolder)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install`

### 2.2 Setup Environment Variables

Di Vercel Dashboard > Project Settings > Environment Variables, tambahkan:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

**Catatan**: 
- `NEXT_PUBLIC_API_URL` harus URL backend Laravel yang sudah di-deploy
- `NEXT_PUBLIC_APP_URL` akan otomatis dari Vercel, atau gunakan custom domain

### 2.3 Deploy

1. Klik **"Deploy"**
2. Tunggu proses build (2-5 menit)
3. Setelah selesai, Anda akan dapat URL: `https://your-app.vercel.app`

**Opsi B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy dari folder kost-app
cd kost-app
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: kost-app
# - Directory: ./ (current)
# - Override settings? No

# Deploy to production
vercel --prod
```

---

## 🔧 Bagian 3: Konfigurasi Next.js untuk Vercel

### 3.1 Update next.config.ts

File `kost-app/next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Vercel handles images optimization
  images: {
    domains: ['api.yourdomain.com'], // Add your API domain if serving images
    unoptimized: false, // Let Vercel optimize
  },
  
  // Optimize for Vercel
  experimental: {
    optimizePackageImports: ['@/app/components', '@/app/lib'],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Redirects (optional)
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

### 3.2 Buat vercel.json (Optional)

File `kost-app/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_API_URL": "@api-url"
    }
  }
}
```

### 3.3 Commit & Push Changes

```bash
cd kost-app
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

Vercel akan otomatis re-deploy setiap kali ada push ke branch main.

---

## 🌐 Bagian 4: Custom Domain (Optional)

### 4.1 Tambah Custom Domain di Vercel

1. Di Vercel Dashboard > Project > Settings > Domains
2. Klik **"Add Domain"**
3. Masukkan domain: `app.yourdomain.com`
4. Vercel akan memberikan DNS records

### 4.2 Setup DNS

Di DNS provider Anda (Cloudflare, Namecheap, dll), tambahkan:

**Untuk subdomain:**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

**Untuk root domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

### 4.3 Update Environment Variables

Setelah custom domain aktif, update di Vercel:

```env
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

---

## 🔐 Bagian 5: Setup Backend untuk CORS

### 5.1 Update CORS di Laravel Backend

File `kost-backend/config/cors.php`:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        'https://your-app.vercel.app',
        'https://app.yourdomain.com', // jika pakai custom domain
        'http://localhost:3000', // untuk development
    ],
    
    'allowed_origins_patterns' => [
        '/\.vercel\.app$/', // Allow all Vercel preview deployments
    ],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => true,
];
```

### 5.2 Update .env Backend

```env
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://app.yourdomain.com
```

### 5.3 Clear Cache Backend

```bash
cd ~/public_html/api
php artisan config:cache
php artisan cache:clear
```

---

## 🚦 Bagian 6: Environment-Based Configuration

### 6.1 Multiple Environments di Vercel

Vercel otomatis membuat 3 environment:

1. **Production**: Branch `main` → `your-app.vercel.app`
2. **Preview**: Pull requests → `your-app-git-branch.vercel.app`
3. **Development**: Local development

### 6.2 Environment Variables per Environment

Di Vercel Dashboard, set variables untuk setiap environment:

**Production:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**Preview:**
```env
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com
```

**Development:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📊 Bagian 7: Monitoring & Analytics

### 7.1 Vercel Analytics (Built-in)

1. Di Vercel Dashboard > Project > Analytics
2. Enable **Web Analytics** (gratis)
3. Lihat real-time visitors, page views, dll

### 7.2 Speed Insights

1. Install package:

```bash
cd kost-app
npm install @vercel/speed-insights
```

2. Update `app/layout.tsx`:

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 7.3 Error Tracking

Vercel otomatis track errors. Lihat di:
- Dashboard > Project > Logs
- Real-time logs untuk debugging

---

## 🔄 Bagian 8: Deployment Workflow

### 8.1 Automatic Deployments

Setiap push ke GitHub akan trigger deployment:

```bash
# Development
git checkout -b feature/new-feature
# ... make changes ...
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Vercel creates preview deployment

# Production
git checkout main
git merge feature/new-feature
git push origin main
# Vercel deploys to production
```

### 8.2 Manual Deployment

```bash
cd kost-app
vercel --prod
```

### 8.3 Rollback

Di Vercel Dashboard:
1. Go to Deployments
2. Find previous successful deployment
3. Click "..." > "Promote to Production"

---

## ⚡ Bagian 9: Performance Optimization

### 9.1 Enable Edge Functions (Optional)

Untuk API routes yang perlu cepat, gunakan Edge Runtime:

```typescript
// app/api/route.ts
export const runtime = 'edge';

export async function GET() {
  return Response.json({ message: 'Hello from Edge' });
}
```

### 9.2 Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/icon-192.png"
  alt="Logo"
  width={192}
  height={192}
  priority // for above-the-fold images
/>
```

### 9.3 Caching Strategy

Vercel otomatis cache static assets. Untuk API responses:

```typescript
// app/api/data/route.ts
export async function GET() {
  return Response.json(
    { data: 'cached data' },
    {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate',
      },
    }
  );
}
```

---

## 🐛 Bagian 10: Troubleshooting

### Issue: Build Failed

**Check build logs:**
1. Vercel Dashboard > Deployments > Failed deployment
2. Click "View Build Logs"

**Common fixes:**
```bash
# Locally test build
cd kost-app
npm run build

# Fix TypeScript errors
npm run lint

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Issue: Environment Variables Not Working

1. Pastikan prefix `NEXT_PUBLIC_` untuk client-side variables
2. Redeploy setelah update env vars
3. Check di build logs apakah env vars ter-load

### Issue: API CORS Error

1. Check backend CORS config
2. Pastikan Vercel domain ada di `allowed_origins`
3. Check browser console untuk detail error

### Issue: 404 on Page Refresh

Vercel handles this automatically untuk Next.js. Jika masih terjadi:
- Pastikan menggunakan Next.js routing (bukan static export)
- Check `next.config.ts` tidak ada `output: 'export'`

---

## 📱 Bagian 11: PWA di Vercel

### 11.1 Service Worker

Vercel serve static files dari `public/`:

```javascript
// public/sw.js already exists in your project
// Vercel will serve it automatically at /sw.js
```

### 11.2 Manifest

```json
// public/manifest.json
{
  "name": "Kost Management",
  "short_name": "Kost App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 11.3 Headers untuk PWA

Sudah included di `next.config.ts` headers configuration.

---

## 💰 Bagian 12: Pricing & Limits

### Vercel Free Tier (Hobby)

- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ Analytics (basic)
- ⚠️ 1 concurrent build
- ⚠️ 10 second serverless function timeout

### Upgrade ke Pro ($20/month)

- ✅ 1 TB bandwidth
- ✅ 5 concurrent builds
- ✅ 60 second function timeout
- ✅ Team collaboration
- ✅ Advanced analytics

---

## ✅ Checklist Deployment

- [ ] Backend Laravel sudah di-deploy dan accessible
- [ ] Database sudah setup dan migrate
- [ ] Project di-push ke GitHub
- [ ] Vercel project created dan linked
- [ ] Environment variables configured
- [ ] CORS di backend sudah include Vercel domain
- [ ] Build berhasil di Vercel
- [ ] Test login dan fitur utama
- [ ] Custom domain setup (optional)
- [ ] SSL certificate active
- [ ] Analytics enabled
- [ ] Error tracking configured

---

## 🎉 Selesai!

Aplikasi Next.js Anda sekarang live di Vercel!

**URLs:**
- Production: `https://your-app.vercel.app`
- Custom Domain: `https://app.yourdomain.com`
- Backend API: `https://api.yourdomain.com`

**Next Steps:**
1. Monitor performance di Vercel Analytics
2. Setup error tracking (Sentry)
3. Configure CI/CD untuk automated testing
4. Setup staging environment
5. Document deployment process untuk tim

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🆘 Support

Jika ada masalah:
1. Check Vercel build logs
2. Check browser console
3. Check backend Laravel logs
4. Vercel Community: [vercel.com/community](https://vercel.com/community)
