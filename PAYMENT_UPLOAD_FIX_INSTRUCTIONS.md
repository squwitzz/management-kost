# 🔧 Payment Upload 401 Error - Fix Instructions

## Problem
Anda mendapat error "Session Expired" / 401 Unauthorized ketika mencoba upload bukti pembayaran, padahal baru saja login.

## Token Analysis ✅
Saya sudah menganalisis token Anda:
- Token VALID (belum expired)
- User ID: 9
- Format JWT: Benar
- Expires: 14/04/2026, 21:02:38

## Root Cause
Token Anda valid, tapi backend menolaknya. Kemungkinan:
1. **JWT_SECRET mismatch** - Backend pakai secret key berbeda
2. **Payment bukan milik Anda** - Payment ID 19 mungkin bukan milik User ID 9
3. **Cache issue** - Laravel cache JWT config lama

## 🚀 SOLUSI - Pilih Salah Satu

### Solusi 1: Clear Cache (Coba Ini Dulu)
Ini paling aman, tidak akan invalidate token yang ada.

```bash
# SSH ke cPanel
cd ~/public_html/api
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

Setelah itu:
1. Refresh browser (Ctrl+F5)
2. Coba upload payment lagi
3. Jika masih error, lanjut ke Solusi 2

### Solusi 2: Regenerate JWT Secret
Ini akan invalidate SEMUA token. Semua user harus login ulang.

```bash
# SSH ke cPanel
cd ~/public_html/api
php artisan jwt:secret --force
php artisan config:clear
php artisan cache:clear
php artisan config:cache
```

Setelah itu:
1. **LOGOUT** dari aplikasi
2. **LOGIN** lagi (untuk dapat token baru)
3. Coba upload payment lagi

### Solusi 3: Check Payment Ownership
Mungkin Payment ID 19 bukan milik Anda.

**Cara check:**
1. Buka phpMyAdmin di cPanel
2. Pilih database kost
3. Run query ini:

```sql
SELECT p.id, p.user_id, u.nama, p.bulan_dibayar, p.status_bayar
FROM payments p
LEFT JOIN users u ON p.user_id = u.id
WHERE p.id = 19;
```

**Hasil yang diharapkan:**
- `user_id` harus `9` (ID Anda)
- Jika beda, berarti Anda coba akses payment orang lain

## 🔍 Diagnostic Tool (Optional)

Saya sudah buat script untuk diagnose masalah ini.

**File:** `kost-backend/public/test-jwt-debug.php`

**Cara pakai:**
1. Upload file tersebut ke `public_html/api/test-jwt-debug.php`
2. Buka URL ini di browser:

```
https://mykost-cendana.xyz/test-jwt-debug.php?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL215a29zdC1jZW5kYW5hLnh5ei9hcGkvbG9naW4iLCJpYXQiOjE3NzYxNzE3NTgsImV4cCI6MTc3NjE3NTM1OCwibmJmIjoxNzc2MTcxNzU4LCJqdGkiOiJGeTRkTVBmektSbUNWVFVIIiwic3ViIjoiOSIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.nPZ8sb4NkCH_05fH105g6ce82zSn5DlLF5ZbOi7K3Q8
```

3. Share hasil JSON-nya dengan saya

Script ini akan memberitahu:
- ✅ JWT_SECRET configured?
- ✅ Token expired?
- ✅ Token signature valid?
- ✅ User exists?
- ✅ Exact error message

## 📝 Checklist

Coba solusi ini secara berurutan:

- [ ] **Step 1**: Clear cache (Solusi 1)
- [ ] **Step 2**: Test upload payment
- [ ] **Step 3**: Jika masih error, regenerate JWT secret (Solusi 2)
- [ ] **Step 4**: Logout dan login ulang
- [ ] **Step 5**: Test upload payment lagi
- [ ] **Step 6**: Jika masih error, check payment ownership (Solusi 3)
- [ ] **Step 7**: Share hasil diagnostic tool dengan saya

## ⚠️ Important Notes

1. **Solusi 1** (clear cache) - Aman, tidak perlu login ulang
2. **Solusi 2** (regenerate JWT) - SEMUA user harus login ulang
3. **Solusi 3** (check ownership) - Pastikan payment memang milik Anda

## 🆘 Jika Masih Error

Share dengan saya:
1. Screenshot error di console browser (F12 > Console)
2. Output dari diagnostic tool
3. Hasil SQL query payment ownership
4. Error dari `storage/logs/laravel.log` (jika ada akses)

---
**Dibuat:** 14 April 2026, 20:16
**Status:** Menunggu Anda coba solusi di atas
**Priority:** HIGH
