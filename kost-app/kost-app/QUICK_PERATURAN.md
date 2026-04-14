# Quick Guide: Peraturan Kost

## Setup

### 1. Migration
```bash
cd kost-backend
php artisan migrate
php artisan db:seed --class=PeraturanSeeder
```

### 2. Routes
✅ Already added to `routes/api.php`

### 3. Frontend
✅ User page: `/rules`
✅ Admin page: `/admin/rules`

## User - Melihat Peraturan

**URL**: `/rules`

**Fitur**:
- Lihat peraturan aktif
- Filter by kategori
- Card layout dengan icon

## Admin - Manage Peraturan

**URL**: `/admin/rules`

**Fitur**:
- Create new rule (modal form)
- Edit existing rule
- Delete rule
- Toggle active/inactive status
- Set urutan & kategori

## API Endpoints

```
GET    /api/peraturan          - Get active rules (user)
GET    /api/peraturan/all      - Get all rules (admin)
GET    /api/peraturan/{id}     - Get single rule
POST   /api/peraturan          - Create rule (admin)
PUT    /api/peraturan/{id}     - Update rule (admin)
DELETE /api/peraturan/{id}     - Delete rule (admin)
PUT    /api/peraturan/{id}/toggle - Toggle status (admin)
```

## Database

**Table**: `peraturan`
- judul (string)
- deskripsi (text)
- kategori (enum: Umum, Keamanan, Kebersihan, Fasilitas, Pembayaran, Lainnya)
- urutan (integer)
- is_active (boolean)
- icon (string)

## Kategori

1. Umum
2. Keamanan
3. Kebersihan
4. Fasilitas
5. Pembayaran
6. Lainnya

## Icons (Material Icons)

- rule, security, cleaning_services, home, payments, info, warning, check_circle

## Navigation

### User
- Bottom Nav: Dashboard | Payments | Requests | Rules | Profile

### Admin
- Header: Dashboard | Rooms | Residents | Payments | Requests | Rules | Profile

## Testing

1. Login as Admin
2. Go to `/admin/rules`
3. Add new rule → Success
4. Edit rule → Success
5. Toggle status → Success
6. Delete rule → Success
7. Login as User
8. Go to `/rules`
9. View rules → Only active rules shown
10. Filter by category → Works

## Default Data

15 peraturan default sudah dibuat via seeder:
- Jam Malam, Tamu Berkunjung, Kebersihan, Pembayaran, dll.
