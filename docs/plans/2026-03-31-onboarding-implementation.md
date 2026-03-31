# Phase 2: Onboarding Orchestration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:executing-plans to implement this plan task-by-task.

**Goal:** Build the onboarding orchestration layer that replaces Denali's fragmented post-offer process (PIF email + ServiceNow IT request + manual follow-ups) with a unified milestone-tracked workflow from Offer Accepted to Day 1 Ready.

**Architecture:** Extends the existing Phase 1 Next.js 15 monolith. New Prisma entities (10), new API routes (12), new pages (5). Auto-triggers when a candidate moves to "Hired" stage. Follows Denali dark theme (#0A0A0A background, #00C9FF cyan accent).

**Tech Stack:** Same as Phase 1 — Next.js 15, TypeScript, Tailwind CSS, Prisma 7 (PrismaPg adapter), PostgreSQL, ExcelJS

**Design Doc:** `docs/plans/2026-03-31-onboarding-orchestration-design.md`

---

## Task 0: Prisma Schema — 10 New Onboarding Entities

**Files:**
- Modify: `prisma/schema.prisma` — add 10 new models + enums
- Run: `npx prisma migrate dev --name add-onboarding-entities`

**New Enums:**
- OnboardingStatus: NOT_STARTED, PIF_PENDING, IN_PROGRESS, DAY1_READY, COMPLETED
- PIFType: NEW_HIRE, REHIRE, INTERNAL_TRANSFER
- OrientationLocation: REDMOND_ONSITE, WEBEX_REMOTE
- HardwareType: PC, MAC
- DeliveryMethod: PICKUP, SHIP_TO_HOME, DESK_SETUP
- I9Status: NOT_STARTED, EMAIL_SENT, SUBMITTED, VERIFIED
- AccessRequestStatus: PENDING, COMPLETED
- ContractStatus: DRAFT, MANAGER_SIGNED, CANDIDATE_SIGNED, COMPLETED
- MedicalClearanceStatus: PENDING, CLEARED, BLOCKED
- PayFrequency: BIWEEKLY, MONTHLY

**New Models (7 core + 3 skeleton):**
1. OnboardingRecord — links to Candidate, tracks overall status + greeter + key timestamps
2. PIFData — unified PIF + IT request fields (25+ PIF + IT hardware + equipment tracking)
3. OnboardingMilestone — per-milestone tracking with SLA targets and escalation
4. EquipmentPackage — auto-assign equipment by role family
5. CandidatePrework — I-9, tax, policies, direct deposit, emergency contacts
6. AccessRequest — system access requests (shared inboxes, Salesforce, building access)
7. OnboardingPlan — manager's first-week plan (meetings, trainings, tasks)
8. ContractTracking — UK/Ireland DocuSign flow (skeleton)
9. MedicalCompliance — Concentra vaccination/drug screen tracking (skeleton)
10. InternationalHireDetails — India/UK/Ireland specifics (skeleton)

**Step 1:** Add all enums and models to schema.prisma
**Step 2:** Run migration: `npx prisma migrate dev --name add-onboarding-entities`
**Step 3:** Verify: `npx prisma studio` — confirm all 10 new tables
**Step 4:** Commit

---

## Task 1: Seed Data — Equipment Packages + Milestone Templates

**Files:**
- Modify: `prisma/seed.ts` — add equipment packages

**Seed:**
- 5 equipment packages: Developer Standard (Mac + dual monitors + dock + KB/mouse/headset/webcam), PM Standard (PC + single monitor + dock + KB/mouse/headset), Admin Basic (PC + KB/mouse), Field Service (Laptop + rugged case), Sales (PC + dual monitors + dock + headset)
- Each with roleFamily, peripherals JSON, isDefault flag

**Step 1:** Add equipment package seed data
**Step 2:** Run: `npx prisma db seed`
**Step 3:** Commit

---

## Task 2: Phase 1→2 Handoff — Auto-Create Onboarding on "Hired"

**Files:**
- Modify: `app/api/transitions/route.ts` — add onboarding trigger after terminal stage transition
- Create: `lib/onboarding/create-onboarding.ts` — logic to create OnboardingRecord + milestones

**Logic:**
When a candidate moves to the "Hired" (terminal) stage:
1. Create OnboardingRecord with status = PIF_PENDING, hireDate from offer startDate
2. Auto-calculate milestone target dates based on scenario:
   - Check candidate.billable from requisition
   - Check candidate.jurisdiction
   - Check if equipment needed (default: yes)
   - Apply SOP timeline rules
3. Create all 13 OnboardingMilestone records with targetDate
4. Create Notification for manager: "Onboarding started for [Name]. Submit PIF."
5. Create Notification for HR: "New hire [Name] — background check needed."

**Enforcement:** Milestone targets follow SOP timelines:
- Billable + equipment: 1+ week from PIF to start
- Non-billable + equipment: 2+ weeks
- India: 3+ weeks (extended BG check)

**Step 1:** Create `lib/onboarding/create-onboarding.ts`
**Step 2:** Modify transitions POST to call it when toStage.isTerminal
**Step 3:** Test: move a candidate to Hired → verify OnboardingRecord + milestones created
**Step 4:** Commit

---

## Task 3: API Routes — Onboarding CRUD

**Files:**
- Create: `app/api/onboarding/route.ts` — list/create
- Create: `app/api/onboarding/[id]/route.ts` — get/update
- Create: `app/api/onboarding/[id]/pif/route.ts` — unified PIF+IT form
- Create: `app/api/onboarding/[id]/milestones/route.ts` — get/update milestones
- Create: `app/api/onboarding/[id]/h-note/route.ts` — generate/send H-Note
- Create: `app/api/onboarding/[id]/prework/route.ts` — candidate prework
- Create: `app/api/onboarding/[id]/access/route.ts` — access requests
- Create: `app/api/onboarding/[id]/plan/route.ts` — onboarding plan
- Create: `app/api/onboarding/[id]/equipment/route.ts` — equipment tracking
- Create: `app/api/onboarding/[id]/contract/route.ts` — contract tracking (skeleton)
- Create: `app/api/onboarding/[id]/medical/route.ts` — medical compliance (skeleton)
- Create: `app/api/admin/equipment-packages/route.ts` — equipment package CRUD

**Enforcement Rules in API:**
1. H-Note POST blocked if BG check not cleared
2. Equipment shipping blocked if H-Note not sent
3. DAY1_READY status blocked if any milestone incomplete
4. PIF auto-populates from offer/req data where possible
5. Equipment auto-assigned from EquipmentPackage by role family

**All routes include:** audit logging, RBAC scoping, optimistic concurrency

**Step 1-12:** Create each route file
**Step 13:** Build and verify all routes compile
**Step 14:** Commit

---

## Task 4: H-Note Auto-Generation

**Files:**
- Create: `lib/onboarding/h-note-generator.ts` — generates H-Note from PIF data

**Logic:**
- Pull all fields from PIFData + Candidate + OnboardingRecord
- Format into H-Note template matching SOP format:
  - Subject: "H-Note: Last Name, First Name | Start Date | Location"
  - All 20 fields from the SOP H-Note template
- Return as structured data (for preview) and formatted text (for email)
- Mark hNoteGeneratedAt on OnboardingRecord
- When "sent" is confirmed, mark hNoteSentAt and complete H_NOTE_SENT milestone

**Step 1:** Create generator
**Step 2:** Wire into API route
**Step 3:** Commit

---

## Task 5: Onboarding UI — Manager Readiness Dashboard

**Files:**
- Create: `app/recruiter/onboarding/page.tsx` — list of active onboardings
- Create: `app/recruiter/onboarding/[id]/page.tsx` — readiness dashboard
- Create: `components/onboarding/MilestoneTracker.tsx` — visual milestone checklist
- Create: `components/onboarding/GreeterAssignment.tsx` — greeter form
- Create: `components/onboarding/EquipmentStatus.tsx` — equipment tracking panel

**Readiness Dashboard shows:**
- Candidate name, title, start date, days until start
- Milestone checklist with ✅/🟡/⬜/🔴 status
- Equipment status (shipped/staged/confirmed)
- Greeter assignment with confirmation
- Prework completion status
- "Everything ready" banner when all milestones complete

**Denali branding:** Same dark theme, cyan accent for completed milestones, yellow for in-progress, red for overdue.

**Step 1:** Create list page
**Step 2:** Create detail page with milestone tracker
**Step 3:** Create components
**Step 4:** Add "Onboarding" link to recruiter sidebar
**Step 5:** Commit

---

## Task 6: Onboarding UI — Unified PIF + IT Form

**Files:**
- Create: `app/recruiter/onboarding/[id]/pif/page.tsx` — the form
- Create: `components/onboarding/PIFForm.tsx` — unified form component

**Form sections:**
1. **Candidate Info** — pre-populated from offer/candidate data (name, req#, title)
2. **Employment Details** — PIF type, employee type, pay rate, bill rate, accounting code
3. **System Access** — Salesforce, CPQ, Kimble checkboxes
4. **Client & Compliance** — client assignment, drug screen, TB test, additional BGC
5. **IT Equipment** — hardware type (auto-suggested from EquipmentPackage), peripherals, delivery method
6. **Additional** — business cards, desired alias, business reason, additional info

**Pre-population:** Auto-fill from offer data (salary, employee type, billable, client) and req data (department, location, manager). Manager only fills what's missing or different.

**Step 1:** Create form page
**Step 2:** Create form component with all sections
**Step 3:** Wire submit to POST /api/onboarding/[id]/pif
**Step 4:** Commit

---

## Task 7: Onboarding UI — H-Note Preview + Send

**Files:**
- Create: `app/recruiter/onboarding/[id]/h-note/page.tsx` — H-Note preview
- Create: `components/onboarding/HNotePreview.tsx` — formatted preview

**Shows:**
- Auto-generated H-Note from PIF data
- All 20 fields formatted like the SOP template
- Subject line: "H-Note: Last Name, First Name | Start Date | Location"
- "Send H-Note" button (marks milestone complete)
- Blocked if BG check not cleared (enforcement rule)

**Step 1:** Create page and preview component
**Step 2:** Wire send button to POST /api/onboarding/[id]/h-note
**Step 3:** Commit

---

## Task 8: Onboarding UI — Admin Overview + Prework + Access + Plan

**Files:**
- Create: `app/admin/onboarding/page.tsx` — all active onboardings table
- Create: `app/recruiter/onboarding/[id]/prework/page.tsx` — prework checklist
- Create: `app/recruiter/onboarding/[id]/access/page.tsx` — access requests
- Create: `app/recruiter/onboarding/[id]/plan/page.tsx` — onboarding plan

**Admin overview:** Table of all onboardings with columns: candidate, title, start date, milestone progress (X/13), status, overdue count, days until start. Filter by status, overdue.

**Prework page:** Checklist of I-9, tax, policies, direct deposit, emergency contacts, marketing consent. Each toggleable.

**Access page:** Add/complete access requests (system name, status).

**Plan page:** Manager's first-week plan — meetings to schedule, trainings required, first-week tasks. JSON-based editable lists.

**Add sidebar links:** "Onboarding" in recruiter sidebar, "Onboarding" in admin sidebar.

**Step 1-4:** Create each page
**Step 5:** Update sidebar navigation
**Step 6:** Commit

---

## Task 9: Milestone Escalation Engine

**Files:**
- Create: `lib/onboarding/escalation-engine.ts` — checks for overdue milestones
- Create: `app/api/onboarding/escalate/route.ts` — trigger escalation check

**Logic:**
- Query all OnboardingMilestones where targetDate < now AND completedAt IS NULL AND escalatedAt IS NULL
- For each overdue milestone:
  - Create Notification for the responsible person
  - Set escalatedAt = now
  - Mark as overdue in the UI (red indicator)

**Designed to run:** manually via admin UI button or via scheduled cron (Phase A)

**Step 1:** Create escalation engine
**Step 2:** Create API route
**Step 3:** Add "Check Escalations" button to admin onboarding page
**Step 4:** Commit

---

## Task 10: E2E Tests + Audit

**Files:**
- Create: `e2e/onboarding.spec.ts` — Playwright tests for all onboarding flows

**Tests:**
- Onboarding list page loads
- Readiness dashboard loads with milestone tracker
- PIF form renders with pre-populated fields
- PIF form submission creates onboarding milestones
- H-Note preview shows all fields
- H-Note blocked if BG check not cleared
- Admin onboarding overview loads
- Equipment status tracking
- Greeter assignment
- Prework checklist
- All enforcement rules verified via API

**Step 1:** Write tests
**Step 2:** Run and fix any failures
**Step 3:** Commit

---

## Execution Order & Dependencies

```
Task 0: Prisma Schema (10 entities) ──┐
Task 1: Seed Data (equipment packages) ┤ (depends on 0)
Task 2: Phase 1→2 Handoff ─────────────┤ (depends on 0)
Task 3: API Routes (12 endpoints) ──────┤ (depends on 0)
Task 4: H-Note Generator ──────────────┘ (depends on 3)
                                        │
Task 5: Readiness Dashboard ────────────┤ (depends on 3)
Task 6: Unified PIF+IT Form ───────────┤ (depends on 3)
Task 7: H-Note Preview+Send ───────────┤ (depends on 4)
Task 8: Admin+Prework+Access+Plan ─────┘ (depends on 3)
                                        │
Task 9: Escalation Engine ─────────────┤ (depends on 3)
Task 10: E2E Tests + Audit ────────────┘ (depends on all)
```
