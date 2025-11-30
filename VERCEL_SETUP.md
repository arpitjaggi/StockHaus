# Vercel Environment Variables Setup

## Quick Setup

1. Go to **Vercel → Your Project → Settings → Environment Variables**
2. Click **"Add New"**
3. Copy the **Key** and **Value** (replace placeholder with your actual Railway URL)
4. Select **Environment**: Production, Preview, and Development (or just Production)
5. Click **"Save"**
6. **Redeploy** your app for changes to take effect

## Required Variable

### API Base URL
```
Key: VITE_API_BASE_URL
Value: https://your-railway-url.up.railway.app/api
```

**Important Notes:**
- Replace `your-railway-url.up.railway.app` with your actual Railway backend URL
- Get Railway URL from: **Railway → Your Service → Settings → Networking → Public URL**
- **Must include `/api` at the end**
- **Must use `https://` not `http://`**
- No trailing slash after `/api`

## Step-by-Step Instructions

### 1. Get Your Railway Backend URL

1. Go to **Railway → Your Service**
2. Click **Settings** tab
3. Go to **Networking** section
4. Copy the **Public URL** (e.g., `https://stockhaus-api.up.railway.app`)

### 2. Add Environment Variable in Vercel

1. Go to **Vercel → Your Project**
2. Click **Settings** tab
3. Click **Environment Variables** in the left sidebar
4. Click **"Add New"** button
5. Enter:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-railway-url.up.railway.app/api` (replace with your Railway URL)
   - **Environment**: Select all (Production, Preview, Development) or just Production
6. Click **"Save"**

### 3. Redeploy Your App

After adding/changing environment variables, you must redeploy:

1. Go to **Vercel → Your Project → Deployments** tab
2. Click the **"⋯"** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

**OR** trigger a new deployment by:
- Pushing a commit to your GitHub repo, or
- Clicking **"Redeploy"** button

## Verification

After redeploying, verify the environment variable is working:

1. Open your Vercel app
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. You should see: `🔧 API Base URL: https://your-railway-url.up.railway.app/api`
   (This only shows in development mode)

## Common Issues

### Variable Not Working After Adding

**Solution**: You must redeploy after adding/changing environment variables. Vercel doesn't automatically apply changes to running deployments.

### Wrong URL Format

**Correct**: `https://api.up.railway.app/api` ✅
**Wrong**: 
- `https://api.up.railway.app` ❌ (missing `/api`)
- `http://api.up.railway.app/api` ❌ (using `http` instead of `https`)
- `https://api.up.railway.app/api/` ❌ (trailing slash)

### Variable Not Showing in Build

**Solution**: 
1. Make sure variable name is exactly `VITE_API_BASE_URL` (case-sensitive)
2. Variables starting with `VITE_` are only available in the build, not at runtime
3. Redeploy after adding the variable

## Example Configuration

If your Railway backend URL is: `https://stockhaus-api-production.up.railway.app`

Then set in Vercel:
```
VITE_API_BASE_URL=https://stockhaus-api-production.up.railway.app/api
```

## Testing

After setup, test the connection:

1. Open your Vercel app
2. Try logging in
3. Check browser console (F12) for any errors
4. If you see "Cannot connect to server", verify:
   - `VITE_API_BASE_URL` is set correctly in Vercel
   - You've redeployed after adding the variable
   - Railway backend is running (test `/health` endpoint)

## Troubleshooting

### "Cannot connect to server" Error

1. Verify `VITE_API_BASE_URL` is set in Vercel
2. Check the URL is correct (includes `/api` and uses `https://`)
3. Make sure you redeployed after adding the variable
4. Test Railway backend directly: `curl https://your-railway-url.up.railway.app/health`

### "404 Not Found" Error

- Make sure `VITE_API_BASE_URL` ends with `/api`
- Example: `https://api.up.railway.app/api` ✅

### Variable Not Available

- Variable name must be exactly `VITE_API_BASE_URL`
- Must start with `VITE_` to be available in the build
- Redeploy after adding/changing

## Quick Reference

**Variable Name**: `VITE_API_BASE_URL`
**Value Format**: `https://[railway-url]/api`
**Where to Set**: Vercel → Project → Settings → Environment Variables
**After Setting**: Redeploy the app

