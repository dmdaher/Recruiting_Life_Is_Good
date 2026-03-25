# Denali Advanced Integration — New Hire Onboarding: Complete Process, Pain Points & Platform Requirements

## Document Purpose

This document captures the complete hiring and onboarding process at Denali Advanced Integration as experienced by a hiring manager (Devin Daher, Head of Software Solutions & Delivery) and as documented in HR's official SOPs. It is intended to serve as the source-of-truth context for building a recruiting/onboarding platform that eliminates the friction, disconnects, and manual coordination described below.

The goal state: **a manager's only required input should be salary and start date.** Everything else — candidate personal info, IT equipment, system access, Day 1 readiness — should be handled by the appropriate teams, triggered automatically, and confirmed without the manager having to project-manage the process.

---

## Company Context

- **Company:** Denali Advanced Integration (formerly 3MD Inc. — some internal docs and templates still reference "3MD")
- **HQ:** 17735 NE 65th Street, Suite 130, Redmond, WA 98052
- **International offices:** UK (Crick, Northampton / London), Ireland (Dublin), India (Bangalore)
- **Core systems:** ADP Workforce Now (HRIS, recruiting, payroll, onboarding), ServiceNow (IT ticketing), DocuSign (agreements), Box (file storage), Okta (SSO), Kimble (time tracking/resource management), Salesforce CRM
- **Employee types:** Type 1 (salaried exempt), Type 2 (salaried non-exempt), Type 3 (hourly), Type 4/4A (contractors), Type 7, Type 8, Type 9
- **Key distribution lists:** H-Notes@denaliai.com (triggers IT provisioning), recruiting@denaliai.com, humanresources@denaliai.com, compensation@denaliai.com, helpdesk@denaliai.com
- **Orientation schedule:** New Employee Orientations (NEO) held Monday/Wednesday for most candidates, 9:00 AM – 11:30 AM PT

---

## The End-to-End Hiring Process (As Documented in the SOP)

### Phase 1: Job Description & Requisition

**If the job title already exists in ADP:**
1. Hiring manager opens a requisition directly in ADP (Process → Talent → Recruitment → Create Requisition)
2. Req goes through approval workflow (routed to higher management within ADP)
3. Recruiting notifies hiring manager when req is approved and posted to Denali career page

**If the job title does NOT exist in ADP:**
1. Hiring manager submits a new job description request to compensation@denaliai.com
2. Compensation team creates/approves the JD (uses a standard Job Description Form template)
3. HR inputs the new job title into ADP
4. Then the manager can open the requisition as above

**Requisition form fields (in ADP):**
- Job Title (dropdown)
- Hiring Manager (dropdown)
- Worker Category (dropdown)
- Target Start Date
- Evergreen checkbox (for continuously open positions)
- Number of New Positions
- Business Unit
- Home Department
- Location(s) — required for position to open
- Salary range (From/To, as provided by Compensation)
- Recruiter Information
- Comments/Reasons for Hire (must include billable/non-billable designation; non-billable requires business justification)
- Posting details: visibility settings, job description text, EEOC statement, shift schedule
- Application settings (defaults to recruiting@denaliai.com)
- Posting questions (7 pre-set questions added to all requisitions)

**Requisition management:**
- Status options: Open, Closed, On Hold
- Job Priority: Yes/No
- Publish Start Date must be set for position to post
- Can post to: Indeed, CareerBuilder, Monster, LinkedIn, Facebook, Referrals

**Pain point (Devin's experience):** Creating a req for a position that does NOT exist and creating a JD feels clunky — involves back-and-forth with Compensation for title, range, and approval before you can even open the req. Creating a req for a position that already exists with an existing JD is fine.

### Phase 2: Recruiting & Candidate Sourcing

**For internal recruiters (direct hire):**
1. Recruiting assigns an internal recruiter to source candidates
2. Recruiter schedules intake meeting with hiring manager to assess position requirements
3. Qualified candidates are submitted to the hiring manager
4. Hiring manager reviews and decides who to interview
5. Recruiting coordinators schedule interviews (Microsoft Teams)

**For external recruiters:**
1. Recruiting asks hiring manager if agency assistance is needed
2. If yes, recruiting reaches out to approved staffing agencies
3. Agency sources and submits candidates
4. Recruiting assists with scheduling upon hiring manager request

**Interview scheduling process:**
- Interviews are scheduled from the Recruiting inbox in Outlook
- Calendar invite title format: "Microsoft Teams Interview - Candidate Name - Req Title, Req #"
- Recruiter's candidate notes are pasted into the meeting body (compensation info removed)
- Candidate's resume is attached
- A separate confirmation email is sent to the candidate with the Teams link
- Before each interview, candidate must sign an NDA via DocuSign (sent from Recruiting's Okta/DocuSign account)
- Interview will not proceed until NDA is signed

**NDA process:**
- Sent via DocuSign template: "3MD Non-disclosure Agreement Human Resources"
- Separate templates exist for US, UK, and India
- Signed NDA is filed in Box: Recruiting → Active Candidate Files → [Candidate Last, First] folder

**Pain point (Devin's experience):** Sometimes the process feels slow as a manager — checking in on whether the candidate is interested, when interviews are being scheduled. "I think it's getting better but just input as an end user." The offer discussion itself is not a major concern.

### Phase 3: Offer & Selection

1. Hiring manager decides to hire a candidate
2. Manager and recruiter discuss offer amount
3. **Manager submits a PIF (Personnel Information Form) to recruiting@denaliai.com**
4. Recruiter checks PIF against open req for accuracy, updates if necessary
5. Recruiter contacts candidate with soft offer
6. Upon candidate approval, Recruiting Coordinator sends official offer letter and background check consent form through ADP

**Offer letter process in ADP:**
- Find open req → View Open Applications → Search candidate
- If candidate hasn't applied, have them apply to the ADP posting first
- View/edit classic Candidate Profile, correct errors
- Change status to "Offer" → Create an Offer
- Select correct offer letter template type per PIF
- Edit and confirm: position title, hiring manager, start date, salary match PIF
- Upload current employee benefits guide and handbook (from Box: Recruiting → Benefits)
- Send for approval → once approved, "Extend Offer Letter" banner appears
- Send offer via email with offer letter link
- Then change status to "Pre-Hire" and click "Request Electronic Consent" for background check

**Offer letter templates exist for:** US, UK, Ireland, India (each with different legal requirements, contract structures, and signature flows)

### Phase 4: Post-Offer — PIF and IT Request (THE MAJOR PAIN POINT)

#### 4A: Personnel Information Form (PIF)

The PIF is submitted by the hiring manager to recruiting@denaliai.com when they decide to hire a candidate.

**PIF fields:**
| Field | Description |
|-------|-------------|
| PIF Type | New Hire / Rehire / Internal Transfer |
| Employee Name | Full Legal Name |
| Job Requisition # | REQ# from ADP |
| Employee Referrer Name | If applicable, otherwise N/A |
| Name of Denali Recruiter | If applicable, otherwise N/A |
| Agency / $ Fee | External staffing agency and fee percentage |
| Position Title | Name of position |
| Orientation (Hire Date) | Date of New Employee Orientation (NEO) |
| Office Location | Dropdown selection |
| Country | Country the new hire is working from |
| New Hire Orientation Location | Red 1 or via WebEx |
| Client Onsite Start Date | May differ from orientation date |
| Employee Type | From job REQ (Type 1-9) |
| Bonus/Commission Plan | If applicable |
| Pay Rate | Hourly (Type 2-9) or yearly salary (Type 1). Yearly = hourly × 2,080 |
| Bill Rate | Hourly rate charged to client, if applicable |
| 3MD Manager | Manager listed on REQ |
| Accounting Code | Budget/department code from job REQ |
| Supervisor/Management Role | Yes/No |
| Employee (Billable/Non-Billable) | Yes/No |
| Salesforce CRM Access Needed? | Yes/No (sales tool) |
| CPQ Permissions Needed? | Yes/No (sales tool) |
| Kimble Approval Access | N/A if not management role |
| Do they need to log time in Kimble | Should always be Yes for FTE |
| Do they need business cards? | If yes, request goes to Vicki Davis |
| Does role require IT equipment? | Yes/No |
| Client | N/A or assigned client |
| Client Required Drug Screen | Yes/No based on client requirements |
| Client Required TB Test/Vaccinations | Yes/No based on client requirements |
| Client Required Additional Background Check | Additional checks beyond standard ADP (e.g., Microsoft, Amazon) |

**The PIF is a live document in ADP.** The stored template is in Box.

#### 4B: IT Hardware & Peripherals Request

**This is a completely separate form from the PIF**, submitted by the manager to the Help Desk via http://itrequest.denaliai.com/ (ServiceNow).

**IT Request form fields (from the ServiceNow screenshot):**
| Field | Details |
|-------|---------|
| New Employee | Checkbox |
| Requested For | Employee name (dropdown) |
| Pickup/Delivery | Radio: Pickup or Delivery |
| Hardware Type | Dropdown (PC, Mac, etc.) |
| Peripheral Selection | Checkboxes: Keyboard, Mouse, Docking Station, 1x Monitor, 2x Monitor, Headset, Webcam, Other |
| Business Reason for Request | Required text field |
| Additional Information | Optional text field |

**Key SOP note:** "IT requests can be submitted to the Help Desk once the req has been approved, but IT will not send any equipment until the H-Note has gone out."

**Pain point (Devin's experience):**
- "This feels so heavy on the manager to have to manage details they aren't knowledgeable about."
- "Why is PIF separate from IT request form?"
- "Why don't the candidates fill this themselves and approval only required if they submit a request for an expensive item?"
- "Feel like IT should manage this."
- Manager is making hardware spec decisions (PC vs Mac, monitor count, peripheral choices) that IT is better positioned to determine based on role type.

### Phase 5: Background Check & Onboarding Processing

**ADP Background Check (standard for all US hires):**
1. HR initiates in ADP: Process → Talent → Recruitment → Candidates → find applicant → Actions → Start Background Screening
2. Select "Standard" package (add Multi-State Sex Offender for hospital workers)
3. Enter billing code (department)
4. Fill in any missing candidate info (middle name, school/employer locations)
5. Save → Certify → Start Screening → Submit
6. Note ETA on Employee Life Cycle report
7. Change candidate status to "Background Check Processing"
8. Notify recruiting, CC manager and HR (and Operations Services if professional services/WA-Systems)
9. Average completion time: ~1 week
10. Results: No record → proceed. Record found → submit to HR Manager for approval. May initiate Adverse Action Process.

**Accurate Background Check (for Amazon yellow badge hires):**
- Separate system from ADP: https://www.accuratebackground.com
- Client selection: Amazon.com, Inc
- Package types: US Kuiper Package, US Vendor Package, or location-specific
- Reference numbers tracked in Box: HR > Process & Policy Documents > Hiring Process > Background Screenings > AccurateAccel-AMZ
- Kuiper checks: ~1 week. Standard Accurate checks: ~2 days
- Both ADP and Accurate background checks must complete before proceeding

**Concentra Process (for hospital client hires):**
- Required vaccinations: COVID (yearly), Influenza (yearly), TDAP/TD (every 10 years), TB Skin Test, MMR, Varicella, HepB, 10-Panel Drug Screen
- Requirements vary by hospital client:
  - Seattle Children's Hospital: COVID and Drug screen required
  - Swedish/Providence: Not required
  - Overlake Medical Center: Not required
- Authorization form sent via DocuSign
- TB test requires two visits (48-72 hours apart)
- New hire can show proof of past vaccinations or take a titer test
- Can start with pending titer/vaccinations if TB and drug screen have returned

**Recruiting Handover to HR:**
1. Once applicant accepts and signs offer letter, PIIA, and background check consent → Recruiting emails HR to begin background check
2. HR sets up candidate's Active Candidate Folder with subfolders: Medical, Involuntary Deductions, Personal_Background, Personnel (with Employee Agreements subfolder)
3. HR adds PIF details to Employee Lifecycle Report: name, employee number, start date, employee type, department, position title, manager, pay rate, state, PIF verification, NEO location/date/time, health screening info if applicable
4. Progress is continuously logged on Employee Life Cycle Report

### Phase 6: Hiring in ADP & H-Note

**US Hiring Process (after background check clears):**
1. Change candidate status to "Hired" in ADP, select "3MD New Hire Template"
2. Assign Onboarding Experience (by employee type)
3. Edit Paperwork/Documents: should only have EA and marketing consent
4. Fill required fields: hire date, reason for hire, personal email notification, verify state, File # (from Employee Life Cycle report), manager, Benefits Eligibility, assign Denali email
5. Enter payroll info from PIF (salary: annual ÷ 26 for biweekly; hourly: if >$27.63/hr select OT threshold)
6. Enter tax info, job function, job level (from JD)
7. Assign time off policies (varies by employee type — detailed matrix exists)
8. Send to Gretchen's approval
9. Update Employee Life Cycle report

**H-Note (triggers IT provisioning):**
- Template filled from ADP and PIF data
- Sent from: HumanResources@denaliai.com
- To: H-Notes@denaliai.com
- CC: Hiring Manager
- Subject: "H-Note: Last Name, First Name | Start Date | Location"

**H-Note fields:**
| Field | Source |
|-------|--------|
| Employee Name | PIF/ADP |
| Desired Alias | Candidate preference |
| Position Title | PIF |
| Accounting Code | PIF |
| Employee Type | PIF |
| Orientation (Hire Date) | PIF |
| Client Onsite Start Date | PIF |
| Sourced From | Agency if applicable |
| 3MD Manager | PIF |
| Client | PIF |
| Employee Position ID | ADP |
| Contact Phone Number | ADP Personal Profile |
| Office Location | PIF |
| Country | PIF |
| Contact Email | ADP Personal Profile |
| Supervisor Role | PIF |
| Salesforce CRM Access Needed? | PIF |
| CPQ Permissions Needed? | PIF |
| Kimble Approval Permissions | PIF |
| Time entry in Kimble | PIF |
| 3MD Email Address | ADP |

**Critical:** The H-Note is what triggers IT and Billing to create credentials and provision equipment. Without the H-Note, IT will not act — even if an IT Request form was submitted earlier.

### Phase 7: NEO (New Employee Orientation) & Day 1

**NEO Instructions Email:**
- Sent to new hire with start date, location, orientation time
- Onsite (Redmond): 8:45-8:55 AM picture/badge, 9:00 AM-11:30 AM orientation
- Remote: 9:00 AM-11:30 AM PT via WebEx
- New hire must complete before orientation: Form I-9, Tax Withholding, Company Policies acknowledgement, Direct Deposit setup, Emergency Contacts, Marketing Consent form
- I-9 verification: must provide acceptable documents on first day (scan/photo front and back to humanresources@denaliai.com)
- T-shirt size requested

**Final ADP Steps (HR):**
- Set EEO Establishment (office location)
- Set seniority date = start date
- Set Status Flag 2 = employee type
- Add PTO/VTO/WA PSL accumulators
- Enroll in benefits: Medical (core plan, Employee Only), Dental (core plan, Employee Only), 401K (Pre-tax 2.00%)
- Company-paid benefits auto-enrolled: STD, LTD, Life Insurance

**Employee File Management:**
- Copy template folders from "2. Example Folders" into candidate's file
- Move documents to correct subfolders (EA → Personnel/Employment Agreements, Background Check → Personal_Background, PIF/H-Note/Marketing Consent → Personnel, NDA → Personal_Background)
- Move folder from Active Candidates to Active Employees in Box
- Log file move date on Employee Life Cycle Report

**I-9 and E-Verify:**
- ADP sends I-9 email to new hire
- New hire submits identification documents (per government approved list)
- Documents saved in employee folder under Personal_Background
- HR completes Section 2 in ADP: Process → EI-9 Management → verify Section 1 → input employment date, work location, identification info → submit

---

## The Current Manager Onboarding Checklist (as provided by HR)

This is the checklist HR gives to managers. It explicitly places the manager at the center of post-offer coordination:

**JD / New Req Phase:**
- ☐ Contact Compensation team for assistance in new JD creation
- ☐ Contact Compensation team for compensation analysis of pay rates
- ☐ Open a req in ADP once JD has been approved

**Recruitment Phase:**
- ☐ Meet with Recruiting team to go over requirements of position once req has been approved
- ☐ Respond with feedback to Recruiting team on applications/interviews
- ☐ Complete PIF
- ☐ Submit an IT request form for new hire of both mobile/desktop workstations
- ☐ Schedule an appointment for equipment pickup

**Onboarding Phase:**
- ☐ Contact HR for any special requests in relation to HR orientation schedule
- ☐ Create an onboarding plan (list of managers to meet, tasks, trainings, etc.)
- ☐ Request appropriate access for new hire (shared inboxes, tools, building access, etc.)

---

## Timeline Guidelines for Hire Dates

These are the SOP's guidelines for timeline required to hire candidates after receiving the PIF (assuming req is opened and approved):

| Scenario | Billable | Non-Billable |
|----------|----------|-------------|
| Equipment needed | 1+ week | 2+ weeks |
| No equipment | ~1 week (depends on client needs + BGC time) | 1+ week |
| Special equipment | 2+ weeks | 2+ weeks |

Notes: Shipping may extend timelines. "White glove" hires don't follow these rules. India hires typically require 3+ weeks to allow for background check processing.

---

## Payroll Impact Report (PIR)

- Submitted Monday, Wednesday, Friday by 2:30 PM to HR
- Includes: new job req requests, new hires, employee referrals
- File location: Box → Recruiting → Payroll Impact Report V2
- Naming convention: "Payroll Impact Report Week [X].[report#] [Month]_[MM.DD.YYYY]"
- Sections: Job Req Requests, New Hires, New Hire Date Changes, Rescinded Offers, Internal Transfers, Employee Referrals
- OTE calculation: Salary + Additional Negotiated Expenses + Commissions/Bonus
- Salary from hourly: Hourly Rate × 2,080
- Recruiting cost calculation: Hourly Worker = 2,080 × Hourly Wage × Fee %; Salary Worker = Salary × Fee %
- Agency fee info: Box → Recruiting → Approved Staffing Agencies → Recruiting Agency Reference Sheet

---

## Devin's Specific Pain Points (Verbatim Context)

### Requisition & JD Creation
"Creating a req for a position that does not exist and creating a JD to me has been a bit clunky. Creating a req for a position that exists with a JD that exists is fine. The compensation portion — I think it's better but this is the whole part around creating or adjusting a job description and getting a compensation range and title set."

### Recruiting Process
"As a manager, I create a requisition in ADP and recruiting starts to find people and sends to hiring manager. They find a person and send resume and if approved they setup meeting. What I've experienced as an end user is sometimes if it feels slow, I check in on how the process is going or if the person is interested or when the interviews are being scheduled. I think it's getting better but just input as an end user. When the candidate is selected, we discuss how much to offer and send an offer letter. This so far isn't too much of a concern."

### Post-Offer (PIF + IT Request)
"Once someone is selected and they say yes, the manager has to get involved in multiple parts that feel inefficient or clunky. They submit a PIF with the details around name of candidate, department code, required access to systems and tools, etc. Separately, the manager has to submit an IT request form to submit what type of laptop is needed (PC or Mac), questions around spec of laptop, is keyboard needed, mouse needed, monitors, etc. This feels so heavy on the manager to have to manage details they aren't knowledgeable about. Feel like IT should manage this. Why is PIF separate than IT request form, why don't the candidates fill this themselves and approval only required if they submit a request for an expensive item."

### Day 1 Readiness
"What I've faced is I had to check in with IT multiple times to make sure the IT equipment was setup on the desk so they arrived to equipment but it felt like if I didn't do that, the person would have no equipment and the experience is poor. Then, I checked in with HR/recruiting to make sure someone was there to greet them and either onboard them or lead them to their desk. I had to micromanage the process for Stephan because I couldn't trust it. And without my involvement, I don't believe he would have had his IT equipment at the desk and no one to connect with him that knew how to guide him next."

### Broader Observation
"HR should be engaged with IT hand in hand to ensure they have their equipment, engaged hand in hand with the candidate. Sometimes they don't even have a laptop to start."

---

## Structural Problems Identified

### 1. Fragmented Forms with No Connection
The PIF goes to recruiting@denaliai.com. The IT Hardware request goes to the Help Desk (ServiceNow). Nobody tracks both in one place. There is no system connection between them. They share overlapping data (employee name, start date, department) but require separate manual entry.

### 2. No SLA or Confirmation Loop for IT Equipment
The H-Note triggers IT to act, but the SOP contains no step where IT confirms equipment readiness back to HR, the manager, or anyone. There is no accountability mechanism if equipment isn't staged by Day 1. The IT request form note says "IT will not send any equipment until the H-Note has gone out" — but there's no corresponding "IT confirms equipment is ready" step anywhere.

### 3. No Day 1 Readiness Checklist
The SOP extensively covers HR's ADP data entry steps, background check processes, and file management. But there is no checklist, milestone tracker, or process step that confirms: equipment is staged at the desk, a greeter is assigned, the new hire has been contacted with Day 1 logistics, the manager has been notified that everything is ready. The closest thing is the NEO Instructions Email, which is sent to the new hire — but there's no corresponding "readiness confirmed" communication to the manager.

### 4. Manager Is the Connective Tissue
The process relies on the manager to: submit the PIF (to Recruiting), submit the IT request (to IT/ServiceNow), follow up with IT to confirm equipment staging, follow up with HR to confirm someone will greet the new hire, create the onboarding plan, and request system access. The manager is the only person with visibility across all three teams (HR, Recruiting, IT) and becomes the de facto project manager for each hire.

### 5. Candidate Has No Self-Service Role
The candidate does not fill out their own personal information for the PIF — the manager does. The candidate does not specify their own equipment preferences. The candidate doesn't receive proactive updates between offer acceptance and Day 1 about their onboarding status (equipment, schedule, who to meet). Their first communication is the NEO Instructions Email, which is sent relatively close to start date.

### 6. Data Re-Entry Across Systems
The same information (candidate name, start date, department, manager, compensation) is entered multiple times across: the requisition in ADP, the PIF, the IT Request form, the H-Note, the PIR (Payroll Impact Report), the Employee Life Cycle report, and the ADP hiring profile. Each re-entry is an opportunity for error and adds no value.

---

## Ideal Future State (Devin's Vision)

**Manager provides:** salary and start date. That's it.

**Everything else should be automated or owned by the right team:**

1. **Candidate self-serves personal info** — name, address, emergency contacts, direct deposit, I-9 documents
2. **IT auto-assigns equipment by role type** — standard packages per role (developer = Mac + dual monitors + docking station; PM = PC + single monitor; admin = PC + basic peripherals). Manager only approves exceptions above a cost threshold.
3. **One unified onboarding intake** — a single form or workflow that triggers both HR and IT processes, not two separate disconnected forms
4. **System-driven milestones** — automated reminders/escalations at key dates (Offer+1: intake sent, Offer+3: IT receives order, Start-5: equipment confirmed, Start-3: greeter assigned, Start-1: manager gets readiness dashboard, Day 1: everything ready)
5. **HR and IT co-own Day 1 readiness** — shared checklist, joint accountability, neither signs off alone
6. **Manager receives a confirmation dashboard** — not a to-do list. "Equipment ready ✓, Access provisioned ✓, Greeter assigned ✓, Orientation scheduled ✓"
7. **Candidate receives proactive updates** — "Your equipment is ready," "Here's your Day 1 schedule," "Your buddy is [Name]"

---

## International Considerations

### UK Hires
- Contract of Employment sent via DocuSign (manager signs first, then new hire, then Alex Daher)
- SBS UK Employee Starter Forms sent alongside contract
- Payroll team (Candy) must be notified separately — they need HMRC Form and New Hire form before proceeding
- Business Unit: UK Denali Europe Limited
- Location: REUK-Remote UK
- Pay frequency: Monthly (annual salary ÷ 12 for regular, ÷ 2080 for Rate 2)
- Standard hours: 173.33/month
- Time off policies: Holiday-UK, Sick Leave-UK

### Ireland Hires
- Similar to UK but with Ireland Contract of Employment template
- Ireland New Starter Form (not SBS)
- Business Unit: Ireland Denali Europe Limited
- Location: Remote-IRL
- Position ID format: EU000000 (sequential)
- Time off policies: Holiday-IRL, Sick Leave-IRL

### India Hires
- Offer letter and terms sent to Global Upside (3rd party agency) who sends to candidate
- Typically require start date 3+ weeks out to allow for background checks
- 60-day notice period (30 days during probation)
- 6-month probation period (extendable by 6 months)
- Separate tab on Employee Life Cycle report
- Salary structure includes: Basic, HRA, Conveyance, Medical, Special Allowance, Statutory Bonus, PF, Gratuity

---

## Key Systems & Their Roles

| System | Purpose | Used By |
|--------|---------|---------|
| ADP Workforce Now | HRIS, recruiting, payroll, onboarding, offer letters, background checks, I-9/E-Verify | HR, Recruiting, Managers |
| ServiceNow | IT ticketing, hardware requests (itrequest.denaliai.com) | Managers, IT |
| DocuSign | NDAs, offer letters (UK/Ireland), Concentra authorization | Recruiting, HR, Candidates |
| Box | File storage (candidate files, employee files, templates, SOPs) | HR, Recruiting |
| Okta | SSO/authentication | All |
| Kimble | Time tracking, resource management, approval workflows | All employees |
| Salesforce CRM | Sales tool, CRM access | Sales-related roles |
| Microsoft Teams | Interviews, internal communication | All |
| Outlook | Email, calendar, interview scheduling | All |
| Concentra | Drug screening, vaccinations for hospital clients | HR, Candidates |
| Accurate | Background checks for Amazon yellow badge hires | HR |

---

## Key People & Roles Referenced in SOPs

- **Gretchen** — Approves new hires in ADP, coordinates NEO scheduling
- **Katie** — HR Manager, consulted for adverse background check results, positive drug screens
- **Candy** — Payroll, notified for UK/Ireland hires
- **Vicki Davis** — Handles business card requests
- **Alex Daher** — Final signature on UK/Ireland contracts
- **Brad Klahr** — Approves contract addendums for UK/Ireland
- **Celina Aguilar** — Recruiting Coordinator, created Master SOP (Jan 2025)

---

## Data Flow Summary

```
Manager creates Req in ADP
  → Approval workflow in ADP
  → Recruiting posts & sources
  → Interviews scheduled (Outlook/Teams)
  → NDA sent (DocuSign)
  → Manager decides to hire
  → Manager submits PIF (email to recruiting@denaliai.com)
  → Manager submits IT Request (ServiceNow — separate form)
  → Recruiting verifies PIF against req
  → Offer letter sent (ADP)
  → Background check consent sent (ADP)
  → HR initiates background check (ADP + possibly Accurate)
  → [If hospital client] Concentra process initiated
  → Background check clears
  → HR hires candidate in ADP (data entry, benefits enrollment, time off policies)
  → HR sends H-Note to H-Notes@denaliai.com (triggers IT)
  → IT provisions equipment and credentials (no confirmation step documented)
  → HR sends NEO Instructions Email to new hire
  → Employee file moved from Active Candidates to Active Employees (Box)
  → Day 1: Orientation (nobody formally confirming readiness)
```

**The gap:** Between "HR sends H-Note" and "Day 1" there is no documented coordination, confirmation, or accountability. The manager fills this gap manually by following up with IT and HR repeatedly.

---

## Platform Requirements (Derived from Above)

A platform replacing this process should:

1. **Unify the PIF and IT Request** into a single intake triggered automatically after offer acceptance
2. **Enable candidate self-service** for personal info, document uploads (I-9), and equipment preferences
3. **Auto-assign standard equipment packages** by role type with manager approval only for exceptions
4. **Create a single source of truth** for each new hire's onboarding status, visible to HR, IT, Recruiting, and the manager
5. **Automate milestone tracking** with escalation triggers when deadlines are missed
6. **Send proactive communications** to the candidate, manager, and teams at each milestone
7. **Provide a manager dashboard** showing readiness status (not a to-do list)
8. **Integrate with ADP** (or replace its recruiting/onboarding modules) for candidate data, offer letters, and background check status
9. **Integrate with ServiceNow** (or replace it) for IT equipment provisioning and tracking
10. **Support multi-country workflows** (US, UK, Ireland, India) with different contract types, background check processes, and payroll requirements
11. **Eliminate data re-entry** — information entered once should flow to all downstream systems
12. **Track and report on SLAs** — time from offer acceptance to equipment ready, time from H-Note to IT confirmation, overall time from PIF to Day 1 readiness
