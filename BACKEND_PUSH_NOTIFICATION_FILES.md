# Backend Files untuk Push Notification

## 1. Migration File

Buat file: `kost-backend/database/migrations/2024_xx_xx_create_push_subscriptions_table.php`

```php
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
            $table->string('content_encoding')->default('aesgcm');
            $table->timestamps();
            
            $table->unique(['user_id', 'endpoint']);
            $table->index('user_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
```

## 2. Model File

Buat file: `kost-backend/app/Models/PushSubscription.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PushSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'endpoint',
        'public_key',
        'auth_token',
        'content_encoding',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

## 3. Controller File

Buat file: `kost-backend/app/Http/Controllers/Api/PushNotificationController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class PushNotificationController extends Controller
{
    /**
     * Subscribe user to push notifications
     */
    public function subscribe(Request $request)
    {
        try {
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
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save push subscription',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Unsubscribe user from push notifications
     */
    public function unsubscribe(Request $request)
    {
        try {
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
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove push subscription',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send push notification to specific user
     * 
     * @param int $userId
     * @param string $title
     * @param string $body
     * @param string $url
     * @return bool
     */
    public static function sendPushNotification($userId, $title, $body, $url = '/')
    {
        try {
            $subscriptions = PushSubscription::where('user_id', $userId)->get();

            if ($subscriptions->isEmpty()) {
                \Log::info("No push subscriptions found for user: {$userId}");
                return false;
            }

            $auth = [
                'VAPID' => [
                    'subject' => env('VAPID_SUBJECT', 'mailto:admin@mykost-cendana.xyz'),
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
            $successCount = 0;
            $failCount = 0;

            foreach ($webPush->flush() as $report) {
                $endpoint = $report->getRequest()->getUri()->__toString();

                if ($report->isSuccess()) {
                    $successCount++;
                    \Log::info("Push notification sent successfully to: {$endpoint}");
                } else {
                    $failCount++;
                    // Delete invalid subscriptions
                    PushSubscription::where('endpoint', $endpoint)->delete();
                    \Log::error("Push notification failed for endpoint: {$endpoint}. Reason: " . $report->getReason());
                }
            }

            \Log::info("Push notification summary - Success: {$successCount}, Failed: {$failCount}");
            return $successCount > 0;

        } catch (\Exception $e) {
            \Log::error("Error sending push notification: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send push notification to multiple users
     * 
     * @param array $userIds
     * @param string $title
     * @param string $body
     * @param string $url
     * @return array
     */
    public static function sendBulkPushNotification($userIds, $title, $body, $url = '/')
    {
        $results = [
            'success' => 0,
            'failed' => 0,
        ];

        foreach ($userIds as $userId) {
            $sent = self::sendPushNotification($userId, $title, $body, $url);
            if ($sent) {
                $results['success']++;
            } else {
                $results['failed']++;
            }
        }

        return $results;
    }

    /**
     * Test endpoint to send push notification (for development only)
     */
    public function test(Request $request)
    {
        $user = $request->user();
        
        $sent = self::sendPushNotification(
            $user->id,
            'Test Push Notification',
            'This is a test notification from Kost Management System',
            '/dashboard'
        );

        return response()->json([
            'success' => $sent,
            'message' => $sent ? 'Test notification sent' : 'Failed to send notification',
        ]);
    }
}
```

## 4. Update Routes

Edit file: `kost-backend/routes/api.php`

Tambahkan di dalam middleware `auth:api`:

```php
// Push Notification Routes
Route::post('/push-subscriptions', [PushNotificationController::class, 'subscribe']);
Route::delete('/push-subscriptions', [PushNotificationController::class, 'unsubscribe']);
Route::get('/push-notifications/test', [PushNotificationController::class, 'test']); // Remove in production
```

## 5. Update NotificationController

Edit file: `kost-backend/app/Http/Controllers/Api/NotificationController.php`

Tambahkan di bagian atas:

```php
use App\Http\Controllers\Api\PushNotificationController;
```

Lalu update method yang membuat notifikasi (contoh di method `store` atau saat admin membuat notifikasi):

```php
public function store(Request $request)
{
    // ... existing validation code ...
    
    // Create notification
    $notification = Notification::create([
        'user_id' => $userId,
        'judul' => $title,
        'pesan' => $message,
        'tipe' => $type,
        'is_read' => false,
    ]);
    
    // Send push notification
    PushNotificationController::sendPushNotification(
        $userId,
        $title,
        $message,
        '/notifications' // or specific URL based on notification type
    );
    
    return response()->json([
        'success' => true,
        'notification' => $notification,
    ]);
}
```

Atau jika ada method untuk broadcast ke semua penghuni:

```php
public function broadcastToResidents(Request $request)
{
    // ... existing code to get resident IDs ...
    
    $residentIds = User::where('role', 'Penghuni')->pluck('id')->toArray();
    
    // Create notifications for each resident
    foreach ($residentIds as $residentId) {
        Notification::create([
            'user_id' => $residentId,
            'judul' => $title,
            'pesan' => $message,
            'tipe' => $type,
            'is_read' => false,
        ]);
    }
    
    // Send bulk push notifications
    $results = PushNotificationController::sendBulkPushNotification(
        $residentIds,
        $title,
        $message,
        '/notifications'
    );
    
    return response()->json([
        'success' => true,
        'message' => "Notifications sent to {$results['success']} users",
        'results' => $results,
    ]);
}
```

## 6. Update .env File

Edit file: `kost-backend/.env`

Tambahkan:

```env
# Push Notification VAPID Keys
VAPID_PUBLIC_KEY=BG5zzl3DBettRZysFO1OzjvX13vphA9t9JU2D6QpQY02uHb1nMk5UVAZKbPJCZaBqBN6nrjqx2-mo-qBrE1eaxw
VAPID_PRIVATE_KEY=9bfDQ_j3Pofr6bTS6cd6YB1ARTpI1RDIrlsJb2jL4G8
VAPID_SUBJECT=mailto:admin@mykost-cendana.xyz
```

## 7. Install Composer Package

Jalankan di terminal:

```bash
cd kost-backend
composer require minishlink/web-push
```

## 8. Run Migration

```bash
cd kost-backend
php artisan migrate
```

## 9. Testing

### Test Subscribe
1. Login ke aplikasi PWA
2. Check browser console: "Subscribed to push notifications"
3. Check database: `SELECT * FROM push_subscriptions;`

### Test Send Notification
Akses endpoint test (setelah login):
```
GET https://mykost-cendana.xyz/api/push-notifications/test
```

Atau trigger dari admin panel saat membuat notifikasi baru.

### Test Background Notification
1. Install PWA ke home screen
2. Tutup aplikasi sepenuhnya
3. Trigger notifikasi dari admin panel
4. Notifikasi harus muncul di device

## 10. Production Checklist

- [ ] Install composer package: `composer require minishlink/web-push`
- [ ] Copy migration file ke `database/migrations/`
- [ ] Copy model file ke `app/Models/`
- [ ] Copy controller file ke `app/Http/Controllers/Api/`
- [ ] Update `routes/api.php`
- [ ] Update NotificationController untuk trigger push
- [ ] Add VAPID keys to `.env`
- [ ] Run migration: `php artisan migrate`
- [ ] Test subscription
- [ ] Test push notification
- [ ] Remove test endpoint dari routes (production)

## Notes

- Semua file sudah siap copy-paste
- Tidak perlu modifikasi apapun, langsung bisa digunakan
- Push notification otomatis terkirim saat admin membuat notifikasi
- Invalid subscriptions otomatis dihapus
- Logging sudah ditambahkan untuk debugging
