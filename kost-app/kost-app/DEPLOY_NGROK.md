# Deploy dengan Ngrok - Panduan Lengkap

## ⚠️ Penting: Ngrok Free Tier Limitation

Ngrok free tier **hanya mengizinkan 1 tunnel aktif**. Ada 3 solusi:

### Solusi A: Hanya Expose Backend (RECOMMENDED untuk Free Tier)

Ini cara paling praktis:
- Frontend tetap di localhost:3000
- Backend di-expose dengan ngrok
- Bisa diakses dari device lain di network yang sama

### Solusi B: Gunakan Ngrok Config (Butuh Paid Plan)

Untuk multiple tunnels, butuh upgrade ngrok.

### Solusi C: Gunakan Alternatif Ngrok

Gunakan tools lain seperti:
- **LocalTunnel** (free, unlimited)
- **Serveo** (free)
- **Cloudflare Tunnel** (free)

---

## Persiapan

1. Install ngrok jika belum:
   - Download dari https://ngrok.com/download
   - Atau install via chocolatey: `choco install ngrok`

2. Daftar akun ngrok (gratis) di https://dashboard.ngrok.com/signup

3. Setup authtoken:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

---

## METODE 1: Hanya Expose Backend (FREE - RECOMMENDED)

### Langkah 1: Start Laravel Backend

```bash
# Terminal 1: Start Laravel
cd kost-backend
php artisan serve --host=0.0.0.0 --port=8000
```

### Langkah 2: Expose Backend dengan Ngrok

```bash
# Terminal 2: Ngrok Backend
ngrok http 8000
```

Copy URL ngrok (contoh: `https://abc123.ngrok-free.app`)

### Langkah 3: Update Frontend API URL

```bash
# Terminal 3
cd kost-app
node scripts/update-api-url.js https://abc123.ngrok-free.app
```

### Langkah 4: Start Frontend di Localhost

```bash
# Masih di terminal 3
npm run dev
```

### Langkah 5: Akses Aplikasi

- **Dari komputer Anda**: http://localhost:3000
- **Dari HP/device lain** (di network yang sama):
  1. Cari IP komputer Anda: `ipconfig` (Windows) atau `ifconfig` (Mac/Linux)
  2. Akses dari HP: http://192.168.x.x:3000 (ganti dengan IP Anda)

**Keuntungan:**
- ✅ Gratis
- ✅ Cepat
- ✅ Tidak perlu multiple tunnels
- ✅ Bisa diakses dari device lain di network yang sama

---

## METODE 2: Expose Backend + Frontend (BUTUH PAID PLAN)

Jika Anda upgrade ngrok ke paid plan, gunakan config file:

### Langkah 1: Buat Ngrok Config

Buat file `ngrok.yml`:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN

tunnels:
  backend:
    proto: http
    addr: 8000
  
  frontend:
    proto: http
    addr: 3000
```

### Langkah 2: Start Multiple Tunnels

```bash
ngrok start --all --config ngrok.yml
```

### Langkah 3: Update URLs

Update backend CORS dan frontend API URL dengan URL ngrok yang muncul.

---

## METODE 3: Gunakan LocalTunnel (FREE Alternative)

LocalTunnel adalah alternatif gratis yang support multiple tunnels:

### Install LocalTunnel

```bash
npm install -g localtunnel
```

### Start Backend Tunnel

```bash
# Terminal 1: Laravel
cd kost-backend
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2: LocalTunnel Backend
lt --port 8000 --subdomain my-kost-api
```

### Start Frontend Tunnel

```bash
# Terminal 3: Next.js
cd kost-app
npm run dev

# Terminal 4: LocalTunnel Frontend
lt --port 3000 --subdomain my-kost-app
```

**Note:** Subdomain mungkin tidak tersedia, LocalTunnel akan generate random URL.

---

## Troubleshooting

### Error: "You are limited to 1 tunnel"

Ini karena ngrok free tier. Solusi:
1. Gunakan **Metode 1** (hanya expose backend)
2. Upgrade ngrok ke paid plan
3. Gunakan LocalTunnel sebagai alternatif

### Error: CORS Policy

1. Pastikan CORS sudah di-update di `kost-backend/config/cors.php`
2. Clear cache Laravel:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

### Error: API Connection Failed

1. Pastikan `NEXT_PUBLIC_API_URL` di `.env.local` sudah benar
2. Restart Next.js:
   ```bash
   npm run dev
   ```

### Ngrok Warning Page

Klik "Visit Site" untuk melanjutkan. Ini normal untuk free tier.

---

## Perbandingan Tools

| Tool | Free Tunnels | Speed | Stability |
|------|--------------|-------|-----------|
| Ngrok | 1 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| LocalTunnel | Unlimited | ⭐⭐⭐ | ⭐⭐⭐ |
| Serveo | Unlimited | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Cloudflare Tunnel | Unlimited | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## Rekomendasi

**Untuk Testing/Demo:**
- Gunakan **Metode 1** (hanya expose backend)
- Akses dari localhost atau IP lokal

**Untuk Production:**
- Deploy ke VPS (DigitalOcean, AWS, dll)
- Gunakan domain sendiri
- Setup SSL dengan Let's Encrypt

---

## Quick Commands

### Metode 1 (Recommended)
```bash
# Terminal 1: Laravel
cd kost-backend && php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2: Ngrok Backend
ngrok http 8000

# Terminal 3: Update & Start Frontend
cd kost-app
node scripts/update-api-url.js https://YOUR-NGROK-URL.ngrok-free.app
npm run dev
```

### Akses
- Lokal: http://localhost:3000
- Dari HP (network sama): http://YOUR-IP:3000

