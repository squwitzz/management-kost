<?php
/**
 * Script to automatically add push notification calls to controllers
 * Run: php add-push-to-controllers.php
 * 
 * This script will:
 * 1. Add use statement for PushNotificationController
 * 2. Add push notification calls after each Notification::create()
 */

$baseDir = __DIR__ . '/kost-backend';

// If not found, try parent directory
if (!is_dir($baseDir)) {
    $baseDir = __DIR__ . '/../kost-backend';
}

// Check if kost-backend exists
if (!is_dir($baseDir)) {
    echo "❌ Error: kost-backend directory not found\n";
    echo "Please run this script from web-kost directory\n";
    exit(1);
}

echo "🔔 Adding Push Notification Integration...\n\n";

// Create backups directory
$backupDir = $baseDir . '/backups';
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0755, true);
}

// Files to update
$files = [
    'MaintenanceRequestController' => [
        'path' => $baseDir . '/app/Http/Controllers/Api/MaintenanceRequestController.php',
        'notifications' => [
            [
                'search' => "Notification::create([\n                'user_id' => \$admin->id,\n                'judul' => 'Laporan Baru',",
                'userId' => '$admin->id',
                'title' => "'Laporan Baru'",
                'message' => '"Laporan baru dari {\$user->nama}: {\$request->judul}"',
                'url' => "'/admin/requests'",
            ],
            [
                'search' => "Notification::create([\n            'user_id' => \$maintenanceRequest->user_id,\n            'judul' => 'Laporan Selesai',",
                'userId' => '$maintenanceRequest->user_id',
                'title' => "'Laporan Selesai'",
                'message' => '"Laporan Anda \'{\$maintenanceRequest->judul}\' telah selesai ditangani"',
                'url' => "'/requests'",
            ],
        ],
    ],
    'PaymentController' => [
        'path' => $baseDir . '/app/Http/Controllers/Api/PaymentController.php',
        'notifications' => [
            [
                'search' => "Notification::create([\n                'user_id' => \$admin->id,\n                'judul'   => 'Bukti Pembayaran Baru',",
                'userId' => '$admin->id',
                'title' => "'Bukti Pembayaran Baru'",
                'message' => '"Bukti pembayaran baru dari {\$user->nama} untuk periode {\$payment->bulan_tahun}"',
                'url' => "'/admin/payments'",
            ],
            [
                'search' => "Notification::create([\n            'user_id' => \$payment->user_id,\n            'judul'   => 'Status Pembayaran',",
                'userId' => '$payment->user_id',
                'title' => "'Status Pembayaran'",
                'message' => '"Pembayaran Anda untuk periode {\$payment->bulan_tahun} telah {\$statusText}"',
                'url' => "'/payments'",
            ],
            [
                'search' => "Notification::create([\n            'user_id' => \$request->user_id,\n            'judul'   => 'Tagihan Baru',",
                'userId' => '$request->user_id',
                'title' => "'Tagihan Baru'",
                'message' => '"Tagihan baru untuk periode {\$payment->bulan_tahun} sebesar Rp " . number_format($payment->jumlah, 0, \',\', \'.\')',
                'url' => "'/payments'",
            ],
        ],
    ],
    'BillingController' => [
        'path' => $baseDir . '/app/Http/Controllers/Api/BillingController.php',
        'notifications' => [
            [
                'search' => "// Send notification to resident\n        Notification::create([\n            'user_id' => \$payment->user_id,\n            'judul' => 'Tagihan Baru',",
                'userId' => '$payment->user_id',
                'title' => "'Tagihan Baru'",
                'message' => '"Tagihan baru untuk periode {\$payment->bulan_tahun} sebesar Rp " . number_format($payment->jumlah, 0, \',\', \'.\')',
                'url' => "'/payments'",
            ],
        ],
    ],
];

// Process each file
foreach ($files as $name => $config) {
    echo "📝 Processing {$name}...\n";
    
    $filePath = $config['path'];
    
    if (!file_exists($filePath)) {
        echo "  ⚠️  File not found: {$filePath}\n\n";
        continue;
    }
    
    // Create backup
    $backupPath = $backupDir . '/' . basename($filePath) . '.backup';
    copy($filePath, $backupPath);
    echo "  💾 Backup created: {$backupPath}\n";
    
    // Read file content
    $content = file_get_contents($filePath);
    
    // Add use statement if not exists
    if (strpos($content, 'use App\Http\Controllers\Api\PushNotificationController;') === false) {
        // Find the last use statement
        $lines = explode("\n", $content);
        $lastUseLine = 0;
        foreach ($lines as $i => $line) {
            if (preg_match('/^use /', $line)) {
                $lastUseLine = $i;
            }
        }
        
        if ($lastUseLine > 0) {
            array_splice($lines, $lastUseLine + 1, 0, 'use App\Http\Controllers\Api\PushNotificationController;');
            $content = implode("\n", $lines);
            echo "  ✅ Added use statement\n";
        }
    }
    
    // Add push notifications
    $addedCount = 0;
    foreach ($config['notifications'] as $notif) {
        // Check if push notification already exists nearby
        $searchPos = strpos($content, $notif['search']);
        if ($searchPos !== false) {
            // Check if push notification already added (within next 500 chars)
            $checkRange = substr($content, $searchPos, 1000);
            if (strpos($checkRange, 'PushNotificationController::sendPushNotification') === false) {
                // Find the closing ]); of Notification::create
                $startPos = $searchPos;
                $endPos = strpos($content, ']);', $startPos);
                
                if ($endPos !== false) {
                    $endPos += 3; // Include ]);
                    
                    // Determine indentation
                    $lineStart = strrpos(substr($content, 0, $searchPos), "\n") + 1;
                    $indent = str_repeat(' ', strpos(substr($content, $lineStart), 'Notification'));
                    
                    // Build push notification code
                    $pushCode = "\n\n{$indent}// Send push notification\n";
                    $pushCode .= "{$indent}PushNotificationController::sendPushNotification(\n";
                    $pushCode .= "{$indent}    {$notif['userId']},\n";
                    $pushCode .= "{$indent}    {$notif['title']},\n";
                    $pushCode .= "{$indent}    {$notif['message']},\n";
                    $pushCode .= "{$indent}    {$notif['url']}\n";
                    $pushCode .= "{$indent});";
                    
                    // Insert push notification code
                    $content = substr_replace($content, $pushCode, $endPos, 0);
                    $addedCount++;
                }
            }
        }
    }
    
    // Write back to file
    file_put_contents($filePath, $content);
    echo "  ✅ Added {$addedCount} push notification(s)\n\n";
}

echo "✅ Integration complete!\n\n";
echo "📋 Summary:\n";
echo "- Backups saved in: {$backupDir}\n";
echo "- Use statements added\n";
echo "- Push notifications integrated\n\n";
echo "🧪 Next steps:\n";
echo "1. Review the changes in each controller\n";
echo "2. Test each notification type\n";
echo "3. Check Laravel logs for any errors\n";
