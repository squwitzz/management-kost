# Quick Setup: User Management Endpoints

## ✅ Files Created

1. **Controller**: `app/Http/Controllers/Api/UserController.php`
2. **Routes**: Updated `routes/api.php`
3. **Documentation**: `RESIDENT_API_ENDPOINTS.md`

## 🚀 Testing Endpoints

### 1. Test Get User
```bash
curl -X GET http://localhost:8000/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### 2. Test Update User
```bash
curl -X PUT http://localhost:8000/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "nama": "Updated Name",
    "email": "updated@example.com"
  }'
```

### 3. Test Delete User
```bash
curl -X DELETE http://localhost:8000/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

## 📝 No Migration Needed

These endpoints use existing `users` table. No database changes required.

## ✅ Features

- ✅ Admin authentication check
- ✅ Get user detail with room info
- ✅ Update user profile
- ✅ Optional password change
- ✅ Delete user (prevents deleting admins)
- ✅ Validation for all fields
- ✅ Unique email and phone validation

## 🔒 Security

- Only admin users can access these endpoints
- Admin users cannot be deleted
- Password confirmation required when updating
- JWT authentication required

## 🎯 Frontend Integration

Frontend already configured to use these endpoints via `ApiClient`:

```typescript
// Get resident
await ApiClient.getResident(userId);

// Update resident  
await ApiClient.updateResident(userId, data);

// Delete resident
await ApiClient.deleteResident(userId);
```

## ✅ Ready to Use!

Backend is now ready. Just restart Laravel server if needed:

```bash
php artisan serve
```

Frontend will work immediately after backend is running.
