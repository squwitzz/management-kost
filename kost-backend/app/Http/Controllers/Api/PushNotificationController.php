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
