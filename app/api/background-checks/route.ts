import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError, enforcementBlocked, notFound } from "@/lib/api/response";
import { validateBackgroundCheckTiming } from "@/lib/enforcement/rules";

// GET /api/background-checks
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get("candidateId");

  const where: Record<string, unknown> = {};
  if (candidateId) where.candidateId = candidateId;

  const checks = await prisma.backgroundCheck.findMany({
    where,
    include: { candidate: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return success(checks);
}

// POST /api/background-checks
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { candidateId, type } = body;

  if (!candidateId || !type) {
    return validationError("Missing required fields: candidateId, type");
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { currentStage: true },
  });
  if (!candidate) return notFound("Candidate");

  // Enforcement Rule 2: Fair Chance Act
  const screenStage = await prisma.pipelineStage.findFirst({ where: { name: "Screen" } });
  if (screenStage) {
    const check = validateBackgroundCheckTiming(candidate.currentStage.order, screenStage.order);
    if (check.blocked) {
      return enforcementBlocked(check.rule!, check.message!);
    }
  }

  const bgCheck = await prisma.backgroundCheck.create({
    data: {
      candidateId,
      type,
      status: "PENDING",
    },
    include: { candidate: { select: { id: true, firstName: true, lastName: true } } },
  });

  return success(bgCheck, 201);
}
