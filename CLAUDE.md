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

Internal recruiting platform for Denali Advanced Integration replacing manual Excel/Outlook workflows. Phase 1 covers recruiting (req intake through hire). Phase 2 (future) covers onboarding (hire through Day 1).

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with Denali brand tokens (dark theme, #00C9FF cyan accent)
- **Database:** PostgreSQL 16 via Docker Compose
- **ORM:** Prisma 7 with PrismaPg adapter
- **Auth:** NextAuth.js (not yet implemented — dev-mode open access)
- **DnD:** @dnd-kit/core for Kanban board

## Prisma 7 Important Pattern

Prisma 7 does NOT support `datasourceUrl` on the client constructor. Must use adapter:

```typescript
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
```

The database URL is also configured in `prisma.config.ts` via dotenv.

## Project Structure

```
app/
  (auth)/login/         → Login page with dev-mode role selection
  recruiter/            → Recruiter portal (dashboard, pipeline, reqs, hires)
  admin/                → Recruiting Manager portal (dashboard, reports, financial, compliance, settings, audit-log)
  manager/              → Hiring Manager portal (dashboard)
  generated/prisma/     → Generated Prisma client (do not edit)
components/
  layout/               → Sidebar, Header
  dashboard/            → Dashboard panels (MyCandidatesToday, MyNumbers, etc.)
  pipeline/             → Kanban board, CandidateCard, KanbanColumn
lib/
  db/client.ts          → Prisma client singleton
prisma/
  schema.prisma         → 34 entities (source of truth for data model)
  seed.ts               → Reference data + demo data
  migrations/           → Database migrations
docs/plans/
  2026-03-25-recruiting-platform-design.md              → Full design doc (compliance, data model, UX)
  2026-03-25-recruiting-platform-implementation.md       → 23-task implementation plan
  2026-03-25-recruiting-platform-implementation.md.tasks.json → Task status tracker
```

## Current State (2026-03-30)

**Completed (15 of 23 tasks):**
- Project scaffolding, Prisma schema (34 entities), seed data
- UI Shell (sidebar, header), Denali dark theme
- All core API routes: reqs, candidates, transitions, interviews, offers, background checks, notifications, admin CRUD
- All 8 enforcement rules implemented and audited
- Functional forms: AddCandidate, CreateReq, ScheduleInterview, CreateOffer modals
- Kanban drag-and-drop persists to database via /api/transitions
- Recruiter dashboard (morning coffee view, 5 panels with Quick Actions wired)
- Pipeline Kanban, Requisitions table, Hires log
- Admin dashboard (leaderboard, funnel, source effectiveness)
- Admin reports hub, financial tracking, settings, compliance dashboard, audit log
- Hiring Manager portal (dashboard, review queue, offer approvals)
- Login page (dev-mode role selection)

**Not yet built (8 of 23 tasks):**
- Task 3: Authentication (NextAuth.js + Microsoft Entra SSO + RBAC)
- Task 4: Audit trail + encryption services
- Task 9: Report generation engine + Excel export ← **START HERE**
- Task 10: Compliance API routes (DSAR, consent, retention engine)
- Task 20: Excel import wizard
- Task 21: Mobile responsive polish
- Task 22: Testing + CI pipeline

## Key Design Decisions

- **Pipeline stages are DB-driven** (PipelineStage table), not hardcoded
- **8 enforcement rules** are hardcoded (FCRA, WA pay range, Fair Chance Act, NDA, etc.)
- **4-tier data classification** (Restricted, Confidential, Internal, Aggregate Only)
- **SOC 2 + GDPR + FCRA + EEOC + WA state law** compliance designed in
- **Jurisdiction-aware retention** (US 5-7yr, UK/Ireland 1yr, India 1yr)
- **EEO data physically separated** — never joins to candidate evaluation views

## Environment Variables

See `.env.example` for all required variables. Key ones:
- `DATABASE_URL` — PostgreSQL connection string
- `ENCRYPTION_KEY` — 32-char key for field-level encryption (not yet implemented)
- `NEXTAUTH_SECRET` — Auth secret (not yet implemented)
- `AZURE_AD_*` — Microsoft Entra SSO credentials (get from Denali IT)

## Database

- 34 tables, all created via Prisma migrations
- Seed data: 22 departments, 14 locations, 12 sources, 9 agencies, 8 stages, 8 employee types, 5 clients, 3 dev users, 15 demo candidates, 6 demo reqs
- To reset: `npx prisma migrate reset` (drops all data and re-seeds)
- To view: `npx prisma studio`

## Design & Requirements Docs

Always read these before making changes:
1. `PROJECT_REQUIREMENTS.md` — Original requirements from recruiting team
2. `Denali_Onboarding_Complete_Context.md` — Full SOP with HR procedures
3. `Denali_Onboarding_Context_Consolidated.md` — Manager experience perspective
4. `docs/plans/2026-03-25-recruiting-platform-design.md` — Full design (compliance, data model, UX flows, enforcement rules)
