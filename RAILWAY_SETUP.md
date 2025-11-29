# Railway Environment Variables Setup

## Quick Setup

1. Go to **Railway → Your Service → Variables** tab
2. Click **"New Variable"** for each variable below
3. Copy the **Key** and **Value** (replace placeholders with your actual values)
4. Click **"Add"**
5. Railway will automatically redeploy after adding variables

## Required Variables

### 1. Supabase URL
```
Key: SUPABASE_URL
Value: https://ybxvmphlwbdjeyndqosk.supabase.co
```

### 2. Supabase Service Role Key
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: [Get from Supabase Dashboard → Settings → API → service_role key]
```
⚠️ **Important**: Use the **service_role** key, NOT the anon key!

### 3. Supabase Storage Bucket
```
Key: SUPABASE_STORAGE_BUCKET
Value: paintings
```

### 4. Authentication Users
```
Key: AUTH_USERS
Value: admin:admin,arpit:arpit,user:user@123
```
Format: `username1:password1,username2:password2,username3:password3`
- No spaces around commas or colons
- Each user is `username:password`
- Multiple users separated by commas

### 5. JWT Secret
```
Key: JWT_SECRET
Value: 17964dca82df4248b7275f4c782d7758eebc66d27e231c058dd15182828dfa23
```
This is a secure random string for signing JWTs. You can generate a new one with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. CORS Origin
```
Key: CORS_ORIGIN
Value: https://your-app.vercel.app,http://localhost:3000
```
Replace `your-app.vercel.app` with your actual Vercel URL.
- Multiple origins separated by commas
- No trailing slashes
- Include `http://localhost:3000` for local development

### 7. API Port (Optional)
```
Key: API_PORT
Value: 4000
```
⚠️ **Note**: Railway automatically sets `PORT` environment variable. This is only needed if you want to override it.

## Complete Variable List (Copy-Paste Format)

```
SUPABASE_URL=https://ybxvmphlwbdjeyndqosk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_STORAGE_BUCKET=paintings
AUTH_USERS=admin:admin,arpit:arpit,user:user@123
JWT_SECRET=17964dca82df4248b7275f4c782d7758eebc66d27e231c058dd15182828dfa23
CORS_ORIGIN=https://your-app.vercel.app,http://localhost:3000
API_PORT=4000
```

## Verification

After setting all variables, check Railway logs for:
- ✅ `Loaded 3 internal user(s): admin, arpit, user`
- ✅ `Supabase URL: Set`
- ✅ `Service Role Key: Set`
- ✅ `JWT Secret: Set`
- ✅ `🚀 StockHaus API running on http://0.0.0.0:XXXX`

If you see ❌ errors, check which variable is missing and add it.

## Troubleshooting

### "Supabase environment variables are missing"
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Make sure you're using the **service_role** key, not anon key

### "No internal users configured"
- Verify `AUTH_USERS` is set
- Check format: `username:password,username:password` (no spaces)

### "Invalid AUTH_USERS entry"
- Check format: each entry must be `username:password`
- No spaces around `:` or `,`
- Example: `admin:admin,user:pass123` ✅
- Example: `admin : admin, user : pass` ❌ (has spaces)

### CORS errors in browser
- Verify `CORS_ORIGIN` includes your exact Vercel URL
- No trailing slash: `https://app.vercel.app` ✅ not `https://app.vercel.app/` ❌

