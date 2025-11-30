# Fixing Railway 502 "Application failed to respond" Error

## What the Error Means

A 502 error means:
- ✅ Railway's proxy/edge is working (it's responding)
- ❌ Your Node.js application isn't responding
- The app either crashed, isn't starting, or isn't listening on the correct port

## Step 1: Check Railway Logs

1. Go to **Railway → Your Service**
2. Click **Deployments** tab
3. Click on the **latest deployment**
4. Click **View Logs**

### What to Look For:

**✅ Good Signs:**
```
🚀 StockHaus API running on http://0.0.0.0:XXXX
✅ All systems ready!
```

**❌ Bad Signs:**
```
❌ CRITICAL: Supabase environment variables are missing.
❌ No internal users configured
❌ Failed to start server
Error: ...
```

## Step 2: Common Issues and Fixes

### Issue 1: Missing Environment Variables

**Error in logs:**
```
❌ CRITICAL: Supabase environment variables are missing.
```

**Fix:**
1. Go to **Railway → Variables**
2. Verify all 7 variables are set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
   - `AUTH_USERS`
   - `JWT_SECRET`
   - `CORS_ORIGIN`
   - `API_PORT` (optional)

### Issue 2: No Internal Users

**Error in logs:**
```
❌ No internal users configured
```

**Fix:**
1. Go to **Railway → Variables**
2. Set `AUTH_USERS` = `admin:admin,arpit:arpit,user:user@123`
3. Format: `username:password,username:password` (no spaces)

### Issue 3: Port Mismatch

**Error in logs:**
```
❌ Port XXXX is already in use
```

**Fix:**
- Railway automatically sets `PORT` environment variable
- Don't set `API_PORT` in Railway (or remove it)
- The code will use `PORT` automatically

### Issue 4: Application Crashed

**Error in logs:**
```
❌ Uncaught Exception: ...
❌ Failed to start server: ...
```

**Fix:**
- Check the error message in logs
- Common causes:
  - Invalid Supabase credentials
  - Database connection issues
  - Invalid `AUTH_USERS` format

## Step 3: Verify Server is Running

After checking logs, verify the server started:

**In Railway logs, you should see:**
```
🔧 Starting server...
🔧 PORT env var: XXXX (or not set)
🔧 Using port: XXXX
🚀 StockHaus API running on http://0.0.0.0:XXXX
✅ All systems ready!
```

If you don't see "🚀 StockHaus API running", the server didn't start.

## Step 4: Test Health Endpoint

Once the server is running, test:

```bash
curl https://stockhaus-production.up.railway.app/health
```

Should return: `{"status":"ok","time":...}`

If this returns 502, the server still isn't running.

## Step 5: Redeploy

After fixing environment variables:

1. Railway will auto-redeploy when you save variables
2. Or manually redeploy: **Deployments → Latest → Redeploy**
3. Watch the logs to see if it starts successfully

## Quick Checklist

- [ ] Check Railway logs for error messages
- [ ] Verify all 7 environment variables are set
- [ ] Check `AUTH_USERS` format is correct (no spaces)
- [ ] Verify server logs show "🚀 StockHaus API running"
- [ ] Test `/health` endpoint returns 200, not 502
- [ ] If still 502, check Railway deployment status

## Still Getting 502?

Share:
1. Railway deployment logs (latest deployment)
2. Any error messages you see
3. Whether you see "🚀 StockHaus API running" in logs

This will help identify the exact issue.

