# Assign Room Feature

## Overview
Fitur untuk assign kamar ke resident yang belum memiliki kamar atau kamarnya kosong.

## Fitur

### 1. Deteksi Resident Tanpa Kamar
- Sistem otomatis mendeteksi jika resident tidak memiliki `room_id`
- Tombol "Assign Room" akan muncul di halaman detail resident

### 2. Modal Assign Room
- Menampilkan daftar kamar yang tersedia (status: "Kosong")
- Dropdown untuk memilih kamar
- Menampilkan nomor kamar dan tarif bulanan

### 3. Proses Assignment
- Validasi kamar tersedia
- Update `room_id` pada user
- Update status kamar menjadi "Terisi"
- Refresh data resident setelah berhasil

## Frontend Changes

### File: `kost-app/app/(admin)/admin/residents/[id]/page.tsx`

**State Baru:**
```typescript
const [showAssignRoomModal, setShowAssignRoomModal] = useState(false);
const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
const [selectedRoomId, setSelectedRoomId] = useState<string>('');
```

**Functions Baru:**
- `fetchAvailableRooms()` - Ambil daftar kamar kosong
- `handleAssignRoom()` - Proses assign kamar ke resident
- `openAssignRoomModal()` - Buka modal dan load kamar tersedia

**UI Changes:**
- Tombol "Assign Room" muncul jika `!resident.room_id`
- Modal dengan dropdown kamar tersedia
- Konfirmasi sebelum assign

## Backend Changes

### File: `kost-backend/app/Http/Controllers/Api/UserController.php`

**Method Baru:**
```php
public function assignRoom(Request $request, $id)
```

**Validasi:**
- User harus ada
- Room ID harus valid
- Room harus berstatus "Kosong"

**Proses:**
1. Assign `room_id` ke user
2. Update status room menjadi "Terisi"
3. Return user dengan relasi room

### File: `kost-backend/routes/api.php`

**Route Baru:**
```php
Route::post('/admin/users/{id}/assign-room', [UserController::class, 'assignRoom']);
```

## API Endpoint

### POST `/api/admin/users/{id}/assign-room`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "room_id": "1"
}
```

**Success Response (200):**
```json
{
  "message": "Room assigned successfully",
  "user": {
    "id": 1,
    "nama": "John Doe",
    "room_id": 1,
    "room": {
      "id": 1,
      "nomor_kamar": "101",
      "tarif_dasar": 1500000,
      "status": "Terisi"
    }
  }
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**400 Bad Request:**
```json
{
  "error": "Room is not available"
}
```

**404 Not Found:**
```json
{
  "message": "User not found"
}
```

**422 Validation Error:**
```json
{
  "message": "Validation failed",
  "errors": {
    "room_id": ["The room id field is required."]
  }
}
```

## Use Cases

### 1. Resident Baru Tanpa Kamar
- Admin register resident tanpa assign kamar
- Admin buka detail resident
- Klik "Assign Room"
- Pilih kamar dari dropdown
- Confirm assignment

### 2. Resident Pindah Kamar
- Admin kosongkan kamar lama (via room detail page)
- Resident sekarang tidak punya kamar
- Admin assign kamar baru via resident detail page

### 3. Resident Kembali Setelah Keluar
- Resident yang sudah keluar (room_id = null)
- Admin bisa assign kamar baru tanpa register ulang

## UI/UX

### Tombol "Assign Room"
- Warna: Secondary (blue)
- Icon: meeting_room
- Posisi: Di samping tombol "Export PDF"
- Kondisi: Hanya muncul jika `!resident.room_id`

### Modal
- Background: Blur backdrop
- Size: max-w-md
- Dropdown: Menampilkan "Room {nomor} - Rp {tarif}/month"
- Buttons: Cancel (outline) dan Assign (filled)

### Feedback
- Loading state saat fetch rooms
- Disabled state jika tidak ada kamar tersedia
- Success alert setelah berhasil assign
- Error alert jika gagal

## Testing Checklist

- [ ] Tombol "Assign Room" muncul untuk resident tanpa kamar
- [ ] Tombol tidak muncul untuk resident yang sudah punya kamar
- [ ] Modal menampilkan daftar kamar kosong
- [ ] Dropdown disabled jika tidak ada kamar tersedia
- [ ] Assign room berhasil dan data refresh
- [ ] Status kamar berubah menjadi "Terisi"
- [ ] Error handling untuk kamar yang tidak tersedia
- [ ] Konfirmasi sebelum assign
- [ ] Success/error alert muncul dengan benar

## Future Improvements

1. **History Tracking**
   - Log perpindahan kamar
   - Tanggal mulai dan selesai tinggal

2. **Bulk Assignment**
   - Assign multiple residents sekaligus
   - Import dari CSV/Excel

3. **Room Preferences**
   - Resident bisa request kamar tertentu
   - Admin approve/reject request

4. **Auto Assignment**
   - Algoritma untuk assign kamar otomatis
   - Berdasarkan preferensi dan ketersediaan

5. **Notification**
   - Notifikasi ke resident saat kamar di-assign
   - Email/SMS confirmation

---

**Created:** April 2026
**Status:** ✅ Implemented
