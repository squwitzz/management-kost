# Backend Implementation Guide - Payment History Endpoints

## Quick Start

Tambahkan 2 endpoint baru di Laravel backend untuk mendukung payment history yang terpisah untuk room dan user.

## Step 1: Update Routes

**File:** `routes/api.php`

```php
// Existing routes...

// Payment History Endpoints (Admin only)
Route::middleware(['auth:api', 'admin'])->group(function () {
    // Get payment history for a specific room
    Route::get('/rooms/{roomId}/payments', [PaymentController::class, 'getRoomPayments']);
    
    // Get payment history for a specific user
    Route::get('/users/{userId}/payments', [PaymentController::class, 'getUserPayments']);
});
```

## Step 2: Update PaymentController

**File:** `app/Http/Controllers/Api/PaymentController.php`

### Method 1: getRoomPayments

```php
/**
 * Get all payment history for a specific room
 * 
 * @param int $roomId
 * @return \Illuminate\Http\JsonResponse
 */
public function getRoomPayments($roomId)
{
    try {
        // Verify room exists
        $room = Room::findOrFail($roomId);
        
        // Get all payments for users in this room
        // This includes current and past residents
        $payments = Payment::whereHas('user', function($query) use ($roomId) {
            $query->where('room_id', $roomId);
        })
        ->with([
            'user:id,nama,nomor_telepon,email',
            'room:id,nomor_kamar,tarif_dasar'
        ])
        ->orderBy('created_at', 'desc')
        ->get();
        
        return response()->json([
            'success' => true,
            'room' => [
                'id' => $room->id,
                'nomor_kamar' => $room->nomor_kamar,
                'tarif_dasar' => $room->tarif_dasar,
            ],
            'payments' => $payments,
            'count' => $payments->count(),
        ], 200);
        
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'error' => 'Room not found'
        ], 404);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => 'Failed to fetch room payments',
            'message' => $e->getMessage()
        ], 500);
    }
}
```

### Method 2: getUserPayments

```php
/**
 * Get all payment history for a specific user
 * 
 * @param int $userId
 * @return \Illuminate\Http\JsonResponse
 */
public function getUserPayments($userId)
{
    try {
        // Verify user exists
        $user = User::findOrFail($userId);
        
        // Get all payments for this user
        $payments = Payment::where('user_id', $userId)
            ->with([
                'user:id,nama,nomor_telepon,email',
                'room:id,nomor_kamar,tarif_dasar'
            ])
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Calculate summary statistics
        $summary = [
            'total_payments' => $payments->count(),
            'total_paid' => $payments->where('status_bayar', 'Lunas')->count(),
            'total_pending' => $payments->where('status_bayar', 'Menunggu Verifikasi')->count(),
            'total_unpaid' => $payments->where('status_bayar', 'Belum Bayar')->count(),
            'total_amount_paid' => $payments->where('status_bayar', 'Lunas')->sum('jumlah_tagihan'),
            'total_amount_pending' => $payments->where('status_bayar', 'Menunggu Verifikasi')->sum('jumlah_tagihan'),
            'payment_rate' => $payments->count() > 0 
                ? round(($payments->where('status_bayar', 'Lunas')->count() / $payments->count()) * 100, 2)
                : 0
        ];
        
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'nomor_telepon' => $user->nomor_telepon,
            ],
            'payments' => $payments,
            'summary' => $summary,
        ], 200);
        
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'error' => 'User not found'
        ], 404);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => 'Failed to fetch user payments',
            'message' => $e->getMessage()
        ], 500);
    }
}
```

## Step 3: Verify Model Relationships

Pastikan model relationships sudah benar:

### Payment Model

**File:** `app/Models/Payment.php`

```php
class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'room_id',
        'bulan_dibayar',
        'jumlah_tagihan',
        'status_bayar',
        'tanggal_upload',
        'bukti_bayar',
    ];

    /**
     * Get the user that owns the payment
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the room associated with the payment
     */
    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
```

### User Model

**File:** `app/Models/User.php`

```php
class User extends Model
{
    // ... existing code ...

    /**
     * Get the payments for the user
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the room assigned to the user
     */
    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
```

### Room Model

**File:** `app/Models/Room.php`

```php
class Room extends Model
{
    // ... existing code ...

    /**
     * Get the users in the room
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get all payments for this room
     */
    public function payments()
    {
        return $this->hasManyThrough(Payment::class, User::class);
    }
}
```

## Step 4: Create Middleware (if not exists)

**File:** `app/Http/Middleware/AdminMiddleware.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || $request->user()->role !== 'Admin') {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        return $next($request);
    }
}
```

**Register middleware in:** `app/Http/Kernel.php`

```php
protected $routeMiddleware = [
    // ... existing middleware ...
    'admin' => \App\Http\Middleware\AdminMiddleware::class,
];
```

## Step 5: Testing

### Test Room Payments Endpoint

```bash
# Using curl
curl -X GET "https://mykost-cendana.xyz/api/rooms/13/payments" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"

# Expected Response
{
  "success": true,
  "room": {
    "id": 13,
    "nomor_kamar": "01",
    "tarif_dasar": 1300000
  },
  "payments": [
    {
      "id": 1,
      "user_id": 5,
      "room_id": 13,
      "bulan_dibayar": "Januari 2024",
      "jumlah_tagihan": 1300000,
      "status_bayar": "Lunas",
      "tanggal_upload": "2024-01-15T10:30:00.000000Z",
      "user": {
        "id": 5,
        "nama": "John Doe",
        "nomor_telepon": "08123456789"
      }
    }
  ],
  "count": 1
}
```

### Test User Payments Endpoint

```bash
# Using curl
curl -X GET "https://mykost-cendana.xyz/api/users/5/payments" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"

# Expected Response
{
  "success": true,
  "user": {
    "id": 5,
    "nama": "John Doe",
    "nomor_telepon": "08123456789"
  },
  "payments": [
    {
      "id": 1,
      "user_id": 5,
      "room_id": 13,
      "bulan_dibayar": "Januari 2024",
      "jumlah_tagihan": 1300000,
      "status_bayar": "Lunas",
      "tanggal_upload": "2024-01-15T10:30:00.000000Z",
      "room": {
        "id": 13,
        "nomor_kamar": "01",
        "tarif_dasar": 1300000
      }
    }
  ],
  "summary": {
    "total_payments": 5,
    "total_paid": 4,
    "total_pending": 1,
    "total_unpaid": 0,
    "total_amount_paid": 5200000,
    "total_amount_pending": 1300000,
    "payment_rate": 80
  }
}
```

## Step 6: Database Optimization (Optional)

Untuk performa lebih baik dengan data besar, tambahkan index:

```php
// Create migration
php artisan make:migration add_indexes_to_payments_table

// In migration file
public function up()
{
    Schema::table('payments', function (Blueprint $table) {
        $table->index('user_id');
        $table->index('room_id');
        $table->index('status_bayar');
        $table->index('created_at');
    });
}

public function down()
{
    Schema::table('payments', function (Blueprint $table) {
        $table->dropIndex(['user_id']);
        $table->dropIndex(['room_id']);
        $table->dropIndex(['status_bayar']);
        $table->dropIndex(['created_at']);
    });
}

// Run migration
php artisan migrate
```

## Troubleshooting

### Issue: 404 Not Found
**Solution:** 
- Pastikan routes sudah ditambahkan di `routes/api.php`
- Clear route cache: `php artisan route:clear`
- Check route list: `php artisan route:list | grep payments`

### Issue: 401 Unauthorized
**Solution:**
- Pastikan token valid dan belum expired
- Check middleware authentication
- Verify user role is 'Admin'

### Issue: 500 Internal Server Error
**Solution:**
- Check Laravel logs: `storage/logs/laravel.log`
- Verify database relationships
- Check if Payment model has correct fillable fields

### Issue: Empty payments array
**Solution:**
- Verify data exists in database
- Check relationship definitions
- Ensure user_id and room_id are correctly set

## Performance Considerations

### For Large Datasets (>1000 payments)

Add pagination:

```php
public function getRoomPayments($roomId, Request $request)
{
    $perPage = $request->input('per_page', 20);
    
    $payments = Payment::whereHas('user', function($query) use ($roomId) {
        $query->where('room_id', $roomId);
    })
    ->with(['user:id,nama,nomor_telepon', 'room:id,nomor_kamar'])
    ->orderBy('created_at', 'desc')
    ->paginate($perPage);
    
    return response()->json([
        'success' => true,
        'payments' => $payments->items(),
        'pagination' => [
            'current_page' => $payments->currentPage(),
            'last_page' => $payments->lastPage(),
            'per_page' => $payments->perPage(),
            'total' => $payments->total(),
        ]
    ]);
}
```

## Deployment Checklist

- [ ] Routes added to `routes/api.php`
- [ ] Methods added to `PaymentController.php`
- [ ] Model relationships verified
- [ ] Middleware configured
- [ ] Database indexes added (optional)
- [ ] Tested with Postman/curl
- [ ] Tested with frontend
- [ ] Error handling verified
- [ ] Performance tested with large dataset
- [ ] Documentation updated

## Next Steps After Implementation

1. Test endpoints dengan Postman atau curl
2. Verify frontend dapat mengakses endpoint baru
3. Monitor performance di production
4. Consider adding caching untuk frequently accessed data
5. Add rate limiting jika diperlukan

## Support

Jika ada masalah:
1. Check Laravel logs
2. Verify database structure
3. Test dengan curl/Postman terlebih dahulu
4. Check frontend console untuk error messages
