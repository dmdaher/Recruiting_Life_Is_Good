import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound, conflictError } from "@/lib/api/response";

// PUT /api/background-checks/:id — Update status, record FCRA workflow timestamps
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.backgroundCheck.findUnique({ where: { id } });
  if (!existing) return notFound("Background check");

  if (body.updatedAt && new Date(body.updatedAt).getTime() !== existing.updatedAt.getTime()) {
    return conflictError("This background check was modified by another user. Reload to see changes.");
  }

  // Auto-calculate waiting period when pre-adverse notice is sent
  let waitingPeriodExpiresAt = existing.waitingPeriodExpiresAt;
  if (body.preAdverseNoticeSentAt && !existing.preAdverseNoticeSentAt) {
    const sentDate = new Date(body.preAdverseNoticeSentAt);
    // 5 business days = ~7 calendar days (conservative)
    waitingPeriodExpiresAt = new Date(sentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  const updated = await prisma.backgroundCheck.update({
    where: { id },
    data: {
      status: body.status ?? existing.status,
      completedAt: body.completedAt ? new Date(body.completedAt) : existing.completedAt,
      result: body.result ?? existing.result,
      preAdverseNoticeSentAt: body.preAdverseNoticeSentAt ? new Date(body.preAdverseNoticeSentAt) : existing.preAdverseNoticeSentAt,
      fcraRightsSentAt: body.fcraRightsSentAt ? new Date(body.fcraRightsSentAt) : existing.fcraRightsSentAt,
      waitingPeriodExpiresAt,
      adverseActionNoticeSentAt: body.adverseActionNoticeSentAt ? new Date(body.adverseActionNoticeSentAt) : existing.adverseActionNoticeSentAt,
    },
    include: { candidate: { select: { id: true, firstName: true, lastName: true } } },
  });

  return success(updated);
}
