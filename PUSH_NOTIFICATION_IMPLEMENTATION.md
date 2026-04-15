# Push Notification Implementation Guide

## Overview
Implementasi push notification untuk PWA yang memungkinkan notifikasi masuk bahkan ketika aplikasi ditutup.

## Frontend Implementation ✅

### 1. VAPID Keys
VAPID keys sudah di-generate dan ditambahkan ke `.env.production`:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BG5zzl3DBettRZysFO1OzjvX13vphA9t9JU2D6QpQY02uHb1nMk5UVAZKbPJCZaBqBN6nrjqx2-mo-qBrE1eaxw
```

Private key (untuk backend):
```
9bfDQ_j3Pofr6bTS6cd6YB1ARTpI1RDIrlsJb2jL4G8
```

### 2. Service Worker (public/sw.js)
- ✅ Push event handler sudah ada
- ✅ Notification click handler sudah ada
- ✅ Caching strategy untuk offline support

### 3. Frontend Functions (app/lib/notifications.ts)
- ✅ `subscribeToPushNotifications()` - Subscribe user ke push service
- ✅ `unsubscribeFromPushNotifications()` - Unsubscribe user
- ✅ VAPID key conversion helper

### 4. NotificationProvider Component
- ✅ Auto-subscribe setelah user login dan grant permission
- ✅ Mengirim subscription ke backend

## Backend Implementation (TODO)

### 1. Database Migration
Buat tabel untuk menyimpan push subscriptions:

```php
// database/migrations/xxxx_create_push_subscriptions_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('endpoint');
            $table->text('public_key')->nullable();
            $table->text('auth_token')->nullable();
            $table->string('content_encoding')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'endpoint']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
```

### 2. Model
```php
// app/Models/PushSubscription.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PushSubscription extends Model
{
    protected $fillable = [
        'user_id',
        'endpoint',
        'public_key',
        'auth_token',
        'content_encoding',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

### 3. Install web-push Library
```bash
cd kost-backend
composer require minishlink/web-push
```

### 4. Add VAPID Keys to .env
```env
VAPID_PUBLIC_KEY=BG5zzl3DBettRZysFO1OzjvX13vphA9t9JU2D6QpQY02uHb1nMk5UVAZKbPJCZaBqBN6nrjqx2-mo-qBrE1eaxw
VAPID_PRIVATE_KEY=9bfDQ_j3Pofr6bTS6cd6YB1ARTpI1RDIrlsJb2jL4G8
VAPID_SUBJECT=mailto:admin@mykost-cendana.xyz
```

### 5. Controller
```php
// app/Http/Controllers/Api/PushNotificationController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class PushNotificationController extends Controller
{
    // Subscribe user to push notifications
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'subscription' => 'required|array',
            'subscription.endpoint' => 'required|string',
            'subscription.keys' => 'required|array',
            'subscription.keys.p256dh' => 'required|string',
            'subscription.keys.auth' => 'required|string',
        ]);

        $user = $request->user();
        $subscription = $validated['subscription'];

        PushSubscription::updateOrCreate(
            [
                'user_id' => $user->id,
                'endpoint' => $subscription['endpoint'],
            ],
            [
                'public_key' => $subscription['keys']['p256dh'],
                'auth_token' => $subscription['keys']['auth'],
                'content_encoding' => $subscription['contentEncoding'] ?? 'aesgcm',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Push subscription saved successfully',
        ]);
    }

    // Unsubscribe user from push notifications
    public function unsubscribe(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => 'required|string',
        ]);

        $user = $request->user();

        PushSubscription::where('user_id', $user->id)
            ->where('endpoint', $validated['endpoint'])
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Push subscription removed successfully',
        ]);
    }

    // Send push notification to user
    public static function sendPushNotification($userId, $title, $body, $url = '/')
    {
        $subscriptions = PushSubscription::where('user_id', $userId)->get();

        if ($subscriptions->isEmpty()) {
            return false;
        }

        $auth = [
            'VAPID' => [
                'subject' => env('VAPID_SUBJECT'),
                'publicKey' => env('VAPID_PUBLIC_KEY'),
                'privateKey' => env('VAPID_PRIVATE_KEY'),
            ],
        ];

        $webPush = new WebPush($auth);

        $payload = json_encode([
            'title' => $title,
            'body' => $body,
            'url' => $url,
            'tag' => 'notification-' . time(),
        ]);

        foreach ($subscriptions as $sub) {
            $subscription = Subscription::create([
                'endpoint' => $sub->endpoint,
                'publicKey' => $sub->public_key,
                'authToken' => $sub->auth_token,
                'contentEncoding' => $sub->content_encoding,
            ]);

            $webPush->queueNotification($subscription, $payload);
        }

        // Send notifications
        foreach ($webPush->flush() as $report) {
            $endpoint = $report->getRequest()->getUri()->__toString();

            if (!$report->isSuccess()) {
                // Delete invalid subscriptions
                PushSubscription::where('endpoint', $endpoint)->delete();
                error_log('Push notification failed for endpoint: ' . $endpoint);
            }
        }

        return true;
    }
}
```

### 6. Routes
```php
// routes/api.php
// Add these routes inside the auth:api middleware group

Route::post('/push-subscriptions', [PushNotificationController::class, 'subscribe']);
Route::delete('/push-subscriptions', [PushNotificationController::class, 'unsubscribe']);
```

### 7. Update NotificationController
Tambahkan push notification saat membuat notifikasi baru:

```php
// app/Http/Controllers/Api/NotificationController.php

use App\Http\Controllers\Api\PushNotificationController;

// Di method store() atau saat membuat notifikasi:
public function store(Request $request)
{
    // ... existing code to create notification ...
    
    $notification = Notification::create([
        'user_id' => $userId,
        'judul' => $title,
        'pesan' => $message,
        // ... other fields
    ]);
    
    // Send push notification
    PushNotificationController::sendPushNotification(
        $userId,
        $title,
        $message,
        '/notifications' // or specific URL
    );
    
    return response()->json([
        'success' => true,
        'notification' => $notification,
    ]);
}
```

## Testing

### 1. Test Subscription
1. Login ke aplikasi
2. Buka browser console
3. Check log: "Subscribed to push notifications"
4. Verify di database: `SELECT * FROM push_subscriptions;`

### 2. Test Push Notification
Buat test endpoint atau trigger dari admin panel:

```php
// Test route (remove after testing)
Route::get('/test-push/{userId}', function ($userId) {
    PushNotificationController::sendPushNotification(
        $userId,
        'Test Notification',
        'This is a test push notification',
        '/dashboard'
    );
    
    return response()->json(['success' => true]);
});
```

### 3. Test Background Notification
1. Install PWA ke home screen
2. Tutup aplikasi sepenuhnya
3. Trigger notifikasi dari backend
4. Notifikasi harus muncul di device

## Browser Support

- ✅ Chrome/Edge (Android & Desktop)
- ✅ Firefox (Android & Desktop)
- ✅ Safari (iOS 16.4+, macOS 13+)
- ❌ Safari (iOS < 16.4)

## Deployment Checklist

### Frontend (Vercel)
- [x] Add VAPID public key to environment variables
- [ ] Deploy to Vercel
- [ ] Test on production URL

### Backend (cPanel)
- [ ] Run migration: `php artisan migrate`
- [ ] Install composer package: `composer require minishlink/web-push`
- [ ] Add VAPID keys to `.env`
- [ ] Add routes to `routes/api.php`
- [ ] Create controller and model
- [ ] Test push notification

## Notes

- Push notifications bekerja bahkan saat aplikasi ditutup
- Subscription disimpan per device/browser
- User bisa punya multiple subscriptions (multiple devices)
- Invalid subscriptions otomatis dihapus saat gagal kirim
- Gratis selamanya, tidak ada biaya

## Troubleshooting

### Notification tidak muncul saat app ditutup
- Pastikan PWA sudah di-install ke home screen
- Check permission: Settings > Site Settings > Notifications
- Verify subscription di database

### Subscription gagal
- Check VAPID keys (public key harus sama di frontend & backend)
- Pastikan HTTPS aktif
- Check browser console untuk error

### Push notification gagal terkirim
- Verify VAPID private key di backend
- Check subscription masih valid
- Review error log di backend
