# Fix CORS Error: "No 'Access-Control-Allow-Origin' header"

## The Problem

Your browser is trying to make a request from `https://stockhaus.vercel.app` to `https://stockhaus-production.up.railway.app`, but Railway is blocking it because the Vercel URL isn't in the allowed CORS origins.

## The Fix (2 minutes)

### Step 1: Add Vercel URL to Railway CORS_ORIGIN

1. Go to **Railway → Your Service**
2. Click **Variables** tab
3. Find the `CORS_ORIGIN` variable (or create it if it doesn't exist)
4. Set it to:
   ```
   https://stockhaus.vercel.app,http://localhost:3000
   ```
   - **Exact format**: `https://stockhaus.vercel.app,http://localhost:3000`
   - **No trailing slashes** (not `https://stockhaus.vercel.app/`)
   - **Comma-separated** (no spaces around comma)
   - Include `http://localhost:3000` for local development

5. Click **Save**
6. Railway will automatically redeploy (wait 1-2 minutes)

### Step 2: Verify in Railway Logs

After Railway redeploys, check the logs:

1. Go to **Railway → Deployments → Latest → View Logs**
2. Look for:
   ```
   ✅ CORS Origins: ['https://stockhaus.vercel.app', 'http://localhost:3000']
   ```

If you see this, CORS is configured correctly.

### Step 3: Test

After Railway redeploys, try logging in again from your Vercel app. The CORS error should be gone.

## Verification

Test CORS with curl:

```bash
curl -X OPTIONS https://stockhaus-production.up.railway.app/api/auth/login \
  -H "Origin: https://stockhaus.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

You should see these headers in the response:
```
< access-control-allow-origin: https://stockhaus.vercel.app
< access-control-allow-methods: GET,POST,PUT,DELETE,OPTIONS,PATCH
< access-control-allow-credentials: true
```

If you see these, CORS is working! ✅

## Common Mistakes

❌ **Wrong**: `https://stockhaus.vercel.app/` (trailing slash)
✅ **Correct**: `https://stockhaus.vercel.app`

❌ **Wrong**: `https://stockhaus.vercel.app , http://localhost:3000` (spaces)
✅ **Correct**: `https://stockhaus.vercel.app,http://localhost:3000`

❌ **Wrong**: `https://www.stockhaus.vercel.app` (if your actual URL doesn't have www)
✅ **Correct**: Use your exact Vercel URL (check in browser address bar)

## Still Not Working?

1. **Check Railway logs** for CORS messages:
   - Look for `🔍 CORS: Checking origin: https://stockhaus.vercel.app`
   - Look for `✅ CORS: Allowing origin` or `❌ CORS blocked origin`

2. **Verify your exact Vercel URL**:
   - Open your Vercel app in browser
   - Copy the exact URL from the address bar
   - Make sure it matches exactly in `CORS_ORIGIN` (case-sensitive for the domain part)

3. **Wait for redeploy**:
   - Railway takes 1-2 minutes to redeploy after changing variables
   - Check deployment status in Railway dashboard

## Quick Checklist

- [ ] `CORS_ORIGIN` is set in Railway Variables
- [ ] Value includes: `https://stockhaus.vercel.app,http://localhost:3000`
- [ ] No trailing slashes
- [ ] No spaces around comma
- [ ] Railway has redeployed (check Deployments tab)
- [ ] Railway logs show: `✅ CORS Origins: [...]`

After all these are checked, CORS should work! 🎉

