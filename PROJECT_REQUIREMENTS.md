# Denali Recruiting Platform - Project Requirements

> **Owner:** Head of Software Solutions, IT & Systems Internal
> **Created:** 2026-03-25
> **Status:** Design Phase

---

## 1. Problem Statement

Denali's recruiting team manages an entire candidate pipeline of 100s of candidates and roles using **manual Excel spreadsheets and Outlook**. The current ATS (ADP) has limited functionality, forcing the team to track candidate activity, compile reports, and manage workflows through disconnected tools. This creates:

- **Hours of manual report compilation** every day/week
- **Data scattered** across Outlook, Excel, ADP, and individual recruiter workflows
- **No single source of truth** for pipeline status
- **No real-time visibility** into recruiting performance
- **Error-prone manual counting** (e.g., interviews counted from Outlook)
- **Difficulty filtering and slicing data** (even ADP's time-to-fill report is hard to run)

The goal is to build a **working dashboard and platform** that eliminates the manual workflow and lets the recruiting team focus on strategic recruiting.

---

## 2. Users & Roles

### User Types
| Role | Count | What They Need |
|------|-------|----------------|
| **Recruiters** | 6-10 | Manage their candidate pipeline daily, log activity, schedule interviews, track submittals/hires |
| **Recruiting Manager** | 1 | Team performance oversight, workload balancing, report generation, analytics |
| **Hiring Managers** | Many | Track their open reqs, review candidates, submit candidate forms (pay, dept codes), contact recruiting |

### Access Levels
- **Recruiter**: See/manage their assigned reqs and candidates, personal performance metrics
- **Recruiting Manager**: Everything recruiters see + team-wide analytics, report distribution, admin controls
- **Hiring Manager**: Their reqs only, candidate review queue, forms submission, read-only pipeline view

## 3. Current Recruiting Team

### Internal Recruiting Team (8 recruiters)
| Recruiter | 2026 YTD Interviews | 2026 YTD Submittals |
|-----------|--------------------:|--------------------:|
| Anania Tefera | 46 | 44 |
| Nandini Mittal | 36 | 38 |
| Sunil Kumar | 28 | 38 |
| Ali El-Husseini | 25 | 39 |
| Alex Espinosa | 21 | 56 |
| Sethupathi Moorthi | 8 | 23 |
| Dennis Watts | 6 | 9 |
| Tara Rogers | 0 | 1 |

### External Sources (Agencies & Others)
- Rocket Staffing
- Lynx Recruitment
- Staffing Technologies
- Field Nation
- Logistics Plus
- PNW Controls
- Metni Engineering Services
- The Functionary
- Argano LLC

### Referral Sources
- Employee Referrals
- Hiring Manager Referrals
- Client Referrals
- Internal Transfers

---

## 4. Current Data & Reports (All Manual Today)

### 3.1 Reports Compiled Manually

| Report | Frequency | Current Method | Pain Level |
|--------|-----------|----------------|------------|
| **Daily Recruiting Report** | Daily (every evening) | Candidate submissions tracked manually, sent out nightly | High |
| **Open Requisition Report** | 2x/week | Exported from ADP, reformatted in Excel | High |
| **YTD Performance Report** | Weekly | Placements by recruiter by week/month/quarter | High |
| **Interview Tracking** | Ongoing | Manually counted from Outlook | Very High |
| **Rescinded Offers** | Weekly | Excel | Medium |
| **Payroll Impact Report (PIR)** | 3x/week | Excel | High |
| **Filled Positions Tracking** | Weekly | Excel | Medium |
| **Cost per Hire** | As needed | Manual calc: (payroll + tools + agency) / placements | High |
| **Referral Bonus Tracking** | Ongoing | Excel | Medium |
| **Agency Fees Reporting** | Weekly | Excel | Medium |
| **Requisition Audit + Updates** | As needed | Shared with stakeholders manually | Medium |
| **Time to Fill** | As needed | ADP automates but difficult to run/filter | Medium |

### 3.2 Data Sources Analyzed

#### A. YTD Report (`YTD Report 2026.xlsx`)
- **Structure:** 12 weekly snapshot sheets (Jan 2 - Mar 20, 2026), each 352 rows x 40 columns
- **Contains per week:**
  - Monthly submittals (internal team + external)
  - Monthly interviews (internal team + external)
  - Internal referrals hired
  - Hires this month (total + by internal recruiters)
  - Per-recruiter: weekly hires, interviews
  - YTD hires by month (Jan: 24, Feb: 25, Mar: 20 as of 3/20)
  - YTD hires by source channel (Agency: 31, Employee Referrals: 7, HM Referrals: 7, etc.)
  - YTD interviews per recruiter
  - YTD submittals per recruiter
  - Avg hires per month (currently 23)
- **Key YTD totals (as of 3/20/2026):**
  - 69 hires YTD
  - 203 interviews YTD
  - 291 submittals YTD

#### B. Open Requisition Report (`Open Req Report 3.23.2026.xlsx`)
- **Structure:** 23 snapshot sheets (Jan 5 - Mar 23, 2026) + 1 Trending sheet, ~66 rows x 29 columns per sheet
- **Fields per req:** Req#, Date Open, # Positions, # Positions Filled, Title, Billable/Non-Billable, Status, Recruiter(s), Accepting Applications?, Hiring Manager, Location
- **Current open reqs (3/23/2026):** ~30 open requisitions
- **Tracks target dates:** Missed Target Date (17 reqs), Approaching Target Hire Date (3 reqs)
- **Trending sheet:** Historical open position counts going back to 2020 (184 data points)
- **Multi-recruiter assignments** common (e.g., "Dennis Watts-Sunil Kumar-Sethupathi Moorthi")

#### C. Filled Positions (`Filled Positions 2026.xlsx`)
- **Structure:** 4 sheets
  1. **Filled 2026** — 583 hire records: Req#, Department, Title, Location, Date of H-Note, Recruiter, Hiring Manager, Sourcing Channel
  2. **Positions Filled by Department** — Quarterly breakdown across 25+ departments
  3. **Fees Per Department** — Agency fee tracking by department and quarter ($50,079.56 YTD)
  4. **U.S. Fees Only** — Subset for domestic agency costs

**18 departments** across the company (see Section 5 for full list)

**14 locations:** Washington, Indiana, UK, India, Lebanon, Brazil, Colorado, Florida, Guatemala, Kansas, Michigan, Ohio, Tennessee, Texas

**12 sourcing channels:** LinkedIn, ADP, Agency, Referral, Hiring Manager, Internal Transfer, Client, Craigslist, Rehire, Staffing Technologies, Laptop Co., FTE to 1099 conversion

---

## 5. What The Platform Must Do

### 4.1 Core Modules

#### Dashboard (Home)
- Real-time KPIs: hires this week/month/YTD, open reqs, interviews scheduled, offer acceptance rate
- Recruiter leaderboard (submittals, interviews, hires)
- Pipeline funnel visualization
- Alerts: reqs approaching/past target dates, rescinded offers, stalled candidates

#### Pipeline Management
- Kanban board for candidates per req (Sourced -> Screen -> Interview -> Debrief -> Offer -> Accepted)
- Drag-and-drop stage transitions
- Per-candidate notes, interview feedback, documents
- Bulk actions (move, tag, reject)
- Filter by recruiter, department, location, billable/non-billable

#### Open Requisitions
- Live table of all open reqs with sorting/filtering
- Status tracking: Open, Filled Paperwork, Pending, Closed
- Target date monitoring with visual warnings (red = missed, yellow = approaching)
- Recruiter assignment management (supports multiple recruiters per req)
- Quick-add from ADP export or manual entry

#### Filled Positions & Hires
- Searchable log of all hires
- Filter by department, recruiter, location, date range, sourcing channel
- Duplicate detection (data currently has some duplicate rows)

#### Recruiter Performance / Analytics
- Submittals, interviews, hires per recruiter (weekly/monthly/quarterly/YTD)
- Conversion rates: submittal -> interview -> offer -> hire
- Time-to-fill per recruiter, department, role type
- Source effectiveness: which channels produce hires
- Agency vs. internal recruiter performance comparison
- Trend lines over time (weekly snapshots already exist)

#### Financial Tracking
- Agency fees by department, quarter, and total
- Cost per hire calculation (payroll expenses + recruiting tools + agency spend / placements)
- Referral bonus tracking
- U.S. vs. international fee breakdowns
- Budget vs. actual spend

#### Reports & Exports
- **Daily Recruiting Report** — auto-generated from pipeline data, emailed nightly
- **Open Req Report** — auto-generated, sent 2x/week
- **YTD Performance Report** — auto-generated weekly
- **PIR (Payroll Impact Report)** — auto-generated 3x/week
- All reports exportable to Excel (.xlsx) matching current team formatting
- Scheduled email delivery to stakeholders
- Custom report builder for ad-hoc analysis

### 4.2 Integrations (Phased)

| Integration | Purpose | Priority |
|-------------|---------|----------|
| **Outlook / Microsoft 365** | Interview scheduling, candidate emails, calendar sync | Phase 1 |
| **ADP** | Import open reqs, employee data, time-to-fill | Phase 1 |
| **Excel Import/Export** | Bulk data import from current spreadsheets, export reports | Phase 1 |
| **Gem ATS** | Full candidate tracking once integration is live | Phase 2 |
| **Slack/Teams** | Notifications for hiring managers, recruiter alerts | Phase 2 |
| **LinkedIn** | Candidate sourcing channel tracking | Phase 3 |

### 4.3 Non-Functional Requirements

- **Local-first**: Runs locally during development, deploys to internal company server or cloud
- **Multi-user**: Full recruiting team + hiring managers need access
- **Role-based access**: Recruiters see their pipeline, managers see their reqs, leadership sees everything
- **Fast**: Must handle 500+ candidates, 30+ open reqs, 8+ recruiters without lag
- **Excel-compatible**: Team lives in Excel today; export must produce clean, formatted spreadsheets
- **Mobile-friendly**: Recruiters are sometimes on the go

---

## 6. Reference Data

### Departments (18)
```
000-50 Executive
001-03 Solutions Architecture
001-09 Field Services - Core IS
001-10 T-Mobile
001-12 EADG
001-15 Kuiper
001-15 Staff Aug
001-21 Service Desk
001-22 Services - PMO
001-24 Configuration/MMS
001-32 Amazon Support Services
001-33 Automation SA
001-34 Digital Services
001-82 Managed Services - IT
002-20 Sales
002-24 Managed Device Lifecycle Sales
004-08 WA Systems
004-20 Sales Operations
004-32 Amazon Support & Logistics
004-55 Customer Success
004-60 Accounting
004-70 HR
```

### Agency Fee Summary (2026 YTD)
| Agency | Candidate | Department | Fee |
|--------|-----------|------------|----:|
| Rocket Staffing | Madalina Patica | Amazon Support & Logistics | $4,365 |
| Dennis Watts (ext) | Doyle Egg III | Solutions Architecture | $0 |
| Rocket Staffing | Paul Sedgwick | Configuration/MMS | $7,862 |
| Rocket Staffing | Antonio Gusa | Automation SA | $10,522 |
| Lynx Recruitment | William Spensley | Automation SA | $16,660 |
| Staffing Technologies | Ashish Nagrale | Sales Operations | $10,670 |
| **Total** | | | **$50,080** |

### Open Req Trending Data
- Historical data going back to 2020
- Peak: 78 open positions (March 2020)
- Trough: ~20 open positions (May 2020)
- Currently: ~30 open positions (March 2026)

---

## 7. Success Criteria

1. **Eliminate daily manual report compilation** — reports auto-generate on schedule
2. **Single source of truth** — no more cross-referencing Excel files, Outlook, and ADP
3. **< 30 seconds** to answer "how many open reqs do we have?" or "what's recruiter X's performance?"
4. **Excel export parity** — exported reports match the formatting stakeholders expect
5. **Recruiter adoption** — the team actually uses it instead of going back to spreadsheets
6. **Real-time pipeline visibility** — leadership can see hiring status without asking for a report

---

## 8. Deployment Strategy

| Phase | Environment | Description |
|-------|-------------|-------------|
| **Phase 1** | Local development | Build and iterate locally with real data from Excel imports |
| **Phase 2** | Internal company server | Deploy to Denali's internal infrastructure for team access |
| **Phase 3** | Cloud server (optional) | If remote access needed beyond VPN |

---

## 9. Tools & Plugins Available

### Claude Code Plugins (Installed)
- **human-resources** (knowledge-work-plugins) — Recruiting pipeline management, offer drafting, onboarding, comp analysis, people reports, interview prep, org planning
- **frontend-design** — UI/UX design for the platform
- **frontend-excellence** — React/Next.js architecture, state management, CSS/styling, performance
- **ui-designer** — Component design
- **superpowers-extended-cc** — Planning, brainstorming, code review, TDD, debugging

### Potential Connectors (via HR Plugin)
- ATS: Gem (planned), ADP (current)
- Calendar: Microsoft 365 / Outlook
- Email: Microsoft 365 / Outlook
- Chat: Teams / Slack
- HRIS: ADP

---

## 10. End-to-End Recruiting Workflow (Expert View)

This section goes beyond the current spreadsheets and defines what a **best-in-class recruiting platform** does at every stage. The goal: make every recruiter's and hiring manager's day dramatically easier.

### 9.1 Requisition Creation & Intake

**For Hiring Managers:**
- One-click req creation from templates (by department/role type)
- Intake form: role details, must-haves vs. nice-to-haves, comp range, urgency, billable/non-billable
- Auto-routing to recruiting team based on department/specialty
- Real-time status of their reqs without emailing recruiting

**For Recruiters:**
- Intake meeting scheduler (auto-pull HM's calendar via Outlook)
- Job description builder with templates by role family
- Auto-assign recruiter(s) based on workload balancing
- Kickoff checklist: posting locations, sourcing strategy, target timeline

### 9.2 Sourcing & Candidate Attraction

**Automated:**
- Job posting distribution tracking (where is this posted? LinkedIn, ADP, Craigslist, agencies)
- Source channel tagging on every candidate from first touch
- Agency portal: agencies submit candidates directly, no email chains
- Employee referral portal: employees submit referrals with a simple form, auto-tracking of referral bonuses
- Passive candidate database: store "not now" candidates for future reqs

**For Recruiters:**
- Candidate search across all past applicants (don't re-source someone you already have)
- Duplicate candidate detection (same person applying to multiple reqs)
- One-click outreach templates (personalized by role, location, company)
- Tracking: how many reached out, responded, interested per source per week

### 9.3 Screening & Evaluation

**For Recruiters:**
- Phone screen scheduling via Outlook calendar integration
- Screen scorecard templates (configurable per role family)
- Quick disposition: pass/fail/hold with one click + reason code
- Candidate profile: resume, notes, screen score, all in one place
- Bulk screen results entry for high-volume roles (e.g., Field Service Tech I with 30 positions)

**For Hiring Managers:**
- See screened candidates with recruiter notes before interviews
- Thumbs up/down to move candidates forward without email back-and-forth

### 9.4 Interview Scheduling & Management

**This is the #1 pain point today (manually counted from Outlook).**

**Automated:**
- Interview scheduling assistant: pull HM + panel availability from Outlook, propose times to candidate
- Calendar holds sent automatically
- Interview reminders (24hr and 1hr before)
- Interview type tracking: phone screen, video, on-site, panel
- Auto-count interviews per recruiter per week (no more manual counting)

**For Interviewers/Hiring Managers:**
- Structured interview guides (competency-based questions per role)
- Interview scorecard: rate candidates on specific criteria, not just "gut feel"
- Mobile-friendly scorecard submission (fill out right after the interview)
- Debrief scheduling: auto-schedule after all interviews complete

**For Recruiters:**
- Interview pipeline view: who's interviewing this week, for which roles
- No-show tracking
- Reschedule management
- Panel coordination across time zones (WA, IN, UK, India, Lebanon)

### 9.5 Debrief & Decision

**For Hiring Managers:**
- Side-by-side candidate comparison (scorecards, notes, comp expectations)
- Structured debrief template: strengths, concerns, hire/no-hire recommendation
- Decision capture: hire, reject, hold for future, redirect to different role

**For Recruiters:**
- Decision status dashboard: which reqs are in debrief? How long have they been there?
- Nudge alerts: "Debrief for Req #3504 has been pending 5 days"
- Rejection reason tracking (for reporting: why are candidates being rejected?)

### 9.6 Offer Management

**For Recruiters:**
- Offer letter generation from templates (auto-fill: name, title, comp, start date, location)
- Comp range guardrails: warn if offer is outside approved band
- Approval workflow: recruiter drafts -> HM approves -> HR/legal signs off
- Offer tracking: extended, accepted, declined, rescinded (with reason)
- Counter-offer management: track negotiation history
- Offer expiration reminders

**For Hiring Managers:**
- One-click offer approval
- See offer status without asking

**Analytics:**
- Offer acceptance rate by recruiter, department, location
- Average time from offer to acceptance
- Decline reasons (comp, counter-offer, timing, relocation, etc.)
- Rescinded offers tracking (currently a weekly manual report)

### 9.7 Pre-boarding & Handoff

**The gap between "offer accepted" and "Day 1" is where candidates ghost.**

- Background check status tracking
- Equipment/laptop provisioning trigger (important for Denali's device lifecycle business)
- Day 1 checklist auto-generation
- Hiring manager notification: "Your new hire starts Monday. Here's what's ready."
- Candidate communication: welcome email sequence, first-day details, parking/badge info
- Onboarding doc package auto-assembly

### 9.8 Hiring Manager Experience (Their Own Portal)

Hiring managers shouldn't need to learn a recruiting tool. They need:

- **My Open Reqs**: See all their reqs, status, days open, candidates in pipeline
- **Candidates to Review**: Queue of screened candidates awaiting their feedback
- **Interview Schedule**: Their upcoming interviews with candidate prep materials
- **Approvals**: Offers to approve, reqs to sign off on
- **Notifications**: Email/Teams digest — "3 new candidates submitted for your Software Engineer II role"

All of this available without logging into a separate tool — push to email/Teams with action links.

### 9.9 Automated Reports (Replacing Manual Compilation)

| Report | Current | Automated Version |
|--------|---------|-------------------|
| **Daily Recruiting Report** | Manually compiled every evening | Auto-generated at 5 PM, emailed to distribution list. Includes: submittals today, interviews today, offers extended, hires confirmed |
| **Open Req Report** | Exported from ADP, reformatted in Excel, sent 2x/wk | Live dashboard always current. Scheduled Excel export Mon & Thu to stakeholders |
| **YTD Performance Report** | Manually compiled weekly | Always-current dashboard. Scheduled Excel export every Monday |
| **Interview Tracking** | Manually counted from Outlook | Auto-counted from platform data. Real-time numbers on dashboard |
| **Rescinded Offers** | Weekly Excel | Dashboard widget + weekly email alert |
| **PIR (Payroll Impact Report)** | 3x/week in Excel | Auto-generated Mon/Wed/Fri, emailed to payroll/HR |
| **Filled Positions** | Weekly Excel tracking | Auto-updated when candidate status changes to "Hired" |
| **Cost per Hire** | Manual calculation | Auto-calculated: (payroll + tools + agency fees) / placements, filterable by department/quarter |
| **Referral Bonus Tracking** | Excel | Auto-tracked from referral source tagging. Alerts when bonus is due |
| **Agency Fees** | Weekly Excel | Auto-tracked per agency placement. Dashboard with budget vs. actual |
| **Req Audit** | Ad-hoc for stakeholders | Self-serve: stakeholders view their reqs directly in HM portal |
| **Time to Fill** | ADP (hard to run) | Auto-calculated per req with easy filtering by department, recruiter, location, role type, billable/non-billable |

### 9.10 Analytics & Intelligence

Beyond basic reporting, the platform should surface insights:

- **Bottleneck Detection**: "Req #3504 has been open 28 days with 0 candidates past screen stage"
- **Recruiter Workload Balancing**: "Anania has 12 active reqs, Tara has 2 — consider rebalancing"
- **Source ROI**: "LinkedIn produces 40% of submittals but only 15% of hires. Referrals produce 10% of submittals but 25% of hires"
- **Seasonal Trends**: Hiring velocity by month/quarter over years
- **Agency Cost Efficiency**: "Rocket Staffing avg fee: $7,583/hire. Lynx Recruitment avg fee: $16,660/hire"
- **Time-to-Fill Benchmarks**: By department, role level, billable vs non-billable
- **Forecast**: "At current hiring velocity (23/month), you'll fill remaining 30 reqs in ~6 weeks"
- **Stale Req Alerts**: Reqs open > 30/60/90 days with no activity
- **Diversity of Source Mix**: Are you over-reliant on agencies vs. building internal pipeline?

### 9.11 Recruiter Daily Workflow (The "Morning Coffee" View)

When a recruiter opens the platform at 8 AM, they should see:

1. **My Candidates Today** — Who needs action? Follow-ups due, interviews happening, offers pending response
2. **My Numbers This Week** — Submittals, interviews, hires vs. weekly target
3. **New Candidates** — Any new applications or referrals overnight
4. **Overdue Items** — Candidates waiting > 48 hours for feedback, reqs with no activity this week
5. **Calendar** — Today's interviews, screens, debrief meetings synced from Outlook
6. **Quick Actions** — Submit candidate, schedule interview, log screen notes, extend offer

No clicking through 5 tabs to figure out what to do. The platform tells them.

---

## 11. Open Questions

- [x] Who are the primary users? **Recruiters (6-10), 1 Recruiting Manager, Hiring Managers**
- [x] What role-based access levels are needed? **Recruiter, Recruiting Manager, Hiring Manager (see Section 2)**
- [ ] Is there an existing Denali design system / brand guidelines to follow?
- [ ] What's the timeline for Gem ATS integration?
- [ ] Are there compliance/data retention requirements for candidate data?
- [ ] What's the internal server infrastructure? (Windows Server? Linux? Docker available?)
- [ ] Does the team use Microsoft Teams or Slack for notifications?
- [ ] What's the budget for hosting / third-party APIs?
- [ ] Should the platform replace ADP for recruiting, or supplement it?
