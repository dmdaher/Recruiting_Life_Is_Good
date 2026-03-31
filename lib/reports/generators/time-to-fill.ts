import { prisma } from "@/lib/db/client";
import { createBrandedWorkbook, type ColumnDef } from "@/lib/excel/exporter";

export async function generateTimeToFillReport(filters?: { departmentId?: string; recruiterId?: string }) {
  const hiredStage = await prisma.pipelineStage.findFirst({ where: { isTerminal: true } });
  if (!hiredStage) return { rows: [], columns: [], title: "Time to Fill Report" };

  const where: Record<string, unknown> = {};
  if (filters?.departmentId) where.departmentId = filters.departmentId;

  const reqs = await prisma.requisition.findMany({
    where: { ...where, dateClosed: { not: null } },
    include: {
      department: true,
      location: true,
      recruiters: { include: { user: { select: { name: true } } } },
    },
    orderBy: { dateClosed: "desc" },
  });

  const rows = reqs.map((r) => {
    const timeToFill = r.dateClosed
      ? Math.floor((r.dateClosed.getTime() - r.dateOpened.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      reqNumber: r.reqNumber,
      title: r.title,
      department: r.department.name,
      location: r.location.name,
      recruiters: r.recruiters.map((rr) => rr.user.name).join(", "),
      billable: r.billable ? "Yes" : "No",
      dateOpened: r.dateOpened,
      dateClosed: r.dateClosed,
      timeToFill,
      positionsTotal: r.positionsTotal,
      positionsFilled: r.positionsFilled,
    };
  });

  // Calculate averages
  const filledRows = rows.filter((r) => r.timeToFill !== null);
  const avgTimeToFill = filledRows.length > 0
    ? Math.round(filledRows.reduce((s, r) => s + (r.timeToFill ?? 0), 0) / filledRows.length)
    : 0;

  const columns: ColumnDef[] = [
    { header: "Req #", key: "reqNumber", width: 12 },
    { header: "Title", key: "title", width: 28 },
    { header: "Department", key: "department", width: 22 },
    { header: "Location", key: "location", width: 14 },
    { header: "Recruiter(s)", key: "recruiters", width: 24 },
    { header: "Billable", key: "billable", width: 10 },
    { header: "Date Opened", key: "dateOpened", width: 14, format: "date" },
    { header: "Date Closed", key: "dateClosed", width: 14, format: "date" },
    { header: "Time to Fill (days)", key: "timeToFill", width: 16, format: "number" },
    { header: "Positions", key: "positionsTotal", width: 10, format: "number" },
    { header: "Filled", key: "positionsFilled", width: 8, format: "number" },
  ];

  return { rows, columns, title: "Time to Fill Report", avgTimeToFill };
}

export async function generateTimeToFillExcel(filters?: { departmentId?: string; recruiterId?: string }) {
  const { rows, columns, title, avgTimeToFill } = await generateTimeToFillReport(filters);
  return createBrandedWorkbook(title, columns, rows, {
    sheetName: "Time to Fill",
    subtitle: `Generated: ${new Date().toLocaleDateString()} | Avg time to fill: ${avgTimeToFill} days`,
  });
}
