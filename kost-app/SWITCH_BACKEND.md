# Cara Mengganti Backend (Ngrok ↔ cPanel)

## Untuk Development Lokal

### Menggunakan Ngrok (Server Lokal)
Jika Anda ingin menggunakan backend lokal dengan ngrok:

1. Jalankan backend Laravel lokal:
   ```bash
   cd kost-backend
   php artisan serve
   ```

2. Jalankan ngrok di terminal lain:
   ```bash
   ngrok http 8000
   ```

3. Edit file `kost-app/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.app/api
   ```

4. Restart Next.js development server:
   ```bash
   cd kost-app
   npm run dev
   ```

### Menggunakan cPanel (Production Backend)
Jika Anda ingin menggunakan backend production di cPanel:

1. Edit file `kost-app/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://mykost-cendana.xyz/api
   ```

2. Restart Next.js development server:
   ```bash
   cd kost-app
   npm run dev
   ```

## Untuk Production (Vercel)

Production di Vercel sudah otomatis menggunakan backend cPanel karena file `.env.production` sudah dikonfigurasi dengan benar:

```env
NEXT_PUBLIC_API_URL=http://mykost-cendana.xyz/api
```

Tidak perlu melakukan perubahan apapun untuk production.

## Catatan Penting

- **Setiap kali mengganti URL di `.env.local`**, Anda HARUS restart development server (Ctrl+C lalu `npm run dev` lagi)
- Environment variables hanya dibaca saat aplikasi pertama kali dijalankan
- Jika masih menggunakan URL lama setelah restart, coba clear browser cache atau buka di incognito mode
- Production di Vercel tidak terpengaruh oleh perubahan `.env.local` - hanya menggunakan `.env.production`

## Troubleshooting

### "Load Failed" atau "Cannot connect to server"
- Pastikan backend yang Anda pilih benar-benar berjalan
- Untuk ngrok: pastikan `php artisan serve` dan `ngrok http 8000` berjalan
- Untuk cPanel: pastikan http://mykost-cendana.xyz/api/health bisa diakses
- Restart development server setelah mengganti URL

### Backend masih menggunakan ngrok padahal sudah diganti
- Pastikan Anda sudah restart development server
- Clear browser cache atau gunakan incognito mode
- Periksa file `.env.local` apakah URL sudah benar
