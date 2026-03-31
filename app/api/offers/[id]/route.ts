import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound, conflictError } from "@/lib/api/response";

// GET /api/offers/:id
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true } },
      employeeType: true,
      client: true,
      approvedBy: { select: { id: true, name: true } },
      revisions: { orderBy: { revisionNumber: "asc" } },
    },
  });
  if (!offer) return notFound("Offer");
  return success(offer);
}

// PUT /api/offers/:id — Update offer, change status
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.offer.findUnique({ where: { id } });
  if (!existing) return notFound("Offer");

  if (body.updatedAt && new Date(body.updatedAt).getTime() !== existing.updatedAt.getTime()) {
    return conflictError("This offer was modified by another user. Reload to see changes.");
  }

  const updated = await prisma.offer.update({
    where: { id },
    data: {
      salary: body.salary ?? existing.salary,
      payRate: body.payRate ?? existing.payRate,
      billRate: body.billRate ?? existing.billRate,
      startDate: body.startDate ? new Date(body.startDate) : existing.startDate,
      status: body.status ?? existing.status,
      declineReason: body.declineReason ?? existing.declineReason,
      rescindReason: body.rescindReason ?? existing.rescindReason,
      offerLetterUrl: body.offerLetterUrl ?? existing.offerLetterUrl,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : existing.expiresAt,
    },
    include: { candidate: { select: { id: true, firstName: true, lastName: true } } },
  });

  return success(updated);
}
