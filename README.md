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

## Vercel

Import this GitHub repository into Vercel and deploy it as a Next.js project with the default build settings. Version 1 uses in-memory sample/session data only, so no environment variables are required yet.

## Version 1 behavior

- Dashboard, clients, projects, payments, contracts, files, reports and settings routes are included.
- Add Client, Create Invoice and Upload Contract update the current browser session.
- Refreshing resets session changes to the original sample data.
- Database, authentication and real file storage are planned for Version 2.
