# Push Notification Integration - Add to Existing Controllers

## Overview
Tambahkan push notification trigger di semua tempat yang membuat notifikasi.

## Files yang Perlu Diupdate

### 1. MaintenanceRequestController.php

**Location:** `kost-backend/app/Http/Controllers/Api/MaintenanceRequestController.php`

#### Tambahkan di bagian atas (setelah use statements):
```php
use App\Http\Controllers\Api\PushNotificationController;
```

#### Update di method store() - sekitar line 155-160:
**SEBELUM:**
```php
$admins = User::where('role', 'Admin')->get();
foreach ($admins as $admin) {
    Notification::create([
        'user_id' => $admin->id,
        'judul' => 'Laporan Baru',
        'pesan' => "Laporan baru dari {$user->nama}: {$request->judul}",
        'tipe' => 'laporan',
        'is_read' => false,
    ]);
}
```

**SESUDAH:**
```php
$admins = User::where('role', 'Admin')->get();
foreach ($admins as $admin) {
    Notification::create([
        'user_id' => $admin->id,
        'judul' => 'Laporan Baru',
        'pesan' => "Laporan baru dari {$user->nama}: {$request->judul}",
        'tipe' => 'laporan',
        'is_read' => false,
    ]);
    
    // Send push notification
    PushNotificationController::sendPushNotification(
        $admin->id,
        'Laporan Baru',
        "Laporan baru dari {$user->nama}: {$request->judul}",
        '/admin/requests'
    );
}
```

#### Update di method updateStatus() - sekitar line 212-218:
**SEBELUM:**
```php
// Notify user
Notification::create([
    'user_id' => $maintenanceRequest->user_id,
    'judul' => 'Laporan Selesai',
    'pesan' => "Laporan Anda '{$maintenanceRequest->judul}' telah selesai ditangani",
    'tipe' => 'laporan',
    'is_read' => false,
]);
```

**SESUDAH:**
```php
// Notify user
Notification::create([
    'user_id' => $maintenanceRequest->user_id,
    'judul' => 'Laporan Selesai',
    'pesan' => "Laporan Anda '{$maintenanceRequest->judul}' telah selesai ditangani",
    'tipe' => 'laporan',
    'is_read' => false,
]);

// Send push notification
PushNotificationController::sendPushNotification(
    $maintenanceRequest->user_id,
    'Laporan Selesai',
    "Laporan Anda '{$maintenanceRequest->judul}' telah selesai ditangani",
    '/requests'
);
```

---

### 2. PaymentController.php

**Location:** `kost-backend/app/Http/Controllers/Api/PaymentController.php`

#### Tambahkan di bagian atas (setelah use statements):
```php
use App\Http\Controllers\Api\PushNotificationController;
```

#### Update di method uploadProof() - sekitar line 161-168:
**SEBELUM:**
```php
$admins = User::where('role', 'Admin')->get();
foreach ($admins as $admin) {
    Notification::create([
        'user_id' => $admin->id,
        'judul'   => 'Bukti Pembayaran Baru',
        'pesan'   => "Bukti pembayaran baru dari {$user->nama} untuk periode {$payment->bulan_tahun}",
        'tipe'    => 'pembayaran',
        'is_read' => false,
    ]);
}
```

**SESUDAH:**
```php
$admins = User::where('role', 'Admin')->get();
foreach ($admins as $admin) {
    Notification::create([
        'user_id' => $admin->id,
        'judul'   => 'Bukti Pembayaran Baru',
        'pesan'   => "Bukti pembayaran baru dari {$user->nama} untuk periode {$payment->bulan_tahun}",
        'tipe'    => 'pembayaran',
        'is_read' => false,
    ]);
    
    // Send push notification
    PushNotificationController::sendPushNotification(
        $admin->id,
        'Bukti Pembayaran Baru',
        "Bukti pembayaran baru dari {$user->nama} untuk periode {$payment->bulan_tahun}",
        '/admin/payments'
    );
}
```

#### Update di method updateStatus() - sekitar line 206-213:
**SEBELUM:**
```php
Notification::create([
    'user_id' => $payment->user_id,
    'judul'   => 'Status Pembayaran',
    'pesan'   => "Pembayaran Anda untuk periode {$payment->bulan_tahun} telah {$statusText}",
    'tipe'    => 'pembayaran',
    'is_read' => false,
]);
```

**SESUDAH:**
```php
Notification::create([
    'user_id' => $payment->user_id,
    'judul'   => 'Status Pembayaran',
    'pesan'   => "Pembayaran Anda untuk periode {$payment->bulan_tahun} telah {$statusText}",
    'tipe'    => 'pembayaran',
    'is_read' => false,
]);

// Send push notification
PushNotificationController::sendPushNotification(
    $payment->user_id,
    'Status Pembayaran',
    "Pembayaran Anda untuk periode {$payment->bulan_tahun} telah {$statusText}",
    '/payments'
);
```

#### Update di method store() - sekitar line 245-252:
**SEBELUM:**
```php
Notification::create([
    'user_id' => $request->user_id,
    'judul'   => 'Tagihan Baru',
    'pesan'   => "Tagihan baru untuk periode {$payment->bulan_tahun} sebesar Rp " . number_format($payment->jumlah, 0, ',', '.'),
    'tipe'    => 'pembayaran',
    'is_read' => false,
]);
```

**SESUDAH:**
```php
Notification::create([
    'user_id' => $request->user_id,
    'judul'   => 'Tagihan Baru',
    'pesan'   => "Tagihan baru untuk periode {$payment->bulan_tahun} sebesar Rp " . number_format($payment->jumlah, 0, ',', '.'),
    'tipe'    => 'pembayaran',
    'is_read' => false,
]);

// Send push notification
PushNotificationController::sendPushNotification(
    $request->user_id,
    'Tagihan Baru',
    "Tagihan baru untuk periode {$payment->bulan_tahun} sebesar Rp " . number_format($payment->jumlah, 0, ',', '.'),
    '/payments'
);
```

---

### 3. BillingController.php

**Location:** `kost-backend/app/Http/Controllers/Api/BillingController.php`

#### Tambahkan di bagian atas (setelah use statements):
```php
use App\Http\Controllers\Api\PushNotificationController;
```

#### Update di method generateMonthlyBills() - sekitar line 397-404:
**SEBELUM:**
```php
// Send notification to resident
Notification::create([
    'user_id' => $payment->user_id,
    'judul' => 'Tagihan Baru',
    'pesan' => "Tagihan baru untuk periode {$payment->bulan_tahun} sebesar Rp " . number_format($payment->jumlah, 0, ',', '.'),
    'tipe' => 'pembayaran',
    'is_read' => false,
]);
```

**SESUDAH:**
```php
// Send notification to resident
Notification::create([
    'user_id' => $payment->user_id,
    'judul' => 'Tagihan Baru',
    'pesan' => "Tagihan baru untuk periode {$payment->bulan_tahun} sebesar Rp " . number_format($payment->jumlah, 0, ',', '.'),
    'tipe' => 'pembayaran',
    'is_read' => false,
]);

// Send push notification
PushNotificationController::sendPushNotification(
    $payment->user_id,
    'Tagihan Baru',
    "Tagihan baru untuk periode {$payment->bulan_tahun} sebesar Rp " . number_format($payment->jumlah, 0, ',', '.'),
    '/payments'
);
```

#### Update di method generateBillForResident() - sekitar line 452-459:
**SEBELUM:**
```php
// Send notification to resident
Notification::create([
    'user_id' => $payment->user_id,
    'judul' => 'Tagihan Baru',
    'pesan' => "Tagihan baru untuk periode {$payment->bulan_tahun} sebesar Rp " . number_format($payment->jumlah, 0, ',', '.'),
    'tipe' => 'pembayaran',
    'is_read' => false,
]);
```

**SESUDAH:**
```php
// Send notification to resident
Notification::create([
    'user_id' => $payment->user_id,
    'judul' => 'Tagihan Baru',
    'pesan' => "Tagihan baru untuk periode {$payment->bulan_tahun} sebesar Rp " . number_format($payment->jumlah, 0, ',', '.'),
    'tipe' => 'pembayaran',
    'is_read' => false,
]);

// Send push notification
PushNotificationController::sendPushNotification(
    $payment->user_id,
    'Tagihan Baru',
    "Tagihan baru untuk periode {$payment->bulan_tahun} sebesar Rp " . number_format($payment->jumlah, 0, ',', '.'),
    '/payments'
);
```

---

### 4. FoodOrderController.php (Jika ada)

**Location:** `kost-backend/app/Http/Controllers/Api/FoodOrderController.php`

#### Tambahkan di bagian atas (setelah use statements):
```php
use App\Http\Controllers\Api\PushNotificationController;
```

#### Update di method store() - sekitar line 69-76:
**SEBELUM:**
```php
$admins = \App\Models\User::where('role', 'Admin')->get();
foreach ($admins as $admin) {
    Notification::create([
        'user_id' => $admin->id,
        'judul' => 'Pesanan Makanan Baru',
        'pesan' => "Pesanan makanan baru dari {$user->nama}",
        'tipe' => 'pesanan',
        'is_read' => false,
    ]);
}
```

**SESUDAH:**
```php
$admins = \App\Models\User::where('role', 'Admin')->get();
foreach ($admins as $admin) {
    Notification::create([
        'user_id' => $admin->id,
        'judul' => 'Pesanan Makanan Baru',
        'pesan' => "Pesanan makanan baru dari {$user->nama}",
        'tipe' => 'pesanan',
        'is_read' => false,
    ]);
    
    // Send push notification
    PushNotificationController::sendPushNotification(
        $admin->id,
        'Pesanan Makanan Baru',
        "Pesanan makanan baru dari {$user->nama}",
        '/admin/food-orders'
    );
}
```

#### Update di method updateStatus() - sekitar line 112-119:
**SEBELUM:**
```php
Notification::create([
    'user_id' => $order->user_id,
    'judul' => 'Status Pesanan',
    'pesan' => "Status pesanan Anda: {$statusText}",
    'tipe' => 'pesanan',
    'is_read' => false,
]);
```

**SESUDAH:**
```php
Notification::create([
    'user_id' => $order->user_id,
    'judul' => 'Status Pesanan',
    'pesan' => "Status pesanan Anda: {$statusText}",
    'tipe' => 'pesanan',
    'is_read' => false,
]);

// Send push notification
PushNotificationController::sendPushNotification(
    $order->user_id,
    'Status Pesanan',
    "Status pesanan Anda: {$statusText}",
    '/food-orders'
);
```

---

## Summary of Changes

### Files to Update:
1. ✅ MaintenanceRequestController.php - 2 locations
2. ✅ PaymentController.php - 3 locations
3. ✅ BillingController.php - 2 locations
4. ✅ FoodOrderController.php - 2 locations (if exists)

### Pattern:
Setelah setiap `Notification::create([...])`, tambahkan:
```php
// Send push notification
PushNotificationController::sendPushNotification(
    $userId,
    $title,
    $message,
    $url
);
```

### URL Mapping:
- Admin notifications: `/admin/requests`, `/admin/payments`, etc.
- User notifications: `/requests`, `/payments`, etc.

## Testing After Integration

1. **Test New Maintenance Request:**
   - User buat laporan baru
   - Admin harus terima push notification

2. **Test Payment Upload:**
   - User upload bukti pembayaran
   - Admin harus terima push notification

3. **Test Payment Status Update:**
   - Admin update status pembayaran
   - User harus terima push notification

4. **Test Monthly Bill Generation:**
   - Admin generate tagihan bulanan
   - Semua user harus terima push notification

5. **Test Background Notification:**
   - Tutup aplikasi sepenuhnya
   - Trigger notifikasi
   - Notifikasi harus muncul

## Notes

- Push notification akan otomatis terkirim setiap kali notifikasi dibuat
- Jika user belum subscribe, push notification akan di-skip (tidak error)
- Invalid subscriptions akan otomatis dihapus
- Semua push notification di-log di Laravel log untuk debugging
