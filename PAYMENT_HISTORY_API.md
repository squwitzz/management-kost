# Payment History API Endpoints

## Overview
Dokumentasi ini menjelaskan endpoint API baru yang perlu ditambahkan di backend untuk mendukung fitur payment history yang terpisah untuk kamar dan user.

## Frontend Implementation
Frontend sudah diupdate untuk menggunakan endpoint baru dengan fallback ke endpoint existing jika endpoint baru belum tersedia.

### Files Updated:
- `app/lib/api.ts` - Added `getRoomPayments()` and `getUserPayments()` methods
- `app/(admin)/admin/rooms/[id]/page.tsx` - Updated to fetch room-specific payments
- `app/(admin)/admin/residents/[id]/page.tsx` - Updated to fetch user-specific payments

## Required Backend Endpoints

### 1. Get Room Payment History
**Endpoint:** `GET /api/rooms/{roomId}/payments`

**Description:** Mendapatkan semua payment history untuk kamar tertentu (semua penghuni yang pernah menempati kamar tersebut)

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Response Success (200):**
```json
{
  "success": true,
  "payments": [
    {
      "id": 1,
      "user_id": 5,
      "room_id": 13,
      "bulan_dibayar": "Januari 2024",
      "jumlah_tagihan": 1300000,
      "status_bayar": "Lunas",
      "tanggal_upload": "2024-01-15T10:30:00Z",
      "bukti_bayar": "payments/bukti_123.jpg",
      "user": {
        "id": 5,
        "nama": "John Doe",
        "nomor_telepon": "08123456789"
      }
    }
  ]
}
```

**Implementation Guide (Laravel):**
```php
// In routes/api.php
Route::get('/rooms/{roomId}/payments', [PaymentController::class, 'getRoomPayments'])
    ->middleware('auth:api');

// In PaymentController.php
public function getRoomPayments($roomId)
{
    $room = Room::findOrFail($roomId);
    
    // Get all payments for users who are/were in this room
    $payments = Payment::whereHas('user', function($query) use ($roomId) {
        $query->where('room_id', $roomId)
              ->orWhereHas('roomHistory', function($q) use ($roomId) {
                  $q->where('room_id', $roomId);
              });
    })
    ->with(['user:id,nama,nomor_telepon'])
    ->orderBy('created_at', 'desc')
    ->get();
    
    return response()->json([
        'success' => true,
        'payments' => $payments
    ]);
}
```

### 2. Get User Payment History
**Endpoint:** `GET /api/users/{userId}/payments`

**Description:** Mendapatkan semua payment history untuk user tertentu (di semua kamar yang pernah ditempati)

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Response Success (200):**
```json
{
  "success": true,
  "payments": [
    {
      "id": 1,
      "user_id": 5,
      "room_id": 13,
      "bulan_dibayar": "Januari 2024",
      "jumlah_tagihan": 1300000,
      "status_bayar": "Lunas",
      "tanggal_upload": "2024-01-15T10:30:00Z",
      "bukti_bayar": "payments/bukti_123.jpg",
      "room": {
        "id": 13,
        "nomor_kamar": "01",
        "tarif_dasar": 1300000
      }
    }
  ],
  "summary": {
    "total_paid": 5,
    "total_pending": 1,
    "total_unpaid": 0,
    "total_amount_paid": 6500000
  }
}
```

**Implementation Guide (Laravel):**
```php
// In routes/api.php
Route::get('/users/{userId}/payments', [PaymentController::class, 'getUserPayments'])
    ->middleware('auth:api');

// In PaymentController.php
public function getUserPayments($userId)
{
    $user = User::findOrFail($userId);
    
    $payments = Payment::where('user_id', $userId)
        ->with(['room:id,nomor_kamar,tarif_dasar'])
        ->orderBy('created_at', 'desc')
        ->get();
    
    // Calculate summary
    $summary = [
        'total_paid' => $payments->where('status_bayar', 'Lunas')->count(),
        'total_pending' => $payments->where('status_bayar', 'Menunggu Verifikasi')->count(),
        'total_unpaid' => $payments->where('status_bayar', 'Belum Bayar')->count(),
        'total_amount_paid' => $payments->where('status_bayar', 'Lunas')->sum('jumlah_tagihan')
    ];
    
    return response()->json([
        'success' => true,
        'payments' => $payments,
        'summary' => $summary
    ]);
}
```

## Database Considerations

### Optional: Room History Table
Jika ingin tracking lengkap perpindahan kamar, bisa tambahkan tabel `room_history`:

```sql
CREATE TABLE room_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    room_id BIGINT UNSIGNED NOT NULL,
    moved_in_at TIMESTAMP NOT NULL,
    moved_out_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);
```

## Testing

### Test Room Payments Endpoint:
```bash
curl -X GET "https://mykost-cendana.xyz/api/rooms/13/payments" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### Test User Payments Endpoint:
```bash
curl -X GET "https://mykost-cendana.xyz/api/users/5/payments" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

## Frontend Behavior

### Current Implementation:
1. Frontend akan mencoba endpoint baru terlebih dahulu
2. Jika endpoint baru return 404, akan fallback ke endpoint `/api/payments` dan filter di frontend
3. Tidak ada breaking changes - aplikasi tetap berfungsi dengan atau tanpa endpoint baru

### Benefits of New Endpoints:
- **Performance**: Mengurangi data transfer dengan filtering di backend
- **Scalability**: Lebih efisien saat data payment bertambah banyak
- **Clarity**: Lebih jelas separation of concerns antara room dan user payments

## Migration Path

1. **Phase 1 (Current)**: Frontend menggunakan fallback ke existing endpoint
2. **Phase 2**: Implementasi endpoint baru di backend
3. **Phase 3**: Test endpoint baru
4. **Phase 4**: Deploy ke production
5. **Phase 5** (Optional): Remove fallback logic setelah endpoint stabil

## Notes

- Endpoint ini memerlukan authentication (Admin role)
- Response format mengikuti convention yang sudah ada
- Sorting default: newest first (created_at DESC)
- Include related data (user/room) untuk mengurangi additional queries di frontend
