import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound, conflictError } from "@/lib/api/response";

// GET /api/interviews/:id
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true } },
      interviewers: { include: { user: { select: { id: true, name: true } } } },
    },
  });
  if (!interview) return notFound("Interview");
  return success(interview);
}

// PUT /api/interviews/:id — Update scorecard, feedback, outcome
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.interview.findUnique({ where: { id } });
  if (!existing) return notFound("Interview");

  if (body.updatedAt && new Date(body.updatedAt).getTime() !== existing.updatedAt.getTime()) {
    return conflictError("This interview was modified by another user. Reload to see changes.");
  }

  const updated = await prisma.interview.update({
    where: { id },
    data: {
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : existing.scheduledAt,
      type: body.type ?? existing.type,
      scorecard: body.scorecard ?? existing.scorecard,
      feedback: body.feedback ?? existing.feedback,
      outcome: body.outcome ?? existing.outcome,
      noShow: body.noShow ?? existing.noShow,
    },
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true } },
      interviewers: { include: { user: { select: { id: true, name: true } } } },
    },
  });

  return success(updated);
}

// DELETE /api/interviews/:id
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.interview.findUnique({ where: { id } });
  if (!existing) return notFound("Interview");
  await prisma.interview.delete({ where: { id } });
  return success({ deleted: true });
}
