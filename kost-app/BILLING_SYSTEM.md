# Sistem Billing - Kost Management

## Overview
Sistem billing hybrid yang memungkinkan admin untuk auto-generate tagihan bulanan dengan kemampuan edit manual sebelum dikirim ke penghuni.

## Fitur Utama

### 1. Billing Settings (`/admin/payments/settings`)
Konfigurasi sistem billing:
- **Siklus Billing**: 25, 28, atau 30 hari
- **Tanggal Jatuh Tempo**: Pilih tanggal 1-31 setiap bulan
- **Denda Keterlambatan**: 
  - Enable/disable denda
  - Tipe: Nominal tetap atau Persentase
  - Masa tenggang (grace period)
- **Auto Generate**: 
  - Enable/disable auto-generate
  - Pilih tanggal auto-generate setiap bulan

### 2. Generate Tagihan (`/admin/payments/generate`)
Generate tagihan bulanan untuk penghuni:
- Input periode tagihan (format: "Januari 2026" atau "2026-01")
- Preview tagihan sebelum generate
- Melihat total penghuni dan total tagihan
- Generate untuk semua penghuni atau pilih kamar tertentu
- Tagihan dibuat sebagai DRAFT (belum dikirim ke penghuni)

### 3. Payment Management (`/admin/payments`)
Halaman utama manajemen pembayaran:

#### Tab "All Payments"
- Menampilkan semua tagihan yang sudah di-finalize
- Status: Lunas, Belum Lunas, Menunggu Verifikasi
- Statistik: Total tagihan, jumlah lunas, belum lunas, draft
- Klik untuk melihat detail payment

#### Tab "Drafts"
- Menampilkan tagihan yang belum di-finalize
- Checkbox untuk bulk selection
- Tombol "Finalize Terpilih" untuk bulk finalize
- Tombol "Pilih Semua" / "Batal Pilih Semua"
- Klik untuk edit draft

### 4. Edit Draft Payment (`/admin/payments/[id]/edit`)
Edit tagihan sebelum dikirim ke penghuni:
- **Tarif Dasar**: Otomatis dari tarif kamar (tidak bisa diedit)
- **Biaya Tambahan**: 
  - Listrik
  - Air
  - Maintenance
  - Denda Keterlambatan
  - Lainnya
  - Setiap biaya bisa ditambah deskripsi
- **Diskon**: Input nominal diskon
- **Catatan**: Catatan tambahan untuk penghuni
- **Total Tagihan**: Kalkulasi otomatis
- **Actions**:
  - Hapus Draft
  - Simpan Draft (save tanpa finalize)
  - Finalize & Kirim (kirim ke penghuni)

### 5. View Payment Detail (`/admin/payments/[id]`)
Melihat detail tagihan yang sudah di-finalize:
- Header dengan status payment
- Informasi penghuni (nama, telepon, email, kamar)
- Rincian tagihan (tarif dasar, biaya tambahan, diskon, total)
- Catatan (jika ada)
- Bukti pembayaran (jika sudah diupload)
- Timeline (finalized, upload bukti, verifikasi)

## Workflow

### Generate & Send Tagihan
1. Admin masuk ke `/admin/payments/generate`
2. Input periode tagihan (contoh: "Januari 2026")
3. Klik "Preview Tagihan" untuk melihat preview
4. Klik "Generate Tagihan" untuk membuat draft
5. Draft muncul di tab "Drafts" di halaman `/admin/payments`
6. Admin bisa:
   - Edit draft untuk menambah biaya tambahan/diskon
   - Finalize satu per satu dengan klik edit → finalize
   - Finalize banyak sekaligus dengan bulk action
7. Setelah finalize, tagihan dikirim ke penghuni dan muncul notifikasi

### Penghuni Menerima Tagihan
1. Penghuni menerima notifikasi tagihan baru
2. Penghuni bisa lihat tagihan di dashboard
3. Penghuni upload bukti pembayaran
4. Admin verifikasi pembayaran
5. Status berubah menjadi "Lunas"

## API Endpoints

### Billing Settings
- `GET /api/billing/settings` - Get billing settings
- `PUT /api/billing/settings` - Update billing settings

### Generate & Preview
- `POST /api/billing/preview` - Preview payments before generate
- `POST /api/billing/generate` - Generate draft payments

### Draft Management
- `GET /api/billing/drafts` - Get all draft payments
- `PUT /api/billing/payments/{id}/charges` - Update payment charges
- `POST /api/billing/payments/{id}/finalize` - Finalize single payment
- `POST /api/billing/payments/bulk-finalize` - Finalize multiple payments
- `DELETE /api/billing/payments/{id}` - Delete draft payment

### Payment Management
- `GET /api/payments` - Get all payments
- `GET /api/payments/{id}` - Get payment detail

## Database Schema

### billing_settings
- billing_cycle_days (25, 28, 30)
- due_date_day (1-31)
- late_fee_percentage
- late_fee_amount
- grace_period_days
- auto_generate (boolean)
- auto_generate_day (1-31)
- enable_late_fee (boolean)
- late_fee_type (percentage/fixed)

### payments
- user_id
- tarif_dasar
- total_additional_charges
- total_discount
- jumlah_tagihan (calculated)
- status_bayar (Belum Lunas, Menunggu Verifikasi, Lunas)
- bulan_dibayar
- due_date
- bukti_bayar
- notes
- is_finalized (boolean)
- finalized_at
- tanggal_upload
- tanggal_verifikasi

### payment_additional_charges
- payment_id
- charge_type (electricity, water, maintenance, late_fee, other)
- amount
- description

## Notifikasi
Sistem otomatis membuat notifikasi untuk:
- Penghuni: Ketika tagihan baru di-finalize
- Admin: Ketika penghuni upload bukti pembayaran
- Penghuni: Ketika pembayaran diverifikasi

## Testing Credentials
- Admin: 081234567890 / admin123
- Penghuni: 081234567891 / password123

## URLs
- Backend: http://127.0.0.1:8000
- Frontend: http://localhost:3001
- Admin Payments: http://localhost:3001/admin/payments
