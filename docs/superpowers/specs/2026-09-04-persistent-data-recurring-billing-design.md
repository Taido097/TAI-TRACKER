# TAI-TRACKER Persistent Data, Recurring Billing, Year Filtering, and Project CRUD Design

Date: 2026-09-04
Status: Approved design, awaiting written-spec review
Owner: Tai Do
Repository: Taido097/TAI-TRACKER
Target branch: feature/tai-tracker-v1

## 1. Goal

Upgrade TAI-TRACKER from session-only React state to a persistent single-user business tracker backed by Supabase, while preserving the existing Vercel-hosted Next.js UI and adding recurring monthly billing, dashboard year switching, and complete project create/edit/delete functionality.

The key success criterion is simple: when Tai clicks Save, the change must still exist after refreshing the page, closing the browser, or opening the tracker on another authorized device.

## 2. Scope

This upgrade covers:

- Persistent clients
- Persistent projects
- Persistent payments
- Persistent contracts metadata
- Recurring billing plans
- Mark-recurring-payment-as-paid workflow
- Dashboard year selector
- Year-aware income chart and payment metrics
- Project create/edit/delete
- Save/loading/error feedback
- Single-user access control

This upgrade does not yet include:

- Client portal accounts
- Staff accounts or multi-user permissions
- Automated card charging
- Automated invoice emailing
- Full document storage implementation unless required by the chosen Supabase setup
- External accounting integrations

## 3. Recommended Architecture

### Frontend

- Next.js 15 App Router
- Existing React components and visual design stay in place
- Existing Vercel deployment remains the hosting target

### Data Layer

- Supabase Postgres for persistent business data
- Supabase client library for reads/writes
- Server-only credentials remain in Vercel environment variables

### Authentication

- Supabase Auth for one owner account
- Only Tai's authorized account can access tracker data
- Row Level Security enabled on every business-data table
- Policies allow only the authenticated owner user to read/write rows

The browser must never receive a Supabase service-role key.

## 4. Data Model

### clients

Fields:

- id: uuid primary key
- owner_id: uuid, authenticated user id
- name: text
- business: text
- email: text
- phone: text
- website: text
- status: text
- start_date: date nullable
- launch_date: date nullable
- package: text
- project_value: numeric
- recurring_fee: numeric default 0
- notes: text
- created_at: timestamptz
- updated_at: timestamptz

### projects

Fields:

- id: uuid primary key
- owner_id: uuid
- client_id: uuid nullable, foreign key to clients
- name: text
- type: text
- status: text
- start_date: date nullable
- target_launch_date: date nullable
- price: numeric
- progress: integer 0-100
- notes: text
- created_at: timestamptz
- updated_at: timestamptz

Client deletion should not automatically delete historical projects. If a client is removed, client_id may be set null so historical project records remain available.

### payments

Fields:

- id: uuid primary key
- owner_id: uuid
- client_id: uuid nullable
- recurring_plan_id: uuid nullable
- invoice: text
- type: text
- amount_charged: numeric
- amount_paid: numeric
- payment_date: date nullable
- due_date: date nullable
- method: text
- status: text
- created_at: timestamptz
- updated_at: timestamptz

Payment records are historical transactions/invoices. Deleting a payment removes that payment record only after confirmation.

### recurring_plans

Fields:

- id: uuid primary key
- owner_id: uuid
- client_id: uuid
- type: text, for example Hosting or Maintenance
- amount: numeric
- billing_day: integer 1-28
- active: boolean
- next_due_date: date
- started_at: date
- paused_at: date nullable
- notes: text
- created_at: timestamptz
- updated_at: timestamptz

Billing day is restricted to 1-28 to avoid invalid dates in shorter months.

### contracts

Fields:

- id: uuid primary key
- owner_id: uuid
- client_id: uuid nullable
- name: text
- signed_date: date nullable
- status: text
- file_name: text
- storage_path: text nullable
- created_at: timestamptz
- updated_at: timestamptz

Version 1 of this persistence upgrade may keep contracts as metadata only. Supabase Storage can be added for actual PDF uploads in a later bounded change.

## 5. Persistent Save Behavior

Every create/edit/delete action must perform a database operation before showing success.

### Create

Examples:

- Add Client
- Add Project
- Create Invoice
- Add Recurring Plan

Flow:

1. User submits form.
2. Button enters loading state.
3. Supabase insert runs.
4. On success, UI updates from returned database row.
5. Success feedback is shown.
6. Dialog closes.
7. Data remains after refresh.

### Edit

Flow:

1. Open pre-filled form.
2. Save Changes.
3. Supabase update runs.
4. UI updates only after success.
5. Error keeps form open and shows a useful message.

### Delete

Flow:

1. User clicks Delete.
2. Confirmation dialog appears.
3. Supabase delete runs after confirmation.
4. UI removes row after successful delete.
5. Dashboard metrics recalculate from the remaining data.

No destructive action should happen without confirmation.

## 6. Dashboard Year Selector

Add a year dropdown to the dashboard header, defaulting to the current year.

Example options:

- 2024
- 2025
- 2026
- 2027

The list should be derived from available payment/project dates plus the current year, rather than hard-coded forever.

### Year-aware metrics

The following use the selected year:

- Total Income
- Outstanding balance for invoices due in selected year
- Open invoice count
- Income Overview chart
- Payment status counts
- Recent Payments for selected year
- Year-specific reports

### Overall metrics

The following remain all-time unless otherwise labeled:

- Active Clients
- Monthly Recurring Revenue
- Current Project Status counts

The UI should clearly distinguish year-specific metrics from current/all-time metrics.

## 7. Income Overview Chart

Replace any remaining mock income-series data with live payment data from Supabase.

For the selected dashboard year:

- Group amount_paid by calendar month
- Show Jan-Dec consistently
- Months with no payments display 0
- Editing, deleting, or adding payments changes the chart after save

Payment income should be grouped by payment_date. If a paid amount exists without a payment_date, it should not be silently assigned to a month; the user should be prompted to add the date when editing that payment.

## 8. Recurring Billing Workflow

Recurring plans eliminate manual month-by-month invoice creation.

### Create plan

From a client or recurring-billing area, user enters:

- Client
- Type
- Monthly amount
- Billing day
- Start date
- Optional notes

The app calculates next_due_date.

### Dashboard display

Active recurring plans appear under Upcoming Payments using next_due_date.

Example:

ABC Construction
Hosting
$50
Due September 1, 2026

### Mark Paid

When user clicks Mark Paid:

1. Open a small confirmation/payment dialog.
2. Default amount paid to recurring plan amount.
3. Default payment date to today, but allow editing.
4. Select payment method.
5. Save a new row in payments linked to recurring_plan_id.
6. Set status to Paid when full amount is received, Partial if lower.
7. If paid in full, advance recurring_plans.next_due_date by one calendar month.
8. Dashboard income, chart, payment history, and upcoming payments refresh from saved data.

The user should never have to manually recreate the same monthly charge.

### Pause plan

Pausing a plan:

- Sets active = false
- Removes it from Upcoming Payments
- Keeps all historical payment rows
- Does not delete the recurring plan

### Resume plan

Resuming a plan:

- Sets active = true
- Recalculates next_due_date to the next appropriate billing date if the stored date is already in the past

### Delete plan

Deleting a recurring plan requires confirmation.

Historical payments linked to the recurring plan remain as payment history. The foreign key behavior should preserve those rows by setting recurring_plan_id to null if needed.

## 9. Project Management

Projects page receives full CRUD.

### Add Project

Fields:

- Project name
- Client
- Type
- Status
- Price
- Progress
- Start date
- Target launch date
- Notes

### Edit Project

All project fields can be edited.

### Delete Project

Delete requires confirmation.

Deleting a project does not delete the client or payments.

### Dashboard updates

Project add/edit/delete changes:

- Project Status chart
- Completed project counts
- Reports project counts

These updates must come from saved database data.

## 10. Client Behavior

Existing client Add/Edit/Delete controls remain.

After persistence is added:

- Client updates save to Supabase
- Client deletion requires confirmation
- Historical projects/payments/contracts remain where practical using nullable foreign keys
- UI displays "Deleted client" for historical records whose client was removed

Client recurring_fee may remain as a convenience summary field during migration, but recurring_plans becomes the source of truth for active monthly billing.

## 11. Payments Behavior

Existing Create/Edit/Delete controls remain.

Payment editing includes:

- Client
- Invoice number
- Type
- Amount charged
- Amount paid
- Payment date
- Due date
- Method
- Status

Dashboard metrics must always derive from saved payments rather than mock totals.

## 12. Data Loading Strategy

On authenticated app load:

- Fetch clients
- Fetch projects
- Fetch payments
- Fetch contracts
- Fetch recurring plans

Use a centralized data layer so the dashboard and management pages share the same source of truth.

Preferred direction:

- Server-side initial fetch where practical
- Client-side mutation functions for create/update/delete
- Refresh/revalidate affected data after successful writes

Avoid duplicating authoritative business data across unrelated component-local useState stores.

## 13. Error and Loading States

Every mutation should show:

- Saving... / Deleting... state
- Disabled submit button during mutation
- Clear error message on failure
- Success feedback after completion

Pages should show a lightweight loading state during initial data fetch.

The user should never have to guess whether Save worked.

## 14. Security

Because only Tai uses the tracker:

- Require authentication before rendering private tracker pages
- Use a single approved owner account
- Enable RLS on every Supabase table
- All rows include owner_id
- Policies require auth.uid() = owner_id
- Never expose service-role credentials client-side
- Store environment variables in Vercel

The GitHub repository should not contain real Supabase secrets.

## 15. Migration from Current Mock Data

Current mock rows are demo data.

Implementation should provide a deliberate migration path:

- Either seed them into Supabase as sample/demo records
- Or start the persistent database empty

Preferred production behavior: start with an empty real database unless Tai explicitly asks to keep the demo companies.

## 16. Testing Requirements

At minimum verify:

### Persistence

- Add client, refresh, client remains
- Edit client, refresh, change remains
- Delete client, refresh, client remains deleted
- Add/edit/delete payment persists
- Add/edit/delete project persists
- Recurring plan persists

### Dashboard

- Changing selected year changes year-based payment metrics
- Payment edit changes Total Income and chart
- Payment delete changes Total Income and chart
- Project delete changes project-status chart

### Recurring billing

- Mark Paid creates one payment history row
- Full recurring payment advances next_due_date one month
- Partial payment does not incorrectly advance the plan as fully paid
- Pause removes plan from upcoming list
- Resume restores an appropriate future due date

### Security

- Unauthenticated user cannot read tracker data
- Authenticated owner can read/write tracker data
- No service-role secret is included in browser bundles or committed source

### Build

- `npm run build` passes
- Vercel preview reaches READY
- Main dashboard, clients, projects, payments, and recurring billing pages return successfully

## 17. Deployment Plan Boundary

Implementation will occur on the existing feature branch unless the implementation plan recommends a new isolated branch.

The database schema and required environment variables must be established before the app switches away from mock in-memory state.

Production should not be promoted until persistence, year filtering, recurring billing, and project CRUD have been verified together.

## 18. Acceptance Criteria

This upgrade is complete when:

1. Saved clients, projects, payments, contracts metadata, and recurring plans survive refresh and browser restart.
2. Dashboard data comes from persisted records.
3. Dashboard can switch between years.
4. Income chart changes with selected year and saved payments.
5. Projects can be added, edited, and deleted.
6. Monthly recurring clients no longer require a manually recreated payment every month.
7. Mark Paid creates payment history and moves the next recurring due date forward.
8. Only the owner can access tracker data.
9. Vercel build and preview are successful.
