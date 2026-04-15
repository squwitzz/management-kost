# ✅ Push Notification - TODO Checklist

## Frontend ✅ (SELESAI)
- [x] Generate VAPID keys
- [x] Add push subscription functions
- [x] Update NotificationProvider
- [x] Add environment variables
- [x] Push to GitHub
- [x] Create documentation

## Backend 🔧 (PERLU DILAKUKAN)

### Step 1: Install Package
```bash
cd kost-backend
composer require minishlink/web-push
```
- [ ] Package installed

### Step 2: Create Migration
File: `kost-backend/database/migrations/2024_xx_xx_create_push_subscriptions_table.php`

Copy dari: `BACKEND_PUSH_NOTIFICATION_FILES.md` - Section 1

- [ ] Migration file created

### Step 3: Create Model
File: `kost-backend/app/Models/PushSubscription.php`

Copy dari: `BACKEND_PUSH_NOTIFICATION_FILES.md` - Section 2

- [ ] Model file created

### Step 4: Create Controller
File: `kost-backend/app/Http/Controllers/Api/PushNotificationController.php`

Copy dari: `BACKEND_PUSH_NOTIFICATION_FILES.md` - Section 3

- [ ] Controller file created

### Step 5: Update Routes
File: `kost-backend/routes/api.php`

Tambahkan di dalam `auth:api` middleware:
```php
use App\Http\Controllers\Api\PushNotificationController;

Route::post('/push-subscriptions', [PushNotificationController::class, 'subscribe']);
Route::delete('/push-subscriptions', [PushNotificationController::class, 'unsubscribe']);
Route::get('/push-notifications/test', [PushNotificationController::class, 'test']);
```

- [ ] Routes updated

### Step 6: Update .env
File: `kost-backend/.env`

Tambahkan:
```env
VAPID_PUBLIC_KEY=BG5zzl3DBettRZysFO1OzjvX13vphA9t9JU2D6QpQY02uHb1nMk5UVAZKbPJCZaBqBN6nrjqx2-mo-qBrE1eaxw
VAPID_PRIVATE_KEY=9bfDQ_j3Pofr6bTS6cd6YB1ARTpI1RDIrlsJb2jL4G8
VAPID_SUBJECT=mailto:admin@mykost-cendana.xyz
```

- [ ] .env updated

### Step 7: Run Migration
```bash
cd kost-backend
php artisan migrate
```

- [ ] Migration executed
- [ ] Table `push_subscriptions` created

### Step 8: Update NotificationController (Optional)
File: `kost-backend/app/Http/Controllers/Api/NotificationController.php`

Tambahkan di bagian atas:
```php
use App\Http\Controllers\Api\PushNotificationController;
```

Di method yang membuat notifikasi, tambahkan:
```php
PushNotificationController::sendPushNotification(
    $userId,
    $title,
    $message,
    '/notifications'
);
```

- [ ] NotificationController updated (optional)

## Vercel Deployment 🚀

### Add Environment Variable
Di Vercel Dashboard → Settings → Environment Variables

Tambahkan:
```
Name: NEXT_PUBLIC_VAPID_PUBLIC_KEY
Value: BG5zzl3DBettRZysFO1OzjvX13vphA9t9JU2D6QpQY02uHb1nMk5UVAZKbPJCZaBqBN6nrjqx2-mo-qBrE1eaxw
```

- [ ] Environment variable added
- [ ] Redeploy triggered

## Testing 🧪

### Test 1: Subscription
1. Login ke aplikasi
2. Buka browser console (F12)
3. Cari log: "Subscribed to push notifications"

- [ ] Subscription successful
- [ ] No errors in console

### Test 2: Database Check
```sql
SELECT * FROM push_subscriptions;
```

- [ ] Subscription saved in database
- [ ] user_id correct
- [ ] endpoint exists

### Test 3: Send Test Notification
```bash
curl -X GET https://mykost-cendana.xyz/api/push-notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

- [ ] Test notification sent
- [ ] Notification received in browser

### Test 4: Background Notification
1. Install PWA ke home screen
2. Tutup aplikasi sepenuhnya
3. Trigger notifikasi dari admin panel

- [ ] PWA installed
- [ ] App closed
- [ ] Notification received
- [ ] Click notification opens app

### Test 5: Multiple Devices
1. Login dari device lain
2. Check subscriptions in database

- [ ] Multiple subscriptions for same user
- [ ] All devices receive notifications

## Production Deployment 🌐

### Backend (cPanel)
- [ ] Upload new files via FTP
- [ ] Run `composer require minishlink/web-push`
- [ ] Update `.env` with VAPID keys
- [ ] Run `php artisan migrate`
- [ ] Test endpoints

### Frontend (Vercel)
- [ ] Already deployed (auto from GitHub)
- [ ] Environment variable added
- [ ] Test on production URL

## Cleanup 🧹

### Remove Test Endpoint (Production)
Edit `routes/api.php`, hapus:
```php
Route::get('/push-notifications/test', [PushNotificationController::class, 'test']);
```

- [ ] Test endpoint removed from production

## Documentation 📚

- [x] Implementation guide created
- [x] Backend files documented
- [x] Setup guide created
- [x] Summary created
- [x] TODO checklist created

## Final Verification ✅

- [ ] Frontend deployed
- [ ] Backend deployed
- [ ] Subscription works
- [ ] Push notification works
- [ ] Background notification works
- [ ] Multiple devices work
- [ ] No errors in logs

## Estimated Time

- Backend setup: ~10 minutes
- Vercel env var: ~1 minute
- Testing: ~5 minutes
- Production deploy: ~5 minutes

**Total: ~20 minutes**

## Support

Jika ada masalah, lihat:
- `PUSH_NOTIFICATION_SETUP.md` - Troubleshooting section
- `PUSH_NOTIFICATION_IMPLEMENTATION.md` - Detailed guide
- Laravel log: `storage/logs/laravel.log`
- Browser console (F12)

---

**Status: Frontend Complete ✅ | Backend Pending 🔧**
