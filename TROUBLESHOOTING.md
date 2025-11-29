# Deployment Troubleshooting Guide

## Common Issues and Solutions

### Backend Deployment Issues

#### Issue: "Build failed" or "Cannot find module"

**Solution:**
1. **Railway**: Make sure Root Directory is set to `server` in service settings
2. **Render**: Make sure Root Directory is set to `server` in service settings
3. Verify build command: `npm install && npm run build`
4. Verify start command: `npm start`

#### Issue: "Port already in use" or "EADDRINUSE"

**Solution:**
- Railway/Render auto-assign ports via `PORT` environment variable
- Update `server/src/index.ts` to use `process.env.PORT` instead of hardcoded 4000
- Or set `API_PORT` environment variable

#### Issue: "Invalid API key" or Supabase connection errors

**Solution:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is the **service_role** key (not anon key)
2. Get it from: Supabase Dashboard → Settings → API → service_role key
3. Make sure there are no extra spaces or quotes in the env var

#### Issue: "No internal users configured"

**Solution:**
- Verify `AUTH_USERS` is set in environment variables
- Format: `username1:password1,username2:password2`
- No spaces around commas or colons

#### Issue: Service keeps restarting

**Solution:**
1. Check deployment logs for error messages
2. Verify all required environment variables are set
3. Check that `JWT_SECRET` is set (required for auth)

### Frontend Deployment Issues

#### Issue: "Build failed" on Vercel

**Solution:**
1. Check Vercel build logs
2. Verify `VITE_API_BASE_URL` is set (can be a placeholder initially)
3. Make sure build command is: `npm run build`
4. Make sure output directory is: `dist`

#### Issue: "API calls failing" or CORS errors

**Solution:**
1. Verify `VITE_API_BASE_URL` points to your backend URL (include `/api` suffix)
2. Update `CORS_ORIGIN` in backend to include your Vercel URL
3. Format: `https://your-app.vercel.app,http://localhost:3000`

#### Issue: "Cannot find module" errors

**Solution:**
- Make sure all dependencies are in `package.json`
- Try deleting `node_modules` and `package-lock.json`, then `npm install`

### General Issues

#### Issue: Changes not reflecting after deployment

**Solution:**
1. Verify code is pushed to GitHub: `git push origin main`
2. Trigger a redeploy in Railway/Render/Vercel
3. Clear browser cache and hard refresh (Cmd+Shift+R)

#### Issue: Environment variables not working

**Solution:**
1. **Railway**: Variables tab → Make sure they're saved
2. **Render**: Environment tab → Make sure they're saved
3. **Vercel**: Settings → Environment Variables → Make sure they're saved
4. Redeploy after adding/changing env vars

## Step-by-Step Debugging

### 1. Check Backend Health

```bash
# Replace with your backend URL
curl https://your-backend-url.com/health
```

Should return: `{"status":"ok","time":...}`

### 2. Test Backend Login

```bash
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

Should return a JWT token.

### 3. Check Frontend Build Locally

```bash
npm run build
# Should create dist/ folder without errors
```

### 4. Check Deployment Logs

- **Railway**: Service → Deployments → Click latest → View logs
- **Render**: Service → Logs tab
- **Vercel**: Project → Deployments → Click latest → View build logs

## Quick Fixes

### Railway: Service not starting

1. Go to service → Settings → Root Directory → Set to `server`
2. Go to Variables → Verify all env vars are set
3. Go to Deployments → Click "Redeploy"

### Render: Build failing

1. Go to service → Settings → Root Directory → Set to `server`
2. Go to Environment → Verify all env vars
3. Check Build Command: `npm install && npm run build`
4. Check Start Command: `npm start`

### Vercel: Build failing

1. Go to project → Settings → General
2. Verify Framework Preset: Vite
3. Verify Build Command: `npm run build`
4. Verify Output Directory: `dist`
5. Check Environment Variables tab

## Still Having Issues?

1. **Check deployment logs** - They usually show the exact error
2. **Verify environment variables** - Double-check all are set correctly
3. **Test locally first** - Run `npm run dev:full` to ensure everything works
4. **Check GitHub** - Make sure latest code is pushed

## Getting Help

If you're still stuck, provide:
1. Platform (Railway/Render/Vercel)
2. Service name
3. Error message from logs
4. Which step failed (build, deploy, runtime)

