# 🚀 Quick Setup - Push Notification Backend

## Opsi 1: Otomatis dengan PHP Script (RECOMMENDED - 1 menit)

### Langkah:

1. **Jalankan script dari folder web-kost:**
```bash
cd C:\laragon\www\web-kost
php add-push-to-controllers.php
```

Script akan otomatis:
- ✅ Backup semua file controller
- ✅ Tambahkan `use PushNotificationController;` 
- ✅ Tambahkan push notification di semua tempat yang tepat
- ✅ Simpan backup di `kost-backend/backups/`

2. **Install composer package:**
```bash
cd kost-backend
composer require minishlink/web-push
```

3. **Update .env:**
Tambahkan ke `kost-backend/.env`:
```env
VAPID_PUBLIC_KEY=BG5zzl3DBettRZysFO1OzjvX13vphA9t9JU2D6QpQY02uHb1nMk5UVAZKbPJCZaBqBN6nrjqx2-mo-qBrE1eaxw
VAPID_PRIVATE_KEY=9bfDQ_j3Pofr6bTS6cd6YB1ARTpI1RDIrlsJb2jL4G8
VAPID_SUBJECT=mailto:admin@mykost-cendana.xyz
```

4. **Update routes:**
Edit `kost-backend/routes/api.php`, tambahkan di dalam `auth:api` middleware:
```php
use App\Http\Controllers\Api\PushNotificationController;

// Di dalam Route::middleware(['auth:api'])->group(function () {
Route::post('/push-subscriptions', [PushNotificationController::class, 'subscribe']);
Route::delete('/push-subscriptions', [PushNotificationController::class, 'unsubscribe']);
Route::get('/push-notifications/test', [PushNotificationController::class, 'test']);
```

5. **Run migration:**
```bash
php artisan migrate
```

**SELESAI!** Total waktu: ~5 menit

---

## Opsi 2: Manual (10-15 menit)

Ikuti panduan lengkap di `PUSH_NOTIFICATION_INTEGRATION.md`

---

## Testing

### 1. Test Subscription
```bash
# Login ke aplikasi
# Buka browser console (F12)
# Cari log: "Subscribed to push notifications"
```

### 2. Test Database
```sql
SELECT * FROM push_subscriptions;
```

### 3. Test Send Notification
```bash
# Buat laporan baru dari user
# Admin harus terima push notification
```

### 4. Test Background
```bash
# Install PWA ke home screen
# Tutup aplikasi
# Trigger notifikasi dari admin
# Notifikasi harus muncul
```

---

## Files Created

Backend files sudah dibuat:
- ✅ `kost-backend/database/migrations/2026_04_15_010924_create_push_subscriptions_table.php`
- ✅ `kost-backend/app/Models/PushSubscription.php`
- ✅ `kost-backend/app/Http/Controllers/Api/PushNotificationController.php`

Tinggal:
- [ ] Run script PHP untuk integrate ke controllers
- [ ] Install composer package
- [ ] Update .env
- [ ] Update routes
- [ ] Run migration

---

## Troubleshooting

### Script PHP error
```bash
# Pastikan run dari folder web-kost
cd C:\laragon\www\web-kost
php add-push-to-controllers.php
```

### Composer error
```bash
cd kost-backend
composer update
composer require minishlink/web-push
```

### Migration error
```bash
# Check database connection
php artisan migrate:status

# Run migration
php artisan migrate
```

### Push notification tidak terkirim
```bash
# Check Laravel log
tail -f storage/logs/laravel.log

# Check VAPID keys di .env
cat .env | grep VAPID
```

---

## What Happens After Setup

Setiap kali notifikasi dibuat, push notification otomatis terkirim:

1. **User buat laporan** → Admin terima push
2. **User upload bukti bayar** → Admin terima push
3. **Admin update status** → User terima push
4. **Admin generate tagihan** → User terima push
5. **Admin selesaikan laporan** → User terima push

Semua bekerja otomatis, bahkan saat app ditutup! 🎉

---

## Next Steps

1. Run script: `php add-push-to-controllers.php`
2. Install package: `composer require minishlink/web-push`
3. Update .env dengan VAPID keys
4. Update routes
5. Run migration
6. Test!

**Total: ~5 menit** ⚡
