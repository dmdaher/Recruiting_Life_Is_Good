import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError } from "@/lib/api/response";
import { checkDuplicateFields } from "@/lib/enforcement/rules";
import { getAuthUser, scopeCandidatesForUser } from "@/lib/auth/rbac";
import { logMutation } from "@/lib/audit/service";

// GET /api/candidates (scoped by role)
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  const { searchParams } = new URL(request.url);
  const requisitionId = searchParams.get("requisitionId");
  const stageId = searchParams.get("stageId");

  const roleScope = user ? scopeCandidatesForUser(user) : {};
  const where: Record<string, unknown> = { ...roleScope };
  if (requisitionId) where.requisitionId = requisitionId;
  if (stageId) where.currentStageId = stageId;

  const candidates = await prisma.candidate.findMany({
    where,
    include: {
      currentStage: true,
      requisition: { select: { id: true, reqNumber: true, title: true } },
      source: true,
      _count: { select: { interviews: true, offers: true, documents: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return success(candidates);
}

// POST /api/candidates
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  const body = await request.json();
  const { firstName, lastName, email, requisitionId } = body;

  if (!firstName || !lastName || !email || !requisitionId) {
    return validationError("Missing required fields: firstName, lastName, email, requisitionId");
  }

  const normalized = checkDuplicateFields(firstName, lastName, email);

  const duplicates = await prisma.candidate.findMany({
    where: {
      OR: [
        { email: normalized.email },
        { AND: [{ firstName: normalized.firstName }, { lastName: normalized.lastName }] },
      ],
    },
    include: {
      requisition: { select: { reqNumber: true, title: true } },
      currentStage: { select: { name: true } },
    },
    take: 5,
  });

  const firstStage = await prisma.pipelineStage.findFirst({ orderBy: { order: "asc" } });
  if (!firstStage) return validationError("No pipeline stages configured.");

  const candidate = await prisma.candidate.create({
    data: {
      firstName: normalized.firstName,
      lastName: normalized.lastName,
      email: normalized.email,
      phone: body.phone?.trim() || null,
      jurisdiction: body.jurisdiction || null,
      requisitionId,
      currentStageId: body.currentStageId ?? firstStage.id,
      sourceId: body.sourceId || null,
      sourceDetail: body.sourceDetail || null,
      compensationExpectation: body.compensationExpectation || null,
      notes: body.notes || null,
      ndaStatus: body.ndaStatus ?? "NOT_REQUIRED",
    },
    include: {
      currentStage: true,
      requisition: { select: { id: true, reqNumber: true, title: true } },
      source: true,
    },
  });

  if (body.movedById || user?.id) {
    await prisma.stageTransition.create({
      data: {
        candidateId: candidate.id,
        toStageId: candidate.currentStageId,
        movedById: body.movedById ?? user?.id ?? "",
        notes: "Initial placement",
      },
    });
  }

  await logMutation(user?.id ?? "system", "CREATE", "candidate", candidate.id, null, {
    name: `${normalized.firstName} ${normalized.lastName}`,
    requisitionId,
  });

  return success({
    candidate,
    duplicateWarning: duplicates.length > 0
      ? {
          message: `Potential duplicate(s) found: ${duplicates.map((d) => `${d.firstName} ${d.lastName} (${d.requisition.reqNumber} — ${d.currentStage.name})`).join(", ")}`,
          duplicates: duplicates.map((d) => ({
            id: d.id, name: `${d.firstName} ${d.lastName}`, email: d.email, req: d.requisition.reqNumber, stage: d.currentStage.name,
          })),
        }
      : null,
  }, 201);
}
