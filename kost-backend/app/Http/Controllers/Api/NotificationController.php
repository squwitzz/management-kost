<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\PushNotificationController;
use Tymon\JWTAuth\Facades\JWTAuth;

class NotificationController extends Controller
{
    /**
     * Get authenticated user from JWT token
     */
    private function getAuthenticatedUser(Request $request)
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return null;
            }

            JWTAuth::setToken($token);
            $payload = JWTAuth::getPayload();
            $userId = $payload->get('sub');
            
            return User::find($userId);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get user's notifications
     */
    public function index(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $notifications = Notification::where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json(['notifications' => $notifications]);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $count = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $notification = Notification::where('user_id', $user->id)
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json(['message' => 'Notifikasi ditandai sudah dibaca']);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Semua notifikasi ditandai sudah dibaca']);
    }

    /**
     * Delete notification
     */
    public function destroy(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $notification = Notification::where('user_id', $user->id)
            ->findOrFail($id);

        $notification->delete();

        return response()->json(['message' => 'Notifikasi berhasil dihapus']);
    }
}
