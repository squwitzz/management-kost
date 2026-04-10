# Migration Completion Guide

## ✅ Progress: 47% Complete (15/32 files)

### What's Done:
- ✅ ALL User Pages (100%)
- ✅ ALL Components (100%)
- ✅ Core Room Management (Admin)
- ✅ Residents List (Admin)
- ✅ Mobile Data Support Added
- ✅ CORS Enhanced

### What's Left (17 files):

Semua file di bawah masih menggunakan hardcoded `http://127.0.0.1:8000`:

1. `app/(admin)/admin/dashboard/page.tsx`
2. `app/(admin)/admin/payments/page.tsx`
3. `app/(admin)/admin/payments/[id]/page.tsx`
4. `app/(admin)/admin/payments/[id]/edit/page.tsx`
5. `app/(admin)/admin/payments/generate/page.tsx`
6. `app/(admin)/admin/payments/settings/page.tsx`
7. `app/(admin)/admin/requests/page.tsx`
8. `app/(admin)/admin/requests/[id]/page.tsx`
9. `app/(admin)/admin/residents/[id]/page.tsx`
10. `app/(admin)/admin/residents/[id]/edit/page.tsx`
11. `app/(admin)/admin/register-resident/page.tsx`
12. `app/(admin)/admin/rooms/[id]/page.tsx`
13. `app/(admin)/admin/rules/page.tsx`
14. `app/(admin)/admin/profile/page.tsx`
15. `app/debug/page.tsx` (low priority)

## 🚀 How to Complete Migration

### Pattern 1: Simple Fetch (Most Common)
```typescript
// BEFORE:
const response = await fetch('http://127.0.0.1:8000/api/endpoint', {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  },
});
const data = await response.json();

// AFTER:
import { ApiClient } from '@/app/lib/api';
const data = await ApiClient.methodName();
```

### Pattern 2: Storage URLs
```typescript
// BEFORE:
`http://127.0.0.1:8000/storage/${filename}`

// AFTER:
import { getBaseUrl } from '@/app/lib/api';
`${getBaseUrl()}/storage/${filename}`
```

### Pattern 3: Custom Endpoint (if not in ApiClient)
```typescript
// BEFORE:
const response = await fetch('http://127.0.0.1:8000/api/custom', {...});

// AFTER:
import { getApiUrl } from '@/app/lib/api';
const API_URL = getApiUrl();
const response = await fetch(`${API_URL}/custom`, {
  ...options,
  cache: 'no-store' as RequestCache,
  credentials: 'include' as RequestCredentials,
});
```

### Pattern 4: Replace Alerts
```typescript
// BEFORE:
alert('Success!');
confirm('Are you sure?');

// AFTER:
import { showSuccess, showError, showConfirm } from '@/app/lib/sweetalert';
await showSuccess('Success!', 'Message');
const result = await showConfirm('Title', 'Message');
if (result.isConfirmed) { ... }
```

## 📋 Step-by-Step for Each File:

1. Open file
2. Add imports:
   ```typescript
   import { ApiClient, getApiUrl, getBaseUrl } from '@/app/lib/api';
   import { showSuccess, showError, showConfirm } from '@/app/lib/sweetalert';
   ```
3. Find all `http://127.0.0.1:8000` occurrences
4. Replace with appropriate pattern above
5. Replace `alert()` and `confirm()` with SweetAlert
6. Test the page
7. Commit and push

## 🎯 Priority Order:

### High Priority (User-Facing):
1. admin/dashboard - Most viewed
2. admin/payments - Critical functionality
3. admin/requests - Important for operations

### Medium Priority:
4. admin/residents/[id] - Detail pages
5. admin/rooms/[id] - Detail pages
6. admin/register-resident - Registration

### Low Priority:
7. admin/payments/settings - Configuration
8. admin/rules - Management
9. admin/profile - Settings
10. debug - Development only

## 🧪 Testing After Migration:

### Mobile Data Test:
1. Open https://management-kost.vercel.app from mobile data
2. Test each migrated feature
3. Check console for errors
4. Verify images load
5. Test CRUD operations

### WiFi Test:
1. Same tests as mobile data
2. Should work identically

## 📦 Deployment:

After migration complete:
1. `git add -A`
2. `git commit -m "Complete ApiClient migration - 100% mobile data support"`
3. `git push`
4. Vercel auto-deploys
5. Test on production

## 💡 Tips:

- Use Find & Replace in VS Code for speed
- Test one file at a time
- Commit frequently
- Check `ApiClient` methods in `app/lib/api.ts` for available methods
- If method doesn't exist, use `getApiUrl()` pattern

## 🎉 When Complete:

All features will work perfectly on:
- ✅ Mobile data
- ✅ WiFi
- ✅ Desktop
- ✅ Mobile browsers
- ✅ PWA

No more hardcoded URLs anywhere!

---

**Current Status**: 47% Complete
**Estimated Time to Finish**: 1-2 hours
**Next File**: `app/(admin)/admin/dashboard/page.tsx`
