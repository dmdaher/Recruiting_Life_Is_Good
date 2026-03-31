import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError, notFound } from "@/lib/api/response";

// GET /api/compliance/holds — List active legal holds
export async function GET() {
  const holds = await prisma.legalHold.findMany({
    where: { releasedAt: null },
    include: {
      createdBy: { select: { id: true, name: true } },
      releasedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return success(holds);
}

// POST /api/compliance/holds — Create legal hold
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.entityType || !body.entityId || !body.reason || !body.createdById) {
    return validationError("Missing required fields: entityType, entityId, reason, createdById");
  }

  if (!["candidate", "requisition"].includes(body.entityType)) {
    return validationError("entityType must be 'candidate' or 'requisition'");
  }

  const hold = await prisma.legalHold.create({
    data: {
      entityType: body.entityType,
      entityId: body.entityId,
      reason: body.reason,
      caseReference: body.caseReference || null,
      createdById: body.createdById,
    },
    include: { createdBy: { select: { name: true } } },
  });

  return success(hold, 201);
}

// PUT /api/compliance/holds — Release a hold
export async function PUT(request: NextRequest) {
  const body = await request.json();

  if (!body.holdId || !body.releasedById) {
    return validationError("Missing required fields: holdId, releasedById");
  }

  const existing = await prisma.legalHold.findUnique({ where: { id: body.holdId } });
  if (!existing) return notFound("Legal hold");

  const released = await prisma.legalHold.update({
    where: { id: body.holdId },
    data: {
      releasedById: body.releasedById,
      releasedAt: new Date(),
    },
  });

  return success(released);
}
