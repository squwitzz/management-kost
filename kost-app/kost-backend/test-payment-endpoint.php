<?php

// Test payment endpoint
$loginUrl = 'http://127.0.0.1:8000/api/login';
$paymentUrl = 'http://127.0.0.1:8000/api/payments/1';

// Login first
$loginData = [
    'nomor_telepon' => '081234567890',
    'password' => 'admin123'
];

$ch = curl_init($loginUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$loginResponse = curl_exec($ch);
$loginData = json_decode($loginResponse, true);
curl_close($ch);

if (!isset($loginData['access_token'])) {
    echo "Login failed!\n";
    echo $loginResponse . "\n";
    exit(1);
}

$token = $loginData['access_token'];
echo "✅ Login successful! Token: " . substr($token, 0, 20) . "...\n\n";

// Test payment endpoint
$ch = curl_init($paymentUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/json'
]);

$paymentResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response:\n";
echo $paymentResponse . "\n";

if ($httpCode === 200) {
    echo "\n✅ Payment endpoint working!\n";
} else {
    echo "\n❌ Payment endpoint failed!\n";
}
