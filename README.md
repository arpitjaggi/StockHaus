# ArtVault Inventory Management

A professional painting inventory application built with React, TypeScript, and Tailwind CSS.

## Features

- **Mobile First Data Entry:** Optimized for tablets and phones with camera integration.
- **Desktop Dashboard:** Comprehensive table view with sorting, filtering, and stats.
- **Excel Export:** Download inventory reports instantly.
- **Database Abstraction:** Built to easily swap LocalStorage for Supabase/Firebase.

## 🚀 Quick Start

1.  **Install Dependencies**
    ```bash
    npm install
    npm install react-router-dom lucide-react xlsx
    ```

2.  **Run Locally**
    ```bash
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

## 📦 Deployment to Vercel

This application is designed as a Single Page Application (SPA).

1.  Push code to GitHub.
2.  Import project into Vercel.
3.  **Build Command:** `npm run build` (or `vite build` if using Vite).
4.  **Output Directory:** `dist` (or `build`).
5.  Deploy!

## 🗄️ Database Integration

Currently, the app uses `localStorage` for demonstration purposes. To connect a real database, edit `lib/db.ts`.

### Supabase Example
```typescript
// lib/db.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Replace getAllPaintings implementation:
async getAllPaintings() {
  const { data, error } = await supabase.from('paintings').select('*')
  return data || []
}
```

## 🛠️ Tech Stack

- **Framework:** React 18+
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Utils:** XLSX (Excel export)
