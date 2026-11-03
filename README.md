# CampusConnect

A responsive campus event discovery and registration app built with React, Vite and Supabase.

## Run locally
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add your Supabase project URL and anon key.
4. Run `npm run dev`.

## Supabase setup
1. Open the SQL Editor in your Supabase project.
2. Run `supabase/schema.sql`.
3. In Authentication settings, enable Email provider and configure email confirmation as desired.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel project environment variables.

Only the Supabase anon/public key belongs in frontend environment variables. Never expose a service-role key.

## Deploy
Import this GitHub repository into Vercel. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
