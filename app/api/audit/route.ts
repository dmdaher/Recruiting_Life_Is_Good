import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success } from "@/lib/api/response";

// GET /api/audit — Query audit log
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");
  const action = searchParams.get("action");
  const limit = parseInt(searchParams.get("limit") ?? "100");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (action) where.action = action;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true } } },
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return success({ logs, total, limit, offset });
}
