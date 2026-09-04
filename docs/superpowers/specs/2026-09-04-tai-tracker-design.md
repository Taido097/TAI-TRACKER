# TAI Tracker Design

## Goal
Build a private business tracker for DesignedbyTD that matches the approved light, creative dashboard concept and helps manage clients, projects, payments, contracts, files, and reporting in one place.

## Version 1 Scope
Version 1 focuses on the complete user interface and core workflows using sample/local mock data. No production database, authentication, or cloud file storage is included yet. Those will be added after the UI and workflows are approved.

## Technology
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Lucide icons
- Recharts for dashboard charts
- Vercel-ready project structure

## Visual Direction
Match the approved fourth concept:
- Bright white and soft gray surfaces
- Left sidebar navigation
- Warm gold/olive accent color
- Clean black typography
- Rounded cards with subtle borders
- Spacious desktop layout
- Responsive mobile/tablet layout
- DesignedbyTD branding

## App Structure

### Dashboard
The home page shows:
- Total income
- Active clients
- Outstanding invoices
- Monthly recurring revenue
- Income trend chart
- Project status donut chart
- Recent clients
- Recent activity
- Upcoming payments
- Quick actions

Quick actions:
- Add Client
- Create Invoice
- Upload Contract
- View Reports

### Clients
Client list and detail workflow.

Client fields:
- Client name
- Business name
- Email
- Phone
- Website/domain
- Status
- Start date
- Launch date
- Package
- Project value
- Recurring fee
- Notes

Client statuses:
- Lead
- Demo
- Contract Signed
- Building
- Completed
- Maintenance

### Projects
Track website jobs separately from client identity.

Project fields:
- Client
- Project name
- Type
- Status
- Start date
- Target launch date
- Price
- Progress
- Notes

Project statuses:
- Planning
- In Progress
- On Hold
- Completed

### Payments
Track all money received or owed.

Payment fields:
- Client
- Invoice number
- Payment type
- Amount charged
- Amount paid
- Payment date
- Due date
- Payment method
- Status

Payment types:
- Website
- Hosting
- Maintenance
- Domain
- Other

Payment statuses:
- Paid
- Unpaid
- Partial
- Overdue

### Contracts
Contracts page lists client agreements and related metadata.

Fields:
- Client
- Contract name
- Signed date
- Status
- File placeholder/link field

Version 1 does not persist uploaded files. The UI will simulate the upload workflow and prepare the structure for storage in Version 2.

### Files
A client-focused file browser UI with categories:
- Contracts
- Invoices
- Assets
- Website

Version 1 uses mock file records only.

### Reports
Reports include:
- Monthly income
- Project income
- Recurring revenue
- Outstanding balance
- Client growth
- Payment status breakdown

### Settings
Basic UI preferences and business profile placeholders:
- Business name
- Owner name
- Contact email
- Currency
- Default recurring fee

## Navigation
Persistent desktop sidebar:
- Dashboard
- Clients
- Projects
- Payments
- Contracts
- Files
- Reports
- Settings

On mobile, the sidebar becomes a collapsible drawer.

## Search and Filtering
Global top-bar search searches mock clients, projects, and invoices.

Pages include lightweight filtering where useful:
- Client status
- Project status
- Payment status
- Date range on dashboard/report views

## Data Architecture for Version 1
Use typed mock data stored in the app code.

Suggested modules:
- `lib/data/clients.ts`
- `lib/data/projects.ts`
- `lib/data/payments.ts`
- `lib/data/contracts.ts`
- `lib/data/activity.ts`

All dashboard calculations derive from these records so the interface behaves realistically.

## Component Architecture
Reusable units:
- AppShell
- Sidebar
- Topbar
- StatCard
- IncomeChart
- ProjectStatusChart
- DataTable
- StatusBadge
- EmptyState
- AddClientDialog
- CreateInvoiceDialog
- UploadContractDialog

Each component should have one clear purpose and accept typed props.

## Interaction Behavior
- Sidebar navigation changes routes normally.
- Add Client opens a working form dialog and adds the new record to in-memory client state for the current session.
- Create Invoice opens a working invoice form and adds an in-memory payment/invoice record.
- Upload Contract opens a file-selection style dialog, but Version 1 stores only mock metadata for the current session.
- Search filters visible records.
- Dashboard date-range controls update chart presentation where practical.

Because Version 1 has no database, refreshing the browser resets records to the original sample data.

## Error Handling
Forms will validate required fields and numeric amounts.
The UI will show clear inline validation messages and avoid invalid dashboard totals.

## Testing
Minimum checks:
- App builds successfully
- All routes render
- Desktop sidebar works
- Mobile navigation works
- Dashboard charts render from mock data
- Add Client form validates and updates UI
- Create Invoice form validates and updates UI
- Search/filter interactions work
- No major horizontal overflow at mobile widths

## Version 2 Direction
After Version 1 design approval:
- Add authentication
- Connect PostgreSQL/Supabase database
- Add persistent CRUD operations
- Add real contract/invoice file storage
- Add protected private access
- Add Vercel environment variables
- Add optional recurring-payment reminders

## Success Criteria
Version 1 is successful when:
1. The dashboard visually matches the approved fourth concept closely.
2. The app feels like a real DesignedbyTD business tracker rather than a generic template.
3. Core navigation and forms work.
4. The layout is usable on desktop and mobile.
5. The project is cleanly structured for a later database-backed Version 2.
