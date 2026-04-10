# Fix Mixed Content Error (HTTPS → HTTP)

## Masalah

Error di console:
```
Mixed Content: The page at 'https://management-kost.vercel.app/login' 
was loaded over HTTPS, but requested an insecure resource 
'http://mykost-cendana.xyz/api/login'. This request has been blocked; 
the content must be served over HTTPS.
```

**Penyebab:**
- Frontend Vercel menggunakan HTTPS (aman)
- Backend cPanel menggunakan HTTP (tidak aman)
- Browser memblokir request dari HTTPS ke HTTP

## Solusi 1: Install SSL di cPanel (RECOMMENDED untuk Production)

### Langkah-langkah:

#### 1. Install SSL Certificate di cPanel

**Via Let's Encrypt (GRATIS):**

1. Login ke cPanel
2. Cari "SSL/TLS Status" atau "Let's Encrypt SSL"
3. Pilih domain `mykost-cendana.xyz`
4. Klik "Run AutoSSL" atau "Install"
5. Tunggu beberapa menit sampai SSL aktif

**Via cPanel SSL Manager:**

1. Login ke cPanel
2. Cari "SSL/TLS"
3. Klik "Manage SSL Sites"
4. Install certificate untuk domain Anda

#### 2. Test SSL Aktif

Buka di browser:
```
https://mykost-cendana.xyz/api/health
```

Jika muncul JSON (bukan error SSL), berarti SSL sudah aktif! ✅

#### 3. Update Backend URL di Frontend

File `.env.production` sudah saya update ke HTTPS.

#### 4. Push ke GitHub

```bash
cd kost-app
git add .
git commit -m "Fix: Update backend URL to HTTPS"
git push origin main
```

#### 5. Test Login

Tunggu Vercel deploy (1-2 menit), lalu test login:
```
https://management-kost.vercel.app/login
```

**Seharusnya sekarang BERHASIL!** 🎉

---

## Solusi 2: Gunakan Ngrok (CEPAT - untuk Testing Sekarang)

Jika SSL belum bisa diinstall, gunakan ngrok dulu:

### Langkah-langkah:

#### 1. Jalankan Backend Lokal

```bash
cd kost-backend
php artisan serve
```

#### 2. Jalankan Ngrok (Terminal Baru)

```bash
ngrok http 8000
```

Copy URL ngrok yang muncul (contoh: `https://xxxx-xxxx.ngrok-free.app`)

#### 3. Update .env.local

Edit file `kost-app/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://xxxx-xxxx.ngrok-free.app/api
```

Ganti `xxxx-xxxx` dengan URL ngrok Anda.

#### 4. Restart Development Server

```bash
cd kost-app
# Tekan Ctrl+C untuk stop
npm run dev
```

#### 5. Test Login Lokal

Buka:
```
http://localhost:3000/login
```

Login dengan kredensial yang sudah di-reset.

**Seharusnya BERHASIL!** 🎉

---

## Solusi 3: Test Login dari Localhost (Bypass HTTPS)

Jika ingin test cepat tanpa ngrok:

#### 1. Update .env.local ke HTTP cPanel

```env
NEXT_PUBLIC_API_URL=http://mykost-cendana.xyz/api
```

#### 2. Restart Development Server

```bash
cd kost-app
npm run dev
```

#### 3. Test Login dari Localhost

Buka:
```
http://localhost:3000/login
```

**Catatan:** Ini hanya bekerja di localhost karena localhost tidak enforce HTTPS. Di Vercel tetap akan error.

---

## Rekomendasi

### Untuk Testing Sekarang:
→ **Gunakan Ngrok (Solusi 2)** - paling cepat, bisa login dalam 5 menit

### Untuk Production:
→ **Install SSL di cPanel (Solusi 1)** - solusi proper dan aman

---

## Troubleshooting

### SSL Certificate Error

Jika setelah install SSL muncul error "Certificate not valid":
- Tunggu 5-10 menit untuk propagasi
- Clear browser cache
- Coba di incognito mode

### Ngrok Warning Page

Jika muncul warning page ngrok di mobile:
- Sudah di-handle dengan header `ngrok-skip-browser-warning: true`
- Seharusnya tidak ada masalah

### CORS Error Setelah HTTPS

Jika masih ada CORS error setelah HTTPS:
1. Update `config/cors.php` di backend
2. Pastikan domain Vercel ada di `allowed_origins`
3. Clear cache backend:
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```

---

## Checklist

### Untuk Production (SSL):
- [ ] SSL certificate installed di cPanel
- [ ] Test `https://mykost-cendana.xyz/api/health` berhasil
- [ ] `.env.production` sudah update ke HTTPS
- [ ] Push ke GitHub
- [ ] Vercel deploy selesai
- [ ] Test login dari Vercel berhasil

### Untuk Testing (Ngrok):
- [ ] Backend lokal running (`php artisan serve`)
- [ ] Ngrok running (`ngrok http 8000`)
- [ ] `.env.local` update dengan URL ngrok
- [ ] Development server restart
- [ ] Test login dari localhost berhasil

---

## Kesimpulan

Masalah bukan di password atau backend, tapi di **Mixed Content (HTTPS → HTTP)**.

**Solusi tercepat:** Gunakan ngrok (5 menit)
**Solusi terbaik:** Install SSL di cPanel (production-ready)

Pilih salah satu dan Anda pasti bisa login! 🚀
