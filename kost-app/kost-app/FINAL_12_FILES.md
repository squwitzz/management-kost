# Final 12 Files - Quick Migration Guide

## ✅ Progress: 20/32 (62.5%)

### What's Done:
- ✅ ALL User Pages (7 files)
- ✅ ALL Components (4 files)  
- ✅ Admin: rooms, residents list, dashboard (4 files)
- ✅ User: dashboard, payment upload (2 files)
- ✅ Backend: CORS, API Client (3 files)

### What's Left (12 files):

```
1. app/(admin)/admin/payments/page.tsx
2. app/(admin)/admin/payments/[id]/page.tsx
3. app/(admin)/admin/payments/[id]/edit/page.tsx
4. app/(admin)/admin/payments/generate/page.tsx
5. app/(admin)/admin/payments/settings/page.tsx
6. app/(admin)/admin/register-resident/page.tsx
7. app/(admin)/admin/requests/page.tsx
8. app/(admin)/admin/requests/[id]/page.tsx
9. app/(admin)/admin/residents/[id]/page.tsx
10. app/(admin)/admin/rooms/[id]/page.tsx
11. app/(admin)/admin/rules/page.tsx
12. app/debug/page.tsx (optional)
```

## 🚀 Quick Migration Steps (5 minutes per file):

### Step 1: Add Imports (top of file)
```typescript
import { ApiClient, getApiUrl, getBaseUrl } from '@/app/lib/api';
import { showSuccess, showError, showConfirm, showDeleteConfirm } from '@/app/lib/sweetalert';
```

### Step 2: Find & Replace (VS Code: Ctrl+H)

#### Replace 1: Simple API calls
Find:
```typescript
const token = localStorage.getItem('token');
const response = await fetch('http://127.0.0.1:8000/api/ENDPOINT', {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  },
});
const data = await response.json();
```

Replace with:
```typescript
const data = await ApiClient.methodName();
```

#### Replace 2: Storage URLs
Find: `http://127.0.0.1:8000/storage/`
Replace: `${getBaseUrl()}/storage/`

#### Replace 3: Alerts
Find: `alert('message')`
Replace: `await showSuccess('Title', 'message')` or `await showError('Error', 'message')`

Find: `confirm('message')`
Replace:
```typescript
const result = await showConfirm('Title', 'message');
if (result.isConfirmed) { ... }
```

### Step 3: For Custom Endpoints (if not in ApiClient)
```typescript
import { getApiUrl } from '@/app/lib/api';

const API_URL = getApiUrl();
const response = await fetch(`${API_URL}/endpoint`, {
  ...options,
  cache: 'no-store' as RequestCache,
  credentials: 'include' as RequestCredentials,
});
```

## 📋 File-by-File Checklist:

### Admin Payments (Priority 1)
- [ ] `payments/page.tsx` - List payments
  - Replace: `fetch('/api/payments')` → `ApiClient.getAdminPayments()`
  - Replace: `fetch('/api/billing/drafts')` → Use `getApiUrl()`
  - Replace: alerts with SweetAlert

- [ ] `payments/[id]/page.tsx` - Payment detail
  - Replace: `fetch('/api/payments/${id}')` → `ApiClient.getPayment(id)`
  - Replace: `fetch('/api/payments/${id}/verify')` → Use `getApiUrl()`
  - Replace: storage URLs with `getBaseUrl()`

- [ ] `payments/[id]/edit/page.tsx` - Edit payment
  - Replace: All fetch calls with `getApiUrl()`
  - Replace: alerts with SweetAlert

- [ ] `payments/generate/page.tsx` - Generate payments
  - Replace: `fetch('/api/billing/preview')` → Use `getApiUrl()`
  - Replace: `fetch('/api/billing/generate')` → Use `getApiUrl()`

- [ ] `payments/settings/page.tsx` - Payment settings
  - Replace: `fetch('/api/billing/settings')` → `ApiClient.getPaymentSettings()`
  - Replace: PUT request → `ApiClient.updatePaymentSettings()`

### Admin Requests (Priority 2)
- [ ] `requests/page.tsx` - List requests
  - Replace: `fetch('/api/maintenance-requests')` → `ApiClient.getMaintenanceRequests()`
  - Replace: `fetch('/api/maintenance-requests/stats')` → Use `getApiUrl()`
  - Replace: PUT request → `ApiClient.updateMaintenanceRequestStatus()`

- [ ] `requests/[id]/page.tsx` - Request detail
  - Replace: `fetch('/api/maintenance-requests/${id}')` → `ApiClient.getMaintenanceRequest(id)`
  - Replace: PUT request → `ApiClient.updateMaintenanceRequestStatus()`
  - Replace: storage URLs with `getBaseUrl()`

### Admin Residents (Priority 3)
- [ ] `residents/[id]/page.tsx` - Resident detail
  - Replace: `fetch('/api/rooms')` → `ApiClient.getRooms()`
  - Replace: `fetch('/api/payments')` → `ApiClient.getAdminPayments()`
  - Replace: storage URLs with `getBaseUrl()`

- [ ] `register-resident/page.tsx` - Register new
  - Replace: `fetch('/api/rooms')` → `ApiClient.getRooms()`
  - Replace: POST request → Use `getApiUrl()` or create new ApiClient method

### Admin Rooms (Priority 4)
- [ ] `rooms/[id]/page.tsx` - Room detail
  - Replace: `fetch('/api/rooms/${id}')` → `ApiClient.getRoom(id)`
  - Replace: `fetch('/api/payments')` → `ApiClient.getAdminPayments()`
  - Replace: POST remove-resident → Use `getApiUrl()`
  - Replace: storage URLs with `getBaseUrl()`

### Admin Rules (Priority 5)
- [ ] `rules/page.tsx` - Rules management
  - Replace: `fetch('/api/peraturan/all')` → `ApiClient.getRules()`
  - Replace: POST/PUT → `ApiClient.createRule()` / `ApiClient.updateRule()`
  - Replace: DELETE → `ApiClient.deleteRule()`
  - Replace: alerts with SweetAlert

### Debug (Optional)
- [ ] `debug/page.tsx` - Keep as is or update

## 🎯 Estimated Time:
- 5 minutes per file × 11 files = 55 minutes
- Total to 100%: ~1 hour

## 💡 Pro Tips:
1. Use VS Code multi-cursor (Alt+Click) for repetitive changes
2. Use Find & Replace (Ctrl+H) with regex
3. Test one file at a time
4. Commit after each file or batch
5. Check console for errors after each change

## 🧪 Testing:
After each file:
1. Save file
2. Check for TypeScript errors
3. Test in browser (if possible)
4. Commit if working

## 📦 Final Push:
```bash
git add -A
git commit -m "Complete ApiClient migration - 100% mobile data support"
git push
```

## 🎉 When Complete:
- 100% mobile data support
- No hardcoded URLs
- Consistent error handling
- Beautiful SweetAlert modals
- Production ready!

---
**Current**: 62.5% (20/32)
**Target**: 100% (32/32)
**Remaining**: 12 files
**Time**: ~1 hour
