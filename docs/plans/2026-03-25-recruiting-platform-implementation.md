# Denali Recruiting Platform — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:executing-plans to implement this plan task-by-task.

**Goal:** Build the Phase 1 recruiting platform that replaces Denali's manual Excel/Outlook workflow with a real-time, SOC 2-compliant web application for 8 recruiters, 1 recruiting manager, and hiring managers.

**Architecture:** Monolithic Next.js 15 app with App Router, PostgreSQL via Prisma, Tailwind CSS, and NextAuth.js for SSO. Single codebase, single Docker deployment. RBAC enforced at middleware + query level. 34 database entities covering recruiting workflow + compliance.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL with pgcrypto, NextAuth.js, ExcelJS, Docker, GitHub Actions

**Design Doc:** `docs/plans/2026-03-25-recruiting-platform-design.md`

---

## Task 0: Project Scaffolding & Docker Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- Create: `Dockerfile`, `docker-compose.yml`, `.env.example`, `.env.local`
- Create: `.gitignore`, `.eslintrc.json`, `.prettierrc`
- Create: `app/layout.tsx`, `app/page.tsx`

**Step 1: Initialize Next.js 15 project with TypeScript**

```bash
cd "/Users/devin/Documents/Life & Work/Denali/Head of Software Solutions/Claude & AI/Recruiting_Life_Is_Good"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

**Step 2: Install core dependencies**

```bash
npm install prisma @prisma/client next-auth @auth/prisma-adapter
npm install exceljs bcryptjs uuid
npm install -D @types/bcryptjs @types/uuid prettier eslint-config-prettier
```

**Step 3: Create Docker Compose for PostgreSQL**

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: denali
      POSTGRES_PASSWORD: denali_dev
      POSTGRES_DB: recruiting
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**Step 4: Create .env.local**

```env
DATABASE_URL="postgresql://denali:denali_dev@localhost:5432/recruiting"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
ENCRYPTION_KEY="dev-encryption-key-32-chars-long!"
```

**Step 5: Create production Dockerfile**

```dockerfile
# Multi-stage build
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "server.js"]
```

**Step 6: Configure Tailwind with Denali brand tokens**

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        denali: {
          black: "#0A0A0A",
          cyan: "#00C9FF",
          dark: "#001419",
          gray: { 100: "#F5F5F5", 200: "#E5E5E5", 300: "#D4D4D4", 400: "#A3A3A3", 500: "#737373", 600: "#525252", 700: "#404040", 800: "#262626", 900: "#171717" },
        },
      },
      fontFamily: {
        sans: ["Inter Tight", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

**Step 7: Verify everything runs**

```bash
docker compose up -d
npm run dev
# Visit http://localhost:3000 — should see Next.js default page
```

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: project scaffolding — Next.js 15, TypeScript, Tailwind, Docker, PostgreSQL"
```

---

## Task 1: Prisma Schema — All 34 Entities

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/db/client.ts` (singleton Prisma client)

**Step 1: Initialize Prisma**

```bash
npx prisma init
```

**Step 2: Write the complete Prisma schema**

Write `prisma/schema.prisma` with all 34 entities as defined in the design doc. This is the single most critical file — every feature depends on it.

Key modeling decisions:
- All encrypted fields (Tier 1 + Tier 2) are stored as `String` — encryption/decryption handled in application layer
- `EEOSelfIdentification` has a candidateId but is NEVER included in candidate queries (physically separated)
- `AuditLog` is append-only — no `@@map` to a partitioned table (partitioning configured at PostgreSQL level)
- M2M relations: Requisition ↔ User (recruiters), Requisition ↔ PostingChannel, Interview ↔ User (interviewers)
- Enums for: Role, ReqStatus, CandidateStage, OfferStatus, BackgroundCheckStatus, BackgroundCheckType, NdaStatus, etc.

**Step 3: Create Prisma client singleton**

```typescript
// lib/db/client.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Step 4: Run initial migration**

```bash
npx prisma migrate dev --name init
```
Expected: Migration creates all 34 tables in PostgreSQL.

**Step 5: Verify schema**

```bash
npx prisma studio
```
Expected: All tables visible in Prisma Studio with correct columns and relations.

**Step 6: Commit**

```bash
git add prisma/ lib/db/
git commit -m "feat: Prisma schema — all 34 entities with relations, enums, and indexes"
```

---

## Task 2: Seed Script — Reference Data

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add prisma.seed config)

**Step 1: Write comprehensive seed script**

`prisma/seed.ts` must seed ALL reference data:
- 22 departments (from PROJECT_REQUIREMENTS.md Section 6 + Filled Positions data)
- 14 locations (WA, IN, UK, India, Lebanon, Brazil, CO, FL, Guatemala, KS, MI, OH, TN, TX)
- 12 source channels (LinkedIn, ADP, Agency, Referral, HM, Internal Transfer, Client, Craigslist, Rehire, Staffing Technologies, Laptop Co., FTE to 1099)
- 9 agencies (Rocket Staffing, Lynx Recruitment, Staffing Technologies, Field Nation, Logistics Plus, PNW Controls, Metni Engineering, The Functionary, Argano LLC)
- 8 pipeline stages (Sourced, Submitted, Screen, Interview, Debrief, Offer Extended, Offer Accepted, Hired)
- 7 posting channels (Indeed, CareerBuilder, Monster, LinkedIn, Facebook, ADP Career Page, Craigslist)
- 7 employee types (Type 1 through Type 9, with 4A)
- 3+ clients (Amazon, hospital clients, Microsoft — with default compliance rules)
- ~30 data retention policies (per entity type x per jurisdiction)
- 4 privacy notice versions (US, UK, Ireland, India — placeholder content, legal review required)
- 3 dev-mode users (1 Recruiting Manager, 1 Recruiter, 1 Hiring Manager)
- 2 minimum wage values (Federal $7.25, WA $16.66)

**Step 2: Add seed config to package.json**

```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

```bash
npm install -D tsx
```

**Step 3: Run seed**

```bash
npx prisma db seed
```
Expected: All reference data inserted. No errors.

**Step 4: Verify seed data**

```bash
npx prisma studio
```
Check each reference table has the expected row count.

**Step 5: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: seed script — all reference data (departments, locations, sources, agencies, stages, etc.)"
```

---

## Task 3: Auth — NextAuth.js + Dev Bypass + RBAC

**Files:**
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `lib/auth/config.ts` (NextAuth config)
- Create: `lib/auth/rbac.ts` (role-based access middleware)
- Create: `lib/auth/session.ts` (session helpers)
- Create: `middleware.ts` (Next.js middleware for route protection)
- Create: `app/(auth)/login/page.tsx`

**Step 1: Create NextAuth configuration**

`lib/auth/config.ts`:
- Microsoft Entra ID provider (configured from env vars, only active when `AZURE_AD_CLIENT_ID` is set)
- Credentials provider for dev mode (only when `NODE_ENV=development`)
- Prisma adapter for session/user storage
- JWT callbacks to include role, userId, and data classification access
- Session callback to expose role and permissions to the client

**Step 2: Create RBAC middleware**

`lib/auth/rbac.ts`:
- `requireRole(roles: Role[])` — API route wrapper that checks JWT role
- `requirePermission(permission: string)` — checks specific permissions (canViewCompensation, canViewBackgroundChecks, etc.)
- `scopeQuery(session)` — returns WHERE clause scoping based on role:
  - Recruiter: `{ recruiters: { some: { id: session.userId } } }`
  - HM: `{ hiringManagerId: session.userId }`
  - Recruiting Manager: `{}` (no restriction)

**Step 3: Create Next.js middleware for route protection**

`middleware.ts`:
- Protect all `/(recruiter)`, `/(manager)`, `/(admin)` routes
- Redirect unauthenticated users to `/login`
- Check role-based route access:
  - `/(recruiter)/*` → Recruiter or Recruiting Manager
  - `/(manager)/*` → Hiring Manager or Recruiting Manager
  - `/(admin)/*` → Recruiting Manager only

**Step 4: Create login page**

`app/(auth)/login/page.tsx`:
- Dev mode: show email/password form with pre-filled test credentials
- Production mode: "Sign in with Microsoft" button only
- Denali branding (dark theme, logo)

**Step 5: Test auth flow**

```bash
npm run dev
# Visit http://localhost:3000/login
# Sign in as dev recruiter → should redirect to /(recruiter)/dashboard
# Sign in as dev HM → should redirect to /(manager)/dashboard
# Sign in as dev admin → should redirect to /(admin)/dashboard
```

**Step 6: Commit**

```bash
git add app/api/auth/ lib/auth/ middleware.ts app/\(auth\)/
git commit -m "feat: auth — NextAuth.js with Microsoft Entra SSO + dev bypass + RBAC middleware"
```

---

## Task 4: Audit Trail & Encryption Services

**Files:**
- Create: `lib/audit/service.ts`
- Create: `lib/audit/middleware.ts` (API middleware for auto-logging)
- Create: `lib/encryption/service.ts`
- Create: `lib/encryption/fields.ts` (field-level encrypt/decrypt config)

**Step 1: Build audit trail service**

`lib/audit/service.ts`:
- `logAction(params: { userId, action, entityType, entityId, changes, ipAddress, sessionId })` — INSERT into AuditLog
- `logRead(params: { userId, entityType, entityId, ipAddress, sessionId })` — log PII access events
- Never throws (fire-and-forget with error logging) — audit failures must not break user operations
- Types for actions: CREATE, UPDATE, DELETE, STAGE_TRANSITION, READ_PII, LOGIN, LOGOUT, EXPORT, IMPORT

**Step 2: Build audit API middleware**

`lib/audit/middleware.ts`:
- Wraps API route handlers
- Auto-captures: userId from session, IP from request headers, action from HTTP method
- On mutations: captures before/after state from Prisma result
- On PII reads: logs READ_PII for Tier 1 and Tier 2 field access

**Step 3: Build encryption service**

`lib/encryption/service.ts`:
- `encrypt(plaintext: string): string` — AES-256-GCM encryption using `ENCRYPTION_KEY` env var
- `decrypt(ciphertext: string): string` — corresponding decryption
- Output format: `iv:authTag:ciphertext` (base64 encoded)
- Throws clear error if `ENCRYPTION_KEY` is not set or wrong length

**Step 4: Build field-level config**

`lib/encryption/fields.ts`:
- Defines which entity fields are encrypted:
  - Tier 1: BackgroundCheck result fields
  - Tier 2: Candidate.phone, Candidate.email, Candidate.compensationExpectation, Offer.salary, Offer.payRate, Offer.billRate, AgencyFee.amount
- Prisma client extension or utility functions: `encryptCandidateFields(data)`, `decryptCandidateFields(data)`

**Step 5: Write tests**

```bash
# Test encryption round-trip
# Test audit log insertion
# Test encrypted field utility functions
```

**Step 6: Commit**

```bash
git add lib/audit/ lib/encryption/
git commit -m "feat: audit trail service + AES-256-GCM field encryption — SOC 2 compliance layer"
```

---

## Task 5: API Routes — Reference Data CRUD

**Files:**
- Create: `app/api/admin/departments/route.ts`
- Create: `app/api/admin/locations/route.ts`
- Create: `app/api/admin/sources/route.ts`
- Create: `app/api/admin/agencies/route.ts`
- Create: `app/api/admin/clients/route.ts`
- Create: `app/api/admin/employee-types/route.ts`
- Create: `app/api/admin/posting-channels/route.ts`
- Create: `app/api/admin/stages/route.ts`
- Create: `app/api/admin/users/route.ts`
- Create: `app/api/admin/cost-config/route.ts`
- Create: `app/api/budget/route.ts`
- Create: `app/api/notifications/route.ts`

**Step 1: Create shared API helpers**

- `lib/api/response.ts` — standardized response format: `{ data }` or `{ error, code, details }`
- `lib/api/validation.ts` — input validation helpers (required fields, types, min/max)
- `lib/api/pagination.ts` — cursor-based pagination helper

**Step 2: Create reference data API routes**

Each route follows the same pattern:
- GET: list all (with optional search/filter), requires Recruiting Manager role
- POST: create new, requires Recruiting Manager role
- Each mutation: audit logged, optimistic concurrency via `updatedAt`

**Step 3: Create notifications API**

- GET `/api/notifications` — list unread + recent for current user
- PATCH `/api/notifications/[id]` — mark as read
- POST `/api/notifications/mark-all-read` — mark all as read

**Step 4: Verify all routes**

```bash
# Use curl or Prisma Studio to verify CRUD operations
curl -X GET http://localhost:3000/api/admin/departments -H "Cookie: ..."
```

**Step 5: Commit**

```bash
git add app/api/admin/ app/api/budget/ app/api/notifications/ lib/api/
git commit -m "feat: API routes — reference data CRUD, notifications, budget management"
```

---

## Task 6: API Routes — Requisitions

**Files:**
- Create: `app/api/reqs/route.ts` (list + create)
- Create: `app/api/reqs/[id]/route.ts` (get + update + delete)
- Create: `app/api/reqs/[id]/recruiters/route.ts` (manage recruiter assignments)
- Create: `app/api/reqs/[id]/postings/route.ts` (manage posting channels)
- Create: `lib/enforcement/req-rules.ts` (pay range enforcement)

**Step 1: Create requisition CRUD**

- GET: list reqs scoped by role (recruiter sees own assigned, HM sees own, admin sees all)
- POST: create new req — **enforce pay range required** (WA EPOA)
- PUT: update req
- Optimistic concurrency on all updates

**Step 2: Create enforcement rules**

`lib/enforcement/req-rules.ts`:
- `validateReqForPosting(req)` — throws if payRangeMin or payRangeMax is null
- Returns structured error: `{ code: "ENFORCEMENT_BLOCKED", details: { rule: "WA_EPOA_PAY_RANGE", message: "..." } }`

**Step 3: Create recruiter assignment endpoints**

- POST: assign recruiter(s) to req
- DELETE: remove recruiter from req
- Supports multi-recruiter (M2M)

**Step 4: Create posting channel endpoints**

- POST: mark req as posted on a channel (with postedAt timestamp)
- DELETE: mark posting as removed (set removedAt)

**Step 5: Commit**

```bash
git add app/api/reqs/ lib/enforcement/
git commit -m "feat: requisition API — CRUD, multi-recruiter assignment, posting tracking, WA pay range enforcement"
```

---

## Task 7: API Routes — Candidates & Stage Transitions

**Files:**
- Create: `app/api/candidates/route.ts`
- Create: `app/api/candidates/[id]/route.ts`
- Create: `app/api/candidates/[id]/documents/route.ts`
- Create: `app/api/candidates/[id]/dsar/route.ts`
- Create: `app/api/transitions/route.ts`
- Create: `lib/enforcement/candidate-rules.ts`

**Step 1: Create candidate CRUD**

- GET: list candidates (scoped by role + req assignment)
- POST: create candidate — **duplicate detection** (check name + email, return warning)
- PUT: update candidate
- Encrypted fields: phone, email, compensationExpectation

**Step 2: Create stage transition logic**

`app/api/transitions/route.ts`:
- POST: move candidate to new stage
- Creates StageTransition record (fromStage, toStage, movedBy, movedAt)
- Updates Candidate.currentStage
- **Enforcement checks:**
  - If moving to rejected AND BackgroundCheck exists → FCRA check (pre-adverse sent? waiting period elapsed? adverse action sent?)
  - If moving to Interview AND ndaRequired → check ndaStatus = "signed"
  - If moving to BackgroundCheck AND current stage < Screen → block (Fair Chance Act)

**Step 3: Create candidate document endpoints**

- POST: upload document metadata (file upload handled separately or via presigned URL)
- GET: list documents for candidate
- DELETE: remove document

**Step 4: Create DSAR endpoint**

- GET `/api/candidates/[id]/dsar` — export all candidate data as JSON
- DELETE `/api/candidates/[id]/dsar` — purge candidate data (with legal hold + retention checks)

**Step 5: Commit**

```bash
git add app/api/candidates/ app/api/transitions/ lib/enforcement/candidate-rules.ts
git commit -m "feat: candidate API — CRUD, stage transitions, enforcement rules, DSAR, document management"
```

---

## Task 8: API Routes — Interviews, Offers, Background Checks

**Files:**
- Create: `app/api/interviews/route.ts`
- Create: `app/api/interviews/[id]/route.ts`
- Create: `app/api/offers/route.ts`
- Create: `app/api/offers/[id]/route.ts`
- Create: `app/api/offers/[id]/revisions/route.ts`
- Create: `app/api/background-checks/route.ts`
- Create: `app/api/background-checks/[id]/route.ts`
- Create: `lib/enforcement/offer-rules.ts`
- Create: `lib/enforcement/bgcheck-rules.ts`

**Step 1: Create interview CRUD**

- POST: create interview — **NDA enforcement** (block if candidate NDA not signed)
- PUT: update (reschedule → set rescheduledFromInterviewId on new record)
- Interviewers: M2M with Users

**Step 2: Create offer CRUD with approval workflow**

- POST: create offer (status = "draft")
- PUT: update offer
- POST `/api/offers/[id]/approve` — HM approves (sets approvedBy, approvedAt, status = "approved")
- POST `/api/offers/[id]/extend` — recruiter extends to candidate (status = "extended")
- POST `/api/offers/[id]/respond` — record candidate response (accepted/declined/rescinded)
- **Minimum wage validation**: warn if payRate < applicable minimum wage

**Step 3: Create offer revision tracking**

- POST `/api/offers/[id]/revisions` — log negotiation step
- GET: list revision history for an offer

**Step 4: Create background check tracking**

- POST: create background check (type, candidate)
- PUT: update status, record FCRA workflow timestamps
- **Enforcement**: cannot create if candidate has not passed Screen stage
- Auto-calculate waitingPeriodExpiresAt when preAdverseNoticeSentAt is set

**Step 5: Commit**

```bash
git add app/api/interviews/ app/api/offers/ app/api/background-checks/ lib/enforcement/
git commit -m "feat: interview, offer, background check APIs — NDA gate, offer approval, FCRA workflow"
```

---

## Task 9: API Routes — Reports & Excel Export

**Files:**
- Create: `app/api/reports/[type]/route.ts`
- Create: `lib/reports/generators/daily.ts`
- Create: `lib/reports/generators/open-reqs.ts`
- Create: `lib/reports/generators/ytd-performance.ts`
- Create: `lib/reports/generators/interview-tracking.ts`
- Create: `lib/reports/generators/rescinded-offers.ts`
- Create: `lib/reports/generators/pir.ts`
- Create: `lib/reports/generators/filled-positions.ts`
- Create: `lib/reports/generators/cost-per-hire.ts`
- Create: `lib/reports/generators/referral-bonus.ts`
- Create: `lib/reports/generators/agency-fees.ts`
- Create: `lib/reports/generators/req-audit.ts`
- Create: `lib/reports/generators/time-to-fill.ts`
- Create: `lib/excel/exporter.ts` (shared Excel formatting: Denali branding, headers, column widths)
- Create: `lib/excel/importer.ts` (Excel import pipeline)

**Step 1: Build shared Excel exporter**

`lib/excel/exporter.ts`:
- Creates branded workbook: Denali logo in header, report title, generated date
- Auto-formats: column widths, number formats (currency for fees, dates, percentages)
- Returns Buffer for download

**Step 2: Build each report generator**

Each generator:
- Queries the database for the relevant data
- Returns structured data + metadata (title, columns, filters applied)
- Can output to: JSON (for dashboard display) or Excel (via exporter)

**Step 3: Build report API route**

`app/api/reports/[type]/route.ts`:
- GET with query params for filters (dateRange, recruiter, department, etc.)
- `Accept: application/json` → returns JSON for dashboard
- `Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` → returns Excel download

**Step 4: Build Excel import pipeline**

`lib/excel/importer.ts`:
- `parseExcel(buffer, template)` → parsed rows
- `validateRows(rows, template)` → validated rows + errors
- `previewImport(validatedRows)` → summary (counts, duplicates, issues)
- `executeImport(validatedRows)` → wrapped in transaction, all-or-nothing
- Templates for: YTD Report, Open Req Report, Filled Positions

**Step 5: Build import API route**

`app/api/import/route.ts`:
- POST: upload Excel file + template type
- Returns preview (what will be imported, issues found)
- POST with `confirm=true`: execute the import

**Step 6: Commit**

```bash
git add lib/reports/ lib/excel/ app/api/reports/ app/api/import/
git commit -m "feat: report generation engine — all 12 reports + Excel export + import pipeline"
```

---

## Task 10: API Routes — Compliance (EEO, Consent, Legal Holds, Retention)

**Files:**
- Create: `app/api/eeo/route.ts`
- Create: `app/api/compliance/consent/route.ts`
- Create: `app/api/compliance/holds/route.ts`
- Create: `app/api/compliance/retention/route.ts`
- Create: `app/api/compliance/dsar/route.ts`
- Create: `app/api/compliance/breaches/route.ts`
- Create: `app/api/metrics/snapshot/route.ts`
- Create: `lib/compliance/retention-engine.ts`

**Step 1: Create EEO endpoints**

- POST: record EEO self-identification (stored in separate table)
- GET: aggregate report only (counts by race, gender, veteran status — never individual data)
- Adverse impact analysis endpoint: four-fifths rule calculation by pipeline stage

**Step 2: Create consent management endpoints**

- POST: log consent for a candidate
- GET: list consents for a candidate (with expiry status)
- PUT: record consent withdrawal
- GET `/api/compliance/consent/expiring` — list consents expiring within 30 days

**Step 3: Create legal hold endpoints**

- POST: create legal hold on entity
- GET: list active holds
- PUT: release hold (set releasedBy, releasedAt)

**Step 4: Build retention engine**

`lib/compliance/retention-engine.ts`:
- Checks DataRetentionPolicy for each entity type + jurisdiction
- Identifies records past retention period
- Skips records with active LegalHold
- Logs every deletion in AuditLog
- Designed to run as a scheduled job (cron or API-triggered)

**Step 5: Create DSAR management endpoints**

- POST: create DSAR request (with auto-calculated due date by jurisdiction)
- GET: list open DSARs with SLA status
- PUT: update DSAR status (completed/denied with response details)

**Step 6: Create metric snapshot endpoint**

- POST: record a metric snapshot (for trending charts)
- GET: query snapshots by metric type and date range
- Used for: historical trending data imported from Excel, ongoing daily snapshots

**Step 7: Commit**

```bash
git add app/api/eeo/ app/api/compliance/ app/api/metrics/ lib/compliance/
git commit -m "feat: compliance APIs — EEO, consent, legal holds, retention engine, DSAR, breach tracking"
```

---

## Task 11: UI Shell — Layout, Navigation, Notification Bell

**Files:**
- Create: `app/(recruiter)/layout.tsx`
- Create: `app/(manager)/layout.tsx`
- Create: `app/(admin)/layout.tsx`
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/Header.tsx`
- Create: `components/layout/NotificationBell.tsx`
- Create: `components/ui/Button.tsx`, `Input.tsx`, `Badge.tsx`, `Modal.tsx`, `Toast.tsx`, `Table.tsx`, `Card.tsx`

**Step 1: Build Denali-branded UI primitives**

Create the core component library with Denali dark theme:
- Button (primary/secondary/danger/ghost variants)
- Input (text, select, checkbox, date, number — with validation states)
- Badge (status badges: green/yellow/red/gray)
- Modal (confirmation dialogs, enforcement block modals)
- Toast (success/error/warning notifications)
- Table (sortable, filterable, with column hiding)
- Card (dashboard panels)

**Step 2: Build sidebar navigation**

`components/layout/Sidebar.tsx`:
- Role-aware: shows different nav items per role
- Recruiter: Dashboard, Pipeline, Requisitions, Hires
- HM: Dashboard, My Requisitions
- Admin: Dashboard, Reports, Financial, Compliance, Settings, Audit Log
- Collapsible on mobile

**Step 3: Build header with notification bell**

`components/layout/Header.tsx`:
- User avatar + name from session
- Notification bell with unread count badge
- Click bell → dropdown showing recent notifications
- Click notification → navigate to relevant page + mark as read

**Step 4: Build route group layouts**

Each route group layout wraps its pages in the sidebar + header shell, passing the correct navigation items.

**Step 5: Commit**

```bash
git add app/\(recruiter\)/layout.tsx app/\(manager\)/layout.tsx app/\(admin\)/layout.tsx components/
git commit -m "feat: UI shell — Denali-branded components, sidebar nav, header, notification bell"
```

---

## Task 12: Recruiter Dashboard — Morning Coffee View

**Files:**
- Create: `app/(recruiter)/dashboard/page.tsx`
- Create: `components/dashboard/MyCandidatesToday.tsx`
- Create: `components/dashboard/MyNumbers.tsx`
- Create: `components/dashboard/NewCandidates.tsx`
- Create: `components/dashboard/Alerts.tsx`
- Create: `components/dashboard/QuickActions.tsx`
- Create: `components/dashboard/CalendarView.tsx`

**Step 1: Build "My Candidates Today" hero panel**

Three columns:
- Needs Follow-up (candidates with no activity > 48h)
- Interviews Today (from Interview table, today's date)
- Awaiting Decision (candidates in Debrief or Offer Extended stage)

**Step 2: Build "My Numbers This Week" panel**

- Submittals, interviews, hires counts for current week
- vs. weekly target (configurable per recruiter or team-wide)
- Progress bar visualization

**Step 3: Build "New Candidates" panel**

- Candidates with appliedAt in last 24 hours for recruiter's assigned reqs
- Shows name, req title, source

**Step 4: Build "Alerts" panel**

- Candidates > 48h without action
- Reqs with no activity > 5 days
- Offers pending HM approval > 3 days
- FCRA waiting periods expiring within 2 days
- NDA pending for candidates with upcoming interviews
- Offer expiring within 3 days

**Step 5: Build "Quick Actions" panel**

Buttons that open modals:
- Submit Candidate (select req → add candidate form)
- Schedule Interview (select candidate → interview form with NDA check)
- Log Screen Notes (select candidate → notes form)
- Extend Offer (select candidate → offer form)

**Step 6: Build "Calendar" panel**

Platform-data only (Outlook deferred): shows today's interviews from Interview table, sorted by time.

**Step 7: Commit**

```bash
git add app/\(recruiter\)/dashboard/ components/dashboard/
git commit -m "feat: recruiter dashboard — morning coffee view with all 6 panels"
```

---

## Task 13: Pipeline Kanban Board

**Files:**
- Create: `app/(recruiter)/pipeline/page.tsx`
- Create: `app/(recruiter)/pipeline/[reqId]/page.tsx`
- Create: `components/pipeline/KanbanBoard.tsx`
- Create: `components/pipeline/KanbanColumn.tsx`
- Create: `components/pipeline/CandidateCard.tsx`
- Create: `components/pipeline/CandidateSlideOut.tsx`
- Create: `components/pipeline/FilterBar.tsx`
- Create: `components/pipeline/BulkActions.tsx`

**Step 1: Install drag-and-drop library**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Step 2: Build Kanban board**

- 8 columns (one per pipeline stage)
- Candidate cards with: name, req title, days in stage, source badge
- Color coding: green (<7d), yellow (7-14d), red (>14d in same stage)
- Drag-and-drop between columns
- Server-side validation on every drop (calls `/api/transitions`)
- Visual lock icon on cards that can't be moved (FCRA enforcement)

**Step 3: Build filter bar**

Filters: recruiter, department, location, date range, source, billable/non-billable

**Step 4: Build candidate slide-out**

Click a card → slide-out panel from right:
- Candidate details (name, contact, source, applied date)
- Current stage + stage history timeline
- Interview history with scorecards
- Notes
- Documents
- Offer details (if applicable)
- Quick action buttons (move stage, schedule interview, add note)

**Step 5: Build bulk actions**

Select multiple cards → action bar appears:
- Move to stage (with enforcement checks)
- Bulk reject (with reason code selection)
- Tag candidates

**Step 6: Build mobile view**

On screens < 768px: Kanban collapses to stacked list view grouped by stage. Tap card → full-screen detail instead of slide-out.

**Step 7: Commit**

```bash
git add app/\(recruiter\)/pipeline/ components/pipeline/
git commit -m "feat: pipeline Kanban board — drag-and-drop, filtering, enforcement rules, mobile responsive"
```

---

## Task 14: Open Requisitions & Candidate Detail Pages

**Files:**
- Create: `app/(recruiter)/reqs/page.tsx`
- Create: `app/(recruiter)/reqs/new/page.tsx`
- Create: `app/(recruiter)/reqs/[id]/page.tsx`
- Create: `app/(recruiter)/candidates/[id]/page.tsx`
- Create: `app/(recruiter)/hires/page.tsx`
- Create: `components/reqs/ReqTable.tsx`
- Create: `components/reqs/ReqForm.tsx`
- Create: `components/reqs/MiniPipeline.tsx`
- Create: `components/candidates/CandidateDetail.tsx`
- Create: `components/candidates/StageTimeline.tsx`
- Create: `components/candidates/InterviewList.tsx`
- Create: `components/candidates/OfferDetail.tsx`

**Step 1: Build open requisitions table**

Sortable/filterable table:
- Columns: req#, title, department, HM, recruiter(s), days open, pipeline count, status, pay range
- Row expand → mini pipeline showing candidate distribution per stage
- Target date monitoring: red (missed), yellow (approaching within 7d), green (on track)
- "New Requisition" button → req creation form (pay range required)

**Step 2: Build req creation form**

All fields from Requisition entity. Pay range validation: cannot save without payRangeMin + payRangeMax (WA EPOA).

**Step 3: Build candidate detail page**

Full page view (for deep-dive, vs. slide-out for quick actions):
- Header: name, current stage badge, source, applied date
- Stage timeline: visual history of all stage transitions with dates and who moved them
- Interview section: list of all interviews with scorecards, feedback, outcomes
- Offer section: offer details, approval status, revision history
- Documents section: uploaded documents
- Notes section: chronological notes
- NDA status indicator
- Background check status (Tier 1 — only visible to authorized users)

**Step 4: Build filled positions / hires log**

Table of all candidates in "Hired" stage:
- Columns: name, title, department, recruiter, source, offer date, start date, time-to-fill, agency fee
- Filterable by quarter, department, recruiter, source

**Step 5: Commit**

```bash
git add app/\(recruiter\)/reqs/ app/\(recruiter\)/candidates/ app/\(recruiter\)/hires/ components/reqs/ components/candidates/
git commit -m "feat: requisitions table, candidate detail, hires log — with pay range enforcement and stage timeline"
```

---

## Task 15: Interview & Offer Management UI

**Files:**
- Create: `components/interviews/InterviewForm.tsx`
- Create: `components/interviews/NdaGate.tsx`
- Create: `components/interviews/Scorecard.tsx`
- Create: `components/offers/OfferForm.tsx`
- Create: `components/offers/ApprovalBanner.tsx`
- Create: `components/offers/NegotiationHistory.tsx`
- Create: `components/offers/MinWageWarning.tsx`

**Step 1: Build interview creation form with NDA gate**

- Check candidate NDA status before allowing form submission
- If NDA not signed: show modal explaining requirement, offer to send NDA
- Form: date/time, type, interviewers (multi-select), notes
- Time conflict warning if interviewer has another interview

**Step 2: Build scorecard UI**

- Structured competency-based scorecard (JSON schema)
- Rating scale per competency (1-5)
- Free-text feedback area
- Overall recommendation: pass / fail / hold
- Mobile-friendly for submission right after interview

**Step 3: Build offer form with approval workflow**

- Create offer: salary, pay rate, bill rate, start date, employee type, exempt status
- Minimum wage warning (non-blocking for exempt)
- Offer expiration date field
- Submit → creates draft → appears in HM approval queue
- Show approval status banner on offer detail

**Step 4: Build negotiation history**

- List of offer revisions with: proposed amount, proposed by (candidate/employer), date, notes
- "Log Counter-Offer" button → revision form

**Step 5: Commit**

```bash
git add components/interviews/ components/offers/
git commit -m "feat: interview + offer management UI — NDA gate, scorecards, approval workflow, negotiation tracking"
```

---

## Task 16: Hiring Manager Portal

**Files:**
- Create: `app/(manager)/dashboard/page.tsx`
- Create: `app/(manager)/reqs/[id]/page.tsx`
- Create: `app/(manager)/reqs/[id]/candidates/[id]/page.tsx`
- Create: `components/manager/HmDashboard.tsx`
- Create: `components/manager/CandidateReviewQueue.tsx`
- Create: `components/manager/OfferApprovalQueue.tsx`

**Step 1: Build HM dashboard**

- My Open Reqs: list of HM's reqs with status, days open, candidate count
- Pending Actions badge: "3 candidates to review, 1 offer to approve"
- Recent activity: latest stage transitions on their reqs

**Step 2: Build candidate review queue**

- Shows candidates submitted for review (in "Submitted" stage for HM's reqs)
- For each: name, recruiter notes, resume link, source
- Actions: thumbs up (advance to Screen) / thumbs down (reject with reason) / notes

**Step 3: Build offer approval queue**

- Shows offers in "draft" status on HM's reqs
- Details: salary, title, start date, employee type
- Actions: Approve / Request Changes (with notes)
- Approval creates notification for the recruiter

**Step 4: Build HM candidate detail view**

Scoped view — HM sees candidate info relevant to their decision but not compensation or background check data (per RBAC).

**Step 5: Commit**

```bash
git add app/\(manager\)/ components/manager/
git commit -m "feat: hiring manager portal — dashboard, candidate review queue, offer approval"
```

---

## Task 17: Admin Dashboard — Analytics, Leaderboard, Funnel

**Files:**
- Create: `app/(admin)/dashboard/page.tsx`
- Create: `components/admin/Leaderboard.tsx`
- Create: `components/admin/PipelineFunnel.tsx`
- Create: `components/admin/AnalyticsIntelligence.tsx`
- Create: `components/admin/TeamPerformance.tsx`
- Create: `components/charts/FunnelChart.tsx`
- Create: `components/charts/TrendLine.tsx`
- Create: `components/charts/BarChart.tsx`

**Step 1: Install charting library**

```bash
npm install recharts
```

**Step 2: Build recruiter leaderboard**

- Ranked table: recruiter name, submittals, interviews, hires
- Toggleable by: this week / this month / this quarter / YTD
- Trend arrows (up/down vs. prior period)

**Step 3: Build pipeline funnel**

Visual funnel chart showing:
- Candidate count at each stage
- Conversion rate between stages
- Filterable by: req, recruiter, department, date range

**Step 4: Build analytics intelligence panels**

All 9 intelligence items from design doc:
- Bottleneck Detection, Workload Balancing, Source ROI, Seasonal Trends, Agency Cost Efficiency, Time-to-Fill Benchmarks, Forecast, Stale Req Alerts, Source Mix Diversity

**Step 5: Commit**

```bash
git add app/\(admin\)/dashboard/ components/admin/ components/charts/
git commit -m "feat: admin dashboard — leaderboard, pipeline funnel, 9 analytics intelligence panels"
```

---

## Task 18: Admin — Reports Hub, Financial Tracking, Settings

**Files:**
- Create: `app/(admin)/reports/page.tsx`
- Create: `app/(admin)/reports/[type]/page.tsx`
- Create: `app/(admin)/financial/page.tsx`
- Create: `app/(admin)/settings/*` (11 settings pages)
- Create: `app/(admin)/audit-log/page.tsx`
- Create: `components/admin/ReportViewer.tsx`
- Create: `components/admin/FinancialDashboard.tsx`
- Create: `components/admin/SettingsForm.tsx`
- Create: `components/admin/AuditLogViewer.tsx`

**Step 1: Build reports hub**

- List all 12 reports with: name, frequency, last generated, "Generate Now" button
- Click report → report viewer with filter controls + data table + "Export to Excel" button

**Step 2: Build financial tracking dashboard**

- Agency fees by department/quarter (table + bar chart)
- Referral bonus tracking (pending/paid)
- Cost per hire (auto-calculated from CostPerHireConfig + AgencyFee + placements)
- Budget vs. actual spend by department/quarter
- U.S. vs. international fee breakdown

**Step 3: Build settings pages**

11 CRUD pages for all reference data (departments, locations, sources, agencies, clients, posting channels, employee types, pipeline stages, cost config, budget, user management).

Each follows the same pattern: table view + create/edit modal.

**Step 4: Build audit log viewer**

- Searchable table of all audit log entries
- Filters: user, action type, entity type, date range
- Shows: timestamp, user, action, entity, change details (JSON diff)
- 7-year retention noted in UI

**Step 5: Commit**

```bash
git add app/\(admin\)/reports/ app/\(admin\)/financial/ app/\(admin\)/settings/ app/\(admin\)/audit-log/ components/admin/
git commit -m "feat: admin — reports hub, financial tracking, 11 settings pages, audit log viewer"
```

---

## Task 19: Admin — Compliance Dashboard

**Files:**
- Create: `app/(admin)/compliance/page.tsx`
- Create: `app/(admin)/compliance/dsar/page.tsx`
- Create: `app/(admin)/compliance/holds/page.tsx`
- Create: `app/(admin)/compliance/retention/page.tsx`
- Create: `app/(admin)/compliance/breaches/page.tsx`
- Create: `components/compliance/DsarQueue.tsx`
- Create: `components/compliance/LegalHoldManager.tsx`
- Create: `components/compliance/RetentionLog.tsx`
- Create: `components/compliance/BreachRegister.tsx`
- Create: `components/compliance/ConsentTracker.tsx`
- Create: `components/compliance/AdverseImpactReport.tsx`

**Step 1: Build compliance dashboard overview**

Cards showing: open DSARs (with SLA status), active legal holds count, consents expiring within 30 days, FCRA workflows in progress, next retention purge date.

**Step 2: Build DSAR management**

- Queue of all DSAR requests with SLA countdown
- Create new DSAR, update status, record completion
- Link to candidate data export/deletion endpoints

**Step 3: Build legal hold manager**

- Create hold on candidate or requisition
- List active holds with reason and age
- Release hold (requires confirmation)

**Step 4: Build retention log**

- Shows what the retention engine would purge (dry run)
- Manual trigger button for executing purge
- Log of past purge executions (what was deleted, when, by policy)

**Step 5: Build breach register**

- Log breach incidents with classification and affected data
- Auto-calculate notification deadlines by jurisdiction
- Track notifications sent

**Step 6: Build consent tracker**

- List all consents with expiry status
- Filter by: jurisdiction, type, expiring soon
- Bulk send refresh reminders

**Step 7: Build adverse impact report**

- Four-fifths rule calculation by pipeline stage
- Selection rates by demographic group
- Exportable for EEOC reporting

**Step 8: Commit**

```bash
git add app/\(admin\)/compliance/ components/compliance/
git commit -m "feat: compliance dashboard — DSAR, legal holds, retention, breach register, consent, adverse impact"
```

---

## Task 20: Excel Import UI & Data Migration

**Files:**
- Create: `app/(admin)/import/page.tsx`
- Create: `components/import/ImportWizard.tsx`
- Create: `components/import/PreviewTable.tsx`
- Create: `components/import/ImportReport.tsx`

**Step 1: Build import wizard**

Multi-step flow:
1. Select template (YTD Report / Open Req Report / Filled Positions)
2. Upload .xlsx file
3. Preview: show parsed data, highlight issues (duplicates, mismatches, missing fields)
4. Resolve: user decides on each issue (skip, merge, fix)
5. Confirm: execute import (all-or-nothing transaction)
6. Report: show what was imported, what was skipped, why

**Step 2: Build preview table**

- Shows parsed rows with validation status per row
- Red rows: errors (missing required fields, invalid data)
- Yellow rows: warnings (duplicates detected, fuzzy department match)
- Green rows: ready to import
- Inline editing for quick fixes

**Step 3: Execute historical data migration**

Run the migration runbook:
1. Import Open Req Report → Requisitions
2. Import Filled Positions → Candidates + Offers + AgencyFees
3. Import YTD Report → performance data
4. Import historical trending data → MetricSnapshots
5. Reconciliation check

**Step 4: Commit**

```bash
git add app/\(admin\)/import/ components/import/
git commit -m "feat: Excel import wizard — upload, preview, validate, import with transaction safety"
```

---

## Task 21: Polish — Mobile, First Login, Error Boundaries

**Files:**
- Modify: all component files (responsive breakpoints)
- Create: `components/layout/WelcomeBanner.tsx`
- Create: `app/error.tsx` (global error boundary)
- Create: `app/(recruiter)/error.tsx` (route group error boundary)
- Create: `components/ui/ErrorFallback.tsx`
- Create: `components/ui/ToastProvider.tsx`

**Step 1: Mobile responsive pass**

- Dashboard: stack panels vertically on mobile
- Kanban: collapse to list view on < 768px
- Tables: horizontal scroll on mobile
- Scorecard: full-width inputs on mobile
- Sidebar: hamburger menu on mobile
- Touch-friendly tap targets (min 44px)

**Step 2: First-login welcome banner**

- Dismissible banner on first login: "Welcome to the Denali Recruiting Platform"
- Brief tour highlights: dashboard, pipeline, quick actions
- Stored in user preferences (don't show again after dismiss)

**Step 3: Error boundaries**

- Global error boundary at app level
- Route group error boundaries for graceful degradation
- Error fallback UI: "Something went wrong" with retry button
- Toast notifications for API errors

**Step 4: Commit**

```bash
git add components/ app/
git commit -m "feat: mobile responsive, welcome banner, error boundaries, toast notifications"
```

---

## Task 22: Testing & Launch Preparation

**Files:**
- Create: `__tests__/` directory structure mirroring app/
- Create: `jest.config.ts`
- Create: `.github/workflows/ci.yml`

**Step 1: Set up testing framework**

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom @types/jest ts-jest
```

**Step 2: Write critical path tests**

Priority tests:
- Auth: login flow, role-based redirects, session expiry
- RBAC: recruiter can't access admin routes, HM can't see other HM's data
- Enforcement rules: pay range required, FCRA workflow blocks, NDA gate, Fair Chance Act, duplicate detection
- Stage transitions: valid moves, audit trail creation
- Encryption: round-trip encrypt/decrypt, encrypted fields not readable without decryption
- Report generation: each of 12 reports produces correct data shape
- Excel import: transaction safety (all-or-nothing), duplicate handling

**Step 3: Set up CI pipeline**

`.github/workflows/ci.yml`:
- On push/PR: lint → type-check → test → build
- PostgreSQL service container for integration tests
- Fail build on any step failure

**Step 4: Create launch checklist**

- [ ] All seed data verified (departments, locations, sources, agencies, stages)
- [ ] Historical data imported from Excel files
- [ ] 3 dev users can log in and see role-appropriate dashboards
- [ ] All 12 reports generate correctly
- [ ] FCRA enforcement tested (cannot reject after BGC without workflow)
- [ ] Pay range enforcement tested (cannot post req without range)
- [ ] NDA enforcement tested (cannot schedule interview without NDA)
- [ ] Excel export matches expected formatting
- [ ] Mobile responsive on phone/tablet
- [ ] Audit log captures all mutations and PII reads
- [ ] Encryption verified on Tier 1 and Tier 2 fields

**Step 5: Commit**

```bash
git add __tests__/ jest.config.ts .github/
git commit -m "feat: test suite + CI pipeline — critical path tests for auth, RBAC, enforcement, reports"
```

---

## Execution Order & Dependencies

```
Task 0: Project Scaffolding ─────┐
Task 1: Prisma Schema ───────────┤
Task 2: Seed Script ─────────────┤ (depends on Task 1)
Task 3: Auth + RBAC ─────────────┤ (depends on Task 1)
Task 4: Audit + Encryption ──────┘ (depends on Task 1)
                                  │
Task 5: Reference Data APIs ──────┤ (depends on Tasks 1-4)
Task 6: Requisition APIs ─────────┤ (depends on Tasks 1-4)
Task 7: Candidate APIs ───────────┤ (depends on Tasks 1-4)
Task 8: Interview/Offer APIs ─────┤ (depends on Tasks 1-4)
Task 9: Reports + Excel ──────────┤ (depends on Tasks 5-8)
Task 10: Compliance APIs ─────────┘ (depends on Tasks 5-8)
                                  │
Task 11: UI Shell ─────────────────┤ (depends on Task 3)
Task 12: Recruiter Dashboard ──────┤ (depends on Tasks 5-8, 11)
Task 13: Pipeline Kanban ──────────┤ (depends on Tasks 7, 11)
Task 14: Reqs + Candidates Pages ──┤ (depends on Tasks 6-7, 11)
Task 15: Interview + Offer UI ─────┤ (depends on Task 8, 11)
Task 16: HM Portal ───────────────┤ (depends on Tasks 6-8, 11)
Task 17: Admin Dashboard ─────────┤ (depends on Tasks 5-10, 11)
Task 18: Admin Reports + Settings ─┤ (depends on Tasks 9-10, 11)
Task 19: Compliance Dashboard ─────┘ (depends on Task 10, 11)
                                  │
Task 20: Excel Import UI ─────────┤ (depends on Task 9)
Task 21: Polish ───────────────────┤ (depends on Tasks 12-19)
Task 22: Testing + Launch ─────────┘ (depends on all)
```
