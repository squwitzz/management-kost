# Solusi Alternatif: Assign Room untuk Resident

## Situasi Saat Ini

Setelah beberapa kali mencoba menambahkan fitur assign room dengan icon button, terjadi masalah:
- Duplikasi state
- Merge conflict
- Build error di Vercel

Untuk menghindari masalah lebih lanjut, saya sarankan **solusi alternatif yang lebih sederhana dan aman**.

## Solusi Alternatif 1: Gunakan Halaman Edit Resident

### Cara Kerja:
1. Admin buka halaman Residents
2. Klik icon **Edit** (pensil) pada resident
3. Di halaman edit, tambahkan dropdown untuk pilih kamar
4. Save → resident ter-assign ke kamar

### Keuntungan:
- ✅ Tidak perlu modal baru
- ✅ Menggunakan form yang sudah ada
- ✅ Lebih simple dan aman
- ✅ Tidak ada risk merge conflict

### Implementasi:
File: `app/(admin)/admin/residents/[id]/edit/page.tsx`

Tambahkan field:
```tsx
<select name="room_id">
  <option value="">-- Pilih Kamar --</option>
  {availableRooms.map(room => (
    <option key={room.id} value={room.id}>
      Room {room.nomor_kamar}
    </option>
  ))}
</select>
```

## Solusi Alternatif 2: Assign dari Halaman Room Detail

### Cara Kerja:
1. Admin buka halaman Rooms
2. Klik kamar yang kosong
3. Di halaman detail kamar, ada button "Assign to Resident"
4. Pilih resident dari dropdown
5. Save → resident ter-assign ke kamar ini

### Keuntungan:
- ✅ Workflow lebih natural (dari kamar ke resident)
- ✅ Tidak perlu ubah halaman residents
- ✅ Lebih mudah manage kamar kosong

## Solusi Alternatif 3: Halaman Terpisah "Assign Rooms"

### Cara Kerja:
1. Buat menu baru "Assign Rooms" di admin
2. Halaman menampilkan:
   - List resident tanpa kamar (kiri)
   - List kamar kosong (kanan)
3. Drag & drop atau button untuk assign
4. Batch assign multiple residents sekaligus

### Keuntungan:
- ✅ Dedicated page untuk task ini
- ✅ Bisa batch assign
- ✅ Clear separation of concerns
- ✅ Tidak ganggu halaman lain

## Rekomendasi

Saya rekomendasikan **Solusi 1** karena:
1. Paling cepat implement
2. Paling aman (tidak ada risk break existing code)
3. Menggunakan form yang sudah ada
4. User sudah familiar dengan flow edit resident

## Backend Sudah Siap

Backend endpoint sudah ready:
```
POST /api/admin/users/{id}/assign-room
Body: { room_id: number }
```

Jadi tinggal tambahkan UI di salah satu solusi di atas.

## Next Steps

Pilih salah satu solusi dan saya akan implement dengan cara yang aman tanpa risk break existing code.

---
**Status:** Waiting for decision
**Recommended:** Solution 1 (Edit Resident Page)
**Last Updated:** April 14, 2026
