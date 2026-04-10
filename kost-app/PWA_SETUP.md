# PWA & Push Notifications Setup

## Fitur yang Ditambahkan

### 1. Progressive Web App (PWA)
- App bisa diinstall di device mobile dan desktop
- Bekerja offline dengan service worker
- Icon di home screen seperti native app
- Splash screen saat launch

### 2. Push Notifications
- Notifikasi real-time muncul di device
- Bekerja bahkan saat app tidak dibuka
- Auto-polling setiap 30 detik untuk notifikasi baru
- Click notification untuk langsung ke halaman terkait

## File yang Dibuat

1. **public/manifest.json** - PWA manifest configuration
2. **public/sw.js** - Service Worker untuk offline & push notifications
3. **app/lib/notifications.ts** - Helper functions untuk notifications
4. **app/components/PWAInstallPrompt.tsx** - Install prompt UI
5. **app/components/NotificationProvider.tsx** - Notification polling provider

## Cara Menggunakan

### Install App di Mobile

1. Buka app di browser mobile (Chrome/Safari)
2. Setelah 3 detik, akan muncul prompt "Install Kost App"
3. Klik "Install"
4. App akan muncul di home screen

**Atau manual:**
- Chrome Android: Menu → "Add to Home screen"
- Safari iOS: Share → "Add to Home Screen"

### Enable Notifications

1. Saat pertama kali login, browser akan meminta permission
2. Klik "Allow" untuk enable notifications
3. Notifikasi akan muncul otomatis saat ada update baru

### Testing Notifications

Untuk testing, buat notifikasi baru dari admin:
1. Login sebagai admin
2. Verifikasi pembayaran / approve maintenance request
3. Notifikasi akan muncul di device penghuni dalam 30 detik

## Icon Requirements

Ganti placeholder icons dengan icon asli:

1. **icon-192.png** - 192x192 pixels
2. **icon-512.png** - 512x512 pixels

Gunakan tool seperti:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

## Browser Support

### PWA Install
- ✅ Chrome Android
- ✅ Safari iOS 11.3+
- ✅ Chrome Desktop
- ✅ Edge Desktop
- ❌ Firefox (limited support)

### Push Notifications
- ✅ Chrome Android
- ✅ Chrome Desktop
- ✅ Edge Desktop
- ⚠️ Safari iOS (requires iOS 16.4+)
- ❌ Firefox Android

## Troubleshooting

### App tidak bisa diinstall
- Pastikan menggunakan HTTPS (atau localhost untuk development)
- Clear browser cache
- Pastikan manifest.json accessible

### Notifications tidak muncul
- Check browser permission settings
- Pastikan service worker registered (check DevTools → Application → Service Workers)
- Check console untuk error messages

### Service Worker tidak update
- Unregister old service worker di DevTools
- Hard refresh (Ctrl+Shift+R)
- Clear site data

## Development

### Test PWA locally
```bash
npm run build
npm start
# Access via http://localhost:3000
```

### Debug Service Worker
1. Open DevTools (F12)
2. Go to Application tab
3. Check Service Workers section
4. Check Manifest section

### Test Notifications
```javascript
// In browser console
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    new Notification('Test', { body: 'This is a test notification' });
  }
});
```

## Production Deployment

1. Generate proper icons (192x192 and 512x512)
2. Update manifest.json with production URLs
3. Ensure HTTPS is enabled
4. Test on real devices before launch

## Next Steps

### Backend Integration (Optional)
Untuk push notifications yang lebih advanced, integrate dengan:
- Firebase Cloud Messaging (FCM)
- OneSignal
- Pusher

### Features to Add
- Offline data sync
- Background sync for uploads
- Badge count on app icon
- Rich notifications with images
- Notification actions (Reply, Archive, etc.)
