# Fix: HTTP 401 Error pada Insert Peraturan

## Problem
Saat mencoba insert data peraturan, muncul error:
```
HTTP error! status: 401
```

## Root Cause
Controller `PeraturanController` menggunakan method authentication yang salah:
- ❌ Menggunakan `remember_token` untuk mencari user
- ✅ Seharusnya menggunakan JWT token authentication

## Solution

### 1. Update PeraturanController
File: `kost-backend/app/Http/Controllers/Api/PeraturanController.php`

**Before:**
```php
private function getAuthenticatedUser(Request $request)
{
    $token = $request->bearerToken();
    if (!$token) {
        return null;
    }

    $user = \App\Models\User::where('remember_token', $token)->first();
    return $user;
}
```

**After:**
```php
use Tymon\JWTAuth\Facades\JWTAuth;

private function getAuthenticatedUser(Request $request)
{
    try {
        $token = $request->bearerToken();
        if (!$token) {
            return null;
        }

        JWTAuth::setToken($token);
        $payload = JWTAuth::getPayload();
        $userId = $payload->get('sub');
        
        return \App\Models\User::find($userId);
    } catch (\Exception $e) {
        return null;
    }
}
```

### 2. Add ngrok-skip-browser-warning Header
File: `kost-app/app/(admin)/admin/rules/page.tsx`

Tambahkan header ini di semua fetch requests:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true', // Add this
}
```

### 3. Add 401 Error Handling
Tambahkan handling untuk session expired:
```typescript
if (!response.ok) {
  if (response.status === 401) {
    // Session expired, redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/login';
    return;
  }
  throw new Error('Failed to save');
}
```

## Files Changed

### Backend
- ✅ `kost-backend/app/Http/Controllers/Api/PeraturanController.php`
  - Updated `getAuthenticatedUser()` method
  - Added JWT authentication
  - Added try-catch for error handling

### Frontend
- ✅ `kost-app/app/(admin)/admin/rules/page.tsx`
  - Added `ngrok-skip-browser-warning` header
  - Added 401 error handling in `fetchPeraturan()`
  - Added 401 error handling in `handleSubmit()`
  - Added 401 error handling in `handleDelete()`
  - Added 401 error handling in `handleToggleActive()`

- ✅ `kost-app/app/(dashboard)/rules/page.tsx`
  - Added `ngrok-skip-browser-warning` header
  - Added 401 error handling in `fetchPeraturan()`

## Testing

### Test Insert Data
1. Login sebagai Admin
2. Go to `/admin/rules`
3. Click "Add Rule"
4. Fill form:
   - Judul: "Test Rule"
   - Deskripsi: "Test description"
   - Kategori: "Umum"
5. Click "Save"
6. ✅ Should show success message
7. ✅ New rule should appear in list

### Test Update Data
1. Click edit icon on any rule
2. Change judul or deskripsi
3. Click "Save"
4. ✅ Should show success message
5. ✅ Changes should be reflected

### Test Delete Data
1. Click delete icon on any rule
2. Confirm deletion
3. ✅ Should show success message
4. ✅ Rule should be removed from list

### Test Toggle Status
1. Click status badge (Active/Inactive)
2. ✅ Status should toggle immediately
3. ✅ No error should occur

## Common Issues

### Issue 1: Still getting 401 after fix
**Solution:**
- Clear browser cache
- Logout and login again
- Check if token is valid in localStorage
- Verify JWT secret in `.env` matches

### Issue 2: Token expired
**Solution:**
- Login again to get new token
- Check token expiration time in backend config
- Implement token refresh mechanism

### Issue 3: CORS error
**Solution:**
- Check `config/cors.php` in backend
- Ensure frontend URL is in allowed origins
- Verify headers are properly set

## Prevention

To prevent similar issues in the future:

1. **Use consistent authentication method** across all controllers
2. **Copy authentication code** from working controllers (like AuthController)
3. **Always add error handling** for 401 responses
4. **Test authentication** before implementing CRUD operations
5. **Add ngrok-skip-browser-warning** header for all API calls

## Related Files

- `kost-backend/app/Http/Controllers/Api/AuthController.php` - Reference for correct JWT auth
- `kost-backend/app/Http/Controllers/Api/PaymentController.php` - Another example
- `kost-app/app/lib/api.ts` - API client with fetchWithAuth wrapper

## Notes

- JWT authentication is the standard method used in this project
- All controllers should use the same authentication pattern
- Frontend should handle 401 errors gracefully with redirect to login
- Always test authentication before testing CRUD operations
