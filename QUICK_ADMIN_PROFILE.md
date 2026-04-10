# Quick Guide: Admin Profile Edit

## Akses
- URL: `/admin/profile`
- Menu: Header (desktop) atau Bottom Nav (mobile)
- Auth: Admin only

## Fitur

### Tab 1: Profile Information
Edit data admin:
- Nama lengkap (required)
- Email (optional)
- Nomor telepon (required)

### Tab 2: Change Password
Ganti password:
- Current password (required)
- New password (min 6 char)
- Confirm new password

## API Methods

```typescript
import { ApiClient } from '@/app/lib/api';

// Update profile
await ApiClient.updateProfile({
  nama: 'Admin Name',
  email: 'admin@example.com',
  nomor_telepon: '081234567890'
});

// Change password
await ApiClient.changePassword({
  current_password: 'oldpass',
  new_password: 'newpass',
  new_password_confirmation: 'newpass'
});
```

## File Changes

### New Files
- `app/(admin)/admin/profile/page.tsx`

### Updated Files
- `app/components/AdminHeader.tsx` - Added Profile link
- `app/components/AdminBottomNav.tsx` - Added Profile menu
- `app/lib/api.ts` - Added updateProfile() & changePassword()

## Features
- ✅ Tab navigation (Profile / Password)
- ✅ Form validation
- ✅ Password visibility toggle
- ✅ Success/error messages
- ✅ Loading states
- ✅ Auto-save to localStorage
- ✅ Responsive design
- ✅ Auth guard (Admin only)

## Testing
1. Login as Admin
2. Go to Profile page
3. Update name → Success
4. Change password → Success
5. Logout & login with new password → Success
