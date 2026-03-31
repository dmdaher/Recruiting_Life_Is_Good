# Phase 2: Onboarding Orchestration — Design Document

> **Status:** APPROVED — Ready for implementation planning
> **Owner:** Devin Daher, Head of Software Solutions
> **Created:** 2026-03-31
> **Builds on:** Phase 1 Recruiting Platform (complete)
> **Approach:** Build B (hybrid) with infrastructure for A (full automation)

---

## Goal

Replace the fragmented post-offer process (PIF email + separate IT ServiceNow request + manual follow-ups) with a unified onboarding workflow. Manager provides salary and start date — everything else is tracked, triggered, and confirmed by the platform.

**Scope:** Offer Accepted → Day 1 Ready

---

## New Data Model

### Core Onboarding Entities

**OnboardingRecord** (one per hired candidate)
```
id, candidateId (FK, unique)
status: NOT_STARTED / PIF_PENDING / IN_PROGRESS / DAY1_READY / COMPLETED
hireDate, orientationDate
orientationLocation: REDMOND_ONSITE / WEBEX_REMOTE
neoTimeSlot: "Mon 9:00 AM" / "Wed 9:00 AM"
pifSubmittedAt, pifApprovedAt
itRequestSubmittedAt, itEquipmentReadyAt
hNoteGeneratedAt, hNoteSentAt
backgroundCheckClearedAt
neoEmailSentAt
preworkCompletedAt
greeterAssignedToId (FK to User)
greeterLocation (text — "Building A Lobby", "Front Desk", etc.)
greeterMeetingTime (DateTime)
greeterConfirmedAt
greeterNotes
day1ReadyConfirmedAt
denaliEmail (assigned email address)
employeePositionId (ADP Position ID)
payFrequency: BIWEEKLY / MONTHLY
createdAt, updatedAt
```

**PIFData** (unified PIF + IT Request — one form, not two)
```
id, onboardingId (FK, unique)
--- PIF Fields (all 25+ from SOP) ---
pifType: NEW_HIRE / REHIRE / INTERNAL_TRANSFER
employeeName, jobReqNumber
referrerName (nullable)
recruiterName
agencyName, agencyFee
positionTitle
officeLocation, country, neoLocation
clientOnsiteStartDate
employeeType (Type 1-9)
bonusCommissionPlan
payRate, billRate (encrypted — Tier 2)
managerName, accountingCode
supervisorRole (boolean)
billable (boolean)
salesforceAccess (boolean)
cpqPermissions (boolean)
kimbleApproval (boolean)
kimbleTimeEntry (boolean)
businessCards (boolean)
itEquipmentNeeded (boolean)
client
drugScreenRequired (boolean)
tbTestRequired (boolean)
additionalBGCheck (boolean)
desiredAlias (candidate's preferred email alias)
--- IT Request Fields (from ServiceNow form) ---
hardwareType: PC / MAC
peripherals: JSON ["keyboard", "mouse", "docking_station", "1x_monitor", "2x_monitor", "headset", "webcam"]
deliveryMethod: PICKUP / SHIP_TO_HOME / DESK_SETUP
businessReason (text)
additionalInfo (text)
equipmentPackageId (FK to EquipmentPackage, nullable — for auto-assign)
--- Equipment Tracking ---
equipmentTrackingNumber (nullable — for shipped)
equipmentShippedAt, equipmentDeliveredAt
equipmentDeskLocation (nullable — "Bldg A, 3rd Floor, Desk 42")
equipmentSetupConfirmedAt, equipmentSetupConfirmedById (FK to User)
createdAt, updatedAt
```

**OnboardingMilestone** (tracks each step with SLA)
```
id, onboardingId (FK)
milestone: PIF_SUBMITTED / IT_REQUEST_SENT / BG_CHECK_INITIATED / BG_CHECK_CLEARED / H_NOTE_SENT / NEO_EMAIL_SENT / EQUIPMENT_SHIPPED_OR_STAGED / EQUIPMENT_CONFIRMED / PREWORK_COMPLETED / GREETER_ASSIGNED / GREETER_CONFIRMED / PAYROLL_NOTIFIED / DAY1_CONFIRMED
targetDate (auto-calculated from hire date + scenario)
completedAt (nullable)
completedById (FK to User)
escalatedAt (nullable)
escalationSentToId (FK to User)
notes
```

**Milestone SLA Targets** (from SOP timeline guidelines):
| Milestone | Billable + Equipment | Non-Billable + Equipment | India |
|-----------|---------------------|------------------------|-------|
| PIF_SUBMITTED | Day 0 | Day 0 | Day 0 |
| IT_REQUEST_SENT | Day 0 | Day 0 | Day 0 |
| BG_CHECK_INITIATED | Day 0 | Day 0 | Day 0 |
| BG_CHECK_CLEARED | ~Day 5-7 | ~Day 5-7 | ~Day 14-21 |
| H_NOTE_SENT | BG clear + 1 day | BG clear + 1 day | BG clear + 1 day |
| NEO_EMAIL_SENT | H-Note + 1 day | H-Note + 1 day | H-Note + 1 day |
| EQUIPMENT_SHIPPED_OR_STAGED | Start - 5 days | Start - 5 days | Start - 5 days |
| EQUIPMENT_CONFIRMED | Start - 2 days | Start - 2 days | Start - 2 days |
| PREWORK_COMPLETED | Start - 2 days | Start - 2 days | Start - 2 days |
| GREETER_ASSIGNED | Start - 3 days | Start - 3 days | Start - 3 days |
| GREETER_CONFIRMED | Start - 2 days | Start - 2 days | Start - 2 days |
| PAYROLL_NOTIFIED | H-Note + 1 day | H-Note + 1 day | H-Note + 1 day |
| DAY1_CONFIRMED | Start - 1 day | Start - 1 day | Start - 1 day |

**EquipmentPackage** (auto-assign by role — Phase A skeleton)
```
id, name ("Developer Standard", "PM Standard", "Admin Basic", "Field Service")
hardwareType: PC / MAC
peripherals: JSON
roleFamily ("Engineering", "PM", "Admin", "Field Service", "Sales")
isDefault (boolean)
createdAt, updatedAt
```

**CandidatePrework** (tracks new hire pre-Day-1 tasks)
```
id, onboardingId (FK, unique)
i9Status: NOT_STARTED / EMAIL_SENT / SUBMITTED / VERIFIED
i9DocumentsReceivedAt
taxWithholdingCompleted (boolean)
companyPoliciesAcknowledged (boolean)
directDepositSetup (boolean)
emergencyContactsProvided (boolean)
marketingConsentSigned (boolean)
tshirtSize (nullable)
completedAt (all items done)
```

**AccessRequest** (system access for new hire)
```
id, onboardingId (FK)
systemName ("Shared Inbox: team@denali", "Salesforce", "Building Access Badge", "VPN", etc.)
requestedAt, completedAt
requestedById (FK to User)
status: PENDING / COMPLETED
```

**OnboardingPlan** (manager's plan for the new hire's first week)
```
id, onboardingId (FK, unique)
meetingsToSchedule: JSON [{ person: "VP Engineering", purpose: "Intro", scheduled: false }]
trainingsRequired: JSON [{ name: "Security Training", completed: false }]
firstWeekTasks: JSON [{ task: "Set up dev environment", completed: false }]
notes
createdAt, updatedAt
```

### Skeleton Entities (Phase A infrastructure — built but not fully wired)

**ContractTracking** (UK/Ireland DocuSign flow)
```
id, onboardingId (FK)
jurisdiction: UK / IRELAND
contractType ("Contract of Employment", "Ireland Contract")
starterFormType ("SBS UK", "Ireland New Starter")
managerSignedAt, candidateSignedAt, finalSignedAt (Alex Daher)
contractDocuSignId (nullable)
starterFormDocuSignId (nullable)
status: DRAFT / MANAGER_SIGNED / CANDIDATE_SIGNED / COMPLETED
```

**MedicalCompliance** (Concentra — hospital client hires)
```
id, onboardingId (FK)
clientName (hospital name)
drugScreenRequired, drugScreenStatus: PENDING / PASSED / FAILED
drugScreenCompletedAt
tbTestRequired, tbTestVisit1At, tbTestVisit2At, tbTestResult
vaccinations: JSON [{ name: "COVID", status: "verified", date: "..." }, ...]
concentraAuthSentAt (DocuSign)
canStartWithPending (boolean — "Can start if TB and drug screen returned")
clearanceStatus: PENDING / CLEARED / BLOCKED
```

**InternationalHireDetails** (India/UK/Ireland specifics)
```
id, onboardingId (FK)
jurisdiction: UK / IRELAND / INDIA
--- India ---
globalUpsideNotified (boolean)
noticePeriodDays (60 standard, 30 during probation)
probationMonths (6, extendable)
salaryBreakdown: JSON { basic, hra, conveyance, medical, specialAllowance, statutoryBonus, pf, gratuity }
--- UK/Ireland ---
businessUnit ("UK Denali Europe Limited" / "Ireland Denali Europe Limited")
positionIdFormat (e.g., "EU000000")
payrollContactNotified (boolean — Candy for UK/Ireland)
hmrcFormSubmitted (boolean — UK only)
standardHoursPerMonth (173.33 for UK)
timeOffPolicies: JSON ["Holiday-UK", "Sick Leave-UK"]
```

---

## Pages & UI

### Manager Readiness Dashboard (`/recruiter/onboarding/[id]`)
```
┌─────────────────────────────────────────────────────────────┐
│ Onboarding: Sarah Kim — Software Engineer II                 │
│ Start Date: April 15, 2026 (14 days away)                    │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ ✅ PIF Submitted        ✅ IT Request Sent              │  │
│ │ ✅ BG Check Cleared     ✅ H-Note Sent                  │  │
│ │ ✅ NEO Email Sent       🟡 Equipment (shipping...)      │  │
│ │ ✅ Greeter Assigned     ⬜ Equipment Confirmed          │  │
│ │ ✅ Prework Complete     ⬜ Day 1 Confirmed              │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                              │
│ Status: 8/11 milestones complete                             │
└─────────────────────────────────────────────────────────────┘
```

### Unified PIF + IT Form (`/recruiter/onboarding/[id]/pif`)
- Single form replacing PIF email + ServiceNow IT request
- Pre-populated from offer/req data where possible
- Equipment package auto-suggested by role family
- Manager only changes if non-standard

### Admin Onboarding Overview (`/admin/onboarding`)
- Table of all active onboardings with milestone status
- Filter by: status, recruiter, department, overdue milestones
- Escalation alerts for missed SLAs

### H-Note Preview + Send (`/recruiter/onboarding/[id]/h-note`)
- Auto-generated from PIF data
- Preview before sending
- Records sent timestamp

---

## API Endpoints

```
/api/onboarding                    — List/create onboarding records
/api/onboarding/[id]               — Get/update onboarding record
/api/onboarding/[id]/pif           — Get/submit PIF+IT unified form
/api/onboarding/[id]/milestones    — Get/update milestones
/api/onboarding/[id]/h-note        — Generate/preview/send H-Note
/api/onboarding/[id]/prework       — Get/update candidate prework status
/api/onboarding/[id]/access        — List/create/complete access requests
/api/onboarding/[id]/plan          — Get/update onboarding plan
/api/onboarding/[id]/equipment     — Track equipment status
/api/onboarding/[id]/contract      — UK/Ireland contract tracking (skeleton)
/api/onboarding/[id]/medical       — Concentra medical compliance (skeleton)
/api/admin/equipment-packages      — CRUD equipment packages
```

---

## Enforcement Rules (Phase 2)

1. **H-Note cannot be sent until BG check clears** — SOP requirement
2. **IT will not ship equipment until H-Note is sent** — SOP note
3. **Onboarding cannot be marked DAY1_READY until all milestones complete**
4. **Equipment auto-assigned by role family** — manager can override but default is set
5. **Escalation alert fires when milestone target date is missed** — notification to responsible person

---

## Trigger: Phase 1 → Phase 2 Handoff

When a candidate moves to the "Hired" stage in Phase 1:
1. Auto-create OnboardingRecord with status = PIF_PENDING
2. Auto-create milestone targets based on scenario (billable/non-billable, jurisdiction, equipment needed)
3. Notification to manager: "Onboarding started for [Name]. Submit PIF to continue."
4. Notification to HR: "New hire [Name] — background check needed"

---

## International Workflow Branching

When OnboardingRecord is created, check candidate jurisdiction:
- **US:** Standard flow (PIF → BG Check → H-Note → Equipment → Day 1)
- **UK:** Add ContractTracking + PAYROLL_NOTIFIED milestone + monthly pay frequency
- **Ireland:** Add ContractTracking + PAYROLL_NOTIFIED milestone + Ireland-specific forms
- **India:** Add InternationalHireDetails + extended BG check timeline + Global Upside notification

---

## Data Flow (New)

```
Candidate moves to "Hired" stage (Phase 1)
  → Auto-create OnboardingRecord (status: PIF_PENDING)
  → Auto-create milestone targets
  → Notify manager: "Submit PIF"
  → Manager submits unified PIF+IT form
    → PIF_SUBMITTED milestone ✅
    → IT_REQUEST_SENT milestone ✅ (same form)
    → Equipment auto-assigned from EquipmentPackage
  → HR initiates background check (tracked in Phase 1 BackgroundCheck entity)
    → BG_CHECK_INITIATED milestone ✅
  → Background check clears
    → BG_CHECK_CLEARED milestone ✅
    → Auto-generate H-Note from PIF data
  → HR reviews + sends H-Note
    → H_NOTE_SENT milestone ✅
    → IT begins equipment provisioning
    → NEO_EMAIL_SENT milestone (HR sends to candidate)
    → [UK/Ireland] PAYROLL_NOTIFIED milestone
  → IT ships/stages equipment
    → EQUIPMENT_SHIPPED_OR_STAGED milestone ✅
  → IT confirms equipment ready
    → EQUIPMENT_CONFIRMED milestone ✅
  → Candidate completes prework (I-9, tax, policies)
    → PREWORK_COMPLETED milestone ✅
  → Manager/HR assigns greeter
    → GREETER_ASSIGNED milestone ✅
  → Greeter confirms
    → GREETER_CONFIRMED milestone ✅
  → All milestones complete
    → DAY1_CONFIRMED milestone ✅
    → Manager gets: "Everything ready for [Name] on [Date]"
    → OnboardingRecord status → DAY1_READY
```
