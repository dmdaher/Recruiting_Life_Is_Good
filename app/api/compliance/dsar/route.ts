import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError } from "@/lib/api/response";

// Jurisdiction-based SLA days
const SLA_DAYS: Record<string, number> = {
  UK: 30,
  Ireland: 30,
  India: 30,
  US: 45, // CCPA
  California: 45,
  default: 45,
};

// GET /api/compliance/dsar — List DSAR requests
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const dsars = await prisma.dSARRequest.findMany({
    where,
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true } },
      handledBy: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return success(dsars);
}

// POST /api/compliance/dsar — Create DSAR request
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.candidateId || !body.requestType || !body.jurisdiction) {
    return validationError("Missing required fields: candidateId, requestType, jurisdiction");
  }

  const slaDays = SLA_DAYS[body.jurisdiction] ?? SLA_DAYS.default;
  const dueDate = new Date(Date.now() + slaDays * 24 * 60 * 60 * 1000);

  const dsar = await prisma.dSARRequest.create({
    data: {
      candidateId: body.candidateId,
      requestType: body.requestType,
      jurisdiction: body.jurisdiction,
      dueDate,
      handledById: body.handledById || null,
    },
    include: { candidate: { select: { id: true, firstName: true, lastName: true } } },
  });

  return success(dsar, 201);
}
