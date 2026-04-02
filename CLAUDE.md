# Denali Recruiting Platform — Claude Context

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Install dependencies (if fresh clone)
npm install

# 3. Run database migrations
npx prisma migrate dev

# 4. Seed the database
npx prisma db seed

# 5. Start dev server (port 3001 — port 3000 is used by another project)
PORT=3001 npx next dev --port 3001
```

App runs at http://localhost:3001

## Project Overview

Internal recruiting + onboarding platform for Denali Advanced Integration. Replaces manual Excel/Outlook workflows with a real-time, SOC 2-compliant web application.

- **Phase 1 (COMPLETE):** Recruiting — req intake through hire
- **Phase 2 (COMPLETE):** Onboarding orchestration — hire through Day 1 ready

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with CSS custom properties for dark/light theme
- **Database:** PostgreSQL 16 via Docker Compose
- **ORM:** Prisma 7 with PrismaPg adapter
- **Auth:** NextAuth.js v5 (dev-mode credentials + Microsoft Entra SSO ready)
- **DnD:** @dnd-kit/core for Kanban board
- **Reports:** ExcelJS for branded Excel export
- **Testing:** Playwright for E2E tests

## Prisma 7 Important Pattern

Prisma 7 does NOT support `datasourceUrl` on the client constructor. Must use adapter:

```typescript
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
```

## Current State (2026-04-01)

### What's Built — EVERYTHING

**Phase 1 — Recruiting (COMPLETE):**
- 22 pages across 3 portals (Recruiter, Admin, Hiring Manager) + login
- Kanban pipeline with drag-and-drop (persists to DB)
- All 12 reports with Denali-branded Excel export
- RBAC integrated into API routes (role-based query scoping)
- Audit logging on all CRUD operations + PII access
- AES-256-GCM encryption on sensitive fields
- 13 enforcement rules (WA EPOA, FCRA, NDA, Fair Chance Act, etc.)
- Global candidate search
- Light/dark theme toggle (CSS custom properties)

**Phase 2 — Onboarding (COMPLETE):**
- 10 new entities (OnboardingRecord, PIFData, OnboardingMilestone, etc.)
- Unified PIF + IT form (replaces 2 disconnected forms)
- H-Note auto-generation from PIF data (all 20 SOP fields)
- 13-milestone tracker with SLA targets from SOP timelines
- Manager readiness dashboard
- Equipment tracking (desk setup / ship to home / pickup)
- Candidate prework checklist (I-9, tax, policies)
- Escalation engine for overdue milestones
- International branching (UK/Ireland/India) with skeleton entities
- Greeter assignment with confirmation

**Platform Totals:**
- 22 pages, 44+ API endpoints, 65+ routes
- 44 database tables (34 Phase 1 + 10 Phase 2)
- 13 enforcement rules
- 12 report generators with Excel export
- 36 E2E Playwright tests (all passing)
- Light/dark theme toggle

### What Could Be Enhanced (not phases — polish/integrations)

- Microsoft Entra SSO (config ready, needs IT credentials)
- Outlook/M365 calendar integration
- ADP API integration (currently using Excel import)
- Email delivery of reports (currently platform-only with Excel download)
- Notification bell dropdown (wired to API but dropdown not built)
- Candidate self-service portal (skeleton entities ready)
- Gem ATS integration, Teams/Slack notifications, DocuSign integration

## Project Structure

```
app/
  (auth)/login/              → Login page with dev-mode role selection
  recruiter/                 → Recruiter portal
    dashboard/               → Morning coffee view (5 panels)
    pipeline/                → Kanban board (8 stages, drag-and-drop)
    reqs/                    → Requisitions table + new req form
    hires/                   → Filled positions log
    onboarding/              → Onboarding list + readiness dashboard
    onboarding/[id]/pif/     → Unified PIF + IT form
    onboarding/[id]/h-note/  → H-Note preview + send
  admin/                     → Recruiting Manager portal
    dashboard/               → Leaderboard, funnel, source effectiveness
    reports/                 → 12 report cards with Excel export
    financial/               → Agency fees, referral bonuses
    compliance/              → DSAR, legal holds, retention policies
    onboarding/              → All active onboardings overview
    settings/                → 9 reference data sections
    import/                  → Excel import wizard
    audit-log/               → SOC 2 event viewer
  manager/                   → Hiring Manager portal
    dashboard/               → My reqs, candidate review, offer approvals
    reqs/                    → My Requisitions list
    reqs/[id]/               → Req detail with candidate review actions
  api/                       → 44+ REST API endpoints
components/
  layout/                    → Sidebar, Header, ThemeToggle
  dashboard/                 → Dashboard panels
  pipeline/                  → Kanban board, CandidateCard, SearchBar
  forms/                     → AddCandidate, CreateReq, ScheduleInterview, CreateOffer modals
  manager/                   → ReviewActions (Advance/Pass buttons)
  onboarding/                → PIFForm, HNotePreview
lib/
  api/                       → Response helpers, CRUD factory
  auth/                      → NextAuth config, RBAC, session helpers
  audit/                     → Audit trail service (SOC 2)
  compliance/                → Retention engine
  db/                        → Prisma client singleton
  encryption/                → AES-256-GCM field encryption
  enforcement/               → 13 enforcement rules
  excel/                     → Exporter (branded), Importer (with validation)
  onboarding/                → Create onboarding, H-Note generator
  reports/generators/        → 12 report generators
prisma/
  schema.prisma              → 44 entities
  seed.ts                    → All reference data + demo data
  migrations/                → Database migrations
docs/plans/
  2026-03-25-recruiting-platform-design.md        → Phase 1 design
  2026-03-31-onboarding-orchestration-design.md   → Phase 2 design
  *.md.tasks.json                                 → Task status trackers
```

## Design & Requirements Docs

Always read these before making changes:
1. `PROJECT_REQUIREMENTS.md` — Original requirements from recruiting team
2. `Denali_Onboarding_Complete_Context.md` — Full SOP with HR procedures
3. `Denali_Onboarding_Context_Consolidated.md` — Manager experience perspective
4. `docs/plans/2026-03-25-recruiting-platform-design.md` — Phase 1 design (compliance, data model, UX)
5. `docs/plans/2026-03-31-onboarding-orchestration-design.md` — Phase 2 design (onboarding, PIF, milestones)

## Environment Variables

See `.env.example` for all required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `ENCRYPTION_KEY` — 32-char key for AES-256-GCM field encryption
- `NEXTAUTH_SECRET` — Auth session secret
- `AZURE_AD_*` — Microsoft Entra SSO credentials (get from Denali IT)

## Database

- 44 tables across Phase 1 + Phase 2
- To reset: `npx prisma migrate reset` (drops all data and re-seeds)
- To view: `npx prisma studio`

## Theme

Light/dark toggle via sun/moon icon in header. Uses CSS custom properties on `data-theme` attribute — all `denali-gray-*` classes auto-flip. Light mode has CSS overrides in `globals.css` for status badges, alerts, and accent colors.
