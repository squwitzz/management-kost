<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\FoodItemController;
use App\Http\Controllers\Api\FoodOrderController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PeraturanController;
use App\Http\Controllers\Api\RoomController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tymon\JWTAuth\Facades\JWTAuth;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Backend is running',
        'timestamp' => now()->toDateTimeString(),
        'environment' => app()->environment(),
    ]);
});

// Database check endpoint
Route::get('/db-check', function () {
    try {
        // Check database connection
        DB::connection()->getPdo();
        $dbConnected = true;
        $dbName = DB::connection()->getDatabaseName();
        
        // Check if users table exists
        $tablesExist = Schema::hasTable('users');
        
        // Count users
        $userCount = $tablesExist ? DB::table('users')->count() : 0;
        
        // Get sample user (for testing)
        $sampleUser = null;
        if ($tablesExist && $userCount > 0) {
            $sampleUser = DB::table('users')->first(['id', 'nama', 'nomor_telepon', 'role']);
        }
        
        return response()->json([
            'status' => 'ok',
            'database' => [
                'connected' => $dbConnected,
                'name' => $dbName,
                'tables_exist' => $tablesExist,
                'user_count' => $userCount,
                'sample_user' => $sampleUser,
            ],
            'message' => $tablesExist 
                ? ($userCount > 0 ? 'Database ready' : 'Database ready but no users found') 
                : 'Database connected but tables not migrated',
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Database connection failed',
            'error' => $e->getMessage(),
        ], 500);
    }
});

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// User profile routes (with manual auth)
Route::get('/me', [AuthController::class, 'me']);
Route::post('/profile/update', [AuthController::class, 'updateProfile']);
Route::post('/change-password', [AuthController::class, 'changePassword']);

// Room routes (with manual auth in controller)
Route::get('/rooms', [RoomController::class, 'index']);
Route::post('/rooms', [RoomController::class, 'store']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);
Route::put('/rooms/{id}', [RoomController::class, 'update']);
Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);
Route::post('/rooms/register-penghuni', [RoomController::class, 'registerPenghuni']);
Route::post('/rooms/{id}/remove-resident', [RoomController::class, 'removeResident']);

// Payment routes (with manual auth in controller)
Route::get('/payments', [PaymentController::class, 'index']);
Route::post('/payments', [PaymentController::class, 'store']);
// IMPORTANT: static route 'upload-bukti' must be defined BEFORE the {id} wildcard
Route::post('/payments/upload-bukti', [PaymentController::class, 'uploadBukti']);
Route::get('/payments/{id}', [PaymentController::class, 'show']);
Route::put('/payments/{id}/verify', [PaymentController::class, 'verify']);

// Notification routes (with manual auth in controller)
Route::get('/notifications', [NotificationController::class, 'index']);
Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

// Maintenance Request routes (with manual auth in controller)
Route::get('/maintenance-requests', [\App\Http\Controllers\Api\MaintenanceRequestController::class, 'index']);
Route::get('/maintenance-requests/drafts', [\App\Http\Controllers\Api\MaintenanceRequestController::class, 'getDrafts']);
Route::get('/maintenance-requests/stats', [\App\Http\Controllers\Api\MaintenanceRequestController::class, 'getStats']);
Route::get('/maintenance-requests/{id}', [\App\Http\Controllers\Api\MaintenanceRequestController::class, 'show']);
Route::post('/maintenance-requests', [\App\Http\Controllers\Api\MaintenanceRequestController::class, 'store']);
Route::put('/maintenance-requests/{id}', [\App\Http\Controllers\Api\MaintenanceRequestController::class, 'update']);
Route::delete('/maintenance-requests/{id}', [\App\Http\Controllers\Api\MaintenanceRequestController::class, 'destroy']);

// Billing routes (with manual auth in controller)
Route::get('/billing/settings', [BillingController::class, 'getSettings']);
Route::put('/billing/settings', [BillingController::class, 'updateSettings']);
Route::post('/billing/preview', [BillingController::class, 'previewPayments']);
Route::post('/billing/generate', [BillingController::class, 'generatePayments']);
Route::get('/billing/drafts', [BillingController::class, 'getDraftPayments']);
Route::put('/billing/payments/{id}/charges', [BillingController::class, 'updatePaymentCharges']);
Route::post('/billing/payments/{id}/finalize', [BillingController::class, 'finalizePayment']);
Route::post('/billing/payments/bulk-finalize', [BillingController::class, 'bulkFinalizePayments']);
Route::delete('/billing/payments/{id}', [BillingController::class, 'deleteDraftPayment']);

// Peraturan routes (with manual auth in controller)
Route::get('/peraturan', [PeraturanController::class, 'index']); // Active rules for users
Route::get('/peraturan/all', [PeraturanController::class, 'indexAll']); // All rules for admin
Route::get('/peraturan/{id}', [PeraturanController::class, 'show']);
Route::post('/peraturan', [PeraturanController::class, 'store']); // Admin only
Route::put('/peraturan/{id}', [PeraturanController::class, 'update']); // Admin only
Route::delete('/peraturan/{id}', [PeraturanController::class, 'destroy']); // Admin only
Route::put('/peraturan/{id}/toggle', [PeraturanController::class, 'toggleActive']); // Admin only

// User Management routes (Admin only - with manual auth in controller)
Route::get('/admin/residents', [\App\Http\Controllers\Api\UserController::class, 'index']);
Route::get('/admin/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'show']);
Route::put('/admin/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'update']);
Route::delete('/admin/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'destroy']);
Route::post('/admin/users/{id}/assign-room', [\App\Http\Controllers\Api\UserController::class, 'assignRoom']);

// Debug endpoint
Route::post('/debug-token', function (Request $request) {
    try {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['error' => 'No token provided']);
        }
        
        JWTAuth::setToken($token);
        $payload = JWTAuth::getPayload();
        
        // Try to get user
        $userId = $payload->get('sub');
        $user = \App\Models\User::find($userId);
        
        return response()->json([
            'token_received' => substr($token, 0, 50) . '...',
            'payload' => $payload->toArray(),
            'user_id_from_token' => $userId,
            'user_found' => $user ? true : false,
            'user' => $user,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'class' => get_class($e),
            'trace' => $e->getTraceAsString(),
        ], 500);
    }
});

// Test endpoint
Route::get('/test-auth', function (Request $request) {
    try {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['error' => 'No token'], 401);
        }
        
        JWTAuth::setToken($token);
        $payload = JWTAuth::getPayload();
        $userId = $payload->get('sub');
        $user = \App\Models\User::find($userId);
        
        if (!$user) {
            return response()->json(['error' => 'User not found'], 401);
        }
        
        return response()->json([
            'authenticated' => true,
            'user' => $user,
            'guard' => 'api',
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
        ], 401);
    }
});

// Protected routes
Route::middleware('auth:api')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Food Item routes
    Route::get('/food-items', [FoodItemController::class, 'index']);
    Route::get('/food-items/{id}', [FoodItemController::class, 'show']);
    Route::post('/food-items', [FoodItemController::class, 'store']); // Admin only
    Route::put('/food-items/{id}', [FoodItemController::class, 'update']); // Admin only
    Route::delete('/food-items/{id}', [FoodItemController::class, 'destroy']); // Admin only

    // Food Order routes
    Route::get('/food-orders', [FoodOrderController::class, 'index']);
    Route::get('/food-orders/{id}', [FoodOrderController::class, 'show']);
    Route::post('/food-orders', [FoodOrderController::class, 'store']);
    Route::put('/food-orders/{id}/status', [FoodOrderController::class, 'updateStatus']); // Admin only
});
