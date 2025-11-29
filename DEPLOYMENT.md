# StockHaus Deployment Guide

This guide covers deploying both the frontend (Vercel) and backend (Railway/Render).

## Prerequisites

- GitHub repository pushed (✅ Done)
- Supabase project configured (✅ Done)
- Backend `.env` file with all secrets (✅ Done)

## Step 1: Deploy Backend

Choose one platform:

### Option A: Railway (Recommended - Easiest)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `StockHaus` repository
4. Railway will auto-detect the project. Click **"Add Service"** → **"GitHub Repo"**
5. In the service settings:
   - **Root Directory**: Set to `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Go to **Variables** tab and add all environment variables from `server/.env`:
   ```
   API_PORT=4000
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   SUPABASE_URL=https://ybxvmphlwbdjeyndqosk.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_STORAGE_BUCKET=paintings
   AUTH_USERS=admin:admin,arpit:arpit,user:user@123
   JWT_SECRET=your-jwt-secret
   ```
7. Railway will auto-deploy. Wait for deployment to complete.
8. Copy the **public URL** (e.g., `https://stockhaus-api.up.railway.app`)

### Option B: Render

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your `StockHaus` repository
4. Configure:
   - **Name**: `stockhaus-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Scroll to **Environment Variables** and add all from `server/.env`
6. Click **"Create Web Service"**
7. Wait for deployment, then copy the **service URL**

## Step 2: Update CORS in Backend

After backend is deployed, update the `CORS_ORIGIN` variable to include your Vercel URL:

- In Railway: Go to Variables → Edit `CORS_ORIGIN` → Add your Vercel URL
- In Render: Go to Environment → Edit `CORS_ORIGIN` → Add your Vercel URL

You can set multiple origins separated by commas:
```
CORS_ORIGIN=https://your-app.vercel.app,http://localhost:3000
```

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import `arpitjaggi/StockHaus` repository
4. Vercel will auto-detect Vite. Verify:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add **Environment Variable**:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: Your backend URL from Step 1 (e.g., `https://stockhaus-api.up.railway.app/api`)
6. Click **"Deploy"**
7. Wait for deployment to complete

## Step 4: Test Deployment

1. Visit your Vercel URL (e.g., `https://stockhaus.vercel.app`)
2. Log in with one of your `AUTH_USERS` credentials
3. Create a project
4. Upload a painting with an image
5. Verify data appears in Supabase dashboard

## Troubleshooting

### Backend Issues

- **"Invalid API key"**: Check `SUPABASE_SERVICE_ROLE_KEY` is the service_role key (not anon key)
- **CORS errors**: Ensure `CORS_ORIGIN` includes your Vercel URL
- **Port errors**: Railway/Render auto-assigns ports, but ensure `API_PORT` is set

### Frontend Issues

- **API calls failing**: Verify `VITE_API_BASE_URL` points to your backend URL (include `/api` suffix)
- **Build errors**: Check that all dependencies are in `package.json`

## Environment Variables Summary

### Backend (Railway/Render)
```
API_PORT=4000
CORS_ORIGIN=https://your-app.vercel.app,http://localhost:3000
SUPABASE_URL=https://ybxvmphlwbdjeyndqosk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_STORAGE_BUCKET=paintings
AUTH_USERS=admin:admin,arpit:arpit,user:user@123
JWT_SECRET=your-secret-here
```

### Frontend (Vercel)
```
VITE_API_BASE_URL=https://your-backend-url.com/api
```

## Next Steps

- Set up custom domain (optional)
- Enable monitoring/logging
- Set up database backups in Supabase
- Configure auto-scaling if needed

