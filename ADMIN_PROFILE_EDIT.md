# Admin Profile Edit Feature

Halaman admin untuk mengedit profile (username/nama) dan mengubah password.

## Fitur

### 1. Edit Profile Information
- Update nama lengkap
- Update email address
- Update nomor telepon
- Auto-save ke localStorage setelah update berhasil

### 2. Change Password
- Validasi current password
- Set new password (minimum 6 karakter)
- Konfirmasi password baru
- Password visibility toggle
- Clear form setelah berhasil

## File yang Dibuat/Diubah

### File Baru
- `app/(admin)/admin/profile/page.tsx` - Halaman admin profile dengan tabs

### File yang Diupdate
- `app/components/AdminHeader.tsx` - Tambah link "Profile" di desktop nav
- `app/components/AdminBottomNav.tsx` - Tambah menu "Profile" di mobile bottom nav
- `app/lib/api.ts` - Tambah methods `updateProfile()` dan `changePassword()`

## API Endpoints

### Update Profile
```
POST /api/profile/update
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "nama": "string",
  "email": "string",
  "nomor_telepon": "string"
}

Response:
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

### Change Password
```
POST /api/change-password
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "current_password": "string",
  "new_password": "string",
  "new_password_confirmation": "string"
}

Response:
{
  "message": "Password changed successfully"
}
```

## Cara Menggunakan

### Akses Halaman Profile
1. Login sebagai Admin
2. Klik "Profile" di header (desktop) atau bottom nav (mobile)
3. Atau akses langsung: `/admin/profile`

### Edit Profile
1. Pilih tab "Profile Information"
2. Edit field yang ingin diubah:
   - Full Name (required)
   - Email Address (optional)
   - Phone Number (required)
3. Klik "Update Profile"
4. Success message akan muncul jika berhasil

### Change Password
1. Pilih tab "Change Password"
2. Masukkan current password
3. Masukkan new password (min. 6 karakter)
4. Konfirmasi new password
5. Klik "Change Password"
6. Form akan clear otomatis jika berhasil

## UI Features

### Tabs
- Profile Information tab
- Change Password tab
- Active tab indicator dengan border bawah

### Form Fields
- Clean, modern input design
- Placeholder text untuk guidance
- Required field validation
- Password visibility toggle (eye icon)

### Feedback
- Success message (green background)
- Error message (red background)
- Loading state pada button
- Disabled button saat loading

### Responsive Design
- Desktop: Full width form dengan max-width
- Mobile: Optimized untuk layar kecil
- Bottom navigation untuk mobile
- Header navigation untuk desktop

## Security Features

1. **Authentication Required**
   - Menggunakan `useAuth('Admin')` hook
   - Auto redirect ke login jika tidak authenticated
   - Role-based access (hanya Admin)

2. **Password Validation**
   - Current password verification di backend
   - Minimum 6 karakter untuk new password
   - Password confirmation matching
   - Password hashing di backend (bcrypt)

3. **Token-based API Calls**
   - Semua request menggunakan Bearer token
   - Auto handle 401 Unauthorized
   - Redirect ke login jika token expired

## Error Handling

### Profile Update Errors
- Invalid email format
- Phone number validation
- Network errors
- Unauthorized access

### Password Change Errors
- Current password incorrect
- New password too short
- Passwords don't match
- Network errors

## Testing Scenarios

### Test Profile Update
1. Login sebagai Admin
2. Akses `/admin/profile`
3. Update nama dan phone number
4. Submit form
5. Verify: Success message muncul
6. Verify: Data tersimpan di localStorage
7. Refresh page → Data tetap updated

### Test Password Change
1. Login sebagai Admin
2. Akses `/admin/profile`
3. Pilih tab "Change Password"
4. Masukkan current password yang salah
5. Submit → Error: "Current password is incorrect"
6. Masukkan current password yang benar
7. Masukkan new password (min 6 char)
8. Konfirmasi password
9. Submit → Success message
10. Logout dan login dengan password baru

### Test Validation
1. Try submit empty form → Required field errors
2. Try password < 6 chars → Validation error
3. Try mismatched passwords → Error message
4. Try invalid email format → Validation error

## Code Example

### Using ApiClient
```typescript
import { ApiClient } from '@/app/lib/api';

// Update profile
const data = await ApiClient.updateProfile({
  nama: 'John Doe',
  email: 'john@example.com',
  nomor_telepon: '081234567890'
});

// Change password
await ApiClient.changePassword({
  current_password: 'oldpass123',
  new_password: 'newpass123',
  new_password_confirmation: 'newpass123'
});
```

### Using in Component
```typescript
import { useAuth } from '@/app/lib/useAuth';

export default function ProfilePage() {
  const { isAuthenticated, isLoading, user } = useAuth('Admin');
  
  if (isLoading) return <div>Loading...</div>;
  
  // Render profile form
}
```

## Navigation

### Desktop
- Header menu: Dashboard | Rooms | Residents | Payments | Requests | Profile | Logout

### Mobile
- Bottom nav: Dashboard | Rooms | Payments | Requests | Profile
- 5 menu items dengan icon dan label

## Best Practices

1. **Always validate input** - Client-side dan server-side
2. **Show clear feedback** - Success/error messages
3. **Clear sensitive data** - Clear password form after success
4. **Update localStorage** - Sync user data after profile update
5. **Handle errors gracefully** - Show user-friendly error messages
6. **Use loading states** - Disable buttons during API calls
7. **Secure password handling** - Never log or expose passwords

## Future Enhancements

1. Upload profile photo
2. Email verification
3. Two-factor authentication
4. Password strength indicator
5. Activity log (last login, password changes)
6. Account deletion option
7. Export user data
