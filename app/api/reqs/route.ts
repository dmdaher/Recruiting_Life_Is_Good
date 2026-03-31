import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError, enforcementBlocked } from "@/lib/api/response";
import { validatePayRange } from "@/lib/enforcement/rules";
import { getAuthUser, scopeReqsForUser } from "@/lib/auth/rbac";
import { logMutation } from "@/lib/audit/service";

// GET /api/reqs — List requisitions (scoped by role)
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const departmentId = searchParams.get("departmentId");

  const roleScope = user ? scopeReqsForUser(user) : {};
  const where: Record<string, unknown> = { ...roleScope };
  if (status) where.status = status;
  if (departmentId) where.departmentId = departmentId;

  const reqs = await prisma.requisition.findMany({
    where,
    include: {
      department: true,
      location: true,
      hiringManager: { select: { id: true, name: true, email: true } },
      recruiters: { include: { user: { select: { id: true, name: true } } } },
      candidates: { select: { id: true, currentStageId: true } },
      _count: { select: { candidates: true } },
    },
    orderBy: { dateOpened: "desc" },
  });

  return success(reqs);
}

// POST /api/reqs — Create requisition
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  const body = await request.json();

  const { title, departmentId, locationId, hiringManagerId, reqNumber } = body;

  if (!title || !departmentId || !locationId || !hiringManagerId || !reqNumber) {
    return validationError("Missing required fields: title, departmentId, locationId, hiringManagerId, reqNumber");
  }

  // Enforcement Rule 1: WA EPOA — Pay range required
  const payRangeCheck = validatePayRange(body);
  if (payRangeCheck.blocked) {
    return enforcementBlocked(payRangeCheck.rule!, payRangeCheck.message!);
  }

  const existing = await prisma.requisition.findUnique({ where: { reqNumber } });
  if (existing) {
    return validationError(`Requisition ${reqNumber} already exists`, "reqNumber");
  }

  const req = await prisma.requisition.create({
    data: {
      reqNumber, title, departmentId, locationId, hiringManagerId,
      status: body.status ?? "OPEN",
      billable: body.billable ?? true,
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
      positionsTotal: body.positionsTotal ?? 1,
      payRangeMin: body.payRangeMin,
      payRangeMax: body.payRangeMax,
      benefitsDescription: body.benefitsDescription,
      evergreen: body.evergreen ?? false,
      priority: body.priority ?? false,
      workerCategory: body.workerCategory,
      reasonForHire: body.reasonForHire,
    },
    include: { department: true, location: true, hiringManager: { select: { id: true, name: true } } },
  });

  if (body.recruiterIds?.length) {
    await prisma.requisitionRecruiter.createMany({
      data: body.recruiterIds.map((userId: string) => ({ requisitionId: req.id, userId })),
    });
  }

  await logMutation(user?.id ?? "system", "CREATE", "requisition", req.id, null, { reqNumber, title });

  return success(req, 201);
}
