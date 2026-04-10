# Notification Routing System

## Overview

Sistem routing otomatis untuk notifikasi yang mengarahkan user ke halaman yang sesuai saat notifikasi diklik.

## Fitur

### 1. **Click dari Dropdown Notification**
- User klik notifikasi di dropdown
- Otomatis mark as read
- Navigate ke halaman terkait
- Dropdown otomatis close

### 2. **Click dari Browser Notification**
- User klik browser notification (push notification)
- App otomatis buka/focus
- Navigate ke halaman terkait
- Notification otomatis close

### 3. **Smart Routing berdasarkan Role**
- Admin → Admin pages
- Penghuni → User pages
- Automatic role detection

## Routing Rules

### User (Penghuni)

| Notification Type | Route | Description |
|-------------------|-------|-------------|
| Tagihan | `/payments` | Daftar tagihan |
| Pembayaran | `/payments` | Status pembayaran |
| Maintenance | `/requests` | Maintenance requests |
| Pesanan | `/dashboard` | Dashboard |

### Admin

| Notification Type | Route | Description |
|-------------------|-------|-------------|
| Tagihan | `/admin/payments` | Manage payments |
| Pembayaran | `/admin/payments` | Verify payments |
| Maintenance | `/admin/requests` | Manage requests |
| Penghuni | `/admin/residents` | Manage residents |

## Implementation

### notificationRouter.ts

Helper functions untuk routing:

```typescript
import { getNotificationRoute } from '@/app/lib/notificationRouter';

const url = getNotificationRoute(notification, user);
router.push(url);
```

### Functions Available

#### 1. `getNotificationRoute(notification, user)`
Main routing function.

```typescript
const url = getNotificationRoute(
  {
    id: 1,
    judul: 'Pembayaran Diverifikasi',
    pesan: 'Pembayaran #123 telah diverifikasi',
    tipe: 'Pembayaran',
    related_id: 123
  },
  {
    id: 1,
    role: 'Penghuni',
    nama: 'John Doe'
  }
);
// Returns: '/payments'
```

#### 2. `getNotificationTypeName(tipe)`
Get display name for notification type.

```typescript
getNotificationTypeName('Tagihan'); // 'Tagihan Baru'
getNotificationTypeName('Pembayaran'); // 'Pembayaran'
```

#### 3. `getNotificationIcon(tipe)`
Get Material Icon name for notification type.

```typescript
getNotificationIcon('Tagihan'); // 'receipt_long'
getNotificationIcon('Pembayaran'); // 'payments'
getNotificationIcon('Maintenance'); // 'build'
```

#### 4. `getNotificationColor(tipe)`
Get Tailwind classes for notification colors.

```typescript
getNotificationColor('Tagihan');
// { bg: 'bg-error/10', text: 'text-error' }

getNotificationColor('Pembayaran');
// { bg: 'bg-secondary/10', text: 'text-secondary' }
```

## ID Extraction

System otomatis extract ID dari pesan notifikasi:

### Supported Patterns

```typescript
// Pattern 1: Hash
"Pembayaran #123 telah diverifikasi" → ID: 123

// Pattern 2: ID keyword
"ID: 456 menunggu verifikasi" → ID: 456
"ID 789 telah selesai" → ID: 789

// Pattern 3: Number in text
"Payment 999 verified" → ID: 999
```

### Usage

```typescript
const notification = {
  pesan: "Pembayaran #123 telah diverifikasi",
  tipe: "Pembayaran"
};

const url = getNotificationRoute(notification, user);
// Returns: '/payments/123' (if detail page exists)
// Or: '/payments' (fallback to list)
```

## Component Integration

### UserHeader.tsx

```typescript
const handleNotificationClick = async (notification: Notification) => {
  // Mark as read
  if (!notification.is_read) {
    await markAsRead(notification.id);
  }

  // Get user data
  const userData = user || JSON.parse(localStorage.getItem('user') || '{}');
  
  // Navigate using router helper
  const url = getNotificationRoute(notification, userData);
  router.push(url);
  
  // Close dropdown
  setShowNotifications(false);
};
```

### AdminHeader.tsx

Same implementation as UserHeader, automatically detects admin role.

### NotificationProvider.tsx

For browser notifications:

```typescript
const userData = JSON.parse(localStorage.getItem('user') || '{}');
const notificationUrl = getNotificationRoute(latestUnread, userData);

showNotification(latestUnread.judul, {
  body: latestUnread.pesan,
  tag: `notification-${latestUnread.id}`,
  data: {
    url: notificationUrl, // Used by service worker
  },
});
```

## Service Worker

Service worker handles browser notification clicks:

```javascript
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  // Focus existing window or open new one
  clients.matchAll({ type: 'window' }).then((clientList) => {
    for (const client of clientList) {
      if (client.url.includes(urlToOpen)) {
        return client.focus().then(() => client.navigate(urlToOpen));
      }
    }
    return clients.openWindow(urlToOpen);
  });
});
```

## Testing

### Test Dropdown Click

1. Login sebagai user/admin
2. Buka notification dropdown
3. Klik salah satu notifikasi
4. Verify:
   - ✅ Notifikasi marked as read
   - ✅ Navigate ke halaman yang benar
   - ✅ Dropdown closed

### Test Browser Notification Click

1. Enable browser notifications
2. Tunggu notifikasi baru (atau trigger manual)
3. Klik browser notification
4. Verify:
   - ✅ App opened/focused
   - ✅ Navigate ke halaman yang benar
   - ✅ Notification closed

### Test Role-based Routing

**As User:**
```typescript
// Notification: "Tagihan baru untuk bulan Januari"
// Expected: Navigate to /payments
```

**As Admin:**
```typescript
// Notification: "Pembayaran baru menunggu verifikasi"
// Expected: Navigate to /admin/payments
```

## Extending Routes

### Add New Notification Type

1. **Update notificationRouter.ts:**

```typescript
function getUserRoute(tipe: string, relatedId?: number): string {
  switch (tipe) {
    // ... existing cases
    
    case 'NewType':
      if (relatedId) {
        return `/new-page/${relatedId}`;
      }
      return '/new-page';
    
    default:
      return '/dashboard';
  }
}
```

2. **Add icon and color:**

```typescript
const icons: Record<string, string> = {
  // ... existing icons
  'NewType': 'new_icon',
};

const colors: Record<string, { bg: string; text: string }> = {
  // ... existing colors
  'NewType': { bg: 'bg-primary/10', text: 'text-primary' },
};
```

3. **Update backend to send correct `tipe`:**

```php
Notification::create([
    'user_id' => $userId,
    'judul' => 'New Notification',
    'pesan' => 'Description with #123',
    'tipe' => 'NewType', // Match the case in router
]);
```

## Troubleshooting

### Notification tidak navigate

**Check:**
1. Console errors
2. User data in localStorage
3. Notification tipe spelling
4. Router helper import

**Debug:**
```typescript
console.log('Notification:', notification);
console.log('User:', user);
console.log('Generated URL:', url);
```

### Wrong page opened

**Check:**
1. User role correct
2. Notification tipe correct
3. Route exists in app

**Fix:**
Update routing rules in `notificationRouter.ts`

### ID not extracted

**Check:**
1. Message format
2. ID pattern in message

**Fix:**
Update `extractIdFromMessage()` function with new pattern

## Best Practices

1. **Always include ID in notification message:**
   ```php
   'pesan' => "Pembayaran #$paymentId telah diverifikasi"
   ```

2. **Use consistent notification types:**
   ```php
   // Good
   'tipe' => 'Pembayaran'
   
   // Bad
   'tipe' => 'payment' // lowercase
   'tipe' => 'Pembayaran Baru' // with extra words
   ```

3. **Test both dropdown and browser notifications:**
   - Dropdown click
   - Browser notification click
   - Both should navigate correctly

4. **Handle missing data gracefully:**
   ```typescript
   const url = getNotificationRoute(notification, user) || '/dashboard';
   ```

## Summary

✅ Click notification → Auto navigate
✅ Smart routing based on role
✅ ID extraction from message
✅ Works for dropdown & browser notifications
✅ Extensible for new notification types
✅ Proper error handling

Sekarang notifikasi langsung mengarahkan ke halaman yang sesuai! 🎯
