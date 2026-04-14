# Deploy to Vercel

## Cara Deploy Perubahan Terbaru ke Vercel

### Opsi 1: Auto Deploy (Recommended)
Vercel seharusnya otomatis deploy setiap kali ada push ke branch `main`. Tapi kadang perlu trigger manual.

1. **Buka Vercel Dashboard**: https://vercel.com/dashboard
2. **Pilih project**: `management-kost`
3. **Klik tab "Deployments"**
4. **Klik "Redeploy"** pada deployment terakhir
5. **Tunggu proses deployment selesai** (biasanya 2-3 menit)

### Opsi 2: Trigger dari Git
1. Buat commit kosong untuk trigger deployment:
```bash
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin main
```

2. Vercel akan otomatis detect push dan mulai deployment

### Opsi 3: Deploy via Vercel CLI
```bash
# Install Vercel CLI (jika belum)
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
cd kost-app
vercel --prod
```

## Cek Status Deployment

1. Buka: https://vercel.com/squwitzz/management-kost
2. Lihat status deployment terbaru
3. Jika ada error, klik untuk melihat build logs

## Setelah Deploy Berhasil

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** halaman (Ctrl+F5)
3. **Buka halaman resident detail** lagi
4. **Tombol "Debug" dan "Assign Room"** seharusnya sudah muncul

## Troubleshooting

### Deployment Gagal
- Cek build logs di Vercel dashboard
- Pastikan tidak ada error TypeScript
- Pastikan semua dependencies terinstall

### Perubahan Tidak Muncul
- Clear browser cache
- Coba buka di incognito/private window
- Cek apakah deployment sudah selesai (status: Ready)

### Environment Variables
Pastikan `.env.production` sudah di-set di Vercel:
- `NEXT_PUBLIC_API_URL=https://mykost-cendana.xyz/api`
- `NEXT_PUBLIC_APP_URL=https://management-kost.vercel.app`

## Current Status

**Last Commit:** Debug: Add debug button and improve room check condition
**Commit Hash:** 422bb1b
**Branch:** main

**Changes Include:**
- Debug button untuk melihat data resident
- Improved room check condition
- Assign Room button di Quick Action Bar
- Badge "No Room Assigned"

---

**Note:** Jika Anda sedang test di localhost, jalankan:
```bash
cd kost-app
npm run dev
```

Lalu buka: http://localhost:3000
