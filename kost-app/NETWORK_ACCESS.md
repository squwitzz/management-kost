# Network Access Guide

This guide explains how to access the Kost app from other devices on your network (e.g., testing on mobile phone).

## Problem

When accessing the app from network (e.g., http://192.168.1.100:3000), login fails with "Failed to fetch" error.

## Root Cause

Ngrok free tier only allows 1 tunnel at a time. You can expose either:
- Backend (Laravel API) via ngrok, OR
- Frontend (Next.js) via ngrok

But NOT both simultaneously.

## Solution Options

### Option 1: Ngrok Backend + LocalTunnel Frontend (RECOMMENDED)

This is the best solution for testing on mobile devices.

1. **Start Laravel backend with ngrok:**
   ```bash
   cd kost-backend
   php artisan serve
   # In another terminal:
   ngrok http 8000
   ```

2. **Update frontend API URL:**
   - Copy the ngrok URL (e.g., `https://abc123.ngrok-free.dev`)
   - Edit `kost-app/.env.local`:
     ```
     NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.dev/api
     ```

3. **Bypass ngrok warning page:**
   - Open the ngrok URL in browser
   - Click "Visit Site" button
   - This only needs to be done once per ngrok session

4. **Start frontend with LocalTunnel:**
   ```bash
   cd kost-app
   npm run dev
   # In another terminal:
   npx localtunnel --port 3000
   ```
   
5. **Access from mobile:**
   - Use the LocalTunnel URL (e.g., `https://xyz.loca.lt`)
   - First time: enter the IP shown on screen to bypass warning

### Option 2: Network IP Access (Local Network Only)

This works only for devices on the same WiFi network.

1. **Find your computer's IP address:**
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`
   - Example: `192.168.1.100`

2. **Start backend with ngrok:**
   ```bash
   cd kost-backend
   php artisan serve
   ngrok http 8000
   ```

3. **Update frontend API URL:**
   - Edit `kost-app/.env.local`:
     ```
     NEXT_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.dev/api
     ```

4. **Bypass ngrok warning:**
   - Open ngrok URL in browser and click "Visit Site"

5. **Start frontend:**
   ```bash
   cd kost-app
   npm run dev
   ```

6. **Access from mobile:**
   - Connect mobile to same WiFi
   - Open: `http://192.168.1.100:3000` (use your IP)

### Option 3: Production Build on Different Port

If port 3000 is already in use:

```bash
cd kost-app
npm run build
PORT=3001 npm start
```

Then access via `http://YOUR-IP:3001`

## Debugging

Use the debug page to diagnose issues:

1. **From localhost:**
   ```
   http://localhost:3000/debug
   ```

2. **From network:**
   ```
   http://YOUR-IP:3000/debug
   ```

The debug page will show:
- Current hostname
- API URL being used
- Whether API is reachable
- Specific error messages

### Common Issues

1. **"Failed to fetch" error:**
   - Ngrok warning page not bypassed
   - Laravel server stopped
   - Ngrok tunnel died (restart ngrok)

2. **"Can Reach API: NO":**
   - Click "Open Ngrok URL" button on debug page
   - Click "Visit Site" on ngrok warning
   - Return to debug page and click "Test Again"

3. **Port 3000 already in use:**
   - Stop existing Next.js server
   - Or use different port: `PORT=3001 npm run dev`

## Testing Checklist

- [ ] Laravel server running (`php artisan serve`)
- [ ] Ngrok tunnel active and URL copied
- [ ] `.env.local` updated with ngrok URL
- [ ] Ngrok warning page bypassed (click "Visit Site")
- [ ] Next.js server running
- [ ] Debug page shows "Can Reach API: YES"
- [ ] Login works from localhost
- [ ] Login works from network/mobile

## Notes

- Ngrok free tier: 1 tunnel only
- Ngrok URLs change on restart (update `.env.local` each time)
- LocalTunnel is free and allows multiple tunnels
- Network IP access only works on same WiFi
- Always bypass ngrok warning page first
