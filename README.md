# StockHaus Inventory Platform

A collaborative painting inventory system with:
- **React + Vite** client
- **Express API** (`/server`) that handles auth and all database/storage operations
- **Supabase** Postgres + Storage (accessed via the server’s service-role key)

## ✨ Highlights

- Internal-only authentication: configure three usernames/passwords via env vars.
- All Supabase secrets stay on the server; the browser only talks to the Express API.
- Photos are uploaded through the API to Supabase Storage and served as public URLs.
- Tablet-friendly add flow and desktop dashboard with sorting/search/export.

## 🗂 Structure

```
/StockHaus
  ├── App.tsx                 # Router + guards
  ├── components/Layout.tsx   # Auth-aware shell & project switcher
  ├── lib/db.ts               # Fetch helpers calling the Express API
  ├── pages/                  # Login, ProjectSelection, UploadForm, Dashboard
  ├── providers/AuthProvider.tsx
  ├── env.example             # Client env (only API base URL)
  └── server/
        ├── src/index.ts      # Express API + Supabase integration
        ├── env.example       # Server env template
        └── package.json
```

## ⚙️ Environment Variables

### Client (`env.example → .env`)
```
VITE_API_BASE_URL=http://localhost:4000/api
```

### Server (`server/env.example → server/.env`)
```
API_PORT=4000
CORS_ORIGIN=http://localhost:3000
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET=paintings
AUTH_USERS=alice:password1,bob:password2,charlie:password3
JWT_SECRET=super-secret-string
```
- `AUTH_USERS` is a comma-separated list of `username:password`. On first login the API creates a Supabase auth user (`username@stockhaus.internal`) so foreign-key constraints stay intact.

## 🧱 Supabase Setup

1. Create a Supabase project (free tier works).
2. Run the SQL below (enable `pgcrypto` first):

```sql
create extension if not exists "pgcrypto";

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  last_accessed timestamptz not null default now(),
  item_count integer not null default 0
);

create table public.paintings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  project_id uuid references public.projects(id) on delete cascade,
  serial_number text not null,
  name text not null,
  width numeric not null,
  height numeric not null,
  unit text not null,
  quantity integer not null,
  rate numeric,
  image_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table projects enable row level security;
alter table paintings enable row level security;
```

3. Create a storage bucket called `paintings` (public or custom read-only policy).
4. Grab the **Project URL** and **service_role key** from Supabase settings and place them in `server/.env`.

The Express API uses the service key, so it bypasses RLS but still enforces per-user access in code.

## 🚀 Local Development

```bash
npm install
cd server && npm install && cd ..
cp env.example .env
cp server/env.example server/.env   # then fill real values
npm run dev:full                    # runs API + client together
```

- Client: http://localhost:3000
- API:    http://localhost:4000/api

Log in with one of the usernames from `AUTH_USERS`, create a project, upload a painting, and verify it appears in Supabase (tables + storage).

## 📦 Production Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for a complete step-by-step guide.

**Quick summary:**
1. **Backend**: Deploy to Railway or Render (configs included)
2. **Frontend**: Deploy to Vercel with `VITE_API_BASE_URL` pointing to your backend
3. **Test**: Log in, create projects, upload paintings

All deployment configurations (`railway.json`, `render.yaml`, `vercel.json`) are included in the repo.

## 🔐 Notes

- Tokens are short-lived JWTs issued by the API and stored in `localStorage`.
- Supabase credentials never ship to the browser.
- Removing a user from `AUTH_USERS` invalidates their future logins; existing tokens can be rotated by changing `JWT_SECRET`.

## 🧰 Future Enhancements

- Persist `AUTH_USERS` in Supabase instead of env vars.
- Add server-side auditing/logging.
- Wire Supabase Realtime for live inventory updates.
- Add role-based permissions or shared projects between internal accounts.

Happy cataloging! 🎨
