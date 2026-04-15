# Push Notification Troubleshooting Guide

## Error: "AbortError: Registration failed - push service error"

### Penyebab Umum:
1. **Browser permission di-block sebelumnya**
2. **Service worker belum siap**
3. **Testing tanpa HTTPS** (push notification butuh HTTPS)
4. **Browser cache/data corrupt**

### Solusi:

#### 1. Reset Browser Permission (PALING PENTING)
**Chrome Desktop:**
1. Klik icon 🔒 atau ⓘ di address bar (sebelah kiri URL)
2. Klik "Site settings"
3. Scroll ke "Notifications"
4. Ubah dari "Block" ke "Allow"
5. Scroll ke "Reset permissions"
6. Klik "Reset permissions"
7. Refresh halaman (F5)

**Chrome Mobile:**
1. Tap icon ⓘ di address bar
2. Tap "Permissions"
3. Tap "Notifications"
4. Pilih "Allow"
5. Kembali dan refresh halaman

#### 2. Clear Site Data
**Chrome Desktop:**
1. Buka DevTools (F12)
2. Tab "Application"
3. Sidebar kiri: "Storage" → "Clear site data"
4. Centang semua
5. Klik "Clear site data"
6. Tutup tab dan buka lagi

**Chrome Mobile:**
1. Settings → Privacy and security → Site settings
2. Cari domain aplikasi
3. Tap "Clear & reset"

#### 3. Unregister Service Worker Lama
**Chrome Desktop:**
1. Buka DevTools (F12)
2. Tab "Application"
3. Sidebar kiri: "Service Workers"
4. Klik "Unregister" untuk semua service worker
5. Refresh halaman

#### 4. Test di HTTPS
Push notification HANYA bekerja di:
- HTTPS (production)
- localhost (development)
- Vercel deployment (sudah HTTPS)

**TIDAK bekerja di:**
- HTTP (non-localhost)
- IP address tanpa HTTPS

### Langkah Testing yang Benar:

1. **Upload file backend ke cPanel:**
   - `app/Http/Controllers/Api/PushNotificationController.php`
   - `routes/api.php`

2. **Deploy frontend ke Vercel:**
   ```bash
   cd kost-app
   git add .
   git commit -m "Fix push notification auth"
   git push origin main
   ```

3. **Buka aplikasi di Vercel URL** (bukan localhost)

4. **Reset permission** (ikuti langkah di atas)

5. **Login ulang:**
   - Logout jika sudah login
   - Login lagi
   - Buka DevTools Console (F12)
   - Lihat log: "Push subscription saved to backend"

6. **Cek database:**
   ```sql
   SELECT * FROM push_subscriptions;
   ```
   Harus ada 1 row dengan user_id Anda

7. **Test notification:**
   - Buat maintenance request ATAU
   - Upload bukti pembayaran ATAU
   - Generate tagihan (admin)
   - Notification harus muncul

### Cek Status Push Subscription:

Buka DevTools Console dan jalankan:
```javascript
// Check notification permission
console.log('Permission:', Notification.permission);

// Check service worker
navigator.serviceWorker.ready.then(reg => {
  console.log('Service Worker ready:', reg);
  
  // Check push subscription
  reg.pushManager.getSubscription().then(sub => {
    console.log('Push subscription:', sub);
    if (sub) {
      console.log('Endpoint:', sub.endpoint);
    } else {
      console.log('No push subscription found');
    }
  });
});
```

### Expected Console Output (Success):
```
Service Worker registered successfully
Notification permission granted
New push subscription created
Push subscription saved to backend: {success: true, message: "..."}
Subscribed to push notifications
```

### Error Messages dan Solusi:

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `AbortError` | Permission di-block atau service unavailable | Reset permission + clear site data |
| `NotAllowedError` | User menolak permission | Minta user allow notification |
| `401 Unauthorized` | Token tidak valid | Login ulang |
| `500 Internal Server Error` | Backend error | Cek Laravel logs di cPanel |
| `No push subscription found` | Subscription gagal dibuat | Reset permission + refresh |

### Notification Hanya Muncul Saat App Dibuka?

Ini NORMAL untuk web app. Untuk notification saat app ditutup:

1. **Install PWA ke home screen:**
   - Desktop: Klik icon ⊕ di address bar
   - Mobile: "Add to Home Screen"

2. **Tutup browser tab**

3. **Buka app dari home screen icon**

4. **Tutup app** (swipe close atau minimize)

5. **Trigger notification** (buat maintenance request dari device lain)

6. **Notification akan muncul** meskipun app ditutup

### Catatan Penting:

- Push notification untuk **SEMUA jenis notifikasi**:
  - Maintenance request (created, updated)
  - Payment (uploaded, verified, generated)
  - Billing (generated)

- Notification akan dikirim ke **semua device** yang login dengan user yang sama

- Jika user logout, subscription akan tetap ada di database tapi tidak akan menerima notification (karena token expired)

- Untuk production, hapus route test: `/push-notifications/test`

### Verifikasi Backend:

Test endpoint manual dengan curl:
```bash
curl -X POST https://mykost-cendana.xyz/api/push-subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/fcm/send/test",
      "keys": {
        "p256dh": "test-key",
        "auth": "test-auth"
      }
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Push subscription saved successfully"
}
```

Jika dapat 401, berarti ada masalah dengan auth di backend.
