# Quick Start dengan Ngrok

## ⚠️ Ngrok Free = 1 Tunnel Saja!

Ngrok free tier hanya bisa 1 tunnel. Jadi kita **hanya expose backend**, frontend tetap di localhost.

## Cara Tercepat (Recommended)

### 1. Start Backend + Ngrok Backend

```bash
# Terminal 1: Start Laravel
cd kost-backend
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2: Ngrok untuk Backend
ngrok http 8000
```

**Copy URL ngrok backend** (contoh: `https://abc123.ngrok-free.app`)

### 2. Update API URL di Frontend

```bash
# Terminal 3
cd kost-app
node scripts/update-api-url.js https://abc123.ngrok-free.app
```

Ganti `https://abc123.ngrok-free.app` dengan URL ngrok Anda.

### 3. Start Frontend di Localhost

```bash
# Masih di terminal 3
npm run dev
```

### 4. Akses Aplikasi

**Dari komputer Anda:**
- Buka: http://localhost:3000

**Dari HP/device lain (di network yang sama):**
1. Cari IP komputer Anda:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
2. Cari IP yang seperti `192.168.x.x`
3. Buka di HP: `http://192.168.x.x:3000`

## Alternatif: LocalTunnel (Free, Unlimited Tunnels)

Jika butuh expose frontend juga, gunakan LocalTunnel:

### Install LocalTunnel

```bash
npm install -g localtunnel
```

### Start Backend + Frontend Tunnels

```bash
# Terminal 1: Laravel
cd kost-backend
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2: LocalTunnel Backend
lt --port 8000

# Terminal 3: Next.js
cd kost-app
npm run dev

# Terminal 4: LocalTunnel Frontend
lt --port 3000
```

Copy kedua URL yang muncul dan update sesuai kebutuhan.

## Error yang Sering Muncul

### 1. "You are limited to 1 tunnel"

**Penyebab:** Ngrok free hanya 1 tunnel.

**Solusi:**
- Gunakan metode di atas (hanya expose backend)
- Atau upgrade ngrok ke paid plan
- Atau gunakan LocalTunnel

### 2. CORS Error

**Solusi:**
```bash
cd kost-backend
php artisan config:clear
php artisan cache:clear
```

CORS sudah otomatis support ngrok di `config/cors.php`.

### 3. API Connection Failed

**Cek:**
1. Laravel server masih jalan?
2. Ngrok backend masih aktif?
3. URL di `.env.local` sudah benar?

**Solusi:**
```bash
cd kost-app
npm run dev
```

### 4. Ngrok Warning Page

Ini normal untuk free tier. Klik "Visit Site" untuk lanjut.

### 5. 401 Unauthorized

Token expired. Logout dan login lagi.

## Tips

1. **Ngrok URL berubah setiap restart** (free tier)
   - Simpan URL di notepad
   - Atau upgrade ke paid untuk static URL

2. **Testing dari HP**
   - Pastikan HP dan komputer di WiFi yang sama
   - Gunakan IP lokal (192.168.x.x:3000)
   - Atau gunakan LocalTunnel untuk expose frontend

3. **Performance**
   - Ngrok free agak lambat (normal)
   - LocalTunnel lebih lambat lagi
   - Untuk production, gunakan VPS

## Perbandingan Tools

| Tool | Free Tunnels | Kecepatan | Stabilitas |
|------|--------------|-----------|------------|
| **Ngrok** | 1 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **LocalTunnel** | Unlimited | ⭐⭐⭐ | ⭐⭐⭐ |
| **Serveo** | Unlimited | ⭐⭐⭐⭐ | ⭐⭐⭐ |

## Credentials Default

- **Admin**: 081234567890 / admin123
- **Penghuni**: 081234567891 / password123

## Butuh Bantuan?

Cek file `DEPLOY_NGROK.md` untuk panduan lengkap dengan berbagai metode.
