# Login Failed on Vercel - Troubleshooting Guide

## Quick Checklist

1. ✅ **Vercel Environment Variable**: `VITE_API_BASE_URL` is set correctly
2. ✅ **Railway CORS**: `CORS_ORIGIN` includes your Vercel URL
3. ✅ **Railway Backend**: Backend is running and accessible
4. ✅ **Credentials**: Using correct username/password from `AUTH_USERS`

## Step-by-Step Fix

### 1. Check Vercel Environment Variable

1. Go to **Vercel → Your Project → Settings → Environment Variables**
2. Verify `VITE_API_BASE_URL` is set to:
   ```
   https://your-railway-url.up.railway.app/api
   ```
   - Replace `your-railway-url.up.railway.app` with your actual Railway URL
   - **Must include `/api` at the end**
   - **Must use `https://` not `http://`**

3. If you changed it, **redeploy** your Vercel app:
   - Go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment

### 2. Check Railway CORS Configuration

1. Go to **Railway → Your Service → Variables**
2. Find `CORS_ORIGIN` variable
3. Make sure it includes your **exact Vercel URL**:
   ```
   https://your-app.vercel.app,http://localhost:3000
   ```
   - Replace `your-app.vercel.app` with your actual Vercel URL
   - **No trailing slash** (e.g., `https://app.vercel.app` ✅ not `https://app.vercel.app/` ❌)
   - Multiple origins separated by commas
   - Railway will automatically redeploy after saving

### 3. Test Railway Backend Directly

Test if your Railway backend is working:

```bash
# Replace with your Railway URL
curl https://your-railway-url.up.railway.app/health
```

Should return: `{"status":"ok","time":...}`

If this fails, your Railway backend isn't running. Check Railway logs.

### 4. Test Login Endpoint

```bash
curl -X POST https://your-railway-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

Should return a JSON with `token` and `username`.

If this fails:
- Check Railway logs for errors
- Verify `AUTH_USERS` is set correctly in Railway
- Verify credentials match what's in `AUTH_USERS`

### 5. Check Browser Console

1. Open your Vercel app
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try logging in
5. Look for errors:
   - **CORS errors**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
   - **Network errors**: `Failed to fetch` or `NetworkError`
   - **404 errors**: `Not Found`

### 6. Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try logging in
4. Look for the `/api/auth/login` request:
   - **Status**: Should be `200` (success) or `401` (wrong credentials)
   - **Request URL**: Should point to your Railway URL
   - **Response**: Check what error message is returned

## Common Errors and Fixes

### Error: "Cannot connect to server" or "Network error"

**Cause**: `VITE_API_BASE_URL` is incorrect or not set in Vercel

**Fix**:
1. Go to Vercel → Settings → Environment Variables
2. Set `VITE_API_BASE_URL` = `https://your-railway-url.up.railway.app/api`
3. Redeploy Vercel app

### Error: "CORS policy" or "Access blocked by CORS"

**Cause**: `CORS_ORIGIN` in Railway doesn't include your Vercel URL

**Fix**:
1. Go to Railway → Variables
2. Update `CORS_ORIGIN` to include your Vercel URL:
   ```
   https://your-app.vercel.app,http://localhost:3000
   ```
3. Railway will auto-redeploy

### Error: "Invalid username or password"

**Cause**: Credentials don't match `AUTH_USERS` in Railway

**Fix**:
1. Check Railway → Variables → `AUTH_USERS`
2. Format: `username:password,username:password`
3. Use one of the usernames/passwords from that list
4. Example: If `AUTH_USERS=admin:admin,user:pass`, try:
   - Username: `admin`, Password: `admin`
   - Username: `user`, Password: `pass`

### Error: "404 Not Found" or "API endpoint not found"

**Cause**: `VITE_API_BASE_URL` is missing `/api` suffix

**Fix**:
1. Go to Vercel → Settings → Environment Variables
2. Make sure `VITE_API_BASE_URL` ends with `/api`:
   ```
   https://your-railway-url.up.railway.app/api
   ```

### Error: "500 Internal Server Error"

**Cause**: Railway backend has an error

**Fix**:
1. Check Railway → Deployments → Latest → Logs
2. Look for error messages
3. Common causes:
   - Missing environment variables
   - Supabase connection issues
   - Invalid `AUTH_USERS` format

## Verification Steps

After fixing, verify everything works:

1. ✅ Railway backend is running (check `/health` endpoint)
2. ✅ Vercel has `VITE_API_BASE_URL` set correctly
3. ✅ Railway has `CORS_ORIGIN` with your Vercel URL
4. ✅ Try logging in with credentials from `AUTH_USERS`
5. ✅ Check browser console for any errors

## Still Not Working?

Share:
1. The exact error message from the login page
2. Browser console errors (F12 → Console)
3. Network tab details for the `/api/auth/login` request
4. Your Railway backend URL
5. Your Vercel app URL

This will help identify the exact issue.

