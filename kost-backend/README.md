# Kost Management Backend API

Backend API untuk aplikasi manajemen kost menggunakan Laravel 12 dengan JWT Authentication.

## 🚀 Setup

### Prerequisites
- PHP >= 8.2
- MySQL
- Composer

### Installation

1. Install dependencies:
```bash
composer install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Generate application key:
```bash
php artisan key:generate
```

4. Generate JWT secret:
```bash
php artisan jwt:secret
```

5. Configure database di `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kost_management
DB_USERNAME=root
DB_PASSWORD=
```

6. Run migrations:
```bash
php artisan migrate
```

7. Seed database (optional):
```bash
php artisan db:seed
```

8. Create storage link:
```bash
php artisan storage:link
```

9. Run server:
```bash
php artisan serve
```

Server akan berjalan di `http://127.0.0.1:8000`

## 📧 Default Admin Credentials

```
Nomor Telepon: 081234567890
Password: admin123
```

## 📚 API Endpoints

Base URL: `http://127.0.0.1:8000/api`

### Authentication

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "nomor_telepon": "081234567890",
  "password": "admin123"
}
```

Response:
```json
{
  "message": "Login berhasil",
  "user": {
    "id": 1,
    "nama": "Admin Kost",
    "nomor_telepon": "081234567890",
    "role": "Admin"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### Get User Profile
```http
GET /api/me
Authorization: Bearer {token}
```

#### Logout
```http
POST /api/logout
Authorization: Bearer {token}
```

#### Refresh Token
```http
POST /api/refresh
Authorization: Bearer {token}
```

### Payments

#### Get All Payments
```http
GET /api/payments
Authorization: Bearer {token}
```

#### Upload Bukti Pembayaran
```http
POST /api/payments/upload-bukti
Authorization: Bearer {token}
Content-Type: multipart/form-data

payment_id: 1
bukti_bayar: [file]
```

#### Verify Payment (Admin Only)
```http
PUT /api/payments/{id}/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "status_bayar": "Lunas"
}
```

#### Create Payment (Admin Only)
```http
POST /api/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 1,
  "jumlah_tagihan": 1000000,
  "bulan_dibayar": "2026-04"
}
```

### Food Items

#### Get All Food Items
```http
GET /api/food-items
Authorization: Bearer {token}
```

#### Get Food Item by ID
```http
GET /api/food-items/{id}
Authorization: Bearer {token}
```

#### Create Food Item (Admin Only)
```http
POST /api/food-items
Authorization: Bearer {token}
Content-Type: multipart/form-data

nama_makanan: Nasi Goreng
nama_vendor: Warung Pak Budi
harga: 15000
deskripsi: Nasi goreng spesial
status_stok: Tersedia
gambar: [file]
```

### Food Orders

#### Get All Orders
```http
GET /api/food-orders
Authorization: Bearer {token}
```

#### Create Order
```http
POST /api/food-orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "food_id": 1,
  "jumlah": 2,
  "catatan": "Pedas level 3"
}
```

#### Update Order Status (Admin Only)
```http
PUT /api/food-orders/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status_pesanan": "Diproses Vendor"
}
```

### Rooms (Admin Only)

#### Get All Rooms
```http
GET /api/rooms
Authorization: Bearer {token}
```

#### Create Room
```http
POST /api/rooms
Authorization: Bearer {token}
Content-Type: application/json

{
  "nomor_kamar": "101",
  "tarif_dasar": 1000000,
  "status": "Kosong"
}
```

#### Register Penghuni
```http
POST /api/rooms/register-penghuni
Authorization: Bearer {token}
Content-Type: multipart/form-data

nama: John Doe
nomor_telepon: 081234567891
nik: 1234567890123457
email: john@example.com
password: password123
room_id: 1
foto_penghuni: [file]
```

### Notifications

#### Get All Notifications
```http
GET /api/notifications
Authorization: Bearer {token}
```

#### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer {token}
```

#### Mark as Read
```http
PUT /api/notifications/{id}/read
Authorization: Bearer {token}
```

#### Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer {token}
```

## 🗄️ Database Schema

### Users
- id, nama, nomor_telepon, nik, foto_penghuni, password, role, room_id

### Rooms
- id, nomor_kamar, status, tarif_dasar

### Payments
- id, user_id, jumlah_tagihan, status_bayar, bulan_dibayar, bukti_bayar, tanggal_upload

### Food_Items
- id, nama_makanan, nama_vendor, harga, gambar, status_stok, deskripsi

### Food_Orders
- id, user_id, food_id, jumlah, total_harga, status_pesanan, catatan

### Notifications
- id, user_id, judul, pesan, tipe, is_read

## 📁 File Storage

Uploaded files disimpan di `storage/app/public/`:
- `bukti_bayar/` - Bukti pembayaran
- `foto_penghuni/` - Foto penghuni
- `food_images/` - Gambar makanan

## 🔒 Authorization

- **Admin**: Full access ke semua endpoints
- **Penghuni**: Hanya bisa akses data mereka sendiri

## 🛠️ Tech Stack

- Laravel 12
- MySQL
- JWT Authentication (tymon/jwt-auth)
- PHP 8.2+
