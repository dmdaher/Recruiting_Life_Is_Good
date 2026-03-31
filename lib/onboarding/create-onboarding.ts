import { prisma } from "@/lib/db/client";

type MilestoneTemplate = {
  milestone: string;
  daysFromStart: number | null; // null = triggered by another milestone
  daysBeforeStart: number | null; // null = not relative to start date
};

// SOP timeline: milestone targets relative to offer acceptance and start date
const BASE_MILESTONES: MilestoneTemplate[] = [
  { milestone: "PIF_SUBMITTED", daysFromStart: 0, daysBeforeStart: null },
  { milestone: "IT_REQUEST_SENT", daysFromStart: 0, daysBeforeStart: null },
  { milestone: "BG_CHECK_INITIATED", daysFromStart: 0, daysBeforeStart: null },
  { milestone: "BG_CHECK_CLEARED", daysFromStart: 7, daysBeforeStart: null },
  { milestone: "H_NOTE_SENT", daysFromStart: 8, daysBeforeStart: null },
  { milestone: "NEO_EMAIL_SENT", daysFromStart: 9, daysBeforeStart: null },
  { milestone: "EQUIPMENT_SHIPPED_OR_STAGED", daysFromStart: null, daysBeforeStart: 5 },
  { milestone: "EQUIPMENT_CONFIRMED", daysFromStart: null, daysBeforeStart: 2 },
  { milestone: "PREWORK_COMPLETED", daysFromStart: null, daysBeforeStart: 2 },
  { milestone: "GREETER_ASSIGNED", daysFromStart: null, daysBeforeStart: 3 },
  { milestone: "GREETER_CONFIRMED", daysFromStart: null, daysBeforeStart: 2 },
  { milestone: "DAY1_CONFIRMED", daysFromStart: null, daysBeforeStart: 1 },
];

/**
 * Auto-create an OnboardingRecord + milestones when a candidate moves to "Hired" stage.
 */
export async function createOnboardingForCandidate(
  candidateId: string,
  userId: string
) {
  // Check if onboarding already exists
  const existing = await prisma.onboardingRecord.findUnique({ where: { candidateId } });
  if (existing) return existing;

  // Get candidate + offer data
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      requisition: { include: { department: true } },
      offers: { where: { status: { in: ["ACCEPTED", "EXTENDED", "APPROVED"] } }, take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  if (!candidate) throw new Error(`Candidate ${candidateId} not found`);

  const offer = candidate.offers[0];
  const startDate = offer?.startDate ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // default 2 weeks out
  const now = new Date();

  // Determine scenario for timeline
  const isIndia = candidate.jurisdiction === "India";
  const isBillable = candidate.requisition.billable;
  const bgCheckDays = isIndia ? 21 : 7;

  // Adjust BG check cleared target for India
  const milestones = BASE_MILESTONES.map((m) => {
    if (m.milestone === "BG_CHECK_CLEARED") {
      return { ...m, daysFromStart: bgCheckDays };
    }
    if (m.milestone === "H_NOTE_SENT") {
      return { ...m, daysFromStart: bgCheckDays + 1 };
    }
    if (m.milestone === "NEO_EMAIL_SENT") {
      return { ...m, daysFromStart: bgCheckDays + 2 };
    }
    return m;
  });

  // Add PAYROLL_NOTIFIED for UK/Ireland
  if (candidate.jurisdiction === "UK" || candidate.jurisdiction === "Ireland") {
    milestones.push({
      milestone: "PAYROLL_NOTIFIED",
      daysFromStart: bgCheckDays + 1,
      daysBeforeStart: null,
    });
  }

  // Create onboarding record
  const onboarding = await prisma.onboardingRecord.create({
    data: {
      candidateId,
      status: "PIF_PENDING",
      hireDate: startDate,
      payFrequency: candidate.jurisdiction === "UK" || candidate.jurisdiction === "Ireland" ? "MONTHLY_PAY" : "BIWEEKLY",
    },
  });

  // Create milestones with calculated target dates
  for (const m of milestones) {
    let targetDate: Date;
    if (m.daysBeforeStart !== null) {
      targetDate = new Date(startDate.getTime() - m.daysBeforeStart * 24 * 60 * 60 * 1000);
    } else if (m.daysFromStart !== null) {
      targetDate = new Date(now.getTime() + m.daysFromStart * 24 * 60 * 60 * 1000);
    } else {
      targetDate = startDate;
    }

    await prisma.onboardingMilestone.create({
      data: {
        onboardingId: onboarding.id,
        milestone: m.milestone,
        targetDate,
      },
    });
  }

  // Create prework record
  await prisma.candidatePrework.create({
    data: { onboardingId: onboarding.id },
  });

  // Create international details if applicable
  if (candidate.jurisdiction === "UK" || candidate.jurisdiction === "Ireland") {
    await prisma.contractTracking.create({
      data: {
        onboardingId: onboarding.id,
        jurisdiction: candidate.jurisdiction,
        contractType: candidate.jurisdiction === "UK" ? "Contract of Employment" : "Ireland Contract",
        starterFormType: candidate.jurisdiction === "UK" ? "SBS UK" : "Ireland New Starter",
      },
    });
    await prisma.internationalHireDetails.create({
      data: {
        onboardingId: onboarding.id,
        jurisdiction: candidate.jurisdiction,
        businessUnit: candidate.jurisdiction === "UK" ? "UK Denali Europe Limited" : "Ireland Denali Europe Limited",
        standardHoursPerMonth: 173.33,
        timeOffPolicies: candidate.jurisdiction === "UK" ? ["Holiday-UK", "Sick Leave-UK"] : ["Holiday-IRL", "Sick Leave-IRL"],
      },
    });
  } else if (candidate.jurisdiction === "India") {
    await prisma.internationalHireDetails.create({
      data: {
        onboardingId: onboarding.id,
        jurisdiction: "INDIA",
        noticePeriodDays: 60,
        probationMonths: 6,
      },
    });
  }

  // Notifications
  const reqRecruiters = await prisma.requisitionRecruiter.findMany({
    where: { requisitionId: candidate.requisitionId },
  });

  // Notify manager
  await prisma.notification.create({
    data: {
      userId: candidate.requisition.hiringManagerId,
      message: `Onboarding started for ${candidate.firstName} ${candidate.lastName}. Submit PIF to continue.`,
      link: `/recruiter/onboarding/${onboarding.id}/pif`,
    },
  });

  // Notify recruiters
  for (const rr of reqRecruiters) {
    await prisma.notification.create({
      data: {
        userId: rr.userId,
        message: `New hire ${candidate.firstName} ${candidate.lastName} — onboarding initiated. Background check needed.`,
        link: `/recruiter/onboarding/${onboarding.id}`,
      },
    });
  }

  return onboarding;
}
