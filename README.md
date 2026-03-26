# Denali Recruiting Platform

Internal recruiting platform for Denali Advanced Integration. Replaces manual Excel/Outlook pipeline management with a real-time, SOC 2-compliant web application.

## Quick Start

**Prerequisites:** Node.js 20+, Docker Desktop

```bash
# Clone and install
git clone https://github.com/dmdaher/Recruiting_Life_Is_Good.git
cd Recruiting_Life_Is_Good
npm install

# Start PostgreSQL
docker compose up -d

# Set up environment
cp .env.example .env.local
# Edit .env.local if needed (defaults work for local dev)

# Create .env for Prisma
echo 'DATABASE_URL="postgresql://denali:denali_dev@localhost:5432/recruiting"' > .env

# Run migrations and seed
npx prisma migrate dev
npx prisma db seed

# Start dev server
PORT=3001 npx next dev --port 3001
```

Open http://localhost:3001

## Pages

| URL | Portal | Description |
|-----|--------|-------------|
| `/login` | Auth | Role selection (dev mode) |
| `/recruiter/dashboard` | Recruiter | Morning coffee view — activity, numbers, alerts |
| `/recruiter/pipeline` | Recruiter | Kanban board — drag-and-drop candidate management |
| `/recruiter/reqs` | Recruiter | Open requisitions table |
| `/recruiter/hires` | Recruiter | Filled positions log |
| `/admin/dashboard` | Admin | Leaderboard, pipeline funnel, source effectiveness |
| `/admin/reports` | Admin | 12 automated report cards |
| `/admin/financial` | Admin | Agency fees, referral bonuses, cost tracking |
| `/admin/compliance` | Admin | DSAR, legal holds, retention policies |
| `/admin/settings` | Admin | Reference data management |
| `/admin/audit-log` | Admin | SOC 2 audit trail |
| `/manager/dashboard` | Hiring Manager | My reqs, candidate review, offer approvals |

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS (Denali dark theme)
- PostgreSQL 16 + Prisma 7 ORM
- @dnd-kit (drag-and-drop)
- Docker Compose

## Status

Phase 1 prototype — visual UI complete with live database queries. Authentication, API routes, Excel import/export, and mobile polish are in progress.
