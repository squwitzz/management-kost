# Quick Start: Network Access

Follow these steps to access the app from your mobile device.

## Step 1: Start Backend with Ngrok

```bash
# Terminal 1: Start Laravel
cd kost-backend
php artisan serve

# Terminal 2: Start Ngrok
ngrok http 8000
```

Copy the ngrok URL (e.g., `https://abc-xyz-123.ngrok-free.dev`)

## Step 2: Update Frontend Config

Edit `kost-app/.env.local`:
```
NEXT_PUBLIC_API_URL=https://YOUR-NGROK-URL.ngrok-free.dev/api
```

## Step 3: Bypass Ngrok Warning

1. Open the ngrok URL in your browser
2. Click "Visit Site" button
3. You should see Laravel welcome page or API response

## Step 4: Start Frontend

```bash
cd kost-app
npm run dev
```

## Step 5: Test on Mobile

### Option A: LocalTunnel (Recommended)

```bash
# Terminal 3: Start LocalTunnel
npx localtunnel --port 3000
```

Use the LocalTunnel URL on your mobile device.

### Option B: Network IP

1. Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. On mobile, open: `http://YOUR-IP:3000`

## Step 6: Verify

Open debug page to verify everything works:
- Localhost: http://localhost:3000/debug
- Network: http://YOUR-IP:3000/debug or LocalTunnel URL/debug

Should show "Can Reach API: ✅ YES"

## Troubleshooting

If debug page shows "❌ NO":
1. Click "Open Ngrok URL & Click Visit Site" button
2. Click "Test Again" button
3. Check Laravel server is still running
4. Check ngrok tunnel is still active

## Test Login

- Admin: 081234567890 / admin123
- User: 081234567891 / password123
