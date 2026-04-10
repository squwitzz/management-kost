# Update Vercel untuk Menggunakan HTTPS Backend

## Status
✅ SSL sudah terpasang di backend: `https://mykost-cendana.xyz`
✅ File `.env.production` sudah diupdate ke HTTPS
❌ Vercel masih menggunakan HTTP (perlu update)

## Solusi: Set Environment Variable di Vercel Dashboard

### Langkah-langkah:

#### 1. Login ke Vercel Dashboard

Buka: https://vercel.com/dashboard

#### 2. Pilih Project

Klik project `management-kost`

#### 3. Buka Settings

Klik tab "Settings" di menu atas

#### 4. Buka Environment Variables

Di sidebar kiri, klik "Environment Variables"

#### 5. Tambah/Update Variable

**Tambah variable baru:**

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://mykost-cendana.xyz/api` | Production |

**Cara menambahkan:**
1. Klik "Add New"
2. Key: `NEXT_PUBLIC_API_URL`
3. Value: `https://mykost-cendana.xyz/api`
4. Environment: Pilih "Production" (centang Production)
5. Klik "Save"

#### 6. Redeploy

Setelah menambah environment variable, Vercel perlu redeploy:

**Opsi A: Trigger Redeploy dari Dashboard**
1. Klik tab "Deployments"
2. Klik deployment terakhir
3. Klik tombol "..." (three dots)
4. Klik "Redeploy"

**Opsi B: Push Commit Baru**
```bash
cd kost-app
git add .
git commit -m "Trigger redeploy for HTTPS backend"
git push origin main
```

#### 7. Tunggu Deploy Selesai

Tunggu 1-2 menit sampai deployment selesai (ada notifikasi di Vercel)

#### 8. Test Login

Buka: https://management-kost.vercel.app/login

Login dengan:
- Nomor Telepon: `081234567890`
- Password: `password123` (atau password yang Anda set)

**SEHARUSNYA SEKARANG BERHASIL!** 🎉

---

## Alternatif: Force Add .env.production ke Git

Jika tidak ingin set di Vercel dashboard, bisa force add file `.env.production`:

```bash
cd kost-app
git add -f .env.production
git commit -m "Add .env.production with HTTPS backend URL"
git push origin main
```

**Catatan:** Ini aman karena `.env.production` tidak berisi secret, hanya URL public.

---

## Verifikasi

### 1. Cek Environment Variable di Vercel

Di Vercel Dashboard → Settings → Environment Variables, pastikan ada:
```
NEXT_PUBLIC_API_URL = https://mykost-cendana.xyz/api
```

### 2. Cek Backend HTTPS

Buka di browser:
```
https://mykost-cendana.xyz/api/health
```

Harus return JSON tanpa error SSL.

### 3. Cek Console Browser

Setelah deploy, buka:
```
https://management-kost.vercel.app/login
```

Buka Console (F12), tidak boleh ada error "Mixed Content" lagi.

### 4. Test Login

Login dengan kredensial yang sudah di-reset.

---

## Troubleshooting

### Masih Ada Error "Mixed Content"

Berarti environment variable belum ter-apply:
1. Pastikan variable sudah disave di Vercel
2. Pastikan environment dipilih "Production"
3. Redeploy lagi

### Error SSL Certificate

Jika muncul error SSL:
1. Cek `https://mykost-cendana.xyz` di browser
2. Pastikan certificate valid
3. Tunggu 5-10 menit untuk propagasi

### Login Masih Gagal

Jika tidak ada error Mixed Content tapi login gagal:
1. Cek error message di alert
2. Cek console browser untuk error detail
3. Test backend langsung: `https://mykost-cendana.xyz/api/health`

---

## Checklist

- [ ] SSL certificate aktif di backend
- [ ] Test `https://mykost-cendana.xyz/api/health` berhasil
- [ ] Environment variable `NEXT_PUBLIC_API_URL` sudah diset di Vercel
- [ ] Vercel sudah redeploy
- [ ] Test login dari Vercel berhasil
- [ ] Tidak ada error "Mixed Content" di console
- [ ] File helper (reset-password-manual.php, dll) sudah dihapus dari cPanel

---

## Setelah Berhasil

1. ✅ Hapus file helper dari cPanel:
   - `reset-password-manual.php`
   - `reset-password-simple.php`
   - `reset-password.php`
   - `create-admin.php`
   - `setup-helper.php`

2. ✅ Ganti password dari profile page setelah login

3. ✅ Backend production SIAP! 🎉

---

## Summary

**Yang Perlu Dilakukan:**
1. Set environment variable di Vercel Dashboard
2. Redeploy
3. Test login

**Estimasi Waktu:** 5 menit

**Setelah ini, aplikasi Anda akan:**
- ✅ Berjalan full HTTPS (aman)
- ✅ Bisa login dari Vercel
- ✅ Production ready!
