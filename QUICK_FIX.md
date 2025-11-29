# Quick Fix for Railway + Vercel Deployment

## Issue: "Failed to fetch" on login

### Step 1: Add JWT_SECRET to Railway

1. Go to Railway → Your Service → **Variables** tab
2. Click **"New Variable"**
3. Add:
   - **Key**: `JWT_SECRET`
   - **Value**: `17964dca82df4248b7275f4c782d7758eebc66d27e231c058dd15182828dfa23`
4. Click **"Add"**
5. Railway will automatically redeploy

### Step 2: Update CORS_ORIGIN in Railway

1. In Railway → Your Service → **Variables** tab
2. Find `CORS_ORIGIN` variable
3. Edit it to include your Vercel URL:
   ```
   https://your-app.vercel.app,http://localhost:3000
   ```
   Replace `your-app.vercel.app` with your actual Vercel URL
4. If `CORS_ORIGIN` doesn't exist, create it with the value above
5. Railway will automatically redeploy

### Step 3: Verify Vercel Environment Variable

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Check that `VITE_API_BASE_URL` is set to:
   ```
   https://your-railway-url.up.railway.app/api
   ```
   Replace with your actual Railway URL (get it from Railway → Service → Settings → Networking)
3. Make sure to include `/api` at the end
4. If you changed it, trigger a redeploy in Vercel

### Step 4: Test Backend Connection

After Railway redeploys, test if backend is accessible:

```bash
# Replace with your Railway URL
curl https://your-railway-url.up.railway.app/health
```

Should return: `{"status":"ok","time":...}`

If this fails, check Railway deployment logs for errors.

### Step 5: Verify All Railway Environment Variables

Make sure you have all 7 variables in Railway:

1. ✅ `SUPABASE_URL` = `https://ybxvmphlwbdjeyndqosk.supabase.co`
2. ✅ `SUPABASE_SERVICE_ROLE_KEY` = (your service role key)
3. ✅ `SUPABASE_STORAGE_BUCKET` = `paintings`
4. ✅ `AUTH_USERS` = `admin:admin,arpit:arpit,user:user@123`
5. ✅ `JWT_SECRET` = `17964dca82df4248b7275f4c782d7758eebc66d27e231c058dd15182828dfa23` (NEW!)
6. ✅ `CORS_ORIGIN` = `https://your-vercel-url.vercel.app,http://localhost:3000`
7. ✅ `API_PORT` = `4000` (optional, Railway uses PORT automatically)

### Step 6: Check Railway Deployment Logs

1. Go to Railway → Your Service → **Deployments** tab
2. Click on the latest deployment
3. Check the logs for:
   - ✅ "StockHaus API running on http://localhost:..."
   - ✅ "Loaded X internal user(s): ..."
   - ✅ "Supabase URL: ✓ Set"
   - ❌ Any error messages

### Step 7: Test Login Again

1. Go to your Vercel app
2. Try logging in with `admin:admin`
3. Check browser console (F12 → Console tab) for any errors
4. Check Network tab to see if the request is reaching Railway

## Common Issues

### "Failed to fetch" still happening

1. **Check Railway URL**: Make sure `VITE_API_BASE_URL` in Vercel matches your Railway URL exactly
2. **Check CORS**: Make sure `CORS_ORIGIN` includes your exact Vercel URL (no trailing slash)
3. **Check Railway is running**: Go to Railway → Deployments → Check if latest deployment succeeded
4. **Check browser console**: Look for CORS errors or network errors

### Backend not starting

1. Check Railway logs for missing environment variables
2. Verify all 7 variables are set
3. Make sure Root Directory is set to `server` in Railway settings

### Still not working?

Share:
- Your Railway service URL
- Your Vercel app URL
- Any error messages from browser console (F12)
- Railway deployment logs (latest deployment)

