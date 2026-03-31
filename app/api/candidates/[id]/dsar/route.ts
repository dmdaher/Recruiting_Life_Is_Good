import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound, conflictError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit/service";

// GET /api/candidates/:id/dsar — Export all candidate data (DSAR access request)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      currentStage: true,
      requisition: { include: { department: true, location: true } },
      source: true,
      interviews: { include: { interviewers: { include: { user: { select: { name: true } } } } } },
      offers: { include: { revisions: true, employeeType: true } },
      stageTransitions: { include: { fromStage: true, toStage: true, movedBy: { select: { name: true } } } },
      backgroundChecks: true,
      documents: true,
      consents: { include: { privacyNoticeVersion: true } },
    },
  });

  if (!candidate) return notFound("Candidate");

  await logAudit({
    action: "EXPORT",
    entityType: "candidate",
    entityId: id,
    changes: { type: "DSAR_ACCESS" },
  });

  return success({
    exportedAt: new Date().toISOString(),
    candidate,
  });
}

// DELETE /api/candidates/:id/dsar — Purge candidate data (DSAR delete request)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) return notFound("Candidate");

  // Check legal holds
  const holds = await prisma.legalHold.findMany({
    where: { entityType: "candidate", entityId: id, releasedAt: null },
  });
  if (holds.length > 0) {
    return conflictError("Cannot delete candidate data — active legal hold exists.", {
      holds: holds.map((h) => ({ id: h.id, reason: h.reason })),
    });
  }

  // Check retention policy
  const policy = await prisma.dataRetentionPolicy.findFirst({
    where: { entityType: "candidate", jurisdiction: candidate.jurisdiction ?? "US" },
  });

  if (policy) {
    const retentionEnd = new Date(candidate.createdAt.getTime() + policy.retentionDays * 24 * 60 * 60 * 1000);
    if (new Date() < retentionEnd) {
      // Still within retention period — but GDPR right to erasure overrides for UK/Ireland
      const gdprJurisdictions = ["UK", "Ireland"];
      if (!gdprJurisdictions.includes(candidate.jurisdiction ?? "")) {
        return conflictError(
          `Candidate data is within the ${policy.retentionDays}-day retention period for ${candidate.jurisdiction ?? "US"} jurisdiction. Data will be auto-purged after ${retentionEnd.toISOString().slice(0, 10)}.`
        );
      }
    }
  }

  // Log the deletion before performing it
  await logAudit({
    action: "DELETE",
    entityType: "candidate",
    entityId: id,
    changes: {
      type: "DSAR_ERASURE",
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      jurisdiction: candidate.jurisdiction,
    },
  });

  // Delete candidate and all related data (cascading)
  await prisma.candidate.delete({ where: { id } });

  return success({ deleted: true, candidateId: id });
}
