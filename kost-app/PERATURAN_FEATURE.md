# Fitur Peraturan Kost

Sistem manajemen peraturan dan tata tertib kost dengan halaman untuk user melihat peraturan dan admin untuk mengelola peraturan.

## Fitur

### User (Penghuni)
- Melihat daftar peraturan aktif
- Filter peraturan berdasarkan kategori
- Tampilan card dengan icon dan kategori
- Info box untuk informasi penting

### Admin
- CRUD peraturan (Create, Read, Update, Delete)
- Toggle status active/inactive
- Set urutan tampilan peraturan
- Pilih kategori dan icon
- Modal form untuk add/edit

## Database Schema

### Tabel: `peraturan`
```sql
- id (bigint, primary key)
- judul (string) - Judul peraturan
- deskripsi (text) - Deskripsi lengkap peraturan
- kategori (enum) - Umum, Keamanan, Kebersihan, Fasilitas, Pembayaran, Lainnya
- urutan (integer) - Untuk sorting (default: 0)
- is_active (boolean) - Status aktif/nonaktif (default: true)
- icon (string) - Material icon name (default: 'rule')
- created_at (timestamp)
- updated_at (timestamp)
```

## API Endpoints

### User Endpoints
```
GET /api/peraturan
- Get all active peraturan
- Auth: Required (Bearer token)
- Response: { peraturan: [...] }
```

### Admin Endpoints
```
GET /api/peraturan/all
- Get all peraturan (including inactive)
- Auth: Admin only
- Response: { peraturan: [...] }

GET /api/peraturan/{id}
- Get single peraturan
- Auth: Required
- Response: { peraturan: {...} }

POST /api/peraturan
- Create new peraturan
- Auth: Admin only
- Body: { judul, deskripsi, kategori, urutan?, is_active?, icon? }
- Response: { message, peraturan }

PUT /api/peraturan/{id}
- Update peraturan
- Auth: Admin only
- Body: { judul?, deskripsi?, kategori?, urutan?, is_active?, icon? }
- Response: { message, peraturan }

DELETE /api/peraturan/{id}
- Delete peraturan
- Auth: Admin only
- Response: { message }

PUT /api/peraturan/{id}/toggle
- Toggle active status
- Auth: Admin only
- Response: { message, peraturan }
```

## File Structure

### Backend
```
kost-backend/
├── app/
│   ├── Models/
│   │   └── Peraturan.php
│   └── Http/Controllers/Api/
│       └── PeraturanController.php
├── database/
│   ├── migrations/
│   │   └── 2026_04_10_131327_create_peraturan_table.php
│   └── seeders/
│       └── PeraturanSeeder.php
└── routes/
    └── api.php (added peraturan routes)
```

### Frontend
```
kost-app/
├── app/
│   ├── (dashboard)/
│   │   └── rules/
│   │       └── page.tsx (User view)
│   ├── (admin)/
│   │   └── admin/
│   │       └── rules/
│   │           └── page.tsx (Admin manage)
│   └── components/
│       ├── UserBottomNav.tsx (updated)
│       └── AdminHeader.tsx (updated)
```

## Kategori Peraturan

1. **Umum** - Peraturan umum kost
2. **Keamanan** - Peraturan terkait keamanan
3. **Kebersihan** - Peraturan kebersihan
4. **Fasilitas** - Peraturan penggunaan fasilitas
5. **Pembayaran** - Peraturan pembayaran
6. **Lainnya** - Kategori lainnya

## Icon Options

Material Icons yang tersedia:
- `rule` - Default
- `security` - Keamanan
- `cleaning_services` - Kebersihan
- `home` - Fasilitas
- `payments` - Pembayaran
- `info` - Informasi
- `warning` - Peringatan
- `check_circle` - Checklist

## Data Default (Seeder)

15 peraturan default telah dibuat:
1. Jam Malam
2. Tamu Berkunjung
3. Kebersihan Kamar
4. Kebersihan Area Umum
5. Pembayaran Sewa
6. Penggunaan Listrik
7. Penggunaan Air
8. Kebisingan
9. Hewan Peliharaan
10. Merokok
11. Barang Berharga
12. Perbaikan dan Maintenance
13. Parkir Kendaraan
14. Aktivitas Ilegal
15. Perpanjangan Kontrak

## Cara Menggunakan

### User - Melihat Peraturan
1. Login sebagai Penghuni
2. Klik menu "Rules" di bottom navigation
3. Lihat daftar peraturan
4. Filter berdasarkan kategori (optional)

### Admin - Mengelola Peraturan

#### Tambah Peraturan
1. Login sebagai Admin
2. Akses `/admin/rules`
3. Klik "Add Rule"
4. Isi form:
   - Judul (required)
   - Deskripsi (required)
   - Kategori (required)
   - Icon (optional)
   - Urutan (optional, default: 0)
   - Status (Active/Inactive)
5. Klik "Save"

#### Edit Peraturan
1. Klik icon "edit" pada peraturan
2. Update data yang diperlukan
3. Klik "Save"

#### Hapus Peraturan
1. Klik icon "delete" pada peraturan
2. Konfirmasi penghapusan

#### Toggle Status
1. Klik badge status (Active/Inactive)
2. Status akan berubah otomatis

## UI Features

### User Page
- Clean card layout dengan icon
- Category filter pills
- Numbered list
- Info box untuk informasi penting
- Responsive design

### Admin Page
- List view dengan action buttons
- Modal form untuk add/edit
- Status badges (Active/Inactive)
- Category dan urutan badges
- Delete confirmation
- Quick toggle status

## Security

- Authentication required untuk semua endpoints
- Role-based access control (Admin only untuk manage)
- Token validation
- Input validation
- XSS protection

## Testing

### Test User View
1. Login sebagai Penghuni
2. Akses `/rules`
3. Verify: Hanya peraturan aktif yang tampil
4. Test filter kategori
5. Verify responsive design

### Test Admin Manage
1. Login sebagai Admin
2. Akses `/admin/rules`
3. Test create new rule
4. Test edit existing rule
5. Test delete rule
6. Test toggle active status
7. Verify all rules (active + inactive) tampil

### Test API
```bash
# Get active rules (user)
curl -H "Authorization: Bearer {token}" \
  http://127.0.0.1:8000/api/peraturan

# Get all rules (admin)
curl -H "Authorization: Bearer {token}" \
  http://127.0.0.1:8000/api/peraturan/all

# Create rule (admin)
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"judul":"Test","deskripsi":"Test desc","kategori":"Umum"}' \
  http://127.0.0.1:8000/api/peraturan
```

## Migration Commands

```bash
# Run migration
php artisan migrate

# Run seeder
php artisan db:seed --class=PeraturanSeeder

# Rollback
php artisan migrate:rollback

# Fresh migration with seed
php artisan migrate:fresh --seed
```

## Troubleshooting

### Issue: Peraturan tidak muncul
- Check: Token valid?
- Check: User authenticated?
- Check: Peraturan is_active = true?
- Check: API endpoint correct?

### Issue: Admin tidak bisa create/edit
- Check: User role = 'Admin'?
- Check: Token valid?
- Check: Form validation passed?
- Check: Backend API running?

### Issue: Icon tidak tampil
- Check: Icon name valid (Material Icons)?
- Check: Material Icons loaded di layout?
- Check: Icon field tidak null?

## Best Practices

1. **Urutan**: Gunakan urutan untuk sorting logis (1, 2, 3, ...)
2. **Kategori**: Pilih kategori yang sesuai untuk filtering
3. **Icon**: Pilih icon yang representatif
4. **Deskripsi**: Tulis deskripsi yang jelas dan lengkap
5. **Status**: Set inactive untuk peraturan yang tidak berlaku lagi
6. **Testing**: Test semua CRUD operations sebelum deploy

## Future Enhancements

1. Drag & drop untuk reorder peraturan
2. Rich text editor untuk deskripsi
3. Upload gambar/dokumen pendukung
4. Notifikasi saat ada peraturan baru
5. History perubahan peraturan
6. Multi-language support
7. Export peraturan ke PDF
8. Peraturan dengan tanggal berlaku
