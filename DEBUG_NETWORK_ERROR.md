# Debugging "Network error: Cannot reach backend server"

## Root Causes Checklist

### 1. Vercel Environment Variable Not Set or Wrong

**Check:**
1. Go to **Vercel → Your Project → Settings → Environment Variables**
2. Verify `VITE_API_BASE_URL` exists
3. Check the value is correct:
   - Format: `https://your-railway-url.up.railway.app/api`
   - Must include `/api` at the end
   - Must use `https://` not `http://`
   - No trailing slash after `/api`

**Fix:**
- If missing, add it
- If wrong, update it
- **Redeploy Vercel** after adding/changing

**Verify in Browser:**
1. Open your Vercel app
2. Press **F12** → **Console** tab
3. Look for: `🔧 API Base URL: https://...`
4. If it shows `http://localhost:4000/api`, the env var is NOT set in Vercel

### 2. CORS Not Configured in Railway

**Check:**
1. Go to **Railway → Your Service → Variables**
2. Find `CORS_ORIGIN` variable
3. Verify it includes your **exact Vercel URL**:
   ```
   https://your-app.vercel.app,http://localhost:3000
   ```
   - Replace with your actual Vercel URL
   - **No trailing slash** (e.g., `https://app.vercel.app` ✅ not `https://app.vercel.app/` ❌)
   - Multiple origins separated by commas

**Fix:**
- Add or update `CORS_ORIGIN` in Railway
- Railway will auto-redeploy
- Check Railway logs for: `✅ CORS Origins: [...]`

**Test CORS:**
```bash
curl -X OPTIONS https://your-railway-url.up.railway.app/api/auth/login \
  -H "Origin: https://your-vercel-app.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Should return CORS headers. If not, CORS is misconfigured.

### 3. Railway Backend Not Running

**Check:**
1. Go to **Railway → Your Service → Deployments**
2. Check latest deployment status (should be "Active")
3. Check logs for errors

**Test Backend:**
```bash
curl https://your-railway-url.up.railway.app/health
```

Should return: `{"status":"ok","time":...}`

If this fails, your backend isn't running. Check Railway logs.

### 4. Wrong Railway URL in Vercel

**Check:**
1. Get your Railway URL: **Railway → Settings → Networking → Public URL**
2. Compare with `VITE_API_BASE_URL` in Vercel
3. Must match exactly (including `/api` suffix)

**Common Mistakes:**
- Missing `/api` at the end ❌
- Using `http://` instead of `https://` ❌
- Trailing slash after `/api` ❌
- Wrong Railway URL ❌

## Step-by-Step Debugging

### Step 1: Check Browser Console

1. Open your Vercel app
2. Press **F12** → **Console** tab
3. Look for these logs:
   ```
   🔧 API Base URL: https://...
   🔧 VITE_API_BASE_URL env: https://...
   🔧 Attempting login to: https://.../api/auth/login
   🔧 Login response status: ...
   ```

**What to look for:**
- If `API Base URL` shows `http://localhost:4000/api` → Vercel env var not set
- If `Attempting login to` shows wrong URL → Check Vercel env var
- If you see CORS errors → Check Railway CORS_ORIGIN

### Step 2: Check Network Tab

1. Press **F12** → **Network** tab
2. Try logging in
3. Look for `/api/auth/login` request:
   - **Status**: What HTTP status code?
   - **Request URL**: Does it match your Railway URL?
   - **Response**: What error message?

**Status Codes:**
- `0` or `(failed)` → CORS error or network failure
- `404` → Wrong URL or endpoint doesn't exist
- `500` → Backend error (check Railway logs)
- `401` → Wrong credentials (not a network issue)

### Step 3: Test Railway Backend Directly

```bash
# Test health endpoint
curl https://your-railway-url.up.railway.app/health

# Test login endpoint
curl -X POST https://your-railway-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

**If these work:**
- Backend is running ✅
- Issue is likely CORS or Vercel env var

**If these fail:**
- Backend has issues
- Check Railway logs

### Step 4: Verify CORS Configuration

Check Railway logs for:
```
✅ CORS Origins: ['https://your-app.vercel.app', 'http://localhost:3000']
```

If your Vercel URL is NOT in the list, CORS will block requests.

## Quick Fix Checklist

- [ ] `VITE_API_BASE_URL` is set in Vercel (check Settings → Environment Variables)
- [ ] Value is: `https://your-railway-url.up.railway.app/api` (with `/api`)
- [ ] Vercel app has been **redeployed** after adding env var
- [ ] `CORS_ORIGIN` in Railway includes your exact Vercel URL
- [ ] Railway backend is running (test `/health` endpoint)
- [ ] Browser console shows correct API URL (not localhost)

## Most Common Issue

**90% of the time**, it's one of these:

1. **Vercel env var not set** → Shows `http://localhost:4000/api` in console
2. **Vercel not redeployed** → Old build doesn't have the env var
3. **CORS_ORIGIN missing Vercel URL** → CORS blocks the request
4. **Wrong URL format** → Missing `/api` or using `http://` instead of `https://`

## Still Not Working?

Share:
1. Browser console output (F12 → Console)
2. Network tab details for `/api/auth/login` request
3. Railway backend URL
4. Vercel app URL
5. What `VITE_API_BASE_URL` is set to in Vercel

This will help identify the exact issue.

