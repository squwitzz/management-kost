# Migration to ApiClient - Progress Report

## Objective
Replace all hardcoded `http://127.0.0.1:8000` URLs with `ApiClient` methods or `getApiUrl()` function for proper environment detection and mobile data support.

## Benefits
✅ Automatic environment detection (localhost vs production)
✅ Better error handling
✅ Mobile data compatibility
✅ Consistent API calls across the app
✅ Easier maintenance

## ApiClient Methods Added

### Room Management
- `getRooms()` - Get all rooms
- `getRoom(roomId)` - Get single room
- `createRoom(data)` - Create new room
- `deleteRoom(roomId)` - Delete room

### Rules Management
- `getRules()` - Get all rules
- `createRule(data)` - Create new rule
- `updateRule(ruleId, data)` - Update rule
- `deleteRule(ruleId)` - Delete rule

### Maintenance Requests
- `getMaintenanceRequests()` - Get all requests
- `getMaintenanceRequest(requestId)` - Get single request
- `createMaintenanceRequest(formData)` - Create new request
- `updateMaintenanceRequestStatus(requestId, status)` - Update status

### Dashboard
- `getAdminDashboard()` - Get admin dashboard data
- `getUserDashboard()` - Get user dashboard data

### Residents
- `getResidents()` - Get all residents
- `getResident(userId)` - Get single resident
- `updateResident(userId, data)` - Update resident
- `deleteResident(userId)` - Delete resident
- `registerResident(data)` - Register new resident

### Payments
- `getPayments()` - Get user payments
- `getAdminPayments()` - Get all payments (admin)
- `getPayment(paymentId)` - Get single payment
- `updatePaymentStatus(paymentId, status)` - Update payment status
- `generatePayments(data)` - Generate monthly payments
- `uploadBuktiBayar(paymentId, file)` - Upload payment proof
- `getPaymentSettings()` - Get payment settings
- `updatePaymentSettings(data)` - Update payment settings

## Files Migrated ✅

### Room Management
- ✅ `app/(admin)/admin/rooms/page.tsx` - Uses `ApiClient.getRooms()` and `ApiClient.deleteRoom()`
- ✅ `app/(admin)/admin/rooms/add/page.tsx` - Uses `ApiClient.createRoom()`

### Requests
- ✅ `app/(dashboard)/requests/page.tsx` - Uses `ApiClient.getMaintenanceRequests()` and `getBaseUrl()`

### Core Components
- ✅ `app/lib/api.ts` - Enhanced with mobile data support, all methods added
- ✅ `app/components/AdminHeader.tsx` - Uses `getApiUrl()`
- ✅ `app/components/UserHeader.tsx` - Uses `getApiUrl()` and `getBaseUrl()`
- ✅ `app/components/NotificationProvider.tsx` - Uses `getApiUrl()`

### Backend
- ✅ `config/cors.php` - Enhanced CORS headers for mobile data

## Files Pending Migration ⚠️

### Dashboard Pages (User)
- ⚠️ `app/(dashboard)/dashboard/page.tsx`
- ⚠️ `app/(dashboard)/payments/page.tsx`
- ⚠️ `app/(dashboard)/payments/upload/[id]/page.tsx`
- ⚠️ `app/(dashboard)/profile/page.tsx`
- ⚠️ `app/(dashboard)/rules/page.tsx`
- ⚠️ `app/(dashboard)/requests/create/page.tsx`

### Admin Pages
- ⚠️ `app/(admin)/admin/dashboard/page.tsx`
- ⚠️ `app/(admin)/admin/residents/page.tsx`
- ⚠️ `app/(admin)/admin/residents/[id]/page.tsx`
- ⚠️ `app/(admin)/admin/residents/[id]/edit/page.tsx`
- ⚠️ `app/(admin)/admin/register-resident/page.tsx`
- ⚠️ `app/(admin)/admin/rooms/[id]/page.tsx`
- ⚠️ `app/(admin)/admin/payments/page.tsx`
- ⚠️ `app/(admin)/admin/payments/[id]/page.tsx`
- ⚠️ `app/(admin)/admin/payments/[id]/edit/page.tsx`
- ⚠️ `app/(admin)/admin/payments/generate/page.tsx`
- ⚠️ `app/(admin)/admin/payments/settings/page.tsx`
- ⚠️ `app/(admin)/admin/requests/page.tsx`
- ⚠️ `app/(admin)/admin/requests/[id]/page.tsx`
- ⚠️ `app/(admin)/admin/rules/page.tsx`
- ⚠️ `app/(admin)/admin/profile/page.tsx`

### Other
- ⚠️ `app/debug/page.tsx` (low priority - debug only)

## Migration Pattern

### Before (Hardcoded):
```typescript
const response = await fetch('http://127.0.0.1:8000/api/rooms', {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  },
});
const data = await response.json();
```

### After (ApiClient):
```typescript
import { ApiClient } from '@/app/lib/api';

const data = await ApiClient.getRooms();
```

### For Storage URLs:
```typescript
import { getBaseUrl } from '@/app/lib/api';

const imageUrl = `${getBaseUrl()}/storage/${filename}`;
```

## Next Steps
1. Continue migrating remaining dashboard pages
2. Migrate admin pages
3. Test all functionality on mobile data
4. Push to GitHub
5. Deploy to Vercel

## Testing Checklist
- [ ] Login works on mobile data
- [ ] Room management works on mobile data
- [ ] Requests work on mobile data
- [ ] Payments work on mobile data
- [ ] Profile updates work on mobile data
- [ ] Images load correctly
- [ ] All CRUD operations work

## Mobile Data Enhancements
- Added `Cache-Control` headers to prevent caching issues
- Added `credentials: 'include'` for CORS
- Enhanced error messages for network failures
- Added `cache: 'no-store'` to all fetch requests
- Updated CORS configuration with proper headers
