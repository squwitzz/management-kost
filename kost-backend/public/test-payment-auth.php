<?php
/**
 * Test Payment Authorization
 * Check if token is valid and user can access payment
 */

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\User;
use App\Models\Payment;

header('Content-Type: application/json');

// Get token and payment ID from query
$token = $_GET['token'] ?? null;
$paymentId = $_GET['payment_id'] ?? null;

if (!$token || !$paymentId) {
    echo json_encode([
        'error' => 'Missing parameters',
        'usage' => 'test-payment-auth.php?token=YOUR_TOKEN&payment_id=20',
    ], JSON_PRETTY_PRINT);
    exit;
}

$result = [
    'timestamp' => date('Y-m-d H:i:s'),
    'payment_id' => $paymentId,
];

// Validate token
try {
    JWTAuth::setToken($token);
    $payload = JWTAuth::getPayload();
    $userId = $payload->get('sub');
    
    $result['token_validation'] = [
        'success' => true,
        'user_id' => $userId,
    ];
    
    // Get user
    $user = User::find($userId);
    if ($user) {
        $result['user'] = [
            'id' => $user->id,
            'nama' => $user->nama,
            'role' => $user->role,
            'is_admin' => $user->isAdmin(),
        ];
    } else {
        $result['user'] = [
            'error' => 'User not found in database',
        ];
    }
    
    // Get payment
    $payment = Payment::find($paymentId);
    if ($payment) {
        $result['payment'] = [
            'id' => $payment->id,
            'user_id' => $payment->user_id,
            'bulan_dibayar' => $payment->bulan_dibayar,
            'status_bayar' => $payment->status_bayar,
        ];
        
        // Check authorization
        $isOwner = (int)$payment->user_id === (int)$userId;
        $isAdmin = $user && $user->isAdmin();
        
        $result['authorization'] = [
            'is_owner' => $isOwner,
            'is_admin' => $isAdmin,
            'can_access' => $isOwner || $isAdmin,
            'payment_user_id' => (int)$payment->user_id,
            'current_user_id' => (int)$userId,
            'type_match' => gettype($payment->user_id) === gettype($userId),
        ];
        
        if ($isOwner || $isAdmin) {
            $result['verdict'] = '✅ ACCESS GRANTED - User can access this payment';
        } else {
            $result['verdict'] = '❌ ACCESS DENIED - User cannot access this payment';
        }
    } else {
        $result['payment'] = [
            'error' => 'Payment not found',
        ];
    }
    
} catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
    $result['token_validation'] = [
        'success' => false,
        'error' => 'Token has expired',
        'message' => $e->getMessage(),
    ];
} catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
    $result['token_validation'] = [
        'success' => false,
        'error' => 'Token is invalid',
        'message' => $e->getMessage(),
    ];
} catch (\Exception $e) {
    $result['token_validation'] = [
        'success' => false,
        'error' => get_class($e),
        'message' => $e->getMessage(),
    ];
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
