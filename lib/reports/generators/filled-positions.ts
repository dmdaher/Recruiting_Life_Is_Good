import { prisma } from "@/lib/db/client";
import { createBrandedWorkbook, type ColumnDef } from "@/lib/excel/exporter";

export async function generateFilledPositionsReport(filters?: { departmentId?: string; recruiterId?: string; quarter?: string }) {
  const hiredStage = await prisma.pipelineStage.findFirst({ where: { isTerminal: true } });
  const acceptedStage = await prisma.pipelineStage.findFirst({ where: { name: "Offer Accepted" } });

  const stageIds = [hiredStage?.id, acceptedStage?.id].filter(Boolean) as string[];

  const where: Record<string, unknown> = { currentStageId: { in: stageIds } };

  const candidates = await prisma.candidate.findMany({
    where,
    include: {
      requisition: { include: { department: true, location: true } },
      source: true,
      offers: { take: 1, orderBy: { createdAt: "desc" } },
      stageTransitions: { orderBy: { movedAt: "asc" } },
      currentStage: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const rows = candidates.map((c) => {
    const firstTransition = c.stageTransitions[0];
    const lastTransition = c.stageTransitions[c.stageTransitions.length - 1];
    const timeToFill = firstTransition && lastTransition
      ? Math.floor((lastTransition.movedAt.getTime() - firstTransition.movedAt.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      name: `${c.firstName} ${c.lastName}`,
      title: c.requisition.title,
      reqNumber: c.requisition.reqNumber,
      department: c.requisition.department.name,
      location: c.requisition.location.name,
      source: c.source?.name ?? "Direct",
      sourceDetail: c.sourceDetail ?? "",
      stage: c.currentStage.name,
      startDate: c.offers[0]?.startDate ?? null,
      hireDate: lastTransition?.movedAt ?? c.updatedAt,
      timeToFill,
    };
  });

  const columns: ColumnDef[] = [
    { header: "Name", key: "name", width: 22 },
    { header: "Title", key: "title", width: 28 },
    { header: "Req #", key: "reqNumber", width: 12 },
    { header: "Department", key: "department", width: 22 },
    { header: "Location", key: "location", width: 14 },
    { header: "Source", key: "source", width: 16 },
    { header: "Source Detail", key: "sourceDetail", width: 20 },
    { header: "Stage", key: "stage", width: 16 },
    { header: "Start Date", key: "startDate", width: 14, format: "date" },
    { header: "Hire Date", key: "hireDate", width: 14, format: "date" },
    { header: "Time to Fill (days)", key: "timeToFill", width: 16, format: "number" },
  ];

  return { rows, columns, title: "Filled Positions Report" };
}

export async function generateFilledPositionsExcel(filters?: { departmentId?: string; recruiterId?: string; quarter?: string }) {
  const { rows, columns, title } = await generateFilledPositionsReport(filters);
  return createBrandedWorkbook(title, columns, rows, {
    sheetName: "Filled Positions",
    subtitle: `Generated: ${new Date().toLocaleDateString()} | ${rows.length} positions filled`,
  });
}
