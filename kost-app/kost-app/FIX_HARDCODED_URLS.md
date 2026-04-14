# Fix Hardcoded URLs - Progress Report

## Problem
Many files still use hardcoded `http://127.0.0.1:8000` URLs instead of the dynamic API URL system. This causes the app to fail when deployed to production (Vercel).

## Solution
Use `getApiUrl()` and `getBaseUrl()` from `@/app/lib/api` for all API calls and storage URLs.

## Files Fixed ✅

### Core API Library
- ✅ `kost-app/app/lib/api.ts` - Exported `getApiUrl()` and `getBaseUrl()` functions

### Room Management
- ✅ `kost-app/app/(admin)/admin/rooms/add/page.tsx` - Fixed API URL + SweetAlert
- ✅ `kost-app/app/(admin)/admin/rooms/page.tsx` - Fixed API URL + SweetAlert

### Components
- ✅ `kost-app/app/components/AdminHeader.tsx` - Fixed all notification API calls
- ✅ `kost-app/app/components/UserHeader.tsx` - Fixed all notification API calls + storage URL
- ✅ `kost-app/app/components/NotificationProvider.tsx` - Fixed notification polling

## Files Still Need Fixing ⚠️

### Dashboard Pages (User)
- ⚠️ `kost-app/app/(dashboard)/rules/page.tsx` - Line 43
- ⚠️ `kost-app/app/(dashboard)/requests/page.tsx` - Lines 32, 235
- ⚠️ `kost-app/app/(dashboard)/profile/page.tsx` - Lines 57, 112, 163, 243
- ⚠️ `kost-app/app/(dashboard)/requests/create/page.tsx` - Line 57

### Admin Pages
- ⚠️ `kost-app/app/(admin)/admin/rooms/[id]/page.tsx`
- ⚠️ `kost-app/app/(admin)/admin/residents/page.tsx`
- ⚠️ `kost-app/app/(admin)/admin/residents/[id]/page.tsx`
- ⚠️ `kost-app/app/(admin)/admin/residents/[id]/edit/page.tsx`
- ⚠️ `kost-app/app/(admin)/admin/payments/page.tsx`
- ⚠️ `kost-app/app/(admin)/admin/payments/[id]/page.tsx`
- ⚠️ `kost-app/app/(admin)/admin/payments/[id]/edit/page.tsx`
- ⚠️ `kost-app/app/(admin)/admin/payments/generate/page.tsx`
- ⚠️ `kost-app/app/(admin)/admin/payments/settings/page.tsx`
- ⚠️ `kost-app/app/(admin)/admin/requests/page.tsx`
- ⚠️ `kost-app/app/(admin)/admin/requests/[id]/page.tsx`
- ⚠️ `kost-app/app/(admin)/admin/register-resident/page.tsx`
- ⚠️ `kost-app/app/(admin)/admin/profile/page.tsx`
- ⚠️ `kost-app/app/(admin)/admin/dashboard/page.tsx`
- ⚠️ `kost-app/app/(admin)/admin/rules/page.tsx`

### Payment Pages
- ⚠️ `kost-app/app/(dashboard)/payments/page.tsx`
- ⚠️ `kost-app/app/(dashboard)/payments/upload/[id]/page.tsx`

### Other
- ⚠️ `kost-app/app/debug/page.tsx` - Line 21 (already has fallback logic)

## Pattern to Follow

### For API Calls:
```typescript
import { getApiUrl } from '@/app/lib/api';

const API_URL = getApiUrl();
const response = await fetch(`${API_URL}/endpoint`, {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});
```

### For Storage URLs (images, files):
```typescript
import { getBaseUrl } from '@/app/lib/api';

const imageUrl = user?.foto_penghuni 
  ? `${getBaseUrl()}/storage/${user.foto_penghuni}`
  : 'fallback-url';
```

### For Alerts:
```typescript
import { showSuccess, showError, showDeleteConfirm } from '@/app/lib/sweetalert';

// Success
await showSuccess('Success!', 'Operation completed');

// Error
await showError('Error', 'Something went wrong');

// Delete confirmation
const result = await showDeleteConfirm('Item Name');
if (result.isConfirmed) {
  // proceed with delete
}
```

## Next Steps
1. Fix remaining dashboard pages
2. Fix remaining admin pages
3. Test all pages in production
4. Push to GitHub
5. Deploy to Vercel

## Testing Checklist
- [ ] Login works on Vercel
- [ ] Room data displays correctly
- [ ] Resident management works
- [ ] Payment system works
- [ ] Notifications work
- [ ] Profile images load
- [ ] All alerts use SweetAlert2
