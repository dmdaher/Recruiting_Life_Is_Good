import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError, enforcementBlocked, notFound } from "@/lib/api/response";
import { validateNDAForInterview } from "@/lib/enforcement/rules";
import { getAuthUser } from "@/lib/auth/rbac";
import { logMutation } from "@/lib/audit/service";

// GET /api/interviews
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get("candidateId");
  const date = searchParams.get("date"); // YYYY-MM-DD

  const where: Record<string, unknown> = {};
  if (candidateId) where.candidateId = candidateId;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    where.scheduledAt = { gte: start, lt: end };
  }

  const interviews = await prisma.interview.findMany({
    where,
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true } },
      interviewers: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return success(interviews);
}

// POST /api/interviews
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { candidateId, scheduledAt, type, interviewerIds } = body;

  if (!candidateId || !scheduledAt) {
    return validationError("Missing required fields: candidateId, scheduledAt");
  }

  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) return notFound("Candidate");

  // Enforcement Rule 7: NDA required before interview
  const ndaRequired = body.ndaRequired !== false; // default true
  const ndaCheck = validateNDAForInterview(candidate.ndaStatus, ndaRequired);
  if (ndaCheck.blocked) {
    return enforcementBlocked(ndaCheck.rule!, ndaCheck.message!);
  }

  const interview = await prisma.interview.create({
    data: {
      candidateId,
      scheduledAt: new Date(scheduledAt),
      type: type ?? "VIDEO",
      ndaRequired,
      scorecard: body.scorecard || null,
      feedback: body.feedback || null,
      rescheduledFromInterviewId: body.rescheduledFromInterviewId || null,
    },
  });

  // Add interviewers
  if (interviewerIds?.length) {
    await prisma.interviewInterviewer.createMany({
      data: interviewerIds.map((userId: string) => ({
        interviewId: interview.id,
        userId,
      })),
    });
  }

  const full = await prisma.interview.findUnique({
    where: { id: interview.id },
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true } },
      interviewers: { include: { user: { select: { id: true, name: true } } } },
    },
  });

  const user = await getAuthUser();
  await logMutation(user?.id ?? "system", "CREATE", "interview", interview.id, null, {
    candidateId, scheduledAt: body.scheduledAt, type: body.type ?? "VIDEO",
  });

  return success(full, 201);
}
