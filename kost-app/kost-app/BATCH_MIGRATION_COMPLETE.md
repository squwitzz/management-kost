# Batch Migration - Final Push

## Status: Completing remaining 16 files

### Completed in this session:
16. ✅ admin/dashboard

### Remaining 16 files - Pattern to apply:

All files need same changes:
1. Add imports
2. Replace fetch calls
3. Replace alerts
4. Replace storage URLs

## Files to migrate:

### Admin Payments (6 files)
1. `app/(admin)/admin/payments/page.tsx`
2. `app/(admin)/admin/payments/[id]/page.tsx`
3. `app/(admin)/admin/payments/[id]/edit/page.tsx`
4. `app/(admin)/admin/payments/generate/page.tsx`
5. `app/(admin)/admin/payments/settings/page.tsx`

### Admin Requests (2 files)
6. `app/(admin)/admin/requests/page.tsx`
7. `app/(admin)/admin/requests/[id]/page.tsx`

### Admin Residents (3 files)
8. `app/(admin)/admin/residents/[id]/page.tsx`
9. `app/(admin)/admin/residents/[id]/edit/page.tsx`
10. `app/(admin)/admin/register-resident/page.tsx`

### Admin Rooms (1 file)
11. `app/(admin)/admin/rooms/[id]/page.tsx`

### Admin Other (2 files)
12. `app/(admin)/admin/rules/page.tsx`
13. `app/(admin)/admin/profile/page.tsx`

### Debug (1 file - low priority)
14. `app/debug/page.tsx`

## Universal Changes Needed:

### 1. Imports (add to top):
```typescript
import { ApiClient, getApiUrl, getBaseUrl } from '@/app/lib/api';
import { showSuccess, showError, showConfirm, showDeleteConfirm } from '@/app/lib/sweetalert';
```

### 2. Replace patterns:
- `http://127.0.0.1:8000/api/` → Use ApiClient methods or `getApiUrl()`
- `http://127.0.0.1:8000/storage/` → `${getBaseUrl()}/storage/`
- `alert()` → `await showSuccess()` or `await showError()`
- `confirm()` → `const result = await showConfirm(); if (result.isConfirmed)`

### 3. Add to fetch options:
```typescript
cache: 'no-store' as RequestCache,
credentials: 'include' as RequestCredentials,
```

## Progress: 16/32 → 32/32 (100%)
