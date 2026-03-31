import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound, validationError, conflictError, enforcementBlocked } from "@/lib/api/response";
import { validatePayRange } from "@/lib/enforcement/rules";

// GET /api/reqs/:id
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const req = await prisma.requisition.findUnique({
    where: { id },
    include: {
      department: true,
      location: true,
      hiringManager: { select: { id: true, name: true, email: true } },
      recruiters: { include: { user: { select: { id: true, name: true } } } },
      candidates: {
        include: { currentStage: true, source: true },
        orderBy: { updatedAt: "desc" },
      },
      postings: { include: { postingChannel: true } },
    },
  });

  if (!req) return notFound("Requisition");
  return success(req);
}

// PUT /api/reqs/:id
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.requisition.findUnique({ where: { id } });
  if (!existing) return notFound("Requisition");

  // Optimistic concurrency
  if (body.updatedAt && new Date(body.updatedAt).getTime() !== existing.updatedAt.getTime()) {
    return conflictError("This requisition was modified by another user. Reload to see changes.", {
      updatedAt: existing.updatedAt.toISOString(),
    });
  }

  // Re-validate pay range on update (WA EPOA)
  const updatedPayRange = {
    payRangeMin: body.payRangeMin ?? existing.payRangeMin,
    payRangeMax: body.payRangeMax ?? existing.payRangeMax,
  };
  const payRangeCheck = validatePayRange(updatedPayRange);
  if (payRangeCheck.blocked) {
    return enforcementBlocked(payRangeCheck.rule!, payRangeCheck.message!);
  }

  const updated = await prisma.requisition.update({
    where: { id },
    data: {
      title: body.title ?? existing.title,
      status: body.status ?? existing.status,
      billable: body.billable ?? existing.billable,
      targetDate: body.targetDate ? new Date(body.targetDate) : existing.targetDate,
      positionsTotal: body.positionsTotal ?? existing.positionsTotal,
      positionsFilled: body.positionsFilled ?? existing.positionsFilled,
      payRangeMin: body.payRangeMin ?? existing.payRangeMin,
      payRangeMax: body.payRangeMax ?? existing.payRangeMax,
      benefitsDescription: body.benefitsDescription ?? existing.benefitsDescription,
      evergreen: body.evergreen ?? existing.evergreen,
      priority: body.priority ?? existing.priority,
      workerCategory: body.workerCategory ?? existing.workerCategory,
      reasonForHire: body.reasonForHire ?? existing.reasonForHire,
      dateClosed: body.status === "CLOSED" ? new Date() : existing.dateClosed,
    },
    include: { department: true, location: true },
  });

  return success(updated);
}

// DELETE /api/reqs/:id
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.requisition.findUnique({ where: { id } });
  if (!existing) return notFound("Requisition");

  // Check for legal holds (Enforcement Rule 4)
  const holds = await prisma.legalHold.findMany({
    where: { entityType: "requisition", entityId: id, releasedAt: null },
  });
  if (holds.length > 0) {
    return conflictError("Cannot delete requisition with active legal hold. Release the hold first.", {
      holds: holds.map((h) => ({ id: h.id, reason: h.reason })),
    });
  }

  await prisma.requisition.delete({ where: { id } });
  return success({ deleted: true });
}
