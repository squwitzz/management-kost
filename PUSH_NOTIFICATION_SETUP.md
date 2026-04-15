# Push Notification - Quick Setup Guide

## ✅ Frontend (Sudah Selesai)

Frontend sudah siap dan di-push ke GitHub:
- ✅ VAPID public key di `.env.production`
- ✅ Service worker dengan push handler
- ✅ Auto-subscribe setelah login
- ✅ Subscription management functions

## 🔧 Backend Setup (Langkah-langkah)

### 1. Install Package
```bash
cd kost-backend
composer require minishlink/web-push
```

### 2. Copy Files

#### Migration
Copy dari `BACKEND_PUSH_NOTIFICATION_FILES.md` section 1:
- File: `database/migrations/2024_xx_xx_create_push_subscriptions_table.php`

#### Model
Copy dari `BACKEND_PUSH_NOTIFICATION_FILES.md` section 2:
- File: `app/Models/PushSubscription.php`

#### Controller
Copy dari `BACKEND_PUSH_NOTIFICATION_FILES.md` section 3:
- File: `app/Http/Controllers/Api/PushNotificationController.php`

### 3. Update Routes
Edit `routes/api.php`, tambahkan di dalam `auth:api` middleware:

```php
use App\Http\Controllers\Api\PushNotificationController;

// Di dalam Route::middleware(['auth:api'])->group(function () {
Route::post('/push-subscriptions', [PushNotificationController::class, 'subscribe']);
Route::delete('/push-subscriptions', [PushNotificationController::class, 'unsubscribe']);
Route::get('/push-notifications/test', [PushNotificationController::class, 'test']);
```

### 4. Update .env
Tambahkan ke `kost-backend/.env`:

```env
VAPID_PUBLIC_KEY=BG5zzl3DBettRZysFO1OzjvX13vphA9t9JU2D6QpQY02uHb1nMk5UVAZKbPJCZaBqBN6nrjqx2-mo-qBrE1eaxw
VAPID_PRIVATE_KEY=9bfDQ_j3Pofr6bTS6cd6YB1ARTpI1RDIrlsJb2jL4G8
VAPID_SUBJECT=mailto:admin@mykost-cendana.xyz
```

### 5. Run Migration
```bash
php artisan migrate
```

### 6. Update NotificationController (Optional)
Untuk auto-send push saat membuat notifikasi, edit `app/Http/Controllers/Api/NotificationController.php`:

```php
use App\Http\Controllers\Api\PushNotificationController;

// Di method yang membuat notifikasi:
$notification = Notification::create([...]);

// Tambahkan ini:
PushNotificationController::sendPushNotification(
    $userId,
    $title,
    $message,
    '/notifications'
);
```

## 🧪 Testing

### Test 1: Subscription
1. Login ke aplikasi PWA
2. Buka browser console (F12)
3. Cari log: "Subscribed to push notifications"
4. Check database: `SELECT * FROM push_subscriptions;`

### Test 2: Send Notification
Akses endpoint test (gunakan token dari login):
```
GET https://mykost-cendana.xyz/api/push-notifications/test
Authorization: Bearer YOUR_TOKEN
```

### Test 3: Background Notification
1. Install PWA ke home screen
2. Tutup aplikasi sepenuhnya
3. Trigger notifikasi dari admin panel
4. Notifikasi harus muncul di device

## 📱 Cara Kerja

1. User login → Auto request permission
2. Permission granted → Subscribe ke push service
3. Subscription disimpan ke database
4. Admin buat notifikasi → Push terkirim otomatis
5. Notifikasi muncul bahkan saat app ditutup

## 🌐 Browser Support

- ✅ Chrome/Edge (Android & Desktop)
- ✅ Firefox (Android & Desktop)  
- ✅ Safari (iOS 16.4+, macOS 13+)

## 💰 Biaya

**GRATIS SELAMANYA** - Tidak ada biaya apapun!

## 📝 Notes

- Push notification bekerja di background
- User bisa punya multiple subscriptions (multiple devices)
- Invalid subscriptions otomatis dihapus
- Logging sudah ditambahkan untuk debugging

## 🚀 Deploy ke Production

### Frontend (Vercel)
1. Push ke GitHub (sudah selesai ✅)
2. Vercel auto-deploy
3. Add environment variable di Vercel dashboard:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

### Backend (cPanel)
1. Upload file-file baru via FTP/File Manager
2. Run `composer require minishlink/web-push`
3. Update `.env` dengan VAPID keys
4. Run `php artisan migrate`
5. Test endpoint

## ❓ Troubleshooting

### Subscription gagal
- Check VAPID public key di `.env.production`
- Pastikan HTTPS aktif
- Check browser console untuk error

### Push tidak terkirim
- Verify VAPID private key di backend `.env`
- Check composer package installed: `composer show minishlink/web-push`
- Review Laravel log: `storage/logs/laravel.log`

### Notification tidak muncul saat app ditutup
- Pastikan PWA sudah di-install ke home screen
- Check notification permission di browser settings
- Verify subscription ada di database

## 📚 Dokumentasi Lengkap

Lihat file:
- `PUSH_NOTIFICATION_IMPLEMENTATION.md` - Overview lengkap
- `BACKEND_PUSH_NOTIFICATION_FILES.md` - Semua kode backend
