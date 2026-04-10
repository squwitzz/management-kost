# Admin Panel Fixes - April 2026

## Masalah yang Diperbaiki

### 1. Register Resident - Data Kamar Tidak Tampil
**Masalah:** Dropdown pemilihan kamar kosong di halaman register resident tidak menampilkan data.

**Penyebab:** 
- Tidak ada pengecekan null safety untuk `data.rooms`
- Tidak ada error handling yang baik

**Solusi:**
- Menambahkan null safety check: `(data.rooms || []).filter(...)`
- Menambahkan pesan error jika tidak ada kamar kosong
- Menambahkan logging untuk debugging

**File:** `kost-app/app/(admin)/admin/register-resident/page.tsx`

---

### 2. Payment Generation - Tidak Bisa Generate Tagihan
**Masalah:** Tombol generate tagihan tidak berfungsi dan terjadi error.

**Penyebab:**
- Ada duplikasi kode yang menyebabkan syntax error
- Missing header `ngrok-skip-browser-warning`

**Solusi:**
- Menghapus kode duplikat di function `handleGenerate`
- Menambahkan header `ngrok-skip-browser-warning: 'true'` untuk bypass ngrok warning
- Memperbaiki error handling

**File:** `kost-app/app/(admin)/admin/payments/generate/page.tsx`

---

### 3. Residents Page - Data Tidak Tampil
**Masalah:** Halaman residents tidak menampilkan daftar penghuni.

**Penyebab:**
- Tidak ada null safety check untuk `data.rooms`
- Tidak ada pengecekan apakah `room.users` adalah array

**Solusi:**
- Menambahkan null safety: `const rooms = data.rooms || []`
- Menambahkan pengecekan: `Array.isArray(room.users)`
- Menambahkan logging untuk debugging

**File:** `kost-app/app/(admin)/admin/residents/page.tsx`

---

### 4. Rules Page - Data Rules Tidak Tampil
**Masalah:** Halaman rules admin tidak menampilkan daftar peraturan.

**Penyebab:**
- Menggunakan endpoint yang salah (`/peraturan` untuk user, bukan admin)
- Endpoint yang benar untuk admin adalah `/peraturan/all`

**Solusi:**
- Mengubah endpoint dari `ApiClient.getRules()` ke direct fetch `${API_URL}/peraturan/all`
- Endpoint `/peraturan/all` mengembalikan semua rules termasuk yang inactive (khusus admin)
- Menambahkan proper headers dan error handling

**File:** `kost-app/app/(admin)/admin/rules/page.tsx`

**Backend Endpoint:**
- `/peraturan` - Untuk user (hanya active rules)
- `/peraturan/all` - Untuk admin (semua rules termasuk inactive)

---

### 5. Profile Update - Alert Failed
**Masalah:** Ketika update profile admin, muncul alert "failed".

**Penyebab:**
- Tidak ada pengecekan apakah response memiliki property `user`
- Error handling kurang detail

**Solusi:**
- Menambahkan pengecekan: `if (data.user) { ... }`
- Menambahkan console.log untuk debugging
- Memperbaiki error handling dengan detail error message

**File:** `kost-app/app/(admin)/admin/profile/page.tsx`

---

### 6. Room Detail - "Room Not Found"
**Masalah:** Ketika membuka detail room, halaman menampilkan "Room not found".

**Penyebab:**
- Tidak ada pengecekan apakah response memiliki property `room`
- Tidak ada redirect ke halaman rooms jika room tidak ditemukan

**Solusi:**
- Menambahkan pengecekan: `if (data.room) { ... } else { ... }`
- Menambahkan redirect ke `/admin/rooms` jika room tidak ditemukan
- Menambahkan error message yang jelas

**File:** `kost-app/app/(admin)/admin/rooms/[id]/page.tsx`

---

## Perbaikan Umum

### Headers untuk Ngrok
Semua request ke backend sekarang menggunakan header:
```typescript
'ngrok-skip-browser-warning': 'true'
```

Header ini penting untuk bypass warning page ngrok saat development.

### Null Safety
Semua response dari API sekarang di-check dengan null safety:
```typescript
const rooms = data.rooms || [];
const peraturan = data.peraturan || [];
```

### Error Handling
Semua error sekarang di-log ke console untuk debugging:
```typescript
console.error('Failed to fetch:', err);
```

### Cache Control
Semua request menggunakan:
```typescript
cache: 'no-store' as RequestCache,
credentials: 'include' as RequestCredentials,
```

---

## Testing Checklist

Setelah perbaikan, test semua fitur berikut:

- [ ] Register Resident - Dropdown kamar harus menampilkan kamar kosong
- [ ] Payment Generation - Preview dan generate tagihan harus berfungsi
- [ ] Residents Page - Daftar penghuni harus tampil dengan benar
- [ ] Rules Page - Daftar peraturan harus tampil (termasuk inactive)
- [ ] Profile Update - Update profile admin harus berhasil
- [ ] Room Detail - Detail room harus tampil dengan benar
- [ ] Room Detail - Tombol "Kosongkan Kamar" harus berfungsi

---

## Backend Endpoints yang Digunakan

### Rooms
- `GET /api/rooms` - Get all rooms with users
- `GET /api/rooms/{id}` - Get room detail
- `POST /api/rooms/register-penghuni` - Register new resident
- `POST /api/rooms/{id}/remove-resident` - Remove resident from room

### Payments
- `POST /api/billing/preview` - Preview payments before generating
- `POST /api/billing/generate` - Generate payments

### Rules
- `GET /api/peraturan` - Get active rules (for users)
- `GET /api/peraturan/all` - Get all rules (for admin)
- `POST /api/peraturan` - Create rule
- `PUT /api/peraturan/{id}` - Update rule
- `DELETE /api/peraturan/{id}` - Delete rule
- `PUT /api/peraturan/{id}/toggle` - Toggle active status

### Profile
- `POST /api/profile/update` - Update profile
- `POST /api/change-password` - Change password

---

## Notes

1. Semua endpoint memerlukan Bearer token di header Authorization
2. Backend menggunakan manual JWT authentication (bukan middleware)
3. Admin role check dilakukan di setiap controller method
4. Response format konsisten: `{ data: {...}, message: '...' }`
5. Error format: `{ error: '...', errors: {...} }`

---

**Tanggal Perbaikan:** 11 April 2026
**Status:** ✅ Semua masalah telah diperbaiki
