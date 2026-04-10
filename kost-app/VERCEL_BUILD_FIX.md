# Vercel Build Fix

## ❌ Error yang Terjadi

```
⚠ Invalid next.config.ts options detected:
⚠ Unrecognized key(s) in object: 'swcMinify'
```

## ✅ Solusi

### Masalah
- `swcMinify` sudah deprecated di Next.js 16
- SWC minification sudah enabled by default
- Tidak perlu lagi di-specify di config

### Yang Sudah Diperbaiki

File `next.config.ts` sudah diupdate:

**Sebelum:**
```typescript
const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true, // ❌ Deprecated
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['@/app/components', '@/app/lib'],
  },
};
```

**Sesudah:**
```typescript
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // swcMinify removed - sudah default di Next.js 16
  images: {
    unoptimized: false, // Let Vercel optimize
  },
  experimental: {
    optimizePackageImports: ['@/app/components', '@/app/lib'],
  },
  async headers() {
    // Security headers
  },
};
```

## 🚀 Deploy Ulang ke Vercel

### Opsi 1: Auto Deploy (Recommended)

```bash
# Commit & push perubahan
git add .
git commit -m "Fix: Remove deprecated swcMinify from next.config"
git push origin main
```

Vercel akan otomatis detect push dan re-deploy.

### Opsi 2: Manual Deploy via Vercel CLI

```bash
cd kost-app
vercel --prod
```

### Opsi 3: Via Vercel Dashboard

1. Buka Vercel Dashboard
2. Pilih project Anda
3. Klik "Deployments"
4. Klik "Redeploy" pada deployment terakhir

## ✅ Verifikasi Build Berhasil

Setelah deploy, check:

1. **Build Logs** - Tidak ada warning `swcMinify`
2. **Deployment Status** - Status "Ready"
3. **Preview URL** - Buka dan test aplikasi
4. **Production URL** - Test di production domain

## 📝 Perubahan Lainnya

### Image Optimization

Changed dari `unoptimized: true` ke `unoptimized: false`:
- Vercel akan otomatis optimize images
- Faster loading time
- Better performance

### Security Headers

Ditambahkan security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`

## 🐛 Troubleshooting

### Build Masih Error?

1. **Clear Vercel Cache**
   - Dashboard > Settings > Clear Cache
   - Redeploy

2. **Check Node Version**
   - Vercel default: Node 20.x
   - Next.js 16 requires: Node 18.18+

3. **Check Dependencies**
   ```bash
   npm install
   npm run build
   ```

### Warning Lain yang Mungkin Muncul

**"Telemetry collection"**
- Ini hanya informasi, bukan error
- Aman untuk diabaikan

**"Experiments (use with caution)"**
- `optimizePackageImports` masih experimental
- Tapi aman digunakan dan recommended

## 📚 References

- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Next.js Config Options](https://nextjs.org/docs/app/api-reference/next-config-js)
- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)

## ✅ Checklist

- [x] Remove `swcMinify` dari config
- [x] Update `images.unoptimized` untuk Vercel
- [x] Add security headers
- [ ] Commit & push changes
- [ ] Verify build success di Vercel
- [ ] Test production URL

---

**Status**: ✅ Fixed - Ready to deploy!
