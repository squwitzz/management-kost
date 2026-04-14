<?php
/**
 * JWT Debug Script
 * This script helps diagnose JWT token validation issues
 * 
 * Usage: https://mykost-cendana.xyz/test-jwt-debug.php?token=YOUR_TOKEN_HERE
 */

// Load Laravel
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Config;

header('Content-Type: application/json');

// Get token from query parameter or Authorization header
$token = $_GET['token'] ?? null;
if (!$token) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
    }
}

$result = [
    'timestamp' => date('Y-m-d H:i:s'),
    'server_time' => time(),
    'jwt_config' => [
        'secret_exists' => !empty(env('JWT_SECRET')),
        'secret_preview' => env('JWT_SECRET') ? substr(env('JWT_SECRET'), 0, 20) . '...' : 'NOT SET',
        'ttl' => Config::get('jwt.ttl'),
        'algo' => Config::get('jwt.algo'),
        'blacklist_enabled' => Config::get('jwt.blacklist_enabled'),
        'leeway' => Config::get('jwt.leeway'),
    ],
    'token_provided' => !empty($token),
];

if (!$token) {
    $result['error'] = 'No token provided. Add ?token=YOUR_TOKEN to URL';
    echo json_encode($result, JSON_PRETTY_PRINT);
    exit;
}

$result['token_preview'] = substr($token, 0, 30) . '...';

// Try to decode token without validation first
try {
    $parts = explode('.', $token);
    if (count($parts) === 3) {
        $header = json_decode(base64_decode(strtr($parts[0], '-_', '+/')), true);
        $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
        
        $result['token_structure'] = [
            'valid_format' => true,
            'header' => $header,
            'payload' => [
                'sub' => $payload['sub'] ?? 'missing',
                'iss' => $payload['iss'] ?? 'missing',
                'iat' => $payload['iat'] ?? 'missing',
                'iat_readable' => isset($payload['iat']) ? date('Y-m-d H:i:s', $payload['iat']) : 'missing',
                'exp' => $payload['exp'] ?? 'missing',
                'exp_readable' => isset($payload['exp']) ? date('Y-m-d H:i:s', $payload['exp']) : 'missing',
                'nbf' => $payload['nbf'] ?? 'missing',
                'jti' => $payload['jti'] ?? 'missing',
            ],
            'is_expired' => isset($payload['exp']) ? (time() > $payload['exp']) : 'unknown',
            'time_until_expiry' => isset($payload['exp']) ? ($payload['exp'] - time()) . ' seconds' : 'unknown',
        ];
    } else {
        $result['token_structure'] = [
            'valid_format' => false,
            'error' => 'Token does not have 3 parts (header.payload.signature)',
        ];
    }
} catch (\Exception $e) {
    $result['token_structure'] = [
        'valid_format' => false,
        'error' => $e->getMessage(),
    ];
}

// Try to validate token with JWT library
try {
    JWTAuth::setToken($token);
    $payload = JWTAuth::getPayload();
    
    $result['jwt_validation'] = [
        'success' => true,
        'user_id' => $payload->get('sub'),
        'issued_at' => date('Y-m-d H:i:s', $payload->get('iat')),
        'expires_at' => date('Y-m-d H:i:s', $payload->get('exp')),
        'issuer' => $payload->get('iss'),
    ];
    
    // Try to get user
    $userId = $payload->get('sub');
    $user = \App\Models\User::find($userId);
    
    if ($user) {
        $result['user_lookup'] = [
            'success' => true,
            'user_id' => $user->id,
            'name' => $user->nama,
            'role' => $user->role,
            'phone' => $user->nomor_telepon,
        ];
    } else {
        $result['user_lookup'] = [
            'success' => false,
            'error' => 'User not found in database',
            'user_id' => $userId,
        ];
    }
    
} catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
    $result['jwt_validation'] = [
        'success' => false,
        'error_type' => 'TokenExpiredException',
        'error_message' => $e->getMessage(),
        'solution' => 'Token has expired. User needs to login again.',
    ];
} catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
    $result['jwt_validation'] = [
        'success' => false,
        'error_type' => 'TokenInvalidException',
        'error_message' => $e->getMessage(),
        'solution' => 'Token signature is invalid. Possible causes: JWT_SECRET mismatch, token was tampered with, or token was generated with different secret.',
        'action_required' => 'Run: php artisan jwt:secret --force && php artisan config:clear && php artisan cache:clear',
    ];
} catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
    $result['jwt_validation'] = [
        'success' => false,
        'error_type' => 'JWTException',
        'error_message' => $e->getMessage(),
        'solution' => 'General JWT error. Check error message for details.',
    ];
} catch (\Exception $e) {
    $result['jwt_validation'] = [
        'success' => false,
        'error_type' => get_class($e),
        'error_message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
    ];
}

// Final diagnosis
if (isset($result['jwt_validation']['success']) && $result['jwt_validation']['success']) {
    $result['diagnosis'] = '✅ TOKEN IS VALID! The 401 error is likely caused by authorization (user_id mismatch) not authentication.';
} else {
    $result['diagnosis'] = '❌ TOKEN VALIDATION FAILED! See jwt_validation.error_message and jwt_validation.solution for details.';
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
