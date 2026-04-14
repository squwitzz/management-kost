# Payment Upload 401 Unauthorized Debug Guide

## Status: 🔍 DEBUGGING - DIAGNOSTIC SCRIPT CREATED

## Problem Summary
User berhasil login dan token tersimpan di localStorage, tapi ketika akses halaman upload payment, mendapat error 401 Unauthorized dari backend.

## Evidence from Console Log
```
✅ Token exists in localStorage: true
✅ Token preview: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUz...
✅ getHeaders - Authorization header set
❌ Payment response status: 401
❌ Payment fetch error: {"error":"Unauthorized"}
```

## 🚀 IMMEDIATE ACTION REQUIRED

### Step 1: Run JWT Diagnostic Script

I've created a diagnostic script at `kost-backend/public/test-jwt-debug.php`.

**Upload this file to your cPanel:**
1. Upload `kost-backend/public/test-jwt-debug.php` to `public_html/api/test-jwt-debug.php`
2. Open this URL in your browser:
   ```
   https://mykost-cendana.xyz/test-jwt-debug.php?token=YOUR_TOKEN_HERE
   ```
3. Replace `YOUR_TOKEN_HERE` with the actual token from localStorage

**Your token is:**
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL215a29zdC1jZW5kYW5hLnh5ei9hcGkvbG9naW4iLCJpYXQiOjE3NzYxNzE3NTgsImV4cCI6MTc3NjE3NTM1OCwibmJmIjoxNzc2MTcxNzU4LCJqdGkiOiJGeTRkTVBmektSbUNWVFVIIiwic3ViIjoiOSIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.nPZ8sb4NkCH_05fH105g6ce82zSn5DlLF5ZbOi7K3Q8
```

**Full URL to test:**
```
https://mykost-cendana.xyz/test-jwt-debug.php?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL215a29zdC1jZW5kYW5hLnh5ei9hcGkvbG9naW4iLCJpYXQiOjE3NzYxNzE3NTgsImV4cCI6MTc3NjE3NTM1OCwibmJmIjoxNzc2MTcxNzU4LCJqdGkiOiJGeTRkTVBmektSbUNWVFVIIiwic3ViIjoiOSIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.nPZ8sb4NkCH_05fH105g6ce82zSn5DlLF5ZbOi7K3Q8
```

### Step 2: Share the Result

Copy the entire JSON output from the diagnostic script and share it with me. This will tell us:
- ✅ Is JWT_SECRET configured correctly?
- ✅ Is the token expired?
- ✅ Is the token signature valid?
- ✅ Does the user exist in database?
- ✅ What is the exact JWT error?

---

## 🔍 TOKEN ANALYSIS (Decoded)

I've decoded your token and found:
- **User ID**: 9
- **Issued At**: 14/04/2026, 20:02:38
- **Expires At**: 14/04/2026, 21:02:38
- **Current Time**: 14/04/2026, 20:16:24
- **Is Expired**: ❌ NO (still valid for 46 minutes)
- **Token Format**: ✅ Valid JWT structure

## 🎯 LIKELY ROOT CAUSES

Since the token is NOT expired and has valid structure, the 401 error is likely caused by:

### Cause 1: JWT_SECRET Mismatch (MOST LIKELY)
The backend is using a different JWT_SECRET to validate the token than what was used to generate it during login.

**Solution:**
```bash
# SSH to cPanel backend
cd ~/public_html/api  # or wherever your backend is
php artisan jwt:secret --force
php artisan config:clear
php artisan cache:clear
php artisan config:cache
```

**IMPORTANT**: After running these commands, ALL users must login again because all existing tokens will be invalid.

### Cause 2: Authorization Issue (Payment doesn't belong to user)
Payment ID 19 might not belong to User ID 9.

**To check:**
```sql
-- Run this in phpMyAdmin or MySQL console
SELECT id, user_id, bulan_dibayar, status_bayar 
FROM payments 
WHERE id = 19;
```

If `user_id` is NOT 9, then this is an authorization issue, not authentication.

### Cause 3: Backend Cache Issue
Laravel might be caching old JWT configuration.

**Solution:**
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

## Root Cause Analysis

Token DIKIRIM dengan benar dari frontend, tapi backend MENOLAK token tersebut. Kemungkinan penyebab:

### 1. JWT Secret Key Mismatch (MOST LIKELY)
Backend menggunakan JWT_SECRET yang berbeda untuk:
- Generate token (saat login) ✅ Works
- Validate token (saat API call) ❌ Fails

### 2. Token Expired Immediately
Token di-generate dengan TTL yang salah atau clock skew antara server.

### 3. JWT Configuration Issue
Ada masalah dengan konfigurasi JWT di backend (blacklist, leeway, dll).

## Backend Checks Required

### Check 1: JWT Secret in .env
```bash
# SSH ke cPanel atau check file .env di backend
cat .env | grep JWT_SECRET
```

**Expected:**
```
JWT_SECRET=base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**If missing or different:**
```bash
# Generate new secret
php artisan jwt:secret

# This will add JWT_SECRET to .env
```

### Check 2: JWT TTL Configuration
```bash
cat .env | grep JWT_TTL
```

**Expected:**
```
JWT_TTL=60  # 60 minutes
```

### Check 3: Check Laravel Logs
```bash
# Check backend logs for JWT errors
tail -f storage/logs/laravel.log
```

Look for errors like:
- "Token Signature could not be verified"
- "Token has expired"
- "Token could not be parsed"

### Check 4: Test Token Validation Directly
Create a test file `public/test-jwt.php`:

```php
<?php
require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Tymon\JWTAuth\Facades\JWTAuth;

$token = "PASTE_TOKEN_HERE";

try {
    JWTAuth::setToken($token);
    $payload = JWTAuth::getPayload();
    echo "✅ Token is valid!\n";
    echo "User ID: " . $payload->get('sub') . "\n";
    echo "Expires: " . date('Y-m-d H:i:s', $payload->get('exp')) . "\n";
} catch (\Exception $e) {
    echo "❌ Token validation failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
}
```

Access: `https://mykost-cendana.xyz/test-jwt.php`

## Quick Fix Options

### Option 1: Regenerate JWT Secret (RECOMMENDED)
```bash
# SSH to backend
cd /path/to/kost-backend
php artisan jwt:secret --force
php artisan config:clear
php artisan cache:clear
```

**Note:** This will invalidate ALL existing tokens. All users need to login again.

### Option 2: Increase JWT Leeway
If clock skew issue, add to `.env`:
```
JWT_LEEWAY=300  # 5 minutes tolerance
```

### Option 3: Disable JWT Blacklist Temporarily
Add to `.env`:
```
JWT_BLACKLIST_ENABLED=false
```

### Option 4: Extend Token TTL
Add to `.env`:
```
JWT_TTL=1440  # 24 hours instead of 1 hour
```

## Frontend Workaround (Temporary)

While backend is being fixed, we can add auto-retry with re-login:

```typescript
// In api.ts - Add token refresh logic
static async getPayment(paymentId: number) {
  try {
    const response = await fetchWithAuth(`${API_URL}/payments/${paymentId}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      // If 401, try to refresh token or re-login
      if (response.status === 401) {
        // Option 1: Redirect to login
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }
    
    return response.json();
  } catch (error) {
    throw error;
  }
}
```

## Testing Steps

### After Backend Fix:
1. Clear localStorage
2. Login again (get new token with correct secret)
3. Try upload payment
4. Should work now

### Verify Fix:
1. Check console - should see ✅ for all steps
2. Check Network tab - response should be 200, not 401
3. Payment details should load successfully

## Expected Console Output After Fix

```
=== UPLOAD PAGE AUTH CHECK ===
✅ Token exists: true
✅ User parsed successfully
✅ User role: Penghuni
✅ Auth check passed, setting user

=== FETCHING PAYMENT DETAIL ===
✅ Token exists, calling API...

=== GET PAYMENT API CALL ===
✅ Token exists in localStorage: true
✅ getHeaders - Authorization header set
✅ Payment response status: 200
✅ Payment data received: {...}
✅ All checks passed, setting payment
```

## Next Steps

1. **Check backend .env file** - Verify JWT_SECRET exists
2. **Check backend logs** - Look for JWT errors
3. **Test token validation** - Use test-jwt.php script
4. **Regenerate JWT secret if needed** - php artisan jwt:secret --force
5. **Clear all caches** - php artisan config:clear && php artisan cache:clear
6. **Test again** - Login and try upload payment

## 🚀 QUICK FIX (Try This First)

Based on the token analysis, try this sequence:

### Option A: Clear Backend Cache (Safest - Won't invalidate tokens)
```bash
cd ~/public_html/api
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### Option B: Regenerate JWT Secret (Will invalidate all tokens)
```bash
cd ~/public_html/api
php artisan jwt:secret --force
php artisan config:clear
php artisan cache:clear
php artisan config:cache
```
**Note**: After this, you MUST login again.

### Option C: Check Payment Ownership
Run this SQL query to verify payment belongs to user:
```sql
SELECT p.id, p.user_id, u.nama, p.bulan_dibayar, p.status_bayar
FROM payments p
LEFT JOIN users u ON p.user_id = u.id
WHERE p.id = 19;
```

Expected result: `user_id` should be `9` (your user ID)

If `user_id` is different, then you're trying to access someone else's payment!

## 📊 What to Share With Me

Please share:
1. Output from `test-jwt-debug.php` URL
2. Result of SQL query checking payment ownership
3. Any error messages from `storage/logs/laravel.log`

This will help me pinpoint the exact issue.

## Contact Backend Admin

If you don't have SSH access to backend, contact backend admin and ask them to:
1. Check if JWT_SECRET is set in .env
2. Run: `php artisan jwt:secret` if not set
3. Run: `php artisan config:clear`
4. Run: `php artisan cache:clear`
5. Check storage/logs/laravel.log for JWT errors

---
**Created:** April 14, 2026
**Updated:** April 14, 2026 20:16
**Status:** Awaiting diagnostic results
**Priority:** HIGH - Blocks payment upload functionality
**Token Status:** ✅ Valid (not expired)
**User ID:** 9
**Payment ID:** 19
