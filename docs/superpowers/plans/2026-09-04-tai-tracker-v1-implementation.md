# TAI Tracker V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working Vercel-ready business tracker that closely matches the approved light DesignedbyTD dashboard concept and includes functional navigation, sample data, search, filters, and core form interactions.

**Architecture:** Use a Next.js App Router application with TypeScript and Tailwind CSS. Keep data in typed in-memory modules for Version 1, with a single client-side app state provider for session edits so forms update the UI without a database. Reusable layout, table, badge, chart, and dialog components keep pages focused and prepare the project for a later database-backed version.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Lucide React, Recharts

**Spec:** `docs/superpowers/specs/2026-09-04-tai-tracker-design.md`

## Global Constraints

- Match the approved fourth concept: bright white and soft gray surfaces, warm gold/olive accent, clean black typography, rounded cards, subtle borders, left sidebar.
- Responsive desktop, tablet, and mobile layouts.
- Version 1 uses typed mock/in-memory data only; refreshing resets sample/session data.
- No production authentication, database, or persistent file storage in Version 1.
- Project must be Vercel-ready and build with `npm run build`.

---

### Task 1: Scaffold the Next.js application

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Create: `app/globals.css`
- Create: `app/layout.tsx`

**Interfaces:**
- Produces: Next.js runtime, global styles, application root layout.

- [ ] **Step 1:** Add package scripts for `dev`, `build`, `start`, and `lint`, with dependencies for Next.js, React, Lucide React, and Recharts.
- [ ] **Step 2:** Add TypeScript and Next.js configuration with `@/*` path alias.
- [ ] **Step 3:** Add Tailwind-compatible global CSS using CSS variables for warm gold/olive accent, white/gray surfaces, borders, typography, and responsive utility classes.
- [ ] **Step 4:** Add `app/layout.tsx` metadata for `DesignedbyTD Business Tracker` and import global styles.
- [ ] **Step 5:** Run `npm install` and `npm run build`; expected result is a successful base build.

### Task 2: Define typed mock business data and state

**Files:**
- Create: `lib/types.ts`
- Create: `lib/mock-data.ts`
- Create: `components/app-provider.tsx`

**Interfaces:**
- Produces: `Client`, `Project`, `Payment`, `Contract`, `ActivityItem` types; seed arrays; `useAppData()` hook with clients, projects, payments, contracts, activities and add operations.

- [ ] **Step 1:** Define exact TypeScript unions for client, project, payment, and contract statuses.
- [ ] **Step 2:** Seed realistic DesignedbyTD sample records including ABC Construction, Rivera Landscaping, Elite Roofing, Martinez Concrete, and Nguyen Nails.
- [ ] **Step 3:** Add a client-side context provider that initializes from seed data and exposes `addClient`, `addPayment`, and `addContract`.
- [ ] **Step 4:** Add derived selectors for total income, outstanding balance, monthly recurring revenue, active clients, and project status counts.
- [ ] **Step 5:** Verify TypeScript compiles with no implicit-any errors.

### Task 3: Build the responsive application shell

**Files:**
- Create: `components/app-shell.tsx`
- Create: `components/sidebar.tsx`
- Create: `components/topbar.tsx`
- Create: `components/icons.tsx`

**Interfaces:**
- Consumes: Next.js routing, `useAppData()` for global search labels.
- Produces: persistent desktop sidebar, mobile drawer, top search bar, profile block, main content slot.

- [ ] **Step 1:** Build sidebar navigation for Dashboard, Clients, Projects, Payments, Contracts, Files, Reports, and Settings.
- [ ] **Step 2:** Highlight the active route and preserve the approved DesignedbyTD branding block.
- [ ] **Step 3:** Build a responsive top bar with search input, date/profile area, and mobile menu button.
- [ ] **Step 4:** Implement global search result dropdown for matching clients, projects, and invoice numbers.
- [ ] **Step 5:** Check layout at narrow mobile width and desktop width with no page-level horizontal overflow.

### Task 4: Build reusable dashboard components

**Files:**
- Create: `components/ui/stat-card.tsx`
- Create: `components/ui/status-badge.tsx`
- Create: `components/ui/panel.tsx`
- Create: `components/dashboard/income-chart.tsx`
- Create: `components/dashboard/project-status-chart.tsx`
- Create: `components/dashboard/recent-clients.tsx`
- Create: `components/dashboard/recent-activity.tsx`
- Create: `components/dashboard/upcoming-payments.tsx`

**Interfaces:**
- Consumes: typed records and derived summary values.
- Produces: reusable visual units used by Dashboard and Reports.

- [ ] **Step 1:** Build stat cards for Total Income, Active Clients, Outstanding, and Monthly Recurring.
- [ ] **Step 2:** Build income line/area chart using Recharts with six months of sample data.
- [ ] **Step 3:** Build project-status donut chart from project status counts.
- [ ] **Step 4:** Build compact recent-client, recent-activity, and upcoming-payment panels.
- [ ] **Step 5:** Ensure cards and charts degrade cleanly on mobile.

### Task 5: Build working dashboard and quick actions

**Files:**
- Create: `app/page.tsx`
- Create: `components/dialogs/add-client-dialog.tsx`
- Create: `components/dialogs/create-invoice-dialog.tsx`
- Create: `components/dialogs/upload-contract-dialog.tsx`

**Interfaces:**
- Consumes: `useAppData()` state/actions and dashboard components.
- Produces: working dashboard route and session-based form updates.

- [ ] **Step 1:** Compose the dashboard to visually match the approved concept, including the headline, KPI row, chart row, recent data, quick actions, and branded footer callout.
- [ ] **Step 2:** Implement Add Client dialog with required validation for client name and business name; valid submit calls `addClient` and closes the dialog.
- [ ] **Step 3:** Implement Create Invoice dialog with client, invoice number, payment type, amount, due date, and status; reject non-positive amounts.
- [ ] **Step 4:** Implement Upload Contract dialog with client, contract name, signed date, status, and optional local filename metadata only.
- [ ] **Step 5:** Confirm new records appear in the relevant session UI immediately.

### Task 6: Build client, project, payment, and contract routes

**Files:**
- Create: `app/clients/page.tsx`
- Create: `app/projects/page.tsx`
- Create: `app/payments/page.tsx`
- Create: `app/contracts/page.tsx`
- Create: `components/data-table.tsx`

**Interfaces:**
- Consumes: `useAppData()` records.
- Produces: searchable/filterable management pages.

- [ ] **Step 1:** Build Clients page with status filter, business/contact columns, package, project value, recurring fee, and dates.
- [ ] **Step 2:** Build Projects page with client, project type, status, price, progress bar, start date, and target launch date.
- [ ] **Step 3:** Build Payments page with invoice number, client, type, charged, paid, due date, method, and status.
- [ ] **Step 4:** Build Contracts page with client, contract name, signed date, status, and filename metadata.
- [ ] **Step 5:** Ensure all tables reflow to stacked cards or local horizontal scrollers on small screens without breaking the app shell.

### Task 7: Build files, reports, and settings routes

**Files:**
- Create: `app/files/page.tsx`
- Create: `app/reports/page.tsx`
- Create: `app/settings/page.tsx`

**Interfaces:**
- Consumes: mock records and dashboard chart components.
- Produces: remaining Version 1 routes required by the spec.

- [ ] **Step 1:** Build Files page grouped by Contracts, Invoices, Assets, and Website mock categories.
- [ ] **Step 2:** Build Reports page with monthly income, project income, recurring revenue, outstanding balance, client count, and payment-status breakdown.
- [ ] **Step 3:** Build Settings page with editable session-only business profile fields for business name, owner name, contact email, currency, and default recurring fee.
- [ ] **Step 4:** Add clear labels noting Version 1 session-only behavior where persistence would otherwise be expected.

### Task 8: Verification and Vercel readiness

**Files:**
- Modify as needed: `package.json`, `app/**/*.tsx`, `components/**/*.tsx`, `lib/**/*.ts`
- Create: `README.md`

**Interfaces:**
- Produces: verified build and deployment instructions.

- [ ] **Step 1:** Run `npm run build`; expected result is exit code 0.
- [ ] **Step 2:** Fix all TypeScript, JSX, routing, and dependency errors until build is clean.
- [ ] **Step 3:** Verify every required route renders: `/`, `/clients`, `/projects`, `/payments`, `/contracts`, `/files`, `/reports`, `/settings`.
- [ ] **Step 4:** Manually verify dashboard quick actions, search, filters, and responsive sidebar behavior.
- [ ] **Step 5:** Add README instructions for local development and connecting the GitHub repo to Vercel.
- [ ] **Step 6:** Commit the verified implementation to `main` so Vercel can deploy directly from the repository.

## Plan Self-Review

- Spec coverage: all Version 1 routes, dashboard widgets, search, filters, session forms, mobile navigation, reports, and settings are covered.
- Placeholder scan: no implementation step depends on an undefined future component or unspecified behavior.
- Type consistency: app data types and `useAppData()` are defined before pages and dialogs consume them.
