# Denali Recruiting Platform — Design Document

> **Status:** IN PROGRESS — Full audit complete, all gaps addressed. Awaiting final approval before implementation planning.
> **Owner:** Devin Daher, Head of Software Solutions
> **Created:** 2026-03-25
> **Last Updated:** 2026-03-25
> **Audit:** Pre-implementation audit completed 2026-03-25. All gaps resolved.

---

## Decisions Made

### Tech Stack (Locked In)
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript everywhere
- **Styling:** Tailwind CSS (Denali brand tokens)
- **Database:** PostgreSQL with pgcrypto extension
- **ORM:** Prisma (type-safe queries, migrations, schema-as-code)
- **Auth:** NextAuth.js (Microsoft Entra/AD SSO)
- **Deployment:** Docker container (local → internal server → cloud)

### Phasing Strategy (Locked In)
- **Phase 1 (NOW):** Recruiting platform — req intake through offer accepted
- **Phase 2 (LATER):** Onboarding orchestration — accepted through Day 1
- Data model designed from day one to accommodate Phase 2 without rewrite

### Architecture (Locked In)
- **Monolithic Next.js App** — one codebase, one deployment
- App Router with route groups per module
- REST API routes within the same Next.js project
- Single audit trail, single attack surface (good for SOC 2)

```
/app
  /(auth)         → login, SSO callback, privacy notice acceptance
  /(recruiter)    → recruiter dashboard, pipeline, candidates
  /(manager)      → hiring manager portal, req view, approvals
  /(admin)        → recruiting manager analytics, reports, settings, compliance
  /api            → REST endpoints for data operations
/lib
  /db             → Prisma client, queries
  /auth           → SSO, RBAC middleware
  /audit          → audit trail service
  /compliance     → FCRA workflows, retention engine, DSAR, consent management
  /excel          → import/export logic
  /encryption     → column-level encryption/decryption service
```

### Data Entry Strategy (Locked In)
- **Excel import** for bootstrapping historical data from current spreadsheets
- **Manual entry** for daily operations going forward
- **ADP API integration** deferred to later phase
- No email delivery for reports in Phase 1 — auto-generate in-platform with Excel export

### Pipeline Stages (Locked In — Configurable)
8 stages, stored in database (not hardcoded), can be adjusted without code changes:
1. Sourced
2. Submitted (recruiter sends to HM)
3. Screen
4. Interview
5. Debrief
6. Offer Extended
7. Offer Accepted
8. Hired (terminal state, handoff to Phase 2)

### Dashboard Priority (Locked In)
- **Hero:** Activity-first ("My Candidates Today" — who needs action)
- **Supporting panels:** Numbers ("My Numbers This Week") + Alerts ("Overdue Items")
- All three visible on the recruiter home dashboard

### User Roles (Locked In)
| Role | Access |
|------|--------|
| Recruiter | Own assigned reqs and candidates, personal performance metrics |
| Recruiting Manager | Everything + team-wide analytics, reports, admin controls, compliance tools |
| Hiring Manager | Their reqs only, candidate review queue, approvals, read-only pipeline |

---

## Compliance Framework (Locked In)

### Regulatory Coverage
| Regulation | Scope | Key Requirements |
|------------|-------|------------------|
| **SOC 2** (all 5 Trust Service Criteria) | Entire platform | Access controls, availability, processing integrity, confidentiality, privacy |
| **GDPR** (UK GDPR + EU GDPR) | UK/Ireland candidates | Consent, data subject rights, DPIA, 72-hour breach notification, DPO |
| **FCRA** | US candidates with background checks | Disclosure/authorization, pre-adverse action workflow, adverse action notice |
| **EEOC** (Title VII, ADA, ADEA, GINA) | All US candidates | Record retention, EEO data separation, adverse impact analysis capability |
| **Washington EPOA** (RCW 49.58) | All postings fillable by WA employees | Pay range required on all job postings |
| **Washington Fair Chance Act** (RCW 49.94) | WA candidates | No criminal history inquiry until "otherwise qualified" |
| **CCPA/CPRA** | California candidates | Notice at Collection, right to know/delete/correct, 45-day response |
| **India DPDPA** | India candidates | Consent, data principal rights, breach notification |
| **FLSA** | All US compensation data | Accurate exempt/non-exempt classification, minimum wage validation |

### Data Classification Tiers
| Tier | Classification | Examples | Access |
|------|---------------|----------|--------|
| **Tier 1** | Restricted | Background check results, SSN, drug screen, medical data | HR Admin only |
| **Tier 2** | Confidential | Compensation data, offer details, agency fees, bill rates | Recruiting Manager + assigned recruiter |
| **Tier 3** | Internal | Name, resume, interview notes, stage history, contact info | Per RBAC role assignment |
| **Tier 4** | Aggregate Only | EEO self-identification (race, gender, disability, veteran) | Recruiting Manager — aggregate reports only, never individual |

### Jurisdiction-Aware Retention Schedule
| Data Type | US | UK/Ireland | India |
|-----------|-----|-----------|-------|
| Applications/resumes | 5 years | 1 year | 1 year |
| Interview notes | 5 years | 1 year | 1 year |
| Background check reports | 7 years | Destroy after decision | 1 year |
| FCRA disclosures/notices | 7 years | N/A | N/A |
| Compensation/offer data | 5 years | 1 year | 1 year |
| EEO self-ID data | 5 years (anonymize) | N/A | N/A |
| Consent records | Duration + 6 years | Duration + 6 years | Duration + 6 years |
| Talent pool data | 2 years (refresh consent) | 2 years (refresh consent) | 2 years (refresh consent) |
| Audit logs | 7 years | 7 years | 7 years |
| Pay range/posting records | 5 years | 1 year | 1 year |

### Pipeline Enforcement Rules (Hardcoded — Not Configurable)
These are legal requirements, not business preferences. The platform enforces them:

1. **Requisition cannot be posted without pay range** — Washington EPOA requires salary range + benefits description on all postings
2. **Background check cannot initiate before Screen stage completes** — Washington Fair Chance Act prevents criminal history inquiry until candidate is "otherwise qualified"
3. **FCRA adverse action workflow enforced** — If a background check is on record, candidate cannot be moved to "Rejected" without: (a) pre-adverse action notice sent, (b) 5 business day waiting period elapsed, (c) adverse action notice sent. System blocks the transition until all three are timestamped.
4. **Data cannot be deleted under active Legal Hold** — Automated purge skips any record with an active LegalHold
5. **EEO data never visible in hiring workflow** — Self-identification data stored in separate table, no FK joins to candidate evaluation views, accessible only in aggregate reports
6. **Minimum wage validation** — Offered hourly rate cannot be below applicable minimum wage (WA: $16.66/hr as of 2026). System warns but does not block (to handle exempt employees).
7. **NDA before interview** — Per SOP, interviews cannot proceed until candidate has signed NDA via DocuSign. System blocks interview creation if candidate NDA status is not "signed" (jurisdiction-specific templates: US, UK, India).
8. **Duplicate candidate warning** — On candidate creation, system checks for existing candidates with matching name + email across all reqs. Shows warning with link to existing record. Does not block (same person can apply to multiple reqs) but prevents accidental duplicates.

### DSAR (Data Subject Access Request) Capability
- **Export all candidate data** — one-click export of everything the platform holds on a candidate (JSON + PDF)
- **Delete candidate data** — purge all records with legal hold check, retention policy check, and audit log of the deletion itself
- **Restrict processing** — freeze a candidate's data (retained but not processed)
- **Portability** — export in machine-readable format (JSON/CSV)
- **Tracking** — all DSARs logged with intake date, jurisdiction, response date, actions taken
- **Response SLA** — 30 days for GDPR, 45 days for CCPA, configurable by jurisdiction

### Consent Management
- **Privacy notice versioning** — each jurisdiction has its own notice, versioned and timestamped
- **Consent tracking** — per candidate: what they consented to, when, which privacy notice version, expiry date
- **Consent refresh** — automated reminders for talent pool candidates approaching 1-year consent expiry
- **Withdrawal** — candidates can withdraw consent; system triggers data restriction or deletion per retention rules

### Data Breach Response
- **Breach register** — log all incidents with classification, affected data, affected candidates
- **State-based notification routing** — platform tracks candidate jurisdiction to determine notification requirements
- **30-day clock** — Washington state requires notification within 30 days (shortest US window); this is the platform default
- **Pre-drafted notification templates** — by jurisdiction, reviewed by legal
- **Candidate count threshold tracking** — automatic flagging when breach affects 500+ residents of a single state (triggers AG notification)

---

## Data Model

### Core Entities

**Requisition**
- reqNumber, title, department (FK), location (FK), hiringManager (FK to User)
- status (Open / On Hold / Filled Paperwork / Pending / Closed — from current ADP/Excel workflow)
- billable (boolean), targetDate, positionsTotal, positionsFilled
- payRangeMin, payRangeMax (required — WA law), benefitsDescription
- evergreen (boolean — for continuously open positions, e.g., Field Service Tech with 30+ positions)
- priority (boolean — maps to ADP "Job Priority: Yes/No")
- workerCategory (string — maps to ADP "Worker Category" dropdown)
- reasonForHire (text — must include billable/non-billable justification per SOP; non-billable requires business justification)
- dateOpened, dateClosed, publishStartDate
- Many-to-many with recruiters (supports multi-recruiter assignment)
- Many-to-many with postingChannels (tracks where posted: LinkedIn, Indeed, ADP, Craigslist, agencies)
- Phase 2: nullable onboarding fields

**Candidate**
- firstName, lastName, email, phone (Tier 3 — encrypted PII)
- jurisdiction (US state / UK / Ireland / India — drives retention + consent rules)
- currentStage (FK to PipelineStage)
- source (FK to Source), sourceDetail (agency name, referrer, etc.)
- resumeUrl, compensationExpectation (Tier 2 — encrypted)
- appliedAt, rejectionReason, rejectionReasonCode (structured — for analytics)
- notes
- ndaStatus (not-required / pending / signed), ndaSentAt, ndaSignedAt, ndaJurisdiction (US / UK / India — different templates per SOP)
- Belongs to Requisition (many candidates per req)
- Duplicate detection: on create, check for existing candidate with same name + email across all reqs
- Phase 2: nullable onboarding fields (PIF, IT request, milestones)

**Interview**
- scheduledAt, type (screen/video/onsite/panel)
- interviewers[] (many-to-many with Users)
- scorecard (JSON — structured, competency-based), feedback, outcome (pass/fail/hold)
- noShow (boolean)
- rescheduledFromInterviewId (nullable FK — links to the original interview if this is a reschedule)
- ndaRequired (boolean — per SOP, interviews cannot proceed until NDA is signed)
- Belongs to Candidate
- Enforcement: cannot be created if candidate.ndaStatus != 'signed' and ndaRequired = true

**Offer**
- salary/payRate, billRate (Tier 2 — encrypted)
- startDate, status (extended/accepted/declined/rescinded)
- declineReason, rescindReason
- offerLetterUrl
- employeeType (Type 1-9 — from PIF/SOP)
- exemptStatus (exempt/non-exempt — FLSA)
- bonusCommissionPlan (nullable — from PIF)
- commissionAmount, bonusAmount, additionalExpenses (nullable — for OTE/PIR calculation: OTE = salary + commissions + bonus + expenses)
- expiresAt (nullable — offer expiration date, surfaces in alerts panel when approaching)
- approvedBy (FK to User — HM who approved the offer), approvedAt
- client (FK — nullable, from PIF: assigned client)
- clientRequiresDrugScreen (boolean — from PIF, per-client rules: hospital clients, Amazon)
- clientRequiresTBTest (boolean — from PIF)
- clientRequiresAdditionalBGCheck (boolean — from PIF: Microsoft, Amazon yellow badge)
- Belongs to Candidate
- Has many OfferRevisions (negotiation history)

**OfferRevision** (tracks counter-offer negotiation — from PROJECT_REQUIREMENTS.md Section 9.6)
- offerId (FK), revisionNumber, salary/payRate, billRate
- proposedBy (candidate/employer), notes, createdAt
- Captures full negotiation history: original offer → counter → final

**StageTransition**
- fromStage, toStage, movedAt, movedBy (FK to User), notes
- Belongs to Candidate
- Powers: time-to-fill, conversion rates, bottleneck detection, audit trail

**BackgroundCheck**
- candidateId (FK), type (ADP-Standard / Accurate-Amazon / Concentra)
- status (pending / in-progress / clear / record-found / adverse-action-in-progress)
- initiatedAt, completedAt
- result (clear / record-found)
- preAdverseNoticeSentAt, fcraRightsSentAt
- waitingPeriodExpiresAt (auto-calculated: preAdverseNoticeSentAt + 5 business days)
- adverseActionNoticeSentAt
- Tier 1 — Restricted access (HR Admin only)

### Compliance Entities

**Consent**
- candidateId (FK), privacyNoticeVersionId (FK)
- type (application / talent-pool / background-check / eeo-voluntary)
- jurisdiction (US / UK / Ireland / India / California)
- grantedAt, expiresAt, withdrawnAt
- refreshReminderSentAt

**PrivacyNoticeVersion**
- jurisdiction, version, content (markdown), effectiveDate, supersededAt

**LegalHold**
- entityType (candidate / requisition), entityId
- reason, caseReference
- createdBy (FK to User), createdAt, releasedBy, releasedAt
- Active holds prevent automated data deletion

**EEOSelfIdentification**
- candidateId (FK — but never joined in candidate queries)
- race, ethnicity, gender, disabilityStatus, veteranStatus
- collectedAt, voluntarilyProvided (boolean)
- Tier 4 — Aggregate reporting only, never individual view
- Physically separated: own table, own access policy, no cascade from candidate views

**DataRetentionPolicy**
- entityType, jurisdiction, retentionDays, autoDelete (boolean)
- Seeded with the retention schedule above

**DSARRequest**
- candidateId (FK), requestType (access / delete / correct / restrict / portability)
- jurisdiction, receivedAt, dueDate (auto-calculated by jurisdiction)
- status (received / in-progress / completed / denied)
- completedAt, responseDetails, handledBy (FK to User)

### Supporting Entities

- **User** — SSO identity, role (recruiter / recruiting_manager / hiring_manager), department, isActive, lastLoginAt, deactivatedAt
- **Department** — code, name (normalized from 18+ depts)
- **Location** — name, country, timezone, stateProvince
- **PipelineStage** — name, order, isTerminal, requiresApproval, requiresBackgroundCheck (configurable)
- **Source** — channel name (LinkedIn, ADP, Agency, Referral, Hiring Manager, Internal Transfer, Client, Craigslist, Rehire, Staffing Technologies, Laptop Co., FTE to 1099 — all 12 from current data)
- **PostingChannel** — name (Indeed, CareerBuilder, Monster, LinkedIn, Facebook, ADP Career Page, Craigslist — from SOP)
- **RequisitionPosting** — requisitionId (FK), postingChannelId (FK), postedAt, removedAt (tracks where each req is posted)
- **Client** — name, requiresDrugScreen (default), requiresTBTest (default), requiresAdditionalBGCheck (default), bgCheckType (from SOP: Amazon yellow badge → Accurate, hospital → Concentra + Multi-State Sex Offender)
- **Agency** — name, contact, feeStructure (percentage / flat)
- **AgencyFee** — agency (FK), candidate (FK), department (FK), amount, quarter, invoiceDate
- **RecruitingBudget** — department (FK), quarter, budgetAmount (for budget vs. actual comparison in Financial Tracking)
- **ReferralBonus** — referrer, candidate (FK), amount, status (pending / approved / paid), paidDate
- **EmployeeType** — code (1-9), name (Salaried Exempt, Salaried Non-Exempt, Hourly, Contractor, etc.), description, isExempt (boolean). FK from Offer.
- **CandidateDocument** — candidateId (FK), fileName, fileUrl, uploadedBy (FK to User), uploadedAt, type (resume / cover-letter / portfolio / nda-signed / reference / other). Replaces single resumeUrl — supports multiple documents per candidate.
- **Notification** — userId (FK), message, link (to relevant page), createdAt, readAt. In-app notifications for all roles (critical for HM adoption since email/Teams notifications are deferred).
- **MetricSnapshot** — date, metricType (open-reqs / hires / interviews / submittals), value, metadata (JSON). Stores point-in-time snapshots for trending charts. Also stores imported historical data (2020-2025 trending from Open Req Report).
- **CostPerHireConfig** — period (monthly/quarterly), payrollCost (recruiting team salaries), toolsCost (LinkedIn Recruiter, ADP, etc.), effectiveDate. Admin-managed. Enables auto-calculation: (payroll + tools + agency fees) / placements.
- **AuditLog** — userId, action, entityType, entityId, changes (JSON — before/after), timestamp, ipAddress, sessionId. INSERT only — no UPDATE or DELETE. **Partitioned by month** for performance at scale. Indexed on (entityType, entityId, timestamp) and (userId, timestamp).
- **Report** — type, generatedAt, parameters (JSON), fileUrl
- **ReportSchedule** — reportType, frequency, nextRunAt, format (xlsx/pdf)

---

## Module Architecture & Pages

### Recruiter Dashboard ("Morning Coffee" View)
All 6 panels from PROJECT_REQUIREMENTS.md Section 9.11:
```
┌─────────────────────────────────────────────────────────────────────┐
│  HERO: My Candidates Today (Section 9.11 #1)                        │
│  ┌─────────────────┬─────────────────┬──────────────────┐           │
│  │ Needs Follow-up │ Interviews Today│ Awaiting Decision │           │
│  │  Sarah K. - 3d  │  10:00 J.Smith  │  Mike R. - Offer  │           │
│  │  Tom B. - 2d    │  14:00 A.Chen   │  Pending HM       │           │
│  └─────────────────┴─────────────────┴──────────────────┘           │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────────────┐         │
│  │ My Numbers This Week │  │ New Candidates (Section 9.11  │         │
│  │ (Section 9.11 #2)    │  │ #3)                           │         │
│  │ Submittals: 12/15    │  │ 🆕 3 new applications today   │         │
│  │ Interviews: 8/10     │  │ 🆕 1 referral from J.Park     │         │
│  │ Hires: 2/3           │  │                               │         │
│  │ vs Target: 87%       │  │                               │         │
│  └──────────────────────┘  └──────────────────────────────┘         │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────────────┐         │
│  │ Alerts (Sect 9.11 #4)│  │ Quick Actions (Sect 9.11 #6) │         │
│  │ ⚠ 3 cands 48h+ wait │  │ [+ Submit Candidate]          │         │
│  │ ⚠ REQ-1042 stale 5d  │  │ [+ Schedule Interview]        │         │
│  │ ⚠ Offer pending HM 3d│  │ [+ Log Screen Notes]          │         │
│  │ ⚠ FCRA expires in 2d │  │ [+ Extend Offer]              │         │
│  │ ⚠ NDA pending 2 cands│  │                               │         │
│  └──────────────────────┘  └──────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```
Note: Section 9.11 #5 (Calendar with Outlook sync) deferred — requires Outlook/M365 integration (Phase 2).
Calendar panel will show interviews from platform data only in Phase 1.

### Recruiter Leaderboard (PROJECT_REQUIREMENTS.md Section 4.1)
- Team-wide view on Recruiting Manager dashboard, personal rank visible to each recruiter
- Ranked by: submittals, interviews, hires (toggleable)
- Time range: this week / this month / this quarter / YTD
- Shows: recruiter name, count, rank, trend arrow (up/down vs. prior period)

### Pipeline Funnel Visualization (PROJECT_REQUIREMENTS.md Section 4.1)
- Visual funnel chart showing candidate counts at each stage
- Filterable by: req, recruiter, department, date range
- Shows conversion rate between each stage (e.g., 291 submittals → 203 interviews = 70% conversion)
- Available on both recruiter dashboard (own data) and admin dashboard (team-wide)

### Pipeline Management (Kanban)
- Drag-and-drop Kanban board across 8 stages
- Filterable by: recruiter, department, location, date range, source
- Click candidate card → slide-out detail panel (no page navigation)
- Batch actions: move multiple, bulk reject with reason
- Color coding by age (green <7d, yellow 7-14d, red 14d+ in same stage)
- Drag-to-reject blocked post-background-check without FCRA workflow completion (visual lock icon)

### Open Requisitions
- Sortable/filterable table
- Columns: req#, title, department, HM, recruiter(s), days open, candidates in pipeline, status, pay range
- Quick-add candidate per req
- Expand row → mini pipeline showing candidate distribution per stage
- Cannot post without pay range populated (WA law — field validation)

### Filled Positions / Hires Log
- Historical record of all hires
- Columns: name, title, department, recruiter, source, offer date, start date, time-to-fill, agency fee
- Filterable by quarter, department, recruiter, source

### Hiring Manager Portal
- Scoped to their reqs only
- Candidate review queue: see submittals, thumbs up/down/notes
- Interview schedule view
- Offer approval workflow (recruiter submits → HM approves → offer extended)
- Read-only pipeline view per req

### Recruiting Manager Admin
- Everything recruiters see, but team-wide
- **Recruiter Leaderboard:** team submittals, interviews, hires ranked — toggleable by week/month/quarter/YTD
- **Pipeline Funnel:** visual funnel with conversion rates at each stage
- **Analytics:** team performance, time-to-fill trends, source effectiveness, conversion funnels
- **Analytics Intelligence** (from PROJECT_REQUIREMENTS.md Section 9.10):
  - Bottleneck Detection: "Req #3504 open 28d with 0 past screen"
  - Workload Balancing: "Anania has 12 reqs, Tara has 2"
  - Source ROI: "LinkedIn: 40% submittals, 15% hires. Referrals: 10% submittals, 25% hires"
  - Seasonal Trends: hiring velocity by month/quarter over time
  - Agency Cost Efficiency: avg fee per hire per agency
  - Time-to-Fill Benchmarks: by dept, role level, billable/non-billable
  - Forecast: "At 23 hires/month, 30 reqs filled in ~6 weeks"
  - Stale Req Alerts: open > 30/60/90 days with no activity
  - Source Mix: agency reliance vs. internal pipeline
- **Financial:** agency fees by dept/quarter, referral bonus tracking, cost-per-hire, **budget vs. actual spend**
- **Reports hub:** all 12 reports, auto-generated, downloadable as Excel
- **Compliance dashboard:** pending DSARs, consent expiry alerts, retention purge log, active legal holds, FCRA workflow status
- **Settings:** pipeline stages, user roles, departments, sources, clients (with per-client compliance rules)

### Mobile-Responsive Design (PROJECT_REQUIREMENTS.md Section 4.3)
- All pages use responsive Tailwind breakpoints (mobile-first)
- Recruiter dashboard and candidate detail optimized for phone/tablet
- Interview scorecards mobile-friendly for submission right after interviews (Section 9.4)
- Kanban board collapses to stacked list view on mobile
- Touch-friendly drag-and-drop or tap-to-move alternative on mobile

### Page Map
```
/(auth)
  /login                    → SSO login page
  /callback                 → OAuth callback handler
  /privacy-notice           → Jurisdiction-aware privacy notice acceptance

/(recruiter)
  /dashboard                → Morning coffee view
  /pipeline                 → Kanban board (all my reqs)
  /pipeline/[reqId]         → Kanban for a single req
  /candidates/[id]          → Candidate detail page
  /reqs                     → Open requisitions table
  /reqs/new                 → New req form (pay range required)
  /reqs/[id]                → Req detail + mini pipeline
  /hires                    → Filled positions log

/(manager)
  /dashboard                → HM overview (my reqs, pending actions)
  /reqs/[id]                → Req detail + candidate review queue
  /reqs/[id]/candidates/[id]→ Candidate detail (scoped)

/(admin)
  /dashboard                → Team-wide analytics + leaderboard + pipeline funnel
  /reports                  → Reports hub
  /reports/[type]           → Individual report view + export
  /financial                → Agency fees, referral bonuses, cost-per-hire
  /compliance               → DSAR queue, consent management, legal holds, retention log
  /compliance/dsar          → DSAR request management
  /compliance/holds         → Active legal holds
  /compliance/retention     → Retention policy + purge log
  /settings                 → All reference data management
  /settings/users           → User management (provision/deprovision)
  /settings/stages          → Pipeline stage configuration
  /settings/departments     → Department CRUD
  /settings/locations       → Location CRUD
  /settings/sources         → Source channel CRUD
  /settings/agencies        → Agency CRUD
  /settings/clients         → Client CRUD (with per-client compliance rules)
  /settings/posting-channels → Posting channel CRUD
  /settings/employee-types  → Employee type CRUD
  /settings/cost-config     → Cost per hire configuration
  /settings/budget          → Recruiting budget by department/quarter
  /audit-log                → Searchable audit trail (7-year retention)

/api
  /api/auth/[...nextauth]   → Auth endpoints
  /api/reqs                 → CRUD for requisitions
  /api/candidates           → CRUD for candidates
  /api/candidates/[id]/dsar → DSAR export/delete endpoint
  /api/interviews           → CRUD for interviews
  /api/offers               → CRUD for offers
  /api/background-checks    → Background check tracking + FCRA workflow
  /api/transitions          → Stage transition logging
  /api/reports/[type]       → Report generation + export
  /api/import               → Excel upload + processing
  /api/audit                → Audit log queries
  /api/compliance/consent   → Consent management
  /api/compliance/holds     → Legal hold management
  /api/compliance/retention → Retention policy execution
  /api/admin/stages         → Pipeline stage management
  /api/admin/users          → User provisioning
  /api/admin/departments    → Department CRUD
  /api/admin/locations      → Location CRUD
  /api/admin/sources        → Source channel CRUD
  /api/admin/agencies       → Agency CRUD
  /api/admin/clients        → Client CRUD (with per-client compliance rules)
  /api/admin/employee-types → Employee type CRUD
  /api/admin/posting-channels → Posting channel CRUD
  /api/admin/cost-config    → Cost per hire configuration
  /api/referral-bonuses     → Referral bonus CRUD
  /api/budget               → Recruiting budget CRUD
  /api/notifications        → In-app notification queries + mark read
  /api/eeo                  → EEO self-identification data entry (aggregate access only)
  /api/metrics/snapshot     → Metric snapshot for trending charts
  /api/offers/[id]/revisions → Offer negotiation history
```

---

## Auth, Security & SOC 2

### Authentication Flow
```
User → /login → Redirect to Microsoft Entra → OAuth callback →
NextAuth session created → JWT with role + permissions + dataClassificationAccess →
Redirect to role-appropriate dashboard
```

- **Provider:** Microsoft Entra ID (primary). Okta as fallback.
- **Session:** JWT in httpOnly, secure, sameSite cookie. 8-hour expiry with sliding window. Force re-auth after 24 hours.
- **No local passwords.** SSO only. No shared accounts.
- **MFA:** Enforced at the identity provider level (Microsoft Entra).
- **Dev-mode bypass:** For local development/testing only, a `CredentialsProvider` with pre-seeded test users (1 recruiter, 1 HM, 1 recruiting manager). Enabled only when `NODE_ENV=development`. Automatically disabled in staging/production. Zero throwaway code — NextAuth config simply omits the credentials provider when not in dev mode.
- **IT dependency:** Denali IT must register the app in Microsoft Entra ID (Azure portal) and provide Client ID, Client Secret, Tenant ID before production deployment. This can happen in parallel with development.

### RBAC Implementation
Permissions checked at **two levels** — defense in depth:

1. **Middleware layer:** Can this role access this route?
2. **Query layer:** What data can this user see? (WHERE clauses enforced per role)

```
Recruiter:     WHERE recruiterId = currentUser (own data only)
Hiring Manager: WHERE hiringManagerId = currentUser (own reqs only)
Recruiting Mgr: No WHERE restriction (all data)
```

Compensation fields require `canViewCompensation` permission (Tier 2).
Background check data requires `canViewBackgroundChecks` permission (Tier 1).
EEO data requires `canViewEEOAggregate` permission (Tier 4 — aggregate only).

### Audit Trail
- **Dedicated `AuditLog` table** — immutable (INSERT only).
- Every mutation logged: userId, action, entityType, entityId, changesJSON (before/after), timestamp, IP, sessionId.
- Every PII access logged as READ event.
- **7-year retention** (SOC 2 + FCRA alignment).
- **Queryable admin UI** with filters by user, action, entity, date range.
- Separate from application logs.

### Encryption Strategy
- **In transit:** HTTPS/TLS 1.3 everywhere.
- **At rest:** PostgreSQL with pgcrypto. Full disk encryption.
- **Column-level:** Application-level encryption for Tier 1 and Tier 2 fields. Decryption in API layer only.
- **Key management:** Environment variable Phase 1. Azure Key Vault / AWS KMS when moving to cloud.
- **Backup encryption:** All database backups encrypted at rest.

### Monitoring & Alerting
- Failed login attempts: alert after 5 failures / 10 minutes per account.
- Bulk data access: alert if >50 candidate records queried in single request.
- Privilege escalation: alert on unauthorized route/data access.
- Tier 1 data access: alert on every access to background check / medical data.
- FCRA deadline approaching: alert 2 days before waiting period expires.
- Consent expiring: alert 30 days before talent pool consent expires.

### User Provisioning / Deprovisioning
- Admin UI for Recruiting Manager to add/deactivate users.
- Deactivation immediately revokes session + blocks future auth.
- Deactivated user's data preserved, access removed.
- Quarterly access review report (who has access, when last login).

---

## Excel Import/Export

### Import Pipeline
```
Upload .xlsx → Parse with ExcelJS → Validate & normalize →
Preview (show issues: duplicates, mismatches, missing data) →
User confirms (skip / merge / fix) → Insert into DB →
Generate import report (imported, skipped, why)
```

**Three import templates** (matching existing Excel files):
1. **YTD Report** → Candidates + StageTransitions + performance metrics
2. **Open Req Report** → Requisitions + Recruiter assignments
3. **Filled Positions** → Candidates (hired stage) + Offers + AgencyFees

### Data Normalization Rules
- Exact duplicates: detected by composite key (name + title + date), shown in preview
- Recruiter/Source column split: pattern matching to separate names from channels
- Trailing whitespace stripped from all text fields
- Department names normalized against reference table (fuzzy match + manual mapping for unknowns)
- Misspellings flagged in preview for user decision
- Empty sourcing channel: default to "Not Specified"

### Export
- Every report and table view has "Export to Excel" button
- Formatted to match current stakeholder expectations
- Branded header: Denali logo + report title + generated date
- Auto-formatted: column widths, number formats, header styling

---

## Deployment & Infrastructure

### Local Development
```
docker compose up    → PostgreSQL + Next.js dev server
npx prisma migrate dev → Run migrations
npx prisma db seed   → Seed reference data (departments, stages, sources, retention policies)
```

### Docker Setup
Multi-stage build: install deps → build Next.js → production image (node:alpine, ~150MB).
One container serves frontend + API.

### Environments
| Environment | Purpose | Database |
|-------------|---------|----------|
| Local | Developer machine | Docker PostgreSQL |
| Staging | Testing, stakeholder demos | Dedicated PostgreSQL |
| Production | Live system | Dedicated PostgreSQL with backups + WAL archiving |

### Database Backup & Recovery
- Automated daily backups via pg_dump (compressed, encrypted).
- Point-in-time recovery via WAL archiving.
- Tested restore quarterly.
- **RPO:** 1 hour. **RTO:** 4 hours.

### CI/CD
- GitHub Actions: lint → type-check → test → build → deploy.
- All changes through PR → review → merge → auto-deploy.
- Prisma migrations run on deploy.
- Container images scanned for vulnerabilities on build.
- No SSH to production. No direct changes.

### SOC 2 Infrastructure Controls
- All infra config in code (Dockerfile, docker-compose, GitHub Actions).
- Secrets via environment variables, never in code.
- Production access restricted to Recruiting Manager + IT admin.
- Change log: every deployment tracked with who, what, when.

---

## Data Quality Issues to Address on Import
(From deep dives on source Excel files)

- 6 exact duplicate rows in Filled Positions (inflating 63 real hires to 69)
- Column F ("Recruiter") mixes recruiter names with sourcing channels in 46/69 entries
- Column H ("Sourcing Channel") completely empty for all 2026 records
- Wrong years in sheet titles (templates never updated)
- 11 job titles with trailing whitespace creating false uniqueness
- Department naming inconsistencies across sheets
- Misspellings: "Guatamala", "Sales Support Reprsentative"
- Fee tracking math is clean ($50,079.56 verified)

---

## 12 Automated Reports (Phase 1)

| # | Report | Frequency | Source Data | Format |
|---|--------|-----------|-------------|--------|
| 1 | Daily Recruiting Report | Daily (auto-generate 5 PM) | Submittals, interviews, offers, hires for the day | Excel |
| 2 | Open Requisition Report | 2x/week (Mon & Thu) | All open reqs with status, days open, recruiter, candidates | Excel |
| 3 | YTD Performance Report | Weekly (Monday) | Hires, interviews, submittals per recruiter by week/month/quarter | Excel |
| 4 | Interview Tracking | Real-time (dashboard) | Auto-counted from platform data, not Outlook | Dashboard + Excel |
| 5 | Rescinded Offers | Weekly | Offers with status = rescinded, with reason | Dashboard + Excel |
| 6 | Payroll Impact Report (PIR) | 3x/week (Mon/Wed/Fri) | New reqs, new hires, referrals, date changes, rescissions | Excel |
| 7 | Filled Positions | Auto-updated on hire | All hires with department, recruiter, source, date | Excel |
| 8 | Cost per Hire | On-demand | (Payroll + tools + agency fees) / placements, filterable | Dashboard + Excel |
| 9 | Referral Bonus Tracking | Ongoing | Referrer, candidate, amount, status (pending/paid) | Dashboard + Excel |
| 10 | Agency Fees | Weekly | Fees by agency, department, quarter, with budget vs. actual | Dashboard + Excel |
| 11 | Requisition Audit | On-demand (self-serve) | Req history, status changes, recruiter assignments | Dashboard + Excel |
| 12 | Time to Fill | On-demand | Calculated from StageTransitions, filterable by dept/recruiter/location | Dashboard + Excel |

---

## Cross-Reference: Source Documents → Design Traceability

### From PROJECT_REQUIREMENTS.md
| Requirement | Section | Design Location | Status |
|---|---|---|---|
| Real-time KPIs on dashboard | 4.1 | Recruiter Dashboard | Covered |
| Recruiter leaderboard | 4.1 | Recruiter Leaderboard section | Covered |
| Pipeline funnel visualization | 4.1 | Pipeline Funnel section | Covered |
| Alerts (target dates, rescinded, stalled) | 4.1 | Dashboard Alerts panel | Covered |
| Kanban with drag-and-drop | 4.1 | Pipeline Management | Covered |
| Bulk actions | 4.1 | Pipeline Management | Covered |
| Filter by recruiter/dept/location/billable | 4.1 | Pipeline Management | Covered |
| Req status: Open/Filled Paperwork/Pending/Closed | 4.1 | Requisition.status | Covered |
| Target date monitoring (red/yellow) | 4.1 | Open Requisitions | Covered |
| Multi-recruiter per req | 4.1 | Requisition M2M recruiters | Covered |
| Duplicate detection | 4.1 | Enforcement Rule #8 | Covered |
| All 12 reports | 4 | 12 Automated Reports table | Covered |
| Excel export matching current formatting | 4.1 | Excel Export section | Covered |
| Outlook/M365 integration | 4.2 | Deferred to Phase 2 (agreed with Devin) | Deferred |
| ADP integration | 4.2 | Deferred (Excel import for Phase 1, agreed) | Deferred |
| Mobile-friendly | 4.3 | Mobile-Responsive Design section | Covered |
| Fast (500+ candidates, 30+ reqs) | 4.3 | NFR — addressed by PostgreSQL + SSR | Covered |
| Morning coffee view (6 panels) | 9.11 | Dashboard — panels 1-4,6 covered; #5 (calendar/Outlook) deferred | 5/6 Covered |
| Recruiter workload balancing | 9.10 | Admin Analytics Intelligence | Covered |
| Source ROI analytics | 9.10 | Admin Analytics Intelligence | Covered |
| Bottleneck detection | 9.10 | Admin Analytics Intelligence | Covered |
| Forecast | 9.10 | Admin Analytics Intelligence | Covered |
| Stale req alerts | 9.10 | Admin Analytics Intelligence | Covered |
| Agency cost efficiency | 9.10 | Admin Analytics Intelligence | Covered |
| Budget vs. actual spend | 5 | RecruitingBudget entity + Financial section | Covered |
| U.S. vs. international fee breakdown | 5 | AgencyFee filterable by location | Covered |

### From Denali_Onboarding_Complete_Context.md (SOP)
| SOP Element | SOP Section | Design Location | Status |
|---|---|---|---|
| ADP req fields (title, HM, worker category, target, evergreen, positions, dept, location, salary range) | Phase 1 | Requisition entity | Covered |
| Req posting channels (Indeed, CareerBuilder, Monster, LinkedIn, Facebook, Referrals) | Phase 1 | PostingChannel + RequisitionPosting entities | Covered |
| NDA required before interview (US, UK, India templates) | Phase 2 | Candidate.ndaStatus + Enforcement Rule #7 | Covered |
| NDA filing in Box | Phase 2 | Out of scope Phase 1 (manual Box filing continues) | Noted |
| PIF fields (25+ fields) | Phase 4A | Offer entity (client fields) + Phase 2 nullable fields | Partially covered |
| IT Hardware request (ServiceNow) | Phase 4B | Phase 2 (onboarding orchestration) | Deferred |
| Background check types (ADP Standard, Accurate/Amazon, Concentra) | Phase 5 | BackgroundCheck entity | Covered |
| Client-specific requirements (drug screen, TB test, additional BGC) | Phase 5 | Offer entity (client requirement fields) + Client entity | Covered |
| Adverse action process | Phase 5 | BackgroundCheck entity + Enforcement Rule #3 | Covered |
| H-Note trigger for IT | Phase 6 | Phase 2 (onboarding orchestration) | Deferred |
| Employee Types 1-9 | Company Context | Offer.employeeType | Covered |
| 14 locations across 6+ countries | Company Context | Location entity | Covered |
| Interview scheduling from Outlook | Phase 2 | Deferred — manual entry in Phase 1 | Deferred |

### From Denali_Onboarding_Context_Consolidated.md (Manager Experience)
| Pain Point | Design Response | Status |
|---|---|---|
| PIF + IT Request are separate, disconnected | Phase 2: unified intake form | Deferred (by design) |
| No IT confirmation loop | Phase 2: milestone tracking with SLAs | Deferred (by design) |
| No Day 1 readiness checklist | Phase 2: manager readiness dashboard | Deferred (by design) |
| Manager is the connective tissue | Phase 2: automated coordination across HR/IT/Recruiting | Deferred (by design) |
| Candidate has no self-service | Phase 2: candidate portal | Deferred (by design) |
| Data re-entry across systems | Single source of truth from Phase 1. Data entered once in platform. | Covered |

### Intentionally Deferred to Phase 2+
| Feature | Reason |
|---|---|
| Outlook/M365 calendar sync | Requires Microsoft Graph API integration. Interviews tracked manually in Phase 1. |
| ADP API integration | Requires ADP Marketplace API access. Excel import for Phase 1. |
| Gem ATS integration | Gem not yet live at Denali. |
| Email delivery of reports | Requires SMTP/M365 setup. Platform-only with Excel export for Phase 1. |
| Custom report builder | 12 predefined reports cover current needs. Ad-hoc builder adds complexity. |
| Unified PIF + IT Request | Phase 2 onboarding orchestration. Data model ready. |
| Candidate self-service portal | Phase 2 onboarding orchestration. |
| ServiceNow integration | Phase 2 onboarding orchestration. |
| H-Note automation | Phase 2 onboarding orchestration. |
| Slack/Teams notifications | Phase 2. |
| LinkedIn integration | Phase 3. |

---

## UX Flows (Audit Gap Fixes)

### Interview Creation Flow
1. Recruiter clicks "Schedule Interview" (from Quick Actions or candidate detail)
2. System checks candidate NDA status:
   - If ndaStatus = "signed" → proceed
   - If ndaStatus = "pending" → show warning: "NDA sent but not yet signed. Interview cannot be scheduled until NDA is completed."
   - If ndaStatus = "not-required" or not set → show prompt: "Send NDA before scheduling?" with jurisdiction-specific template (US/UK/India)
3. Form fields: date/time, type (screen/video/onsite/panel), interviewers (multi-select from User list), notes
4. Time conflict check: warn if interviewer has another interview at the same time
5. On save: creates Interview record, creates StageTransition to Interview stage if candidate isn't already there

### Offer Approval Workflow
```
Recruiter creates Offer (status = "draft")
  → Offer appears in HM's approval queue (/(manager)/dashboard)
  → HM reviews: sees salary, title, start date, employee type
  → HM clicks "Approve" (status = "approved", approvedBy = HM, approvedAt = now)
     OR "Request Changes" with notes (status = "revision-requested")
  → On approval: recruiter extends offer to candidate (status = "extended")
  → Candidate responds: accepted / declined / counter-offer
  → If counter: OfferRevision created, recruiter updates, may re-route to HM
```
Offer statuses: draft → approved → extended → accepted/declined/rescinded (or draft → revision-requested → draft)

### In-App Notification System
- **Notification bell** in header for all roles, showing unread count badge
- Notifications generated automatically on key events:
  - **For Recruiters:** new candidate application, HM feedback submitted, offer approved/revision-requested, background check cleared, FCRA deadline approaching, consent expiring
  - **For HMs:** new candidate submitted for review, interview scheduled for their req, offer ready for approval, candidate hired
  - **For Recruiting Manager:** stale req alerts, DSAR received, legal hold created, FCRA deadlines
- Click notification → navigates to relevant page
- Mark as read on click, "Mark all read" button
- Retained 90 days then auto-purged

### Settings Management (Admin)
The recruiting manager can manage all reference data through the settings UI:
```
/(admin)/settings
  /users              → Provision/deactivate users, assign roles
  /stages             → Pipeline stage CRUD (name, order, terminal, requires approval)
  /departments        → Department CRUD (code, name)
  /locations          → Location CRUD (name, country, timezone, state)
  /sources            → Source channel CRUD
  /agencies           → Agency CRUD (name, contact, fee structure)
  /clients            → Client CRUD (name, default compliance requirements)
  /posting-channels   → Posting channel CRUD (Indeed, LinkedIn, etc.)
  /employee-types     → Employee type CRUD (code, name, exempt status)
  /cost-config        → Cost per hire configuration (payroll, tools costs)
  /budget             → Recruiting budget by department/quarter
```

---

## Error Handling & Concurrency (Audit Gap Fixes)

### API Error Response Format
All API endpoints return structured errors:
```json
{
  "error": "Human-readable error message",
  "code": "VALIDATION_ERROR | AUTH_ERROR | NOT_FOUND | CONFLICT | ENFORCEMENT_BLOCKED | SERVER_ERROR",
  "details": { "field": "payRangeMin", "reason": "Required by Washington EPOA" }
}
```

### Client-Side Error Handling
- **React Error Boundaries** at route group level — catches rendering errors, shows fallback UI
- **Toast notifications** for action failures (move candidate, save offer, etc.)
- **Inline validation errors** on forms (field-level, shown on blur and on submit)
- **Enforcement block modals** — when a legal enforcement rule blocks an action (e.g., FCRA rejection block), show a modal explaining what must happen first with action links

### Optimistic Concurrency Control
Every mutable entity has an `updatedAt` timestamp. On save:
1. Client sends `updatedAt` from when it fetched the record
2. API checks: does the current `updatedAt` match?
3. If yes → save succeeds, return new `updatedAt`
4. If no → return `409 Conflict` with `{ code: "CONFLICT", details: { updatedBy: "Nandini Mittal", updatedAt: "2026-03-25T14:32:00Z" } }`
5. Client shows: "This record was modified by Nandini Mittal at 2:32 PM. Reload to see their changes?"

This prevents: two recruiters moving the same candidate to different stages, overwriting each other's notes, conflicting offer edits.

### Excel Import Transaction Safety
The entire import operation is wrapped in a database transaction:
- All rows pass validation in the preview step (before insert)
- On confirm: BEGIN TRANSACTION → insert all rows → COMMIT
- If any row fails during insert (unexpected constraint, race condition): ROLLBACK entire batch
- User sees: "Import failed on row 247: duplicate req number REQ-3504. No records were imported. Fix and retry."
- No partial imports. All or nothing.

### Server-Side Error Logging
- Structured JSON logs (not console.log)
- Fields: timestamp, requestId, userId, action, statusCode, errorCode, message
- **Never** logs PII (no candidate names, emails, SSNs in error messages)
- Log levels: ERROR (failures), WARN (enforcement blocks, validation rejections), INFO (successful actions)
- Shipped to centralized logging in production

---

## Launch Readiness Plan (Audit Gap Fixes)

### Seed Data Script (Complete List)
`npx prisma db seed` provisions all reference data on first boot:

| Entity | Count | Source |
|--------|-------|--------|
| Departments | 22 | PROJECT_REQUIREMENTS.md Section 6 (18 listed + 4 from Filled Positions data) |
| Locations | 14 | PROJECT_REQUIREMENTS.md Section 4 (WA, IN, UK, India, Lebanon, Brazil, CO, FL, Guatemala, KS, MI, OH, TN, TX) |
| Source Channels | 12 | PROJECT_REQUIREMENTS.md Section 4 (LinkedIn, ADP, Agency, Referral, HM, Internal Transfer, Client, Craigslist, Rehire, Staffing Technologies, Laptop Co., FTE to 1099) |
| Agencies | 9 | PROJECT_REQUIREMENTS.md Section 3 (Rocket Staffing, Lynx Recruitment, Staffing Technologies, Field Nation, Logistics Plus, PNW Controls, Metni Engineering, The Functionary, Argano LLC) |
| Pipeline Stages | 8 | Design doc (Sourced → Submitted → Screen → Interview → Debrief → Offer Extended → Offer Accepted → Hired) |
| Posting Channels | 7 | SOP (Indeed, CareerBuilder, Monster, LinkedIn, Facebook, ADP Career Page, Craigslist) |
| Employee Types | 7 | SOP Company Context (Type 1-9, with 4A variant) |
| Clients | 3+ | SOP (Amazon, hospital clients, Microsoft — with per-client compliance defaults) |
| Data Retention Policies | ~30 | Design doc retention schedule (per entity type × per jurisdiction) |
| Privacy Notice Versions | 4 | One per jurisdiction (US, UK, Ireland, India) — initial drafts, legal review required |
| Default Users | 3 | Bootstrap: 1 Recruiting Manager (admin), 1 test Recruiter, 1 test HM |
| Minimum Wage Values | 2 | Federal ($7.25/hr), Washington ($16.66/hr 2026) |

### Data Migration Runbook
**Order of operations** (respects FK dependencies):
1. Seed reference data (departments, locations, sources, agencies, stages, employee types, clients)
2. Import Open Req Report → creates Requisitions with recruiter assignments
3. Import Filled Positions → creates Candidates (hired), Offers, AgencyFees
4. Import YTD Report → creates performance metrics, MetricSnapshots for trending
5. Import historical trending data (2020-2025 from Open Req Report Trending sheet) → MetricSnapshots
6. Reconciliation: compare imported counts to source spreadsheet counts. Report discrepancies.

**Data quality resolution during import:**
- 6 duplicate rows in Filled Positions: auto-skip, show in import report
- 46 recruiter/source mixed entries: pattern match (known recruiter names → recruiter field, remainder → source field), show uncertain matches for manual resolution
- Empty sourcing channel: default to "Not Specified"
- Trailing whitespace: auto-strip
- Department name mismatches: fuzzy match against seeded departments, prompt for manual mapping on unmatched
- Misspellings: flag but do not auto-correct — user confirms in preview

**Rollback:** If migration produces bad data, `prisma migrate reset` drops and recreates. Re-run seed + import.

### User Onboarding (Launch Day)
1. **Recruiting Manager** provisioned first as admin (manual SSO setup)
2. RM logs in → accesses `/admin/settings/users` → creates recruiter accounts (bulk or one-by-one)
3. RM imports reqs and candidates via Excel import
4. RM assigns recruiters to reqs
5. Recruiters get SSO access → first login → redirect to dashboard
6. HMs provisioned as needed when they have active reqs
7. **First login banner:** "Welcome to the Denali Recruiting Platform. Here's a 60-second tour." — dismissible, shows key UI areas (dashboard, pipeline, quick actions)

### User Documentation Plan
Created during implementation, delivered before launch:
- **Recruiter Quick Start Guide** (1-2 pages): dashboard overview, how to add candidates, move stages, generate reports
- **Hiring Manager Cheat Sheet** (1 page): how to review candidates, approve offers, check req status
- **Recruiting Manager Admin Guide** (2-3 pages): reports, user management, compliance dashboard, settings
- **Video walkthrough** (5 min): screen recording of a typical recruiter day

### Excel Export Format Specifications
Before building the export engine, collect sample reports from the recruiting team:
- [ ] Current Daily Recruiting Report format
- [ ] Current Open Req Report format (from ADP export)
- [ ] Current YTD Performance Report format
- [ ] Current PIR format
- [ ] Current Filled Positions format
- [ ] Current Agency Fees format

These samples become the format specifications. Exports must match column order, header names, number formats, and sheet structure that stakeholders already expect.

---

## Compliance Gaps Resolved (Audit)

### Adverse Impact Analysis Report
Added to compliance dashboard (admin only). Uses EEO self-identification data + StageTransition data to calculate:
- Selection rate by demographic group at each pipeline stage
- Four-fifths rule check: if any group's selection rate < 80% of highest group's rate → flag
- Exportable for EEOC reporting
- Runs on aggregate data only — never shows individual candidate demographics in the hiring workflow

### Consent Collection Flow (Phase 1)
In Phase 1, candidates are not platform users. Consent is collected offline:
1. Recruiter collects consent from candidate (paper form, email, or verbal with documentation)
2. Recruiter logs consent in the platform: candidate detail → "Log Consent" button → select type, jurisdiction, and privacy notice version
3. System records: candidateId, type, jurisdiction, grantedAt, privacyNoticeVersionId
4. For talent pool candidates: system tracks consent expiry (1 year) and sends refresh reminders to the recruiter via in-app notification

In Phase 2 (candidate portal), consent is collected directly from the candidate in-app.

### Background Check Report Storage
**Clarification:** The platform stores **metadata and status only** — not the actual background check report documents. Reports remain in ADP (standard checks), Accurate (Amazon checks), or Concentra (hospital checks). The BackgroundCheck entity tracks: type, status, dates, and FCRA workflow steps. This minimizes Tier 1 data surface within the platform while maintaining the audit trail needed for compliance.

### Data Breach Entity
Added for completeness, though breaches may also be managed in an external GRC tool:
- `DataBreach` entity: incidentDate, discoveredDate, classification (low/medium/high/critical), description, affectedDataTypes, affectedCandidateCount, affectedJurisdictions (JSON), notificationsSentAt, resolvedAt, postmortemUrl
- Page: `/(admin)/compliance/breaches` — log and track breach incidents
- Auto-calculates notification deadlines by jurisdiction (30 days for WA, 72 hours for GDPR)
