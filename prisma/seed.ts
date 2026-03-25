import { PrismaClient } from "../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ──────────────────────────────────────────────────────────────────────────
  // DEPARTMENTS (22 from PROJECT_REQUIREMENTS.md + Filled Positions data)
  // ──────────────────────────────────────────────────────────────────────────
  const departments = [
    { code: "000-50", name: "Executive" },
    { code: "001-03", name: "Solutions Architecture" },
    { code: "001-09", name: "Field Services - Core IS" },
    { code: "001-10", name: "T-Mobile" },
    { code: "001-12", name: "EADG" },
    { code: "001-15", name: "Kuiper" },
    { code: "001-15-SA", name: "Staff Aug" },
    { code: "001-21", name: "Service Desk" },
    { code: "001-22", name: "Services - PMO" },
    { code: "001-24", name: "Configuration/MMS" },
    { code: "001-32", name: "Amazon Support Services" },
    { code: "001-33", name: "Automation SA" },
    { code: "001-34", name: "Digital Services" },
    { code: "001-82", name: "Managed Services - IT" },
    { code: "002-20", name: "Sales" },
    { code: "002-24", name: "Managed Device Lifecycle Sales" },
    { code: "004-08", name: "WA Systems" },
    { code: "004-20", name: "Sales Operations" },
    { code: "004-32", name: "Amazon Support & Logistics" },
    { code: "004-55", name: "Customer Success" },
    { code: "004-60", name: "Accounting" },
    { code: "004-70", name: "HR" },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name },
      create: dept,
    });
  }
  console.log(`  ✓ ${departments.length} departments`);

  // ──────────────────────────────────────────────────────────────────────────
  // LOCATIONS (14 from PROJECT_REQUIREMENTS.md)
  // ──────────────────────────────────────────────────────────────────────────
  const locations = [
    { name: "Washington", country: "US", stateProvince: "WA", timezone: "America/Los_Angeles" },
    { name: "Indiana", country: "US", stateProvince: "IN", timezone: "America/Indiana/Indianapolis" },
    { name: "Colorado", country: "US", stateProvince: "CO", timezone: "America/Denver" },
    { name: "Florida", country: "US", stateProvince: "FL", timezone: "America/New_York" },
    { name: "Kansas", country: "US", stateProvince: "KS", timezone: "America/Chicago" },
    { name: "Michigan", country: "US", stateProvince: "MI", timezone: "America/Detroit" },
    { name: "Ohio", country: "US", stateProvince: "OH", timezone: "America/New_York" },
    { name: "Tennessee", country: "US", stateProvince: "TN", timezone: "America/Chicago" },
    { name: "Texas", country: "US", stateProvince: "TX", timezone: "America/Chicago" },
    { name: "UK", country: "UK", stateProvince: null, timezone: "Europe/London" },
    { name: "India", country: "India", stateProvince: null, timezone: "Asia/Kolkata" },
    { name: "Lebanon", country: "Lebanon", stateProvince: null, timezone: "Asia/Beirut" },
    { name: "Brazil", country: "Brazil", stateProvince: null, timezone: "America/Sao_Paulo" },
    { name: "Guatemala", country: "Guatemala", stateProvince: null, timezone: "America/Guatemala" },
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { name_country: { name: loc.name, country: loc.country } },
      update: {},
      create: loc,
    });
  }
  console.log(`  ✓ ${locations.length} locations`);

  // ──────────────────────────────────────────────────────────────────────────
  // PIPELINE STAGES (8 — configurable, DB-driven)
  // ──────────────────────────────────────────────────────────────────────────
  const stages = [
    { name: "Sourced", order: 1 },
    { name: "Submitted", order: 2 },
    { name: "Screen", order: 3 },
    { name: "Interview", order: 4, requiresBackgroundCheck: false },
    { name: "Debrief", order: 5 },
    { name: "Offer Extended", order: 6 },
    { name: "Offer Accepted", order: 7 },
    { name: "Hired", order: 8, isTerminal: true },
  ];

  for (const stage of stages) {
    await prisma.pipelineStage.upsert({
      where: { name: stage.name },
      update: { order: stage.order },
      create: {
        name: stage.name,
        order: stage.order,
        isTerminal: stage.isTerminal ?? false,
        requiresBackgroundCheck: stage.requiresBackgroundCheck ?? false,
      },
    });
  }
  console.log(`  ✓ ${stages.length} pipeline stages`);

  // ──────────────────────────────────────────────────────────────────────────
  // SOURCE CHANNELS (12 from current data)
  // ──────────────────────────────────────────────────────────────────────────
  const sources = [
    "LinkedIn", "ADP", "Agency", "Referral", "Hiring Manager",
    "Internal Transfer", "Client", "Craigslist", "Rehire",
    "Staffing Technologies", "Laptop Co.", "FTE to 1099",
  ];

  for (const name of sources) {
    await prisma.source.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`  ✓ ${sources.length} source channels`);

  // ──────────────────────────────────────────────────────────────────────────
  // POSTING CHANNELS (7 from SOP)
  // ──────────────────────────────────────────────────────────────────────────
  const postingChannels = [
    "Indeed", "CareerBuilder", "Monster", "LinkedIn",
    "Facebook", "ADP Career Page", "Craigslist",
  ];

  for (const name of postingChannels) {
    await prisma.postingChannel.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`  ✓ ${postingChannels.length} posting channels`);

  // ──────────────────────────────────────────────────────────────────────────
  // AGENCIES (9 from PROJECT_REQUIREMENTS.md)
  // ──────────────────────────────────────────────────────────────────────────
  const agencies = [
    { name: "Rocket Staffing", feeStructure: "PERCENTAGE" as const },
    { name: "Lynx Recruitment", feeStructure: "PERCENTAGE" as const },
    { name: "Staffing Technologies", feeStructure: "PERCENTAGE" as const },
    { name: "Field Nation", feeStructure: "PERCENTAGE" as const },
    { name: "Logistics Plus", feeStructure: "PERCENTAGE" as const },
    { name: "PNW Controls", feeStructure: "PERCENTAGE" as const },
    { name: "Metni Engineering Services", feeStructure: "PERCENTAGE" as const },
    { name: "The Functionary", feeStructure: "PERCENTAGE" as const },
    { name: "Argano LLC", feeStructure: "PERCENTAGE" as const },
  ];

  for (const agency of agencies) {
    await prisma.agency.upsert({
      where: { name: agency.name },
      update: {},
      create: agency,
    });
  }
  console.log(`  ✓ ${agencies.length} agencies`);

  // ──────────────────────────────────────────────────────────────────────────
  // EMPLOYEE TYPES (from SOP — Types 1-9)
  // ──────────────────────────────────────────────────────────────────────────
  const employeeTypes = [
    { code: "1", name: "Salaried Exempt", description: "Full-time salaried, overtime exempt", isExempt: true },
    { code: "2", name: "Salaried Non-Exempt", description: "Full-time salaried, overtime eligible", isExempt: false },
    { code: "3", name: "Hourly", description: "Hourly employee", isExempt: false },
    { code: "4", name: "Contractor", description: "Independent contractor", isExempt: false },
    { code: "4A", name: "Contractor (Alt)", description: "Contractor alternate classification", isExempt: false },
    { code: "7", name: "Type 7", description: "Employee type 7", isExempt: false },
    { code: "8", name: "Type 8", description: "Employee type 8", isExempt: false },
    { code: "9", name: "Type 9", description: "Employee type 9", isExempt: false },
  ];

  for (const et of employeeTypes) {
    await prisma.employeeType.upsert({
      where: { code: et.code },
      update: {},
      create: et,
    });
  }
  console.log(`  ✓ ${employeeTypes.length} employee types`);

  // ──────────────────────────────────────────────────────────────────────────
  // CLIENTS (with per-client compliance defaults)
  // ──────────────────────────────────────────────────────────────────────────
  const clients = [
    { name: "Amazon", requiresAdditionalBGCheck: true, bgCheckType: "ACCURATE_AMAZON" as const },
    { name: "Microsoft", requiresAdditionalBGCheck: true },
    { name: "Seattle Children's Hospital", requiresDrugScreen: true, bgCheckType: "CONCENTRA" as const },
    { name: "Swedish/Providence", requiresDrugScreen: false },
    { name: "Overlake Medical Center", requiresDrugScreen: false },
  ];

  for (const client of clients) {
    await prisma.client.upsert({
      where: { name: client.name },
      update: {},
      create: {
        name: client.name,
        requiresDrugScreen: client.requiresDrugScreen ?? false,
        requiresTBTest: false,
        requiresAdditionalBGCheck: client.requiresAdditionalBGCheck ?? false,
        bgCheckType: client.bgCheckType ?? null,
      },
    });
  }
  console.log(`  ✓ ${clients.length} clients`);

  // ──────────────────────────────────────────────────────────────────────────
  // DEV-MODE USERS (3 test users for local development)
  // ──────────────────────────────────────────────────────────────────────────
  const itDept = await prisma.department.findFirst({ where: { code: "001-34" } });

  const devUsers = [
    { email: "admin@denali.dev", name: "Dev Admin (Recruiting Manager)", role: "RECRUITING_MANAGER" as const },
    { email: "recruiter@denali.dev", name: "Dev Recruiter", role: "RECRUITER" as const },
    { email: "manager@denali.dev", name: "Dev Hiring Manager", role: "HIRING_MANAGER" as const },
  ];

  for (const user of devUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        departmentId: itDept?.id ?? null,
      },
    });
  }
  console.log(`  ✓ ${devUsers.length} dev users`);

  // ──────────────────────────────────────────────────────────────────────────
  // PRIVACY NOTICE VERSIONS (placeholder — legal review required)
  // ──────────────────────────────────────────────────────────────────────────
  const privacyNotices = [
    { jurisdiction: "US", version: 1, content: "# US Privacy Notice\n\nPlaceholder — requires legal review before production use.", effectiveDate: new Date("2026-01-01") },
    { jurisdiction: "UK", version: 1, content: "# UK Privacy Notice (UK GDPR)\n\nPlaceholder — requires legal review before production use.", effectiveDate: new Date("2026-01-01") },
    { jurisdiction: "Ireland", version: 1, content: "# Ireland Privacy Notice (EU GDPR)\n\nPlaceholder — requires legal review before production use.", effectiveDate: new Date("2026-01-01") },
    { jurisdiction: "India", version: 1, content: "# India Privacy Notice (DPDPA)\n\nPlaceholder — requires legal review before production use.", effectiveDate: new Date("2026-01-01") },
  ];

  for (const notice of privacyNotices) {
    await prisma.privacyNoticeVersion.upsert({
      where: { jurisdiction_version: { jurisdiction: notice.jurisdiction, version: notice.version } },
      update: {},
      create: notice,
    });
  }
  console.log(`  ✓ ${privacyNotices.length} privacy notice versions`);

  // ──────────────────────────────────────────────────────────────────────────
  // DATA RETENTION POLICIES (from design doc retention schedule)
  // ──────────────────────────────────────────────────────────────────────────
  const retentionPolicies = [
    // US retention
    { entityType: "candidate", jurisdiction: "US", retentionDays: 1825 }, // 5 years
    { entityType: "interview", jurisdiction: "US", retentionDays: 1825 },
    { entityType: "offer", jurisdiction: "US", retentionDays: 1825 },
    { entityType: "backgroundCheck", jurisdiction: "US", retentionDays: 2555 }, // 7 years
    { entityType: "consent", jurisdiction: "US", retentionDays: 2190 }, // 6 years
    { entityType: "auditLog", jurisdiction: "US", retentionDays: 2555 }, // 7 years
    // UK retention
    { entityType: "candidate", jurisdiction: "UK", retentionDays: 365 }, // 1 year
    { entityType: "interview", jurisdiction: "UK", retentionDays: 365 },
    { entityType: "offer", jurisdiction: "UK", retentionDays: 365 },
    { entityType: "consent", jurisdiction: "UK", retentionDays: 2190 },
    { entityType: "auditLog", jurisdiction: "UK", retentionDays: 2555 },
    // Ireland retention
    { entityType: "candidate", jurisdiction: "Ireland", retentionDays: 365 },
    { entityType: "interview", jurisdiction: "Ireland", retentionDays: 365 },
    { entityType: "offer", jurisdiction: "Ireland", retentionDays: 365 },
    { entityType: "consent", jurisdiction: "Ireland", retentionDays: 2190 },
    { entityType: "auditLog", jurisdiction: "Ireland", retentionDays: 2555 },
    // India retention
    { entityType: "candidate", jurisdiction: "India", retentionDays: 365 },
    { entityType: "interview", jurisdiction: "India", retentionDays: 365 },
    { entityType: "offer", jurisdiction: "India", retentionDays: 365 },
    { entityType: "consent", jurisdiction: "India", retentionDays: 2190 },
    { entityType: "auditLog", jurisdiction: "India", retentionDays: 2555 },
  ];

  for (const policy of retentionPolicies) {
    await prisma.dataRetentionPolicy.upsert({
      where: { entityType_jurisdiction: { entityType: policy.entityType, jurisdiction: policy.jurisdiction } },
      update: { retentionDays: policy.retentionDays },
      create: policy,
    });
  }
  console.log(`  ✓ ${retentionPolicies.length} data retention policies`);

  // ──────────────────────────────────────────────────────────────────────────
  // REPORT SCHEDULES (12 reports from design doc)
  // ──────────────────────────────────────────────────────────────────────────
  const reportSchedules = [
    { reportType: "daily-recruiting", frequency: "daily", nextRunAt: new Date() },
    { reportType: "open-reqs", frequency: "2x-week", nextRunAt: new Date() },
    { reportType: "ytd-performance", frequency: "weekly", nextRunAt: new Date() },
    { reportType: "interview-tracking", frequency: "realtime", nextRunAt: new Date() },
    { reportType: "rescinded-offers", frequency: "weekly", nextRunAt: new Date() },
    { reportType: "pir", frequency: "3x-week", nextRunAt: new Date() },
    { reportType: "filled-positions", frequency: "on-hire", nextRunAt: new Date() },
    { reportType: "cost-per-hire", frequency: "on-demand", nextRunAt: new Date() },
    { reportType: "referral-bonus", frequency: "ongoing", nextRunAt: new Date() },
    { reportType: "agency-fees", frequency: "weekly", nextRunAt: new Date() },
    { reportType: "req-audit", frequency: "on-demand", nextRunAt: new Date() },
    { reportType: "time-to-fill", frequency: "on-demand", nextRunAt: new Date() },
  ];

  for (const schedule of reportSchedules) {
    await prisma.reportSchedule.upsert({
      where: { reportType: schedule.reportType },
      update: {},
      create: schedule,
    });
  }
  console.log(`  ✓ ${reportSchedules.length} report schedules`);

  // ──────────────────────────────────────────────────────────────────────────
  // DEMO DATA — Sample requisitions and candidates for visual prototype
  // ──────────────────────────────────────────────────────────────────────────
  const recruiter = await prisma.user.findFirst({ where: { role: "RECRUITER" } });
  const hm = await prisma.user.findFirst({ where: { role: "HIRING_MANAGER" } });
  const waDept = await prisma.department.findFirst({ where: { code: "001-34" } });
  const waLoc = await prisma.location.findFirst({ where: { name: "Washington" } });
  const sourcedStage = await prisma.pipelineStage.findFirst({ where: { name: "Sourced" } });
  const submittedStage = await prisma.pipelineStage.findFirst({ where: { name: "Submitted" } });
  const screenStage = await prisma.pipelineStage.findFirst({ where: { name: "Screen" } });
  const interviewStage = await prisma.pipelineStage.findFirst({ where: { name: "Interview" } });
  const debriefStage = await prisma.pipelineStage.findFirst({ where: { name: "Debrief" } });
  const offerExtStage = await prisma.pipelineStage.findFirst({ where: { name: "Offer Extended" } });
  const offerAccStage = await prisma.pipelineStage.findFirst({ where: { name: "Offer Accepted" } });
  const hiredStage = await prisma.pipelineStage.findFirst({ where: { name: "Hired" } });
  const linkedinSource = await prisma.source.findFirst({ where: { name: "LinkedIn" } });
  const referralSource = await prisma.source.findFirst({ where: { name: "Referral" } });
  const agencySource = await prisma.source.findFirst({ where: { name: "Agency" } });

  if (recruiter && hm && waDept && waLoc && sourcedStage && interviewStage) {
    // Create sample requisitions
    const sampleReqs = [
      { reqNumber: "REQ-3501", title: "Software Engineer II", billable: true, positionsTotal: 2, payRangeMin: 95000, payRangeMax: 130000, targetDate: new Date("2026-04-15") },
      { reqNumber: "REQ-3502", title: "Field Service Technician I", billable: true, positionsTotal: 5, payRangeMin: 55000, payRangeMax: 75000, evergreen: true, targetDate: new Date("2026-05-01") },
      { reqNumber: "REQ-3503", title: "Project Manager", billable: true, positionsTotal: 1, payRangeMin: 85000, payRangeMax: 110000, targetDate: new Date("2026-04-01") },
      { reqNumber: "REQ-3504", title: "Solutions Architect", billable: true, positionsTotal: 1, payRangeMin: 120000, payRangeMax: 160000, targetDate: new Date("2026-03-20") },
      { reqNumber: "REQ-3505", title: "Help Desk Analyst", billable: false, positionsTotal: 2, payRangeMin: 45000, payRangeMax: 60000, reasonForHire: "Non-billable: internal IT support expansion", targetDate: new Date("2026-04-30") },
      { reqNumber: "REQ-3506", title: "DevOps Engineer", billable: true, positionsTotal: 1, payRangeMin: 110000, payRangeMax: 145000, targetDate: new Date("2026-04-20") },
    ];

    for (const req of sampleReqs) {
      const existingReq = await prisma.requisition.findUnique({ where: { reqNumber: req.reqNumber } });
      if (!existingReq) {
        const createdReq = await prisma.requisition.create({
          data: {
            ...req,
            departmentId: waDept.id,
            locationId: waLoc.id,
            hiringManagerId: hm.id,
            status: req.reqNumber === "REQ-3504" ? "OPEN" : "OPEN",
            dateOpened: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // random date in last 30 days
          },
        });

        // Assign recruiter
        await prisma.requisitionRecruiter.create({
          data: { requisitionId: createdReq.id, userId: recruiter.id },
        });
      }
    }
    console.log(`  ✓ ${sampleReqs.length} sample requisitions`);

    // Create sample candidates spread across stages
    const allReqs = await prisma.requisition.findMany();
    const allStages = [sourcedStage, submittedStage, screenStage, interviewStage, debriefStage, offerExtStage, offerAccStage, hiredStage].filter(Boolean);
    const allSources = [linkedinSource, referralSource, agencySource].filter(Boolean);

    const sampleCandidates = [
      { firstName: "Sarah", lastName: "Kim", email: "sarah.kim@example.com", stageIdx: 3 },
      { firstName: "Tom", lastName: "Bradley", email: "tom.bradley@example.com", stageIdx: 2 },
      { firstName: "Mike", lastName: "Rodriguez", email: "mike.rodriguez@example.com", stageIdx: 5 },
      { firstName: "Jessica", lastName: "Chen", email: "jessica.chen@example.com", stageIdx: 1 },
      { firstName: "David", lastName: "Park", email: "david.park@example.com", stageIdx: 0 },
      { firstName: "Emily", lastName: "Johnson", email: "emily.johnson@example.com", stageIdx: 4 },
      { firstName: "James", lastName: "Wilson", email: "james.wilson@example.com", stageIdx: 0 },
      { firstName: "Priya", lastName: "Sharma", email: "priya.sharma@example.com", stageIdx: 1 },
      { firstName: "Alex", lastName: "Thompson", email: "alex.thompson@example.com", stageIdx: 3 },
      { firstName: "Maria", lastName: "Garcia", email: "maria.garcia@example.com", stageIdx: 2 },
      { firstName: "Robert", lastName: "Lee", email: "robert.lee@example.com", stageIdx: 6 },
      { firstName: "Anika", lastName: "Patel", email: "anika.patel@example.com", stageIdx: 7 },
      { firstName: "Chris", lastName: "Brown", email: "chris.brown@example.com", stageIdx: 0 },
      { firstName: "Yuki", lastName: "Tanaka", email: "yuki.tanaka@example.com", stageIdx: 1 },
      { firstName: "Omar", lastName: "Hassan", email: "omar.hassan@example.com", stageIdx: 2 },
    ];

    for (let i = 0; i < sampleCandidates.length; i++) {
      const cand = sampleCandidates[i];
      const existingCand = await prisma.candidate.findFirst({ where: { email: cand.email } });
      if (!existingCand) {
        const req = allReqs[i % allReqs.length];
        const stage = allStages[cand.stageIdx] ?? sourcedStage;
        const source = allSources[i % allSources.length];

        await prisma.candidate.create({
          data: {
            firstName: cand.firstName,
            lastName: cand.lastName,
            email: cand.email,
            jurisdiction: "WA",
            requisitionId: req.id,
            currentStageId: stage!.id,
            sourceId: source?.id ?? null,
            ndaStatus: cand.stageIdx >= 3 ? "SIGNED" : cand.stageIdx >= 1 ? "PENDING" : "NOT_REQUIRED",
            appliedAt: new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
    console.log(`  ✓ ${sampleCandidates.length} sample candidates`);
  }

  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
