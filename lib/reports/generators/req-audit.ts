import { prisma } from "@/lib/db/client";
import { createBrandedWorkbook, type ColumnDef } from "@/lib/excel/exporter";

export async function generateReqAuditReport(filters?: { requisitionId?: string }) {
  const where: Record<string, unknown> = { entityType: "requisition" };
  if (filters?.requisitionId) where.entityId = filters.requisitionId;

  const logs = await prisma.auditLog.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: { timestamp: "desc" },
    take: 500,
  });

  const rows = logs.map((l) => ({
    timestamp: l.timestamp,
    user: l.user?.name ?? "System",
    action: l.action,
    entityId: l.entityId,
    changes: l.changes ? JSON.stringify(l.changes).slice(0, 100) : "",
  }));

  const columns: ColumnDef[] = [
    { header: "Timestamp", key: "timestamp", width: 20, format: "date" },
    { header: "User", key: "user", width: 20 },
    { header: "Action", key: "action", width: 16 },
    { header: "Req ID", key: "entityId", width: 16 },
    { header: "Changes", key: "changes", width: 40 },
  ];

  return { rows, columns, title: "Requisition Audit Report" };
}

export async function generateReqAuditExcel(filters?: { requisitionId?: string }) {
  const { rows, columns, title } = await generateReqAuditReport(filters);
  return createBrandedWorkbook(title, columns, rows, { sheetName: "Req Audit" });
}
