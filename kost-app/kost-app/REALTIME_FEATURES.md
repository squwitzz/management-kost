# Real-time Features Documentation

## Overview

Aplikasi sekarang memiliki fitur real-time yang membuat semua data ter-update otomatis tanpa perlu refresh manual.

## Fitur Real-time

### 1. **Notifications (10 detik)**
- Badge unread count update otomatis
- Notifikasi baru langsung muncul di dropdown
- Browser notification untuk notifikasi baru
- Event-driven updates antar komponen

### 2. **Dashboard Data (15 detik)**
- Room information
- Payment status
- Outstanding balance
- Recent activity

### 3. **Payment List (15 detik)**
- Status pembayaran
- Bukti bayar yang diupload
- Verifikasi admin

### 4. **Maintenance Requests (15 detik)**
- Request baru
- Status updates
- Admin responses

## Cara Kerja

### Polling System
```
┌─────────────────┐
│  Component      │
│  (Dashboard)    │
└────────┬────────┘
         │
         │ useRealtime hook
         │
         ▼
┌─────────────────┐
│  Auto Polling   │◄─── Every 10-15 seconds
│  (Background)   │
└────────┬────────┘
         │
         │ Fetch API
         │
         ▼
┌─────────────────┐
│  Laravel API    │
│  (Backend)      │
└─────────────────┘
```

### Smart Polling
- **Tab Visible**: Polling aktif
- **Tab Hidden**: Polling pause (hemat resource)
- **Network Error**: Auto-retry dengan backoff

## Custom Hooks

### 1. `useRealtime<T>`
Generic hook untuk real-time data fetching.

```typescript
const { data, loading, error, refetch } = useRealtime(
  fetchFunction,
  { interval: 5000, enabled: true }
);
```

### 2. `useRealtimeNotifications`
Khusus untuk notifications.

```typescript
const { data } = useRealtimeNotifications(10000); // 10 seconds
// data: { count: number, notifications: Notification[] }
```

### 3. `useRealtimePayments`
Khusus untuk payments data.

```typescript
const { data } = useRealtimePayments(userId, 15000); // 15 seconds
```

### 4. `useRealtimeRequests`
Khusus untuk maintenance requests.

```typescript
const { data } = useRealtimeRequests(15000); // 15 seconds
```

### 5. `usePageVisibility`
Detect tab visibility untuk pause/resume polling.

```typescript
const isVisible = usePageVisibility();
// true: tab visible, false: tab hidden
```

## Components

### RealtimeIndicator
Visual indicator untuk menunjukkan data real-time.

```tsx
<RealtimeIndicator lastUpdated={new Date()} />
```

Menampilkan:
- 🟢 "Live" - Baru saja update (< 2 detik)
- "5s ago" - Update 5 detik lalu
- "2m ago" - Update 2 menit lalu

## Event System

### Custom Events

**newNotification**
Triggered saat ada notifikasi baru.

```typescript
window.addEventListener('newNotification', (event) => {
  const notification = event.detail;
  console.log('New notification:', notification);
});
```

**Dispatch Event:**
```typescript
window.dispatchEvent(new CustomEvent('newNotification', {
  detail: notificationData
}));
```

## Interval Settings

| Feature | Interval | Reason |
|---------|----------|--------|
| Notifications | 10s | Critical, need fast updates |
| Dashboard | 15s | Balance between fresh data & performance |
| Payments | 15s | Moderate priority |
| Requests | 15s | Moderate priority |

## Performance Optimization

### 1. **Tab Visibility Detection**
Polling otomatis pause saat tab tidak aktif.

```typescript
const isVisible = usePageVisibility();
// Polling only runs when isVisible === true
```

### 2. **Request Deduplication**
Prevent multiple simultaneous requests.

```typescript
const isMountedRef = useRef(true);
// Check before setState to prevent memory leaks
```

### 3. **Cleanup on Unmount**
Proper cleanup untuk prevent memory leaks.

```typescript
useEffect(() => {
  const interval = setInterval(fetchData, 5000);
  return () => clearInterval(interval);
}, []);
```

## Usage Examples

### Example 1: Real-time Dashboard

```tsx
import { useRealtimeDashboard } from '@/app/lib/useRealtimeDashboard';
import { RealtimeIndicator } from '@/app/components';

export default function Dashboard() {
  const { data, loading } = useRealtimeDashboard(userId, roomId);

  return (
    <div>
      <RealtimeIndicator lastUpdated={data?.lastUpdated} />
      {/* Your dashboard content */}
    </div>
  );
}
```

### Example 2: Real-time Notifications

```tsx
import { useRealtimeNotifications } from '@/app/lib/useRealtime';

export default function NotificationBell() {
  const { data } = useRealtimeNotifications(10000);
  
  return (
    <div>
      <span>Unread: {data?.count || 0}</span>
    </div>
  );
}
```

### Example 3: Manual Refetch

```tsx
const { data, refetch } = useRealtime(fetchFunction);

const handleRefresh = () => {
  refetch(); // Manual refresh
};
```

## Troubleshooting

### Data tidak update
1. Check console untuk errors
2. Verify API endpoint accessible
3. Check token validity
4. Verify interval setting

### Performance issues
1. Increase interval (reduce frequency)
2. Check network tab untuk request count
3. Verify cleanup functions running

### Memory leaks
1. Check useEffect cleanup
2. Verify isMountedRef usage
3. Clear intervals on unmount

## Best Practices

1. **Use appropriate intervals**
   - Critical data: 5-10 seconds
   - Normal data: 15-30 seconds
   - Low priority: 60+ seconds

2. **Implement error handling**
   ```typescript
   try {
     await fetchData();
   } catch (error) {
     console.error('Fetch failed:', error);
   }
   ```

3. **Show loading states**
   ```tsx
   {loading ? <Spinner /> : <Data />}
   ```

4. **Provide manual refresh**
   ```tsx
   <button onClick={refetch}>Refresh</button>
   ```

5. **Use visibility detection**
   Pause polling when tab hidden to save resources.

## Future Enhancements

### WebSocket Integration
Untuk real-time yang lebih efisien:

```typescript
// Instead of polling
const ws = new WebSocket('ws://api.example.com');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateState(data);
};
```

### Server-Sent Events (SSE)
Alternative untuk WebSocket:

```typescript
const eventSource = new EventSource('/api/events');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateState(data);
};
```

## Monitoring

### Check Real-time Status

Open browser console:
```javascript
// Check active intervals
console.log('Active intervals:', window.setInterval.length);

// Monitor fetch requests
// Open Network tab in DevTools
// Filter by "api" to see polling requests
```

### Performance Metrics

```javascript
// Measure update latency
const start = Date.now();
await fetchData();
const latency = Date.now() - start;
console.log('Fetch latency:', latency, 'ms');
```

## Summary

✅ Notifications update setiap 10 detik
✅ Dashboard data update setiap 15 detik
✅ Auto-pause saat tab tidak aktif
✅ Event-driven updates antar komponen
✅ Visual indicator untuk real-time status
✅ Proper cleanup & memory management
✅ Error handling & retry logic

Semua data sekarang real-time tanpa perlu refresh manual! 🎉
