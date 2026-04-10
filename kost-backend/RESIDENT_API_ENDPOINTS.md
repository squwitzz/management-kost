# Resident Management API Endpoints

Backend API endpoints yang diperlukan untuk fitur resident management.

## Required Endpoints

### 1. Get Resident Detail
```
GET /api/admin/users/{id}
```

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "nama": "John Doe",
    "nomor_telepon": "08123456789",
    "email": "john@example.com",
    "alamat": "Jl. Example No. 123",
    "tanggal_lahir": "1990-01-01",
    "jenis_kelamin": "Laki-laki",
    "pekerjaan": "Software Engineer",
    "kontak_darurat": "08987654321",
    "role": "Penghuni",
    "room": {
      "id": 1,
      "nomor_kamar": "101"
    }
  }
}
```

### 2. Update Resident
```
PUT /api/admin/users/{id}
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "nama": "John Doe Updated",
  "nomor_telepon": "08123456789",
  "email": "john@example.com",
  "alamat": "Jl. Example No. 123",
  "tanggal_lahir": "1990-01-01",
  "jenis_kelamin": "Laki-laki",
  "pekerjaan": "Software Engineer",
  "kontak_darurat": "08987654321",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Note:** Password fields are optional. Only include if changing password.

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "nama": "John Doe Updated",
    ...
  }
}
```

### 3. Delete Resident
```
DELETE /api/admin/users/{id}
```

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

## Laravel Implementation

### Routes (routes/api.php)

```php
Route::middleware(['auth:api', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});
```

### Controller (app/Http/Controllers/Api/UserController.php)

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Get user detail
     */
    public function show($id)
    {
        $user = User::with('room')->find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'user' => $user
        ]);
    }

    /**
     * Update user
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        $rules = [
            'nama' => 'sometimes|string|max:255',
            'nomor_telepon' => 'sometimes|string|unique:users,nomor_telepon,' . $id,
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'alamat' => 'nullable|string',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:Laki-laki,Perempuan',
            'pekerjaan' => 'nullable|string',
            'kontak_darurat' => 'nullable|string',
            'password' => 'nullable|string|min:6|confirmed',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update user data
        $user->fill($request->except(['password', 'password_confirmation']));

        // Update password if provided
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Delete user
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        // Prevent deleting admin users
        if ($user->role === 'Admin') {
            return response()->json([
                'message' => 'Cannot delete admin user'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
```

### Middleware (app/Http/Middleware/AdminMiddleware.php)

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check() || auth()->user()->role !== 'Admin') {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        return $next($request);
    }
}
```

### Register Middleware (app/Http/Kernel.php)

```php
protected $middlewareAliases = [
    // ... other middleware
    'admin' => \App\Http\Middleware\AdminMiddleware::class,
];
```

## Testing

### Test Get User
```bash
curl -X GET http://localhost:8000/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### Test Update User
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

### Test Delete User
```bash
curl -X DELETE http://localhost:8000/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

## Error Responses

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 403 Forbidden
```json
{
  "message": "Unauthorized. Admin access required."
}
```

### 422 Validation Error
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```

## Security Notes

1. Only admin users can access these endpoints
2. Admin users cannot be deleted
3. Password must be confirmed when updating
4. Unique validation for email and phone number
5. All requests require authentication token

## Frontend Integration

The frontend already uses these endpoints via `ApiClient`:

```typescript
// Get resident
await ApiClient.getResident(userId);

// Update resident
await ApiClient.updateResident(userId, data);

// Delete resident
await ApiClient.deleteResident(userId);
```

## Next Steps

1. Create UserController.php in backend
2. Add routes to api.php
3. Create AdminMiddleware
4. Test endpoints
5. Deploy backend
6. Test from frontend
