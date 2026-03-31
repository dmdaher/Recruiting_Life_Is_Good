import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError, notFound } from "@/lib/api/response";
import { validateMinimumWage } from "@/lib/enforcement/rules";

// GET /api/offers
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get("candidateId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (candidateId) where.candidateId = candidateId;
  if (status) where.status = status;

  const offers = await prisma.offer.findMany({
    where,
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true, jurisdiction: true } },
      employeeType: true,
      client: true,
      approvedBy: { select: { id: true, name: true } },
      revisions: { orderBy: { revisionNumber: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return success(offers);
}

// POST /api/offers — Create offer (status = DRAFT)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { candidateId } = body;

  if (!candidateId) {
    return validationError("Missing required field: candidateId");
  }

  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) return notFound("Candidate");

  // Minimum wage warning (non-blocking)
  let minWageWarning = null;
  if (body.payRate) {
    const wage = validateMinimumWage(
      parseFloat(body.payRate),
      candidate.jurisdiction,
      body.exemptStatus
    );
    if (wage.warning) minWageWarning = wage.message;
  }

  const offer = await prisma.offer.create({
    data: {
      candidateId,
      salary: body.salary || null,
      payRate: body.payRate || null,
      billRate: body.billRate || null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      status: "DRAFT",
      employeeTypeId: body.employeeTypeId || null,
      exemptStatus: body.exemptStatus || null,
      bonusCommissionPlan: body.bonusCommissionPlan || null,
      commissionAmount: body.commissionAmount || null,
      bonusAmount: body.bonusAmount || null,
      additionalExpenses: body.additionalExpenses || null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      clientId: body.clientId || null,
      clientRequiresDrugScreen: body.clientRequiresDrugScreen ?? false,
      clientRequiresTBTest: body.clientRequiresTBTest ?? false,
      clientRequiresAdditionalBGCheck: body.clientRequiresAdditionalBGCheck ?? false,
    },
    include: { candidate: { select: { id: true, firstName: true, lastName: true } }, employeeType: true },
  });

  return success({ offer, minWageWarning }, 201);
}
