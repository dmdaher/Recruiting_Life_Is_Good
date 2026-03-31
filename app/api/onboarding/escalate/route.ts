import { prisma } from "@/lib/db/client";
import { success } from "@/lib/api/response";

// POST /api/onboarding/escalate — Check and fire escalation alerts for overdue milestones
export async function POST() {
  const now = new Date();

  const overdue = await prisma.onboardingMilestone.findMany({
    where: {
      targetDate: { lt: now },
      completedAt: null,
      escalatedAt: null,
    },
    include: {
      onboarding: {
        include: {
          candidate: { select: { firstName: true, lastName: true, requisitionId: true } },
        },
      },
    },
  });

  let escalated = 0;

  for (const milestone of overdue) {
    // Find the hiring manager to notify
    const req = await prisma.requisition.findFirst({
      where: { id: milestone.onboarding.candidate.requisitionId },
    });

    if (req) {
      await prisma.notification.create({
        data: {
          userId: req.hiringManagerId,
          message: `OVERDUE: ${milestone.milestone.replace(/_/g, " ")} for ${milestone.onboarding.candidate.firstName} ${milestone.onboarding.candidate.lastName} — was due ${milestone.targetDate.toLocaleDateString()}`,
          link: `/recruiter/onboarding/${milestone.onboardingId}`,
        },
      });

      await prisma.onboardingMilestone.update({
        where: { id: milestone.id },
        data: { escalatedAt: now, escalationSentToId: req.hiringManagerId },
      });

      escalated++;
    }
  }

  return success({ checked: overdue.length, escalated });
}
