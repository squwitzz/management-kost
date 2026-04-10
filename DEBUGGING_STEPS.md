# 🔍 Langkah-Langkah Debugging untuk Masalah Admin Panel

## 📋 Status Perbaikan

✅ **API Endpoints Diperbaiki:**
- `GET /api/peraturan/all` (bukan `/api/peraturan`)
- `PUT /api/profile` (bukan `POST /api/profile/update`)
- `PUT /api/maintenance-requests/{id}` (menerima object, bukan hanya status)
- `GET /api/payments` (untuk admin payments)

✅ **Console Logging Ditambahkan:**
- Register resident: Log fetching rooms dan available rooms
- Residents page: Log fetching residents dan rooms data
- Rules page: Log fetching rules
- Room detail: Log fetching room detail
- Payment generate: Log preview dan generate operations

---

## 🚀 Cara Testing

### Step 1: Buka API Endpoint Tester

1. Buka file `test-api-endpoints.html` di browser
2. Pastikan Backend URL sudah benar: `https://mykost-cendana.xyz/api`
3. Token akan auto-load dari localStorage
4. Klik **"Test All Endpoints"**
5. Lihat hasil testing:
   - ✓ Hijau = Success
   - ✗ Merah = Failed

### Step 2: Check Console Logs

Untuk setiap halaman yang bermasalah:

#### 1. Register Resident (Field Kamar Tidak Tampil)
```
1. Buka: /admin/register-resident
2. Buka Console (F12)
3. Cari log:
   - "Fetching rooms for registration..."
   - "Rooms data: {...}"
   - "Available rooms: [...]"
4. Jika "Available rooms: []" → Tidak ada kamar kosong
5. Solusi: Update database
```

**SQL Fix:**
```sql
UPDATE rooms SET status = 'Kosong' WHERE id = 1;
```

#### 2. Residents Menu (Data Tidak Tampil)
```
1. Buka: /admin/residents
2. Buka Console (F12)
3. Cari log:
   - "Fetching residents..."
   - "Rooms data: {...}"
   - "All residents: [...]"
4. Check apakah rooms.users ada data
```

**Backend Check:**
```php
// RoomController.php - pastikan ada with('users')
public function index()
{
    $rooms = Room::with('users')->get();
    return response()->json(['rooms' => $rooms]);
}
```

#### 3. Rules Page (Data Tidak Tampil)
```
1. Buka: /admin/rules
2. Buka Console (F12)
3. Cari log:
   - "Fetching rules..."
   - "Rules data: {...}"
4. Check Network tab untuk /api/peraturan/all
```

**Backend Route Check:**
```php
// routes/api.php
Route::get('/peraturan/all', [PeraturanController::class, 'all']);
```

#### 4. Payment Generate (Tidak Bisa Generate)
```
1. Buka: /admin/payments/generate
2. Klik "Preview Tagihan"
3. Buka Console (F12)
4. Cari log:
   - "Previewing payments for periode: ..."
   - "Preview response status: ..."
   - "Preview data: {...}"
5. Jika preview berhasil, klik "Generate Tagihan"
6. Cari log:
   - "Generating payments for periode: ..."
   - "Generate response status: ..."
```

**Backend Routes Check:**
```php
// routes/api.php
Route::post('/billing/preview', [BillingController::class, 'preview']);
Route::post('/billing/generate', [BillingController::class, 'generate']);
```

#### 5. Update Profile (Alert Failed)
```
1. Buka: /admin/profile atau /profile
2. Edit data
3. Klik Save
4. Buka Network tab (F12)
5. Check request ke /api/profile
6. Method harus PUT (bukan POST)
7. Lihat response error
```

#### 6. Room Detail (Room Not Found)
```
1. Buka: /admin/rooms/1 (ganti 1 dengan ID yang valid)
2. Buka Console (F12)
3. Cari log:
   - "Fetching room detail for ID: ..."
   - "Room data: {...}"
4. Check Network tab untuk /api/rooms/1
5. Lihat response status
```

---

## 🔧 Quick Diagnostic Commands

### Test di Browser Console

```javascript
// 1. Check Token
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));

// 2. Test API Connection
const API_URL = 'https://mykost-cendana.xyz/api';
const token = localStorage.getItem('token');

// Test Rooms
fetch(`${API_URL}/rooms`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('Rooms:', d))
.catch(e => console.error('Error:', e));

// Test Rules
fetch(`${API_URL}/peraturan/all`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('Rules:', d))
.catch(e => console.error('Error:', e));

// Test Payments
fetch(`${API_URL}/payments`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('Payments:', d))
.catch(e => console.error('Error:', e));
```

---

## 📊 Expected Results

### ✅ Jika Berhasil:

**Console Logs:**
```
Fetching rooms for registration...
Rooms data: {rooms: Array(5)}
Available rooms: [{id: 1, nomor_kamar: "101", ...}]

Fetching residents...
Rooms data: {rooms: Array(5)}
All residents: [{id: 1, nama: "John Doe", ...}]

Fetching rules...
Rules data: {peraturan: Array(10)}

Fetching room detail for ID: 1
Room data: {room: {id: 1, nomor_kamar: "101", ...}}
```

**Network Tab:**
- Status: 200 OK
- Response: JSON dengan data yang benar

### ❌ Jika Gagal:

**Console Errors:**
```
Failed to fetch rooms: Error: Failed to fetch rooms
Failed to fetch residents: Error: ...
Failed to fetch peraturan: Error: ...
```

**Network Tab:**
- Status: 404 Not Found → Endpoint tidak ada
- Status: 401 Unauthorized → Token invalid
- Status: 500 Internal Server Error → Backend error
- Status: 0 (CORS error) → CORS belum dikonfigurasi

---

## 🛠️ Backend Checklist

Pastikan backend sudah memiliki:

### Routes (routes/api.php)
```php
Route::middleware('auth:sanctum')->group(function () {
    // Rooms
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/{id}', [RoomController::class, 'show']);
    
    // Rules
    Route::get('/peraturan/all', [PeraturanController::class, 'all']);
    Route::post('/peraturan', [PeraturanController::class, 'store']);
    Route::put('/peraturan/{id}', [PeraturanController::class, 'update']);
    Route::delete('/peraturan/{id}', [PeraturanController::class, 'destroy']);
    
    // Payments
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    
    // Billing
    Route::post('/billing/preview', [BillingController::class, 'preview']);
    Route::post('/billing/generate', [BillingController::class, 'generate']);
    
    // Profile
    Route::put('/profile', [ProfileController::class, 'update']);
    
    // Maintenance Requests
    Route::get('/maintenance-requests', [MaintenanceRequestController::class, 'index']);
    Route::get('/maintenance-requests/{id}', [MaintenanceRequestController::class, 'show']);
    Route::put('/maintenance-requests/{id}', [MaintenanceRequestController::class, 'update']);
});
```

### Controllers

**RoomController:**
```php
public function index()
{
    $rooms = Room::with('users')->get(); // PENTING: with('users')
    return response()->json(['rooms' => $rooms]);
}

public function show($id)
{
    $room = Room::with('users')->findOrFail($id);
    return response()->json(['room' => $room]);
}
```

**PeraturanController:**
```php
public function all()
{
    $peraturan = Peraturan::orderBy('urutan')->get();
    return response()->json(['peraturan' => $peraturan]);
}
```

**PaymentController:**
```php
public function index()
{
    $payments = Payment::with('user.room')->get();
    return response()->json(['payments' => $payments]);
}
```

---

## 📝 Reporting Template

Jika masih ada masalah setelah semua langkah di atas, berikan info berikut:

```
**Halaman:** /admin/...
**Masalah:** Data tidak tampil / Error message

**Console Logs:**
[Paste console logs here]

**Network Tab:**
Request URL: ...
Status: ...
Response: ...

**Screenshot:**
[Attach screenshot]

**Sudah Dicoba:**
- [ ] Clear cache
- [ ] Check console logs
- [ ] Check network tab
- [ ] Test dengan API tester
- [ ] Verify token
- [ ] Check backend routes
```

---

## 🎯 Next Steps

1. **Buka `test-api-endpoints.html`** di browser
2. **Test semua endpoints** dengan klik "Test All Endpoints"
3. **Catat endpoint yang gagal** (status merah)
4. **Check console logs** di halaman yang bermasalah
5. **Verify backend routes** untuk endpoint yang gagal
6. **Report hasil testing** dengan template di atas

---

## 📞 Support Files

- `TROUBLESHOOTING_GUIDE.md` - Panduan lengkap troubleshooting
- `test-api-endpoints.html` - Tool untuk test API
- `MIGRATION_COMPLETE.md` - Status migrasi
- `BACKEND_404_FIX.md` - Fix backend 404 errors

---

**Status:** ✅ Debugging tools ready
**Action:** Test dengan `test-api-endpoints.html` dan report hasilnya
