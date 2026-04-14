# ⚡ Quick Guide: Update Vercel Environment Variables

## 🎯 What You Need to Do

Update environment variables di Vercel untuk connect ke backend cPanel.

---

## 📝 Step-by-Step

### 1. Open Vercel Dashboard

Go to: https://vercel.com/dashboard

### 2. Select Your Project

Click on: **management-kost**

### 3. Go to Settings

Click: **Settings** tab

### 4. Open Environment Variables

Click: **Environment Variables** in left sidebar

### 5. Update/Add Variables

#### Variable 1: API URL

- Click **Add New** (or Edit if exists)
- **Name**: `NEXT_PUBLIC_API_URL`
- **Value**: `http://mykost-cendana.xyz/api`
- **Environments**: 
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- Click **Save**

#### Variable 2: App URL

- Click **Add New**
- **Name**: `NEXT_PUBLIC_APP_URL`
- **Value**: `https://management-kost.vercel.app`
- **Environments**:
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- Click **Save**

### 6. Redeploy

After saving environment variables:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **"..."** (three dots)
4. Click **"Redeploy"**
5. Wait 2-3 minutes

---

## ✅ Verification

### 1. Check Deployment

Wait for deployment to finish (status: "Ready")

### 2. Test Login

1. Go to: https://management-kost.vercel.app/login
2. Open Browser DevTools (F12)
3. Go to **Network** tab
4. Try to login
5. Check request URL should be: `http://mykost-cendana.xyz/api/login`

### 3. Check Response

- ✅ Status 200 or 401 = Good (backend responding)
- ❌ Network error = Problem (check backend/CORS)

---

## 🐛 If Still Not Working

### Check 1: Environment Variables

Verify in Vercel Dashboard:
- Settings > Environment Variables
- Both variables exist
- Values are correct
- All environments checked

### Check 2: Redeploy

Make sure you redeployed after adding env vars:
- Deployments > Latest > Redeploy

### Check 3: Backend

Test backend directly:
```
http://mykost-cendana.xyz/api/health
```

Should return JSON (not 404)

### Check 4: CORS

Backend must allow Vercel domain.
Check `config/cors.php` includes:
```php
'https://management-kost.vercel.app'
```

---

## 📸 Visual Guide

### Step 1: Vercel Dashboard
```
vercel.com/dashboard
↓
Click "management-kost"
```

### Step 2: Settings
```
Settings tab
↓
Environment Variables (sidebar)
```

### Step 3: Add Variable
```
Add New
↓
Name: NEXT_PUBLIC_API_URL
Value: http://mykost-cendana.xyz/api
Environments: All ✅
↓
Save
```

### Step 4: Redeploy
```
Deployments tab
↓
Latest deployment > "..." > Redeploy
```

---

## ⏱️ Timeline

- Add env vars: **1 minute**
- Redeploy: **2-3 minutes**
- Test: **1 minute**
- **Total: ~5 minutes**

---

## 🎉 Success Indicators

✅ Vercel deployment status: "Ready"
✅ Login page loads
✅ Network tab shows requests to mykost-cendana.xyz
✅ No CORS errors in console
✅ Can login successfully

---

## 🆘 Need Help?

If stuck, check:
1. Environment variables spelling (exact match)
2. Redeployed after adding vars
3. Backend is accessible
4. CORS configured correctly

---

**Current Status**: ⚠️ Waiting for Vercel env vars update

**Action**: Set environment variables in Vercel Dashboard

**Expected Result**: App connects to cPanel backend

**Time**: ~5 minutes
