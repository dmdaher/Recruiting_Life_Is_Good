import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound, conflictError } from "@/lib/api/response";

// GET /api/candidates/:id
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      currentStage: true,
      requisition: { include: { department: true, location: true } },
      source: true,
      interviews: {
        include: { interviewers: { include: { user: { select: { id: true, name: true } } } } },
        orderBy: { scheduledAt: "desc" },
      },
      offers: {
        include: { employeeType: true, client: true, revisions: { orderBy: { revisionNumber: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
      stageTransitions: {
        include: {
          fromStage: { select: { name: true } },
          toStage: { select: { name: true } },
          movedBy: { select: { name: true } },
        },
        orderBy: { movedAt: "desc" },
      },
      backgroundChecks: true,
      documents: { orderBy: { uploadedAt: "desc" } },
      consents: { include: { privacyNoticeVersion: { select: { jurisdiction: true, version: true } } } },
    },
  });

  if (!candidate) return notFound("Candidate");
  return success(candidate);
}

// PUT /api/candidates/:id
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.candidate.findUnique({ where: { id } });
  if (!existing) return notFound("Candidate");

  // Optimistic concurrency
  if (body.updatedAt && new Date(body.updatedAt).getTime() !== existing.updatedAt.getTime()) {
    return conflictError("This candidate was modified by another user. Reload to see changes.", {
      updatedAt: existing.updatedAt.toISOString(),
    });
  }

  const updated = await prisma.candidate.update({
    where: { id },
    data: {
      firstName: body.firstName ?? existing.firstName,
      lastName: body.lastName ?? existing.lastName,
      email: body.email ?? existing.email,
      phone: body.phone ?? existing.phone,
      jurisdiction: body.jurisdiction ?? existing.jurisdiction,
      sourceId: body.sourceId ?? existing.sourceId,
      sourceDetail: body.sourceDetail ?? existing.sourceDetail,
      compensationExpectation: body.compensationExpectation ?? existing.compensationExpectation,
      notes: body.notes ?? existing.notes,
      ndaStatus: body.ndaStatus ?? existing.ndaStatus,
      ndaSentAt: body.ndaSentAt ? new Date(body.ndaSentAt) : existing.ndaSentAt,
      ndaSignedAt: body.ndaSignedAt ? new Date(body.ndaSignedAt) : existing.ndaSignedAt,
      ndaJurisdiction: body.ndaJurisdiction ?? existing.ndaJurisdiction,
      rejectionReason: body.rejectionReason ?? existing.rejectionReason,
      rejectionReasonCode: body.rejectionReasonCode ?? existing.rejectionReasonCode,
    },
    include: { currentStage: true, source: true },
  });

  return success(updated);
}

// DELETE /api/candidates/:id
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.candidate.findUnique({ where: { id } });
  if (!existing) return notFound("Candidate");

  // Check for legal holds before deletion
  const holds = await prisma.legalHold.findMany({
    where: { entityType: "candidate", entityId: id, releasedAt: null },
  });

  if (holds.length > 0) {
    return conflictError("Cannot delete candidate with active legal hold. Release the hold first.", {
      holds: holds.map((h) => ({ id: h.id, reason: h.reason })),
    });
  }

  await prisma.candidate.delete({ where: { id } });
  return success({ deleted: true });
}
