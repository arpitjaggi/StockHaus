# Rotate Supabase service_role Key — Instructions

1. Generate a new service role key
   - Open Supabase dashboard → Select Project → Settings → API
   - Click `Generate` / `Rotate` for the service role key and copy the new key immediately.

2. Update your local `server/.env` (do NOT commit this file)

```bash
# open editor and update
EDITOR="${EDITOR:-nano}" $EDITOR server/.env
# set SUPABASE_SERVICE_ROLE_KEY to the new key
```

3. Update the server deployment env(s)
- If your server is deployed on Vercel or other host, update the environment variable `SUPABASE_SERVICE_ROLE_KEY` there.

4. Update frontend environment (Vercel)
- Ensure Vercel has `VITE_API_BASE_URL` set to your API base (e.g. `https://api.yourdomain.com/api`) so builds embed correct URL.
- You can use `scripts/set-vercel-env.sh` to do this programmatically (see below).

5. Redeploy
- Re-deploy the backend (restart server / redeploy functions). Then redeploy the frontend (Vercel production build).

6. Test
- Test `/api/health` and `/api/auth/login`.

7. Revoke old key
- Once everything is verified, go back to Supabase dashboard and revoke/delete the old service role key.

# Example: Using the helper script

```bash
# Install dependencies
brew install jq

# Set SUPABASE_SERVICE_ROLE_KEY in Vercel (non-interactive)
./scripts/set-vercel-env.sh "<VERCEL_PROJECT_ID>" "<VERCEL_TOKEN>" "SUPABASE_SERVICE_ROLE_KEY" "<NEW_SERVICE_ROLE_KEY>"

# Set VITE_API_BASE_URL
./scripts/set-vercel-env.sh "<VERCEL_PROJECT_ID>" "<VERCEL_TOKEN>" "VITE_API_BASE_URL" "https://api.yourdomain.com/api"

# Then trigger a production deployment (requires vercel CLI login)
vercel --prod --confirm
```

# Notes
- Do not share the new key in plaintext or commit it to git.
- Keep old key active until new key fully propagates and you confirm functionality, then revoke the old key.
