# Fix Login Error - "Tidak dapat terhubung ke server"

## Diagnosis

Error "Tidak dapat terhubung ke server" bisa disebabkan oleh:
1. Database belum ter-migrate (tabel users tidak ada)
2. Tidak ada user di database
3. Error di backend saat proses login
4. CORS issue (tapi ini sudah dikonfigurasi dengan benar)

## Langkah Troubleshooting

### 1. Cek Status Database

Upload file `routes/api.php` yang baru ke cPanel, lalu akses:

```
http://mykost-cendana.xyz/api/db-check
```

**Expected Response (jika OK):**
```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "name": "your_database_name",
    "tables_exist": true,
    "user_count": 1,
    "sample_user": {
      "id": 1,
      "nama": "Admin",
      "nomor_telepon": "081234567890",
      "role": "admin"
    }
  },
  "message": "Database ready"
}
```

**Jika Response:**

#### A. "Database connection failed"
Database belum dikonfigurasi dengan benar.

**Solusi:**
1. Cek file `.env` di cPanel
2. Pastikan kredensial database benar:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_DATABASE=your_database_name
   DB_USERNAME=your_database_user
   DB_PASSWORD=your_database_password
   ```
3. Test via setup-helper.php:
   ```
   http://mykost-cendana.xyz/setup-helper.php?action=test-db
   ```

#### B. "Database connected but tables not migrated"
Database ada tapi tabel belum dibuat.

**Solusi:**
1. Akses setup-helper.php:
   ```
   http://mykost-cendana.xyz/setup-helper.php
   ```
2. Klik "Run Migrations"
3. Tunggu sampai selesai
4. Cek lagi `/api/db-check`

#### C. "Database ready but no users found"
Database dan tabel ada, tapi tidak ada user untuk login.

**Solusi:** Buat user default (lihat langkah 2)

### 2. Buat User Default

Jika tidak ada user di database, buat user default via setup-helper.php atau manual.

#### Via Setup Helper (MUDAH)

1. Buat file `create-admin.php` di folder `public`:

```php
<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Create admin user
$admin = User::create([
    'nama' => 'Admin',
    'nomor_telepon' => '081234567890',
    'password' => Hash::make('admin123'),
    'role' => 'admin',
    'nik' => '1234567890123456',
    'email' => 'admin@kost.com',
]);

echo "Admin user created successfully!\n";
echo "Nomor Telepon: 081234567890\n";
echo "Password: admin123\n";
echo "\nDELETE THIS FILE AFTER USE!";
```

2. Upload ke: `public_html/mykost-cendana.xyz/public/create-admin.php`

3. Akses: `http://mykost-cendana.xyz/create-admin.php`

4. **HAPUS file create-admin.php setelah selesai!**

5. Test login dengan:
   - Nomor Telepon: `081234567890`
   - Password: `admin123`

#### Via Database (Manual)

1. Login ke cPanel → phpMyAdmin
2. Pilih database Anda
3. Buka tabel `users`
4. Klik "Insert"
5. Isi data:
   ```
   nama: Admin
   nomor_telepon: 081234567890
   password: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
   role: admin
   nik: 1234567890123456
   email: admin@kost.com
   ```
   (Password hash di atas = "password")

6. Test login dengan:
   - Nomor Telepon: `081234567890`
   - Password: `password`

### 3. Test Login Lagi

Setelah user dibuat, test login dari Vercel:

1. Buka: https://management-kost.vercel.app/login
2. Masukkan nomor telepon dan password user yang baru dibuat
3. Klik Login

**Seharusnya sekarang berhasil!**

### 4. Cek Error Log (Jika Masih Error)

Jika masih error, cek error log di cPanel:

1. cPanel → Errors
2. Atau cPanel → File Manager → `storage/logs/laravel.log`
3. Lihat error terakhir untuk detail masalah

## Checklist

- [ ] Health check OK: `http://mykost-cendana.xyz/api/health`
- [ ] Database check OK: `http://mykost-cendana.xyz/api/db-check`
- [ ] Migrations sudah dijalankan
- [ ] User default sudah dibuat
- [ ] Test login berhasil dari Vercel
- [ ] File create-admin.php sudah dihapus (jika dibuat)

## Troubleshooting Tambahan

### Error: "Nomor telepon atau password salah"

Ini berarti:
- ✅ Backend berjalan dengan baik
- ✅ Database terkoneksi
- ❌ Kredensial login salah

**Solusi:**
- Pastikan nomor telepon dan password benar
- Cek user di database via phpMyAdmin
- Atau buat user baru via create-admin.php

### Error: CORS

Jika muncul error CORS di console browser:

1. Cek file `config/cors.php` sudah benar
2. Clear cache:
   ```
   http://mykost-cendana.xyz/setup-helper.php?action=clear
   ```
3. Cache config lagi:
   ```
   http://mykost-cendana.xyz/setup-helper.php?action=cache
   ```

### Error: 500 Internal Server Error

1. Set `APP_DEBUG=true` di `.env` sementara
2. Akses login lagi, lihat error detail
3. Fix error yang muncul
4. Set kembali `APP_DEBUG=false`

## File Helper

Saya sudah membuat file helper:
- `routes/api.php` - Sudah ditambahkan endpoint `/api/db-check`
- `create-admin.php` - Template untuk membuat user admin (buat manual)

Upload file-file ini ke cPanel dan ikuti langkah di atas.

## Setelah Berhasil

1. Hapus file `create-admin.php` (jika dibuat)
2. Hapus file `setup-helper.php`
3. Set `APP_DEBUG=false` di `.env`
4. Backend production siap! 🎉
