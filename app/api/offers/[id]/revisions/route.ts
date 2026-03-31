import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound, validationError } from "@/lib/api/response";

// GET /api/offers/:id/revisions
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const revisions = await prisma.offerRevision.findMany({
    where: { offerId: id },
    orderBy: { revisionNumber: "asc" },
  });
  return success(revisions);
}

// POST /api/offers/:id/revisions — Log counter-offer / negotiation step
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const offer = await prisma.offer.findUnique({ where: { id } });
  if (!offer) return notFound("Offer");

  if (!body.proposedBy) {
    return validationError("Missing required field: proposedBy (candidate or employer)");
  }

  // Get next revision number
  const lastRevision = await prisma.offerRevision.findFirst({
    where: { offerId: id },
    orderBy: { revisionNumber: "desc" },
  });
  const nextNumber = (lastRevision?.revisionNumber ?? 0) + 1;

  const revision = await prisma.offerRevision.create({
    data: {
      offerId: id,
      revisionNumber: nextNumber,
      salary: body.salary || null,
      payRate: body.payRate || null,
      billRate: body.billRate || null,
      proposedBy: body.proposedBy,
      notes: body.notes || null,
    },
  });

  return success(revision, 201);
}
