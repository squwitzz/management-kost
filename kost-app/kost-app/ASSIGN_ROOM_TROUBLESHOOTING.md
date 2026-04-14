# Assign Room Feature - Troubleshooting

## Issue
Tombol "Assign Room" tidak muncul di halaman resident detail meskipun kode sudah benar.

## Root Cause Analysis

### 1. **Hydration Error**
Next.js mengalami hydration mismatch antara server-side dan client-side rendering.

### 2. **Browser/Next.js Cache**
Browser dan Next.js cache menyimpan versi lama dari JavaScript.

### 3. **Port Conflict**
Multiple dev servers running di port berbeda (3000 dan 3001).

## Solutions Attempted

### ✅ Code Changes
- Added `isClient` check: `const isClient = typeof window !== 'undefined'`
- Wrapped buttons with `{isClient && ...}`
- Added debug button untuk melihat data
- Force show buttons (removed conditional rendering)

### ✅ Cache Clearing
- Deleted `.next` folder
- Restarted dev server
- Hard refresh browser (Ctrl+F5)

### ❌ Still Not Working
Tombol masih tidak muncul bahkan setelah semua langkah di atas.

## Alternative Solution

Karena masalah ini kemungkinan besar terkait dengan Next.js caching dan hydration, solusi terbaik adalah:

### **Opsi 1: Tambahkan Tombol di Halaman Residents List**

Daripada menambahkan tombol di halaman detail, tambahkan action button di halaman residents list:

```tsx
// Di kost-app/app/(admin)/admin/residents/page.tsx
{!resident.room_id && (
  <button onClick={() => handleAssignRoom(resident.id)}>
    Assign Room
  </button>
)}
```

### **Opsi 2: Buat Halaman Terpisah untuk Assign Room**

Buat route baru: `/admin/residents/[id]/assign-room`

Keuntungan:
- Tidak ada hydration issue
- Lebih clean separation of concerns
- Easier to debug

### **Opsi 3: Use Client Component Explicitly**

Tambahkan `'use client'` directive di top file (sudah ada) dan pastikan tidak ada server-side rendering:

```tsx
'use client';

import { useEffect, useState } from 'react';
// ... rest of imports

export default function ResidentDetailPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  // ... rest of component
}
```

## Recommended Next Steps

1. **Implement Opsi 1** - Tambahkan tombol di residents list page
2. **Test di production** - Deploy ke Vercel dan test
3. **Jika masih gagal** - Implement Opsi 2 (separate page)

## Backend Already Ready

Backend endpoint sudah siap dan tested:
- ✅ `POST /api/admin/users/{id}/assign-room`
- ✅ Validation works
- ✅ Room status updates correctly

Yang kurang hanya UI button di frontend.

---

**Status:** In Progress
**Last Updated:** April 2026
**Priority:** Medium (workaround available)
