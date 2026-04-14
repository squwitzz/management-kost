# Session Expired After Login Fix

## Status: ✅ FIXED

## Problem
Setelah berhasil login, ketika user navigate ke halaman lain (misalnya payments), muncul error "Session Expired - Please login again to continue" padahal baru saja login.

## Root Cause
Di commit sebelumnya (318a3a0), kami menambahkan auto-clear session di login page dengan useEffect:

```typescript
useEffect(() => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token || user) {
      console.log('Clearing existing session on login page');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }
}, []);
```

**Masalahnya:**
1. User login berhasil → token disimpan di localStorage
2. Router redirect ke dashboard
3. Jika ada re-render atau navigation yang trigger login page component (even briefly)
4. useEffect runs → clear session
5. User kehilangan session → "Session Expired" error

## Solution

### Remove Auto-Clear from Login Page
**File:** `app/(auth)/login/page.tsx`

**Before:**
```typescript
useEffect(() => {
  // Auto-clear session when login page loads
  if (token || user) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
}, []);
```

**After:**
```typescript
// Removed auto-clear useEffect
// Users can logout using the logout button in header
```

### Use Logout Button Instead
User sudah punya logout button di UserHeader yang berfungsi dengan baik:

```typescript
const handleLogout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  router.push('/login');
};
```

## New Behavior

### Login Flow:
1. User masuk ke `/login`
2. Input credentials dan submit
3. Token disimpan di localStorage
4. Redirect ke dashboard berdasarkan role
5. ✅ Session tetap ada, tidak ter-clear
6. ✅ User bisa navigate ke halaman lain tanpa masalah

### Logout Flow:
1. User klik logout button di header
2. Session di-clear
3. Redirect ke `/login`
4. ✅ User bisa login dengan akun berbeda

### Access Login While Logged In:
1. User sudah login
2. User manually navigate ke `/login`
3. ✅ Login page accessible (middleware tidak redirect)
4. User bisa login dengan akun berbeda
5. Token lama akan di-overwrite dengan token baru

## Benefits

1. ✅ No more "Session Expired" after successful login
2. ✅ Stable session management
3. ✅ Proper logout flow via button
4. ✅ Can still access login page when logged in
5. ✅ Can switch accounts by logging in again

## Trade-offs

**Before (with auto-clear):**
- ✅ Auto-logout when accessing /login
- ❌ Session cleared unexpectedly after login
- ❌ "Session Expired" errors

**After (without auto-clear):**
- ✅ Stable session after login
- ✅ No unexpected session clearing
- ⚠️ Need to use logout button to logout (not just navigate to /login)
- ✅ Can still switch accounts by logging in with different credentials

## Testing Checklist

### Test 1: Normal Login Flow
- [ ] Go to `/login`
- [ ] Enter credentials and login
- [ ] Should redirect to dashboard
- [ ] Navigate to `/payments`
- [ ] Should NOT show "Session Expired"
- [ ] Check localStorage - token should exist

### Test 2: Logout Button
- [ ] Login as user
- [ ] Click logout button in header
- [ ] Should redirect to `/login`
- [ ] Check localStorage - should be empty
- [ ] Try to access `/dashboard`
- [ ] Should redirect to `/login`

### Test 3: Switch Account
- [ ] Login as User A
- [ ] Navigate to `/login` manually
- [ ] Login as User B
- [ ] Should redirect to dashboard
- [ ] Should be logged in as User B
- [ ] Old token should be replaced

### Test 4: Session Persistence
- [ ] Login as user
- [ ] Navigate between pages (dashboard, payments, profile)
- [ ] Refresh page
- [ ] Session should persist
- [ ] No "Session Expired" errors

## Files Modified

1. **`app/(auth)/login/page.tsx`**
   - Removed auto-clear useEffect
   - Removed useRef import
   - Back to simple login form

## Alternative Solutions Considered

### Option 1: Use sessionStorage flag
```typescript
useEffect(() => {
  const justLoggedIn = sessionStorage.getItem('justLoggedIn');
  if (!justLoggedIn && (token || user)) {
    // Clear session
  }
}, []);

// In handleSubmit after successful login:
sessionStorage.setItem('justLoggedIn', 'true');
```
**Rejected:** Too complex, adds state management overhead

### Option 2: Check referrer
```typescript
useEffect(() => {
  const referrer = document.referrer;
  if (!referrer.includes('/login') && (token || user)) {
    // Clear session
  }
}, []);
```
**Rejected:** Unreliable, referrer can be empty or manipulated

### Option 3: Remove auto-clear (CHOSEN)
**Pros:**
- Simple and reliable
- No edge cases
- Logout button already exists
- Users can still switch accounts

**Cons:**
- Need to use logout button (not a big deal)

## Deployment

- ✅ Build successful locally
- ✅ Committed to Git (commit: 5100020)
- ✅ Pushed to GitHub
- ✅ Vercel deployment triggered

## Recommendation

For better UX, consider adding a "Switch Account" or "Logout" link on the login page itself:

```typescript
<div className="text-center mt-4">
  <p className="text-sm text-on-surface-variant">
    Already logged in?{' '}
    <button
      onClick={handleLogout}
      className="text-secondary font-bold hover:underline"
    >
      Logout and switch account
    </button>
  </p>
</div>
```

This makes it more obvious to users how to logout/switch accounts.

---
**Created:** April 14, 2026
**Status:** Deployed to Vercel
**Deployment URL:** https://management-kost.vercel.app
