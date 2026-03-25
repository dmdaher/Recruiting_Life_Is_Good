# Denali — New Hire Onboarding: Process, Pain Points & Platform Context

## Purpose

This document captures the hiring and onboarding process at Denali Advanced Integration from the perspective of a hiring manager. It's meant to give full context to anyone building a platform to replace or improve this process. It focuses on the flow as experienced, where it breaks, and what the ideal state looks like — not the internal HR procedures for clicking through ADP.

**The goal state:** A manager's only required input should be salary and start date. Everything else should be handled by the right teams, triggered automatically, and confirmed without the manager project-managing the process.

---

## Company Context

- **Company:** Denali Advanced Integration (some internal docs still reference former name "3MD Inc.")
- **Locations:** HQ in Redmond, WA. International offices in UK (London/Crick), Ireland (Dublin), India (Bangalore)
- **Core systems:** ADP Workforce Now (HR/recruiting/payroll/onboarding), ServiceNow (IT ticketing), DocuSign (agreements), Box (file storage), Kimble (time tracking), Salesforce CRM, Okta (SSO)
- **Employee types:** Type 1 (salaried exempt) through Type 9, plus Type 4/4A (contractors)
- **Orientation:** New Employee Orientations held Mon/Wed, 9 AM–11:30 AM PT, onsite in Redmond or remote via WebEx

---

## The Process as I've Experienced It

### Phase 1: Requisition & Job Description

If the position already exists in ADP with a job description, this is straightforward — open a req, it goes through approval, Recruiting posts it. Fine.

If the position does NOT exist, it gets clunky. I have to email the Compensation team to create a new JD, wait for approval, wait for HR to input the title into ADP, and then I can open the req. The back-and-forth around title, compensation range, and JD approval feels slow when you're trying to move fast on a hire.

### Phase 2: Recruiting & Interview

Once the req is approved, Recruiting assigns an internal recruiter who meets with me on position requirements, then sources candidates. They send resumes, I decide who to interview, and Recruiting Coordinators schedule the interviews on Teams.

This part is getting better. My feedback as an end user: sometimes it feels slow and I end up checking in on whether the candidate is still interested or when interviews are being scheduled. But overall the recruiting and offer process isn't a major concern.

When I select a candidate, we discuss the offer amount and Recruiting sends the offer letter and background check consent through ADP.

### Phase 3: Post-Offer — Where It Breaks Down

Once the candidate says yes, the manager becomes the project manager for onboarding. This is the core problem.

**I have to submit two separate, disconnected forms:**

**Form 1 — PIF (Personnel Information Form):** Submitted by the manager via email to recruiting@denaliai.com. Contains candidate name, department codes, cost center, system access requirements (Salesforce, CPQ, Kimble), reporting structure, compensation details, employee type, office location, client assignment, whether they need IT equipment, and more. This is 25+ fields that the manager fills out.

**Form 2 — IT Hardware & Peripherals Request:** Submitted separately by the manager to the Help Desk via ServiceNow (itrequest.denaliai.com). The manager has to specify hardware type (PC or Mac), laptop specs, and check boxes for peripherals — keyboard, mouse, docking station, monitors (1x or 2x), headset, webcam, etc.

These two forms have no connection to each other. They go to different teams through different systems. Nobody tracks both in one place.

**My issues with this:**
- Why is the PIF separate from the IT request? They're both about the same new hire.
- Why am I specifying laptop specs and peripheral configurations? I'm not an IT person. IT should own IT decisions.
- Why doesn't the candidate fill out their own personal information? The manager is entering the candidate's name, details, and preferences on their behalf.
- Manager approval should only be needed for exceptions — like if someone requests a Mac when the standard is a PC, or wants dual monitors when single is the default.

### Phase 4: The H-Note — What Triggers IT

After the background check clears, HR enters the hire into ADP and sends an "H-Note" to an internal distribution list. The H-Note contains the new hire's info (name, title, department, manager, email, system access needs, etc.) and is what officially triggers IT and Billing to create credentials and provision equipment.

**Critical gap:** The SOP says IT won't send equipment until the H-Note goes out — but there's no step where IT confirms back to anyone that equipment is actually ready. No SLA, no confirmation loop, no accountability if it's not staged by Day 1.

### Phase 5: Day 1 Readiness — Where Trust Breaks Down

HR sends the new hire a NEO Instructions Email with their start date, orientation details, and pre-work (I-9, tax forms, direct deposit, policy acknowledgments).

But here's what's missing: nobody confirms that everything is actually ready for Day 1. There's no checklist that says "equipment staged ✓, greeter assigned ✓, orientation confirmed ✓, manager notified ✓."

**My real experience with Stephan's onboarding:**
- I checked in with IT multiple times to make sure equipment was at his desk before he arrived
- I checked in with HR/Recruiting to make sure someone would be there to greet him
- I didn't feel confident it would happen without my follow-up, so I stayed on top of it
- Without my involvement, I believe he would have arrived to no equipment and no one to guide him
- I ended up project-managing the whole thing instead of just preparing to welcome him

This isn't just my experience — other managers have had new hires show up without a laptop at all.

---

## The Current Manager Checklist (from HR)

HR provides this checklist to managers. It confirms the manager is expected to own all of this:

**JD/Req Phase:** Contact Compensation for JD creation, contact Compensation for pay rate analysis, open req in ADP

**Recruitment Phase:** Meet with Recruiting on requirements, review applications and give feedback, complete PIF, submit IT request form, schedule equipment pickup appointment

**Onboarding Phase:** Contact HR for orientation requests, create onboarding plan (meetings, tasks, trainings), request access for new hire (shared inboxes, tools, building access)

---

## What the SOP Confirms

The Master SOP (150+ pages) is thorough for HR's internal procedures. But cross-referencing it against my experience confirms four structural problems:

1. **PIF and IT Request are completely separate workflows** — PIF goes to recruiting@denaliai.com, IT request goes to ServiceNow. Different systems, different teams, no shared tracking.

2. **No SLA or confirmation loop for IT equipment** — The H-Note triggers IT to act, but the SOP has no step where IT confirms readiness. There's no accountability if equipment isn't ready by Day 1.

3. **No Day 1 readiness checklist** — The SOP covers HR's data entry in ADP extensively, but nothing confirms equipment is staged, a greeter is assigned, or the new hire knows where to go.

4. **The manager is the connective tissue** — HR, Recruiting, and IT each do their part, but the only person with visibility across all three teams is the manager. The process relies on the manager to follow up, chase, and confirm.

---

## Key Data Points for Platform Design

### PIF Fields (what the manager fills out today)
PIF Type, Employee Name, Job Req #, Employee Referrer, Denali Recruiter Name, Agency/Fee, Position Title, Hire Date, Office Location, Country, NEO Location, Client Onsite Start Date, Employee Type, Bonus/Commission Plan, Pay Rate, Bill Rate, Manager, Accounting Code, Supervisor Role (Y/N), Billable/Non-Billable, Salesforce CRM Access (Y/N), CPQ Permissions (Y/N), Kimble Approval Access, Kimble Time Entry (Y/N), Business Cards (Y/N), IT Equipment Needed (Y/N), Client, Drug Screen Required (Y/N), TB Test/Vaccinations Required (Y/N), Additional Background Check Required (Y/N)

### IT Request Fields (separate form in ServiceNow)
New Employee checkbox, Requested For (name), Pickup or Delivery, Hardware Type (PC/Mac), Peripheral Selection (Keyboard, Mouse, Docking Station, 1x Monitor, 2x Monitor, Headset, Webcam, Other), Business Reason, Additional Information

### H-Note Fields (what HR sends to trigger IT)
Employee Name, Desired Alias, Position Title, Accounting Code, Employee Type, Hire Date, Client Onsite Start Date, Sourced From, Manager, Client, Employee Position ID, Phone, Office Location, Country, Contact Email, Supervisor Role, Salesforce CRM Access, CPQ Permissions, Kimble Permissions, Kimble Time Entry, Denali Email Address

### Timeline Guidelines
- Equipment needed (billable): 1+ week
- Equipment needed (non-billable): 2+ weeks
- Special equipment: 2+ weeks
- No equipment: ~1 week (for background check processing)
- India hires: 3+ weeks minimum (background check timing)

---

## International Variations

**UK:** Contract of Employment sent via DocuSign (manager → new hire → Alex Daher signature chain). SBS Starter Forms sent alongside. Payroll notified separately. Monthly pay frequency.

**Ireland:** Similar to UK with Ireland-specific contract template and New Starter Form. Governed by Irish employment law.

**India:** Offer letter sent through Global Upside (3rd party agency). 60-day notice period. 6-month probation. Background checks take longer. Separate salary structure (Basic + HRA + Conveyance + Medical + Special Allowance + Statutory Bonus + PF + Gratuity).

---

## What the Ideal Platform Should Solve

1. **Unify PIF and IT Request** into one intake, triggered after offer acceptance — not two disconnected forms the manager fills out manually
2. **Let the candidate self-serve** personal info, document uploads, and preferences
3. **Auto-assign equipment by role type** — IT defines standard packages, manager only approves exceptions
4. **Single source of truth** for each new hire's status, visible to HR, IT, Recruiting, and the manager
5. **Automated milestone tracking** with escalations when deadlines are missed (Offer+1: intake sent, Offer+3: IT order placed, Start-5: equipment confirmed, Start-3: greeter assigned, Start-1: manager gets confirmation)
6. **Proactive communications** to the candidate ("your equipment is ready"), the manager ("everything is confirmed"), and the teams
7. **Manager gets a dashboard, not a to-do list** — readiness status, not action items
8. **Eliminate re-entry** — data entered once flows everywhere it needs to go
9. **Support multi-country** workflows with different contracts, background checks, and payroll
10. **Track SLAs** — time from offer to equipment ready, time from H-Note to IT confirmation, overall time from PIF to Day 1
