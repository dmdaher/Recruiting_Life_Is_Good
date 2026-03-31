import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound, validationError } from "@/lib/api/response";

// POST /api/offers/:id/approve — HM approves an offer
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const offer = await prisma.offer.findUnique({ where: { id } });
  if (!offer) return notFound("Offer");

  if (offer.status !== "DRAFT" && offer.status !== "REVISION_REQUESTED") {
    return validationError(`Cannot approve offer in ${offer.status} status. Must be DRAFT or REVISION_REQUESTED.`);
  }

  if (!body.approvedById) {
    return validationError("Missing required field: approvedById");
  }

  const updated = await prisma.offer.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedById: body.approvedById,
      approvedAt: new Date(),
    },
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true } },
      approvedBy: { select: { id: true, name: true } },
    },
  });

  // Create notification for the recruiter
  const candidate = await prisma.candidate.findUnique({
    where: { id: offer.candidateId },
    include: { requisition: { include: { recruiters: true } } },
  });

  if (candidate) {
    for (const recruiter of candidate.requisition.recruiters) {
      await prisma.notification.create({
        data: {
          userId: recruiter.userId,
          message: `Offer approved for ${candidate.firstName} ${candidate.lastName} — ready to extend`,
          link: `/recruiter/pipeline`,
        },
      });
    }
  }

  return success(updated);
}
