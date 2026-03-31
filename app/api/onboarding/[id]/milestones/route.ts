import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound, validationError, enforcementBlocked } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/rbac";

// GET /api/onboarding/:id/milestones
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const milestones = await prisma.onboardingMilestone.findMany({
    where: { onboardingId: id },
    include: {
      completedBy: { select: { name: true } },
      escalationSentTo: { select: { name: true } },
    },
    orderBy: { targetDate: "asc" },
  });
  return success(milestones);
}

// PUT /api/onboarding/:id/milestones — Complete a milestone
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  if (!body.milestoneId) return validationError("Missing milestoneId");

  const milestone = await prisma.onboardingMilestone.findUnique({ where: { id: body.milestoneId } });
  if (!milestone) return notFound("Milestone");

  // Enforcement: H-Note can't be sent until BG check clears
  if (milestone.milestone === "H_NOTE_SENT") {
    const bgCheck = await prisma.onboardingMilestone.findFirst({
      where: { onboardingId: id, milestone: "BG_CHECK_CLEARED" },
    });
    if (!bgCheck?.completedAt) {
      return enforcementBlocked("H_NOTE_REQUIRES_BG_CHECK", "H-Note cannot be sent until background check clears (SOP requirement).");
    }
  }

  // Enforcement: Equipment can't ship until H-Note sent
  if (milestone.milestone === "EQUIPMENT_SHIPPED_OR_STAGED") {
    const hNote = await prisma.onboardingMilestone.findFirst({
      where: { onboardingId: id, milestone: "H_NOTE_SENT" },
    });
    if (!hNote?.completedAt) {
      return enforcementBlocked("EQUIPMENT_REQUIRES_H_NOTE", "IT will not ship equipment until the H-Note has gone out (SOP requirement).");
    }
  }

  const user = await getAuthUser();

  const updated = await prisma.onboardingMilestone.update({
    where: { id: body.milestoneId },
    data: {
      completedAt: new Date(),
      completedById: user?.id ?? null,
      notes: body.notes ?? null,
    },
  });

  // Check if all milestones complete → update onboarding status
  const allMilestones = await prisma.onboardingMilestone.findMany({ where: { onboardingId: id } });
  const allComplete = allMilestones.every((m) => m.completedAt !== null);
  if (allComplete) {
    await prisma.onboardingRecord.update({
      where: { id },
      data: { status: "DAY1_READY", day1ReadyConfirmedAt: new Date() },
    });
  }

  return success(updated);
}
