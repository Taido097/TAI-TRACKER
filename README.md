# TAI Tracker

DesignedbyTD client, project, payment and contract tracker.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run build
npm start
```

## Vercel + Supabase

The tracker uses Supabase for authenticated permanent storage.

Required environment variables in Vercel for Production, Preview, and Development:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Do not commit a Supabase service-role key. The browser uses the publishable/anon key together with Supabase Auth and Row Level Security.

Environment variable changes require a new deployment before they are included in the build.

## Current behavior

- Dashboard, clients, projects, payments, contracts, files, reports and settings routes are included.
- Client, project, payment, and contract data are stored in Supabase for the authenticated owner.
- The tracker is restricted to the owner account and database rows are protected by Row Level Security.
- Existing browser-local tracker data is migrated into Supabase the first time the owner signs in if the database is empty.
- Dashboard payment totals and year filters use the persisted payment history.
