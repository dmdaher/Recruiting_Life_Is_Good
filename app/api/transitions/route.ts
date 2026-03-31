import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError, enforcementBlocked, notFound } from "@/lib/api/response";
import { validateFCRAAdverseAction, validateBackgroundCheckTiming } from "@/lib/enforcement/rules";
import { logStageTransition } from "@/lib/audit/service";
import { createOnboardingForCandidate } from "@/lib/onboarding/create-onboarding";

// POST /api/transitions — Move a candidate to a new stage
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { candidateId, toStageId, movedById, notes } = body;

  if (!candidateId || !toStageId || !movedById) {
    return validationError("Missing required fields: candidateId, toStageId, movedById");
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { currentStage: true, backgroundChecks: true },
  });
  if (!candidate) return notFound("Candidate");

  const toStage = await prisma.pipelineStage.findUnique({ where: { id: toStageId } });
  if (!toStage) return notFound("Pipeline stage");

  const fromStage = candidate.currentStage;

  // === ENFORCEMENT CHECKS ===

  // Rule 2: Fair Chance Act — can't initiate background check before Screen
  if (toStage.requiresBackgroundCheck) {
    const screenStage = await prisma.pipelineStage.findFirst({ where: { name: "Screen" } });
    if (screenStage) {
      const check = validateBackgroundCheckTiming(fromStage.order, screenStage.order);
      if (check.blocked) {
        return enforcementBlocked(check.rule!, check.message!);
      }
    }
  }

  // Rule 3: FCRA — can't reject after background check without adverse action workflow
  // Check if moving backward or to a rejection (any downward move from a stage after background check)
  if (toStage.order < fromStage.order || body.isRejection) {
    const activeBackgroundCheck = candidate.backgroundChecks.find(
      (bc) => bc.status !== "CLEAR"
    );
    if (activeBackgroundCheck) {
      const fcraCheck = validateFCRAAdverseAction(activeBackgroundCheck);
      if (fcraCheck.blocked) {
        return enforcementBlocked(fcraCheck.rule!, fcraCheck.message!);
      }
    }
  }

  // Perform the transition
  const [transition, updatedCandidate] = await prisma.$transaction([
    prisma.stageTransition.create({
      data: {
        candidateId,
        fromStageId: fromStage.id,
        toStageId,
        movedById,
        notes: notes || null,
      },
    }),
    prisma.candidate.update({
      where: { id: candidateId },
      data: { currentStageId: toStageId },
      include: { currentStage: true },
    }),
  ]);

  // If moved to terminal stage (Hired), increment positionsFilled + trigger onboarding
  if (toStage.isTerminal) {
    await prisma.requisition.update({
      where: { id: candidate.requisitionId },
      data: { positionsFilled: { increment: 1 } },
    });

    // Phase 2: Auto-create onboarding record + milestones
    try {
      await createOnboardingForCandidate(candidateId, movedById);
    } catch (e) {
      console.error("[ONBOARDING] Failed to auto-create onboarding:", e);
      // Non-blocking — stage transition still succeeds
    }
  }

  await logStageTransition(movedById, candidateId, fromStage.name, toStage.name);

  return success({
    transition,
    candidate: updatedCandidate,
    from: fromStage.name,
    to: toStage.name,
  }, 201);
}

// GET /api/transitions — Get transition history for a candidate
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get("candidateId");

  if (!candidateId) {
    return validationError("candidateId query parameter is required");
  }

  const transitions = await prisma.stageTransition.findMany({
    where: { candidateId },
    include: {
      fromStage: { select: { name: true, order: true } },
      toStage: { select: { name: true, order: true } },
      movedBy: { select: { name: true } },
    },
    orderBy: { movedAt: "desc" },
  });

  return success(transitions);
}
