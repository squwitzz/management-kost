# 🔧 Troubleshooting Guide - Admin Panel Issues

## 📋 Masalah yang Dilaporkan

1. ❌ Register resident - Field pemilihan kamar tidak tampil
2. ❌ Payment generate - Tidak bisa generate tagihan
3. ❌ Residents menu - Data tidak tampil
4. ❌ Rules page - Data rules tidak tampil
5. ❌ Update profile - Alert "failed"
6. ❌ Room detail - Halaman "room not found"

---

## 🔍 Cara Debugging

### Step 1: Buka Browser Console
1. Tekan `F12` atau `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. Pilih tab **Console**
3. Refresh halaman yang bermasalah
4. Lihat error messages yang muncul

### Step 2: Check Network Tab
1. Buka tab **Network** di Developer Tools
2. Filter by **XHR** atau **Fetch**
3. Refresh halaman
4. Lihat request yang gagal (warna merah)
5. Klik request tersebut dan lihat:
   - **Headers** tab: URL dan method
   - **Response** tab: Error message dari backend
   - **Preview** tab: Data yang dikembalikan

---

## 🐛 Debugging Per Masalah

### 1. Register Resident - Kamar Tidak Tampil

**Console Log yang Ditambahkan:**
```
Fetching rooms for registration...
Rooms data: {...}
Available rooms: [...]
```

**Kemungkinan Masalah:**
- ❌ Backend endpoint `/api/rooms` tidak merespons
- ❌ Tidak ada kamar dengan status "Kosong"
- ❌ CORS error

**Cara Check:**
1. Buka halaman register resident
2. Lihat console, apakah ada log "Fetching rooms for registration..."?
3. Jika tidak ada log sama sekali → JavaScript error
4. Jika ada log tapi "Available rooms: []" → Tidak ada kamar kosong di database
5. Jika ada error CORS → Backend CORS belum dikonfigurasi

**Solusi:**
```sql
-- Check kamar di database
SELECT * FROM rooms WHERE status = 'Kosong';

-- Jika tidak ada, update salah satu kamar
UPDATE rooms SET status = 'Kosong' WHERE id = 1;
```

---

### 2. Payment Generate - Tidak Bisa Generate

**Console Log yang Ditambahkan:**
```
Previewing payments for periode: ...
Preview response status: 200
Preview data: {...}
Generating payments for periode: ...
Generate response status: 200
Generate data: {...}
```

**Kemungkinan Masalah:**
- ❌ Backend endpoint `/api/billing/preview` tidak ada
- ❌ Backend endpoint `/api/billing/generate` tidak ada
- ❌ Tidak ada penghuni aktif untuk di-generate

**Cara Check:**
1. Klik tombol "Preview Tagihan"
2. Lihat console untuk log "Previewing payments..."
3. Lihat Network tab untuk request ke `/api/billing/preview`
4. Check response status dan error message

**Backend Routes yang Dibutuhkan:**
```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/billing/preview', [BillingController::class, 'preview']);
    Route::post('/billing/generate', [BillingController::class, 'generate']);
});
```

---

### 3. Residents Menu - Data Tidak Tampil

**Console Log yang Ditambahkan:**
```
Fetching residents...
Rooms data: {...}
All residents: [...]
```

**Kemungkinan Masalah:**
- ❌ Endpoint `/api/rooms` tidak mengembalikan data users
- ❌ Tidak ada penghuni di database
- ❌ Relasi room->users tidak di-load

**Cara Check:**
1. Buka halaman residents
2. Lihat console untuk log "Fetching residents..."
3. Check "Rooms data" - apakah ada property `users`?
4. Check "All residents" - apakah array kosong?

**Backend Fix:**
```php
// RoomController.php
public function index()
{
    $rooms = Room::with('users')->get(); // Pastikan ada ->with('users')
    return response()->json(['rooms' => $rooms]);
}
```

---

### 4. Rules Page - Data Tidak Tampil

**Console Log yang Ditambahkan:**
```
Fetching rules...
Rules data: {...}
```

**Kemungkinan Masalah:**
- ❌ Endpoint `/api/peraturan/all` tidak ada (seharusnya bukan `/api/peraturan`)
- ❌ Tidak ada data rules di database
- ❌ Backend mengembalikan format yang salah

**Cara Check:**
1. Buka halaman rules
2. Lihat console untuk log "Fetching rules..."
3. Check Network tab untuk request ke `/api/peraturan/all`
4. Lihat response - apakah ada property `peraturan`?

**Backend Routes:**
```php
// routes/api.php
Route::get('/peraturan/all', [PeraturanController::class, 'all']);
```

**Expected Response Format:**
```json
{
  "peraturan": [
    {
      "id": 1,
      "judul": "...",
      "deskripsi": "...",
      "kategori": "...",
      ...
    }
  ]
}
```

---

### 5. Update Profile - Alert Failed

**API Endpoint yang Diperbaiki:**
- ❌ OLD: `POST /api/profile/update`
- ✅ NEW: `PUT /api/profile`

**Cara Check:**
1. Buka halaman profile
2. Edit data dan klik Save
3. Lihat Network tab untuk request ke `/api/profile`
4. Check method - harus `PUT` bukan `POST`
5. Lihat response error message

**Backend Route:**
```php
// routes/api.php
Route::put('/profile', [ProfileController::class, 'update']);
```

---

### 6. Room Detail - Room Not Found

**Console Log yang Ditambahkan:**
```
Fetching room detail for ID: 1
Room data: {...}
```

**Kemungkinan Masalah:**
- ❌ Room ID tidak valid
- ❌ Backend endpoint `/api/rooms/{id}` tidak ada
- ❌ Room tidak ada di database

**Cara Check:**
1. Buka halaman room detail (misal: `/admin/rooms/1`)
2. Lihat console untuk log "Fetching room detail for ID: ..."
3. Check Network tab untuk request ke `/api/rooms/1`
4. Lihat response status dan error message

**Backend Route:**
```php
// routes/api.php
Route::get('/rooms/{id}', [RoomController::class, 'show']);
```

**Backend Controller:**
```php
public function show($id)
{
    $room = Room::with('users')->findOrFail($id);
    return response()->json(['room' => $room]);
}
```

---

## 🔧 Quick Fixes

### Fix 1: Clear Browser Cache
```javascript
// Buka Console dan jalankan:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Fix 2: Check Backend Connection
```javascript
// Test API connection
fetch('https://mykost-cendana.xyz/api/rooms', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('API Response:', d))
.catch(e => console.error('API Error:', e));
```

### Fix 3: Verify Token
```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

---

## 📊 Expected API Responses

### GET /api/rooms
```json
{
  "rooms": [
    {
      "id": 1,
      "nomor_kamar": "101",
      "tarif_dasar": 1000000,
      "status": "Kosong",
      "users": []
    }
  ]
}
```

### GET /api/peraturan/all
```json
{
  "peraturan": [
    {
      "id": 1,
      "judul": "Jam Malam",
      "deskripsi": "...",
      "kategori": "Umum",
      "is_active": true
    }
  ]
}
```

### GET /api/payments
```json
{
  "payments": [
    {
      "id": 1,
      "user_id": 1,
      "jumlah_tagihan": 1000000,
      "status_bayar": "Belum Lunas",
      "bulan_dibayar": "Januari 2026"
    }
  ]
}
```

---

## 🚨 Common Errors

### Error 1: CORS Error
```
Access to fetch at 'https://mykost-cendana.xyz/api/...' from origin 'https://management-kost.vercel.app' has been blocked by CORS policy
```

**Solution:** Update `config/cors.php` di backend:
```php
'allowed_origins' => [
    'https://management-kost.vercel.app',
    'http://localhost:3000',
],
```

### Error 2: 401 Unauthorized
```
{"message": "Unauthenticated."}
```

**Solution:** Token expired atau tidak valid. Login ulang.

### Error 3: 404 Not Found
```
{"message": "Not Found"}
```

**Solution:** Endpoint tidak ada di backend. Check routes.

### Error 4: 500 Internal Server Error
```
{"message": "Server Error"}
```

**Solution:** Check backend logs di cPanel atau Laravel log file.

---

## 📝 Checklist Debugging

Sebelum melaporkan bug, pastikan sudah check:

- [ ] Browser console tidak ada error JavaScript
- [ ] Network tab menunjukkan request berhasil (status 200)
- [ ] Token masih valid (belum expired)
- [ ] Backend endpoint ada dan merespons
- [ ] Data ada di database
- [ ] CORS sudah dikonfigurasi dengan benar
- [ ] Cache sudah di-clear
- [ ] Sudah login dengan role yang benar (Admin)

---

## 🆘 Cara Melaporkan Bug

Jika masih ada masalah, berikan informasi berikut:

1. **Screenshot Console** (tab Console)
2. **Screenshot Network** (tab Network, filter XHR)
3. **URL halaman** yang bermasalah
4. **Langkah-langkah** untuk reproduce bug
5. **Error message** yang muncul
6. **Browser** yang digunakan
7. **Role user** (Admin atau User)

---

## 📞 Support

Jika semua troubleshooting di atas sudah dicoba tapi masih error, kemungkinan:
1. Backend belum di-deploy dengan benar
2. Database belum di-migrate
3. Environment variables salah
4. Backend routes belum lengkap

Check dokumentasi deployment di:
- `DEPLOY_CPANEL.md`
- `CPANEL_BACKEND_SETUP.md`
- `BACKEND_404_FIX.md`
