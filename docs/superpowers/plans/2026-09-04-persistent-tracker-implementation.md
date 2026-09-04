# Persistent TAI Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert TAI-TRACKER from session-only mock state into a private single-user Supabase-backed tracker with permanent saves, recurring monthly billing, dashboard year switching, and full project CRUD.

**Architecture:** Keep the existing Next.js 15 App Router UI and Vercel deployment. Add Supabase Auth + Postgres as the source of truth, centralize reads/writes behind focused data helpers, and make dashboard/report calculations derive from persisted rows. Mutations update only after confirmed database success and then refresh shared app data.

**Tech Stack:** Next.js 15.5.24, React 19.1.1, TypeScript 5.7.2, Supabase JS, Supabase Auth/Postgres, Recharts, Vercel

**Spec:** `docs/superpowers/specs/2026-09-04-persistent-data-recurring-billing-design.md`

## Global Constraints

- Only Tai uses the tracker; do not build staff or client roles.
- Enable Row Level Security on every business-data table.
- Every business row has `owner_id` and policies require `auth.uid() = owner_id`.
- Never expose a Supabase service-role key in browser code or GitHub.
- Dashboard year options are derived from available payment/project dates plus the current year.
- Billing day is restricted to 1-28.
- Client deletion must preserve historical projects/payments/contracts where practical by nulling client foreign keys.
- Recurring payment history must remain if a recurring plan is deleted.
- A full recurring payment advances `next_due_date` exactly one calendar month; a partial payment does not.
- Existing visual design stays intact unless a control is required for the new behavior.
- Production is not promoted until persistence, recurring billing, year filtering, project CRUD, and Vercel build are verified together.

---

## File Structure

### Create
- `supabase/schema.sql` — full database schema, constraints, indexes, RLS, policies, and updated-at triggers.
- `lib/supabase/client.ts` — browser Supabase client using public URL + anon key only.
- `lib/supabase/server.ts` — server Supabase client for authenticated server reads.
- `lib/db/clients.ts` — typed client CRUD functions.
- `lib/db/projects.ts` — typed project CRUD functions.
- `lib/db/payments.ts` — typed payment CRUD functions.
- `lib/db/contracts.ts` — typed contract metadata CRUD functions.
- `lib/db/recurring.ts` — recurring-plan CRUD + mark-paid workflow.
- `lib/date-utils.ts` — year extraction, month grouping, billing-date helpers.
- `components/auth-gate.tsx` — protects private tracker UI and displays login state.
- `components/project-dialogs.tsx` — Add/Edit/Delete Project forms.
- `components/recurring-dialogs.tsx` — Add/Edit/Delete/Pause/Resume/Mark Paid recurring forms.
- `components/year-selector.tsx` — reusable dashboard year selector.
- `components/save-feedback.tsx` — compact loading/success/error UI.
- `app/login/page.tsx` — single-owner login page.
- `app/recurring/page.tsx` — recurring billing management page.
- `tests/date-utils.test.ts` — deterministic date/year/billing helper tests.
- `tests/dashboard-metrics.test.ts` — year-filtered dashboard calculation tests.
- `tests/recurring.test.ts` — recurring payment progression tests.

### Modify
- `package.json` — add Supabase and test dependencies/scripts.
- `lib/types.ts` — database-ready models + `RecurringPlan`.
- `components/app-provider.tsx` — replace seed-only state with authenticated persisted data and async mutation methods.
- `components/dialogs.tsx` — convert client/payment/contract forms to async persisted mutations with loading/error states.
- `components/table-pages.tsx` — project CRUD controls, payment/client persistence behavior, recurring links.
- `components/dashboard.tsx` — live year selector, live selected-year metrics/chart, recurring upcoming payments.
- `components/app-shell.tsx` — add Recurring nav item and auth/logout affordance.
- `app/layout.tsx` — wire auth/data loading boundary.
- `app/page.tsx` — pass dashboard persisted state if needed by final data-loading design.
- `README.md` — setup, environment variables, Supabase schema, Vercel deployment notes.

---

### Task 1: Add Test Harness and Pure Date/Metric Helpers

**Files:**
- Modify: `package.json`
- Create: `lib/date-utils.ts`
- Create: `tests/date-utils.test.ts`
- Create: `tests/dashboard-metrics.test.ts`

**Interfaces:**
- Produces: `getBillingDate(year:number, monthIndex:number, billingDay:number): string`
- Produces: `advanceOneMonth(date:string, billingDay:number): string`
- Produces: `getAvailableYears(payments:Payment[], projects:Project[], currentYear:number): number[]`
- Produces: `buildMonthlyIncome(payments:Payment[], year:number): {month:string; income:number}[]`
- Produces: `getYearPaymentMetrics(payments:Payment[], year:number): {totalIncome:number; outstanding:number; openInvoices:number}`

- [ ] **Step 1: Add Vitest and scripts**

Update `package.json` so scripts include:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Add dev dependency:

```json
"vitest": "^3.2.4"
```

- [ ] **Step 2: Write failing date helper tests**

Create `tests/date-utils.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { advanceOneMonth, getBillingDate } from '@/lib/date-utils';

describe('recurring date helpers', () => {
  it('uses billing days from 1 through 28', () => {
    expect(getBillingDate(2026, 8, 1)).toBe('2026-09-01');
    expect(getBillingDate(2026, 1, 28)).toBe('2026-02-28');
  });

  it('advances December into January of the next year', () => {
    expect(advanceOneMonth('2026-12-15', 15)).toBe('2027-01-15');
  });
});
```

- [ ] **Step 3: Run date tests and verify they fail**

Run:

```bash
npm test -- tests/date-utils.test.ts
```

Expected: FAIL because `lib/date-utils.ts` does not exist.

- [ ] **Step 4: Implement the minimum date helpers**

Create `lib/date-utils.ts` with UTC-safe date-only string logic. Reject billing days outside 1-28 with `RangeError`.

- [ ] **Step 5: Add failing dashboard-metric tests**

Create `tests/dashboard-metrics.test.ts` with payment fixtures across 2025 and 2026 and assert:

```ts
expect(getYearPaymentMetrics(payments, 2026)).toEqual({
  totalIncome: 1500,
  outstanding: 300,
  openInvoices: 1,
});
expect(buildMonthlyIncome(payments, 2026)).toHaveLength(12);
expect(buildMonthlyIncome(payments, 2026)[0].month).toBe('Jan');
```

Also assert a paid amount with blank `paymentDate` is excluded from monthly chart aggregation.

- [ ] **Step 6: Run metric tests and verify they fail**

Run:

```bash
npm test -- tests/dashboard-metrics.test.ts
```

Expected: FAIL because metric helpers are not implemented.

- [ ] **Step 7: Implement metric helpers and available-year extraction**

Implement `getAvailableYears`, `buildMonthlyIncome`, and `getYearPaymentMetrics` in `lib/date-utils.ts`.

- [ ] **Step 8: Run tests**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add package.json lib/date-utils.ts tests/date-utils.test.ts tests/dashboard-metrics.test.ts
git commit -m "test: add tracker date and metric helpers"
```

---

### Task 2: Define Supabase Schema and Security

**Files:**
- Create: `supabase/schema.sql`
- Modify: `README.md`

**Interfaces:**
- Produces database tables: `clients`, `projects`, `payments`, `recurring_plans`, `contracts`.
- Produces RLS owner policy: `auth.uid() = owner_id` for SELECT/INSERT/UPDATE/DELETE.

- [ ] **Step 1: Write schema SQL for all five tables**

`supabase/schema.sql` must use `uuid primary key default gen_random_uuid()`, `owner_id uuid not null references auth.users(id)`, timestamps, numeric defaults, and the exact field names from the spec.

Add these critical foreign-key behaviors:

```sql
client_id uuid references clients(id) on delete set null
recurring_plan_id uuid references recurring_plans(id) on delete set null
```

For `recurring_plans.client_id`, use `on delete cascade` only if the owner explicitly deletes the plan with the client; otherwise prefer `on delete restrict`. The implementation must choose preservation first, so use `on delete restrict` and require the UI to remove/pause plans before deleting a client.

Add constraints:

```sql
check (billing_day between 1 and 28)
check (progress between 0 and 100)
check (amount >= 0)
check (amount_charged >= 0)
check (amount_paid >= 0)
```

- [ ] **Step 2: Add indexes and updated_at trigger**

Create indexes on every `owner_id`, payment `payment_date`, payment `due_date`, recurring `next_due_date`, and project `start_date`.

Create one `set_updated_at()` trigger function and attach it to all mutable tables.

- [ ] **Step 3: Enable RLS and add owner-only policies**

For each table:

```sql
alter table public.clients enable row level security;
create policy "owner can read clients" on public.clients
for select using (auth.uid() = owner_id);
create policy "owner can insert clients" on public.clients
for insert with check (auth.uid() = owner_id);
create policy "owner can update clients" on public.clients
for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owner can delete clients" on public.clients
for delete using (auth.uid() = owner_id);
```

Repeat the same pattern for projects, payments, recurring_plans, and contracts.

- [ ] **Step 4: Document environment variables and schema setup**

Add README entries for:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

State explicitly that no service-role key is required for browser CRUD and must never be committed.

- [ ] **Step 5: Review schema manually against the spec**

Verify every spec field exists, every business table has `owner_id`, and all RLS policies are present.

- [ ] **Step 6: Commit**

```bash
git add supabase/schema.sql README.md
git commit -m "feat: define Supabase tracker schema and RLS"
```

---

### Task 3: Add Supabase Clients and Single-Owner Authentication

**Files:**
- Modify: `package.json`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `components/auth-gate.tsx`
- Create: `app/login/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `components/app-shell.tsx`

**Interfaces:**
- Produces: `createBrowserSupabaseClient()`
- Produces: `createServerSupabaseClient()`
- Produces login/logout UI for one authenticated owner account.

- [ ] **Step 1: Add Supabase dependencies**

Add:

```json
"@supabase/ssr": "^0.7.0",
"@supabase/supabase-js": "^2.57.4"
```

- [ ] **Step 2: Implement client constructors**

`lib/supabase/client.ts` must call `createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)`.

`lib/supabase/server.ts` must use `createServerClient` and Next.js cookies, without a service-role key.

- [ ] **Step 3: Build owner login page**

Create `/login` with email/password fields, loading state, inline error, and `supabase.auth.signInWithPassword`.

On success, route to `/`.

- [ ] **Step 4: Add auth gate and logout**

`AuthGate` checks the current session before rendering private tracker content. Unauthenticated sessions route to `/login`.

Add a Logout action to `AppShell` that calls `supabase.auth.signOut()` then routes to `/login`.

- [ ] **Step 5: Build**

Run:

```bash
npm run build
```

Expected: PASS when required environment variables are present.

- [ ] **Step 6: Commit**

```bash
git add package.json lib/supabase components/auth-gate.tsx app/login/page.tsx app/layout.tsx components/app-shell.tsx
git commit -m "feat: add single-owner Supabase authentication"
```

---

### Task 4: Add Typed Persistent CRUD Data Layer

**Files:**
- Modify: `lib/types.ts`
- Create: `lib/db/clients.ts`
- Create: `lib/db/projects.ts`
- Create: `lib/db/payments.ts`
- Create: `lib/db/contracts.ts`
- Create: `lib/db/recurring.ts`

**Interfaces:**
- Produces `listClients`, `createClient`, `updateClient`, `deleteClient`.
- Produces equivalent project/payment/contract CRUD.
- Produces `listRecurringPlans`, `createRecurringPlan`, `updateRecurringPlan`, `deleteRecurringPlan`, `markRecurringPaid`.

- [ ] **Step 1: Update domain types**

Add `RecurringPlan` with:

```ts
export interface RecurringPlan {
  id: string;
  clientId: string;
  type: 'Hosting' | 'Maintenance' | 'Domain' | 'Other';
  amount: number;
  billingDay: number;
  active: boolean;
  nextDueDate: string;
  startedAt: string;
  pausedAt: string;
  notes: string;
}
```

Preserve existing UI-facing camelCase models.

- [ ] **Step 2: Implement row mappers**

Each DB file maps Supabase snake_case rows to camelCase app models and vice versa. Do not spread raw database rows directly into UI models.

- [ ] **Step 3: Implement client/project/payment/contract CRUD**

Every create/update/delete function must:

1. Require authenticated `user.id`.
2. Write `owner_id: user.id` on inserts.
3. Restrict update/delete to the row id; RLS provides the second security boundary.
4. Throw an `Error` with the Supabase message when `error` is present.
5. Return the changed row on successful create/update.

- [ ] **Step 4: Implement recurring CRUD**

Use `getBillingDate` and `advanceOneMonth` for due-date behavior.

- [ ] **Step 5: Implement `markRecurringPaid` atomically enough for V1**

The function must:

1. Insert a payment linked to the plan.
2. If payment is full, update plan `next_due_date` by one month.
3. If payment is partial, leave `next_due_date` unchanged.
4. If the plan update fails after the payment insert, throw a visible error so the user knows the due date did not advance; do not falsely display success.

- [ ] **Step 6: Run tests and type-check through build**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/types.ts lib/db
git commit -m "feat: add persistent tracker data layer"
```

---

### Task 5: Replace Mock Provider with Persistent Shared Data

**Files:**
- Modify: `components/app-provider.tsx`
- Modify: `app/layout.tsx`
- Modify: `lib/mock-data.ts`

**Interfaces:**
- `useAppData()` continues to expose `clients`, `projects`, `payments`, `contracts`.
- Adds `recurringPlans`, `loading`, `error`, `reload`.
- Mutation functions become async and resolve only after database success.

- [ ] **Step 1: Change provider mutation signatures to async**

Example:

```ts
addClient: (input: NewClientInput) => Promise<Client>;
updateClient: (client: Client) => Promise<Client>;
deleteClient: (clientId: string) => Promise<void>;
```

Apply the same pattern to projects, payments, contracts, and recurring plans.

- [ ] **Step 2: Load all persisted collections after authentication**

On provider initialization, fetch clients, projects, payments, contracts, and recurring plans in parallel and set one shared authoritative state.

- [ ] **Step 3: Update local state only after confirmed DB writes**

For an update, replace the row with the returned database row. For deletes, remove from local state only after successful database deletion.

- [ ] **Step 4: Keep mock data only as optional development fixtures**

Do not auto-load demo companies into production state. The real database starts empty.

- [ ] **Step 5: Add visible initial loading/error state**

Provider exposes `loading` and `error`; tracker content shows a lightweight loading panel while fetching.

- [ ] **Step 6: Build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/app-provider.tsx app/layout.tsx lib/mock-data.ts
git commit -m "feat: load tracker data from Supabase"
```

---

### Task 6: Make Client, Payment, and Contract Saves Truly Persistent

**Files:**
- Modify: `components/dialogs.tsx`
- Create: `components/save-feedback.tsx`
- Modify: `components/table-pages.tsx`

**Interfaces:**
- Uses async provider mutations from Task 5.
- Produces loading/success/error behavior for every existing save/delete flow.

- [ ] **Step 1: Add shared mutation-state UI**

Create `SaveFeedback` that can render `Saving…`, `Deleting…`, a success message, or an error message.

- [ ] **Step 2: Convert Add/Edit Client forms to async**

Disable submit while saving. Await provider mutation. Close only on success. Keep form open and show the error on failure.

- [ ] **Step 3: Convert Delete Client to async**

Delete only after confirmation. If active recurring plans exist for that client, block deletion and show: `Pause or delete this client's recurring plan before deleting the client.`

- [ ] **Step 4: Convert Create/Edit/Delete Payment to async**

If `amountPaid > 0`, require a payment date before save. Keep dashboard totals derived from saved data.

- [ ] **Step 5: Convert contract metadata creation to async**

Version 1 persistence stores metadata only; do not pretend a file is uploaded when only a filename is saved.

- [ ] **Step 6: Manual persistence test**

Using the Supabase-backed preview:

1. Add a client.
2. Refresh.
3. Confirm client remains.
4. Edit the client.
5. Refresh.
6. Confirm edit remains.
7. Delete client.
8. Refresh.
9. Confirm it remains deleted.

Repeat create/edit/delete for a payment.

- [ ] **Step 7: Commit**

```bash
git add components/dialogs.tsx components/save-feedback.tsx components/table-pages.tsx
git commit -m "feat: persist client payment and contract changes"
```

---

### Task 7: Add Full Project CRUD

**Files:**
- Create: `components/project-dialogs.tsx`
- Modify: `components/table-pages.tsx`
- Modify: `components/app-provider.tsx`

**Interfaces:**
- Uses: `addProject`, `updateProject`, `deleteProject` async provider methods.
- Produces working Add/Edit/Delete actions on `/projects`.

- [ ] **Step 1: Build Add Project dialog**

Fields: project name, client, type, status, price, progress, start date, target launch date, notes.

Validate price >= 0 and progress 0-100.

- [ ] **Step 2: Build Edit Project dialog**

Pre-fill every project field and save only after DB success.

- [ ] **Step 3: Build Delete Project confirmation**

Deleting a project must not delete the linked client or payments.

- [ ] **Step 4: Add project action buttons to table**

Use existing pencil/trash interaction style and add a `+ Add Project` button to the page header.

- [ ] **Step 5: Manual refresh verification**

Add, edit, delete one project with a refresh after each operation; confirm each result persists.

- [ ] **Step 6: Commit**

```bash
git add components/project-dialogs.tsx components/table-pages.tsx components/app-provider.tsx
git commit -m "feat: add persistent project CRUD"
```

---

### Task 8: Add Recurring Billing Management

**Files:**
- Create: `components/recurring-dialogs.tsx`
- Create: `app/recurring/page.tsx`
- Modify: `components/app-shell.tsx`
- Modify: `components/app-provider.tsx`

**Interfaces:**
- Uses recurring data-layer methods from Task 4.
- Produces Add/Edit/Pause/Resume/Delete/Mark Paid workflows.

- [ ] **Step 1: Add Recurring nav route**

Add `Recurring` to the sidebar with a calendar/repeat icon and route `/recurring`.

- [ ] **Step 2: Build recurring plan table**

Columns: Client, Type, Amount, Billing Day, Next Due, Status, Actions.

- [ ] **Step 3: Build Add/Edit dialogs**

Validate amount >= 0 and billing day 1-28. Calculate next due date from start date and billing day.

- [ ] **Step 4: Build Pause/Resume behavior**

Pause sets `active=false` and `pausedAt` to today. Resume sets `active=true`, clears `pausedAt`, and moves an already-past due date to the next appropriate billing date.

- [ ] **Step 5: Write failing recurring behavior tests**

Create `tests/recurring.test.ts` that asserts:

```ts
expect(advanceOneMonth('2026-09-01', 1)).toBe('2026-10-01');
```

Also test the decision helper used by `markRecurringPaid` so full payment returns `shouldAdvance: true` and partial payment returns `false`.

- [ ] **Step 6: Run tests and implement missing helper if needed**

Run:

```bash
npm test -- tests/recurring.test.ts
```

Expected: PASS after helper implementation.

- [ ] **Step 7: Build Mark Paid dialog**

Defaults: amount = plan amount, payment date = today. User chooses method. Save payment first; full payment advances due date; partial payment does not.

- [ ] **Step 8: Manual recurring verification**

Create a $50 plan due on day 1. Mark it fully paid. Confirm one payment row exists and next due advances exactly one month. Mark a separate test plan partially paid and confirm next due does not advance.

- [ ] **Step 9: Commit**

```bash
git add components/recurring-dialogs.tsx app/recurring/page.tsx components/app-shell.tsx components/app-provider.tsx tests/recurring.test.ts
git commit -m "feat: add recurring monthly billing"
```

---

### Task 9: Add Dashboard Year Switching and Live Recurring Upcoming Payments

**Files:**
- Create: `components/year-selector.tsx`
- Modify: `components/dashboard.tsx`
- Modify: `components/table-pages.tsx`

**Interfaces:**
- Uses `getAvailableYears`, `buildMonthlyIncome`, and `getYearPaymentMetrics`.
- Uses persisted `payments`, `projects`, and `recurringPlans` from provider.

- [ ] **Step 1: Add year selector**

Default to the current year. Options are descending years from `getAvailableYears`.

- [ ] **Step 2: Replace dashboard year-sensitive KPIs**

For selected year, calculate Total Income, Outstanding, and open invoice count from persisted payments.

Keep Active Clients, Monthly Recurring, and Project Status all-time/current and label them clearly.

- [ ] **Step 3: Replace chart with selected-year live data**

Use `buildMonthlyIncome(payments, selectedYear)` and display all Jan-Dec months including zero months.

- [ ] **Step 4: Update Upcoming Payments**

Show active recurring plans sorted by `nextDueDate`, plus non-recurring unpaid invoices. Recurring plans must not require manually created monthly invoices.

- [ ] **Step 5: Add selected-year Recent Payments**

Show payment rows whose `paymentDate` falls within selected year, newest first.

- [ ] **Step 6: Verify live dashboard behavior manually**

Edit a 2026 payment amount/date and confirm 2026 total/chart changes after save. Switch to another year and confirm the same payment is excluded. Delete the payment and confirm metrics recalculate.

- [ ] **Step 7: Run tests and build**

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add components/year-selector.tsx components/dashboard.tsx components/table-pages.tsx
git commit -m "feat: add year-aware live dashboard"
```

---

### Task 10: Final Security, Persistence, and Vercel Verification

**Files:**
- Modify: `README.md`
- Modify only source files necessary to fix verification failures discovered below.

**Interfaces:**
- Produces the release-ready persistent preview.

- [ ] **Step 1: Run full automated checks**

```bash
npm test
npm run build
```

Expected: both PASS.

- [ ] **Step 2: Verify authentication and RLS**

Confirm unauthenticated tracker access routes to `/login`. Confirm the authenticated owner can read/write. Confirm no service-role secret exists in repository files or client environment variables.

- [ ] **Step 3: Run persistence acceptance checklist**

Verify with page refresh after every action:

```text
Client: add / edit / delete
Project: add / edit / delete
Payment: add / edit / delete
Recurring plan: add / edit / pause / resume / delete
Contract metadata: add
```

- [ ] **Step 4: Run dashboard acceptance checklist**

Verify:

```text
Selected year changes Total Income
Selected year changes Outstanding/open invoice count
Selected year changes Jan-Dec income chart
Payment edit/delete updates dashboard
Project delete updates Project Status
Recurring Mark Paid updates income and next due date
```

- [ ] **Step 5: Verify Vercel preview**

Confirm latest preview reaches `READY`. Fetch `/`, `/clients`, `/projects`, `/payments`, `/recurring`, and `/login`; authenticated routes should behave according to auth state without server errors.

- [ ] **Step 6: Update README with final setup instructions**

Document Supabase schema application, owner account creation, Vercel environment variables, local setup, tests, build, and deployment verification.

- [ ] **Step 7: Commit final verification/docs changes**

```bash
git add README.md
git commit -m "docs: document persistent tracker setup"
```

- [ ] **Step 8: Final branch review**

Compare the feature branch against its base and ensure no credentials, unrelated files, or demo-only persistence paths are included.
