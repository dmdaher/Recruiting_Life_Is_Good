import { prisma } from "@/lib/db/client";
import { createBrandedWorkbook, type ColumnDef } from "@/lib/excel/exporter";

export async function generateOpenReqsReport(filters?: { departmentId?: string; recruiterId?: string }) {
  const where: Record<string, unknown> = { status: "OPEN" };
  if (filters?.departmentId) where.departmentId = filters.departmentId;
  if (filters?.recruiterId) where.recruiters = { some: { userId: filters.recruiterId } };

  const reqs = await prisma.requisition.findMany({
    where,
    include: {
      department: true,
      location: true,
      hiringManager: { select: { name: true } },
      recruiters: { include: { user: { select: { name: true } } } },
      _count: { select: { candidates: true } },
    },
    orderBy: { dateOpened: "asc" },
  });

  const now = new Date();

  const rows = reqs.map((r) => {
    const daysOpen = Math.floor((now.getTime() - r.dateOpened.getTime()) / (1000 * 60 * 60 * 24));
    const targetMissed = r.targetDate && r.targetDate < now;
    const targetApproaching = r.targetDate && !targetMissed && r.targetDate < new Date(now.getTime() + 7 * 86400000);

    return {
      reqNumber: r.reqNumber,
      title: r.title,
      department: r.department.name,
      location: r.location.name,
      hiringManager: r.hiringManager.name,
      recruiters: r.recruiters.map((rr) => rr.user.name).join(", "),
      status: r.status,
      billable: r.billable ? "Yes" : "No",
      positionsTotal: r.positionsTotal,
      positionsFilled: r.positionsFilled,
      candidates: r._count.candidates,
      daysOpen,
      payRangeMin: r.payRangeMin,
      payRangeMax: r.payRangeMax,
      targetDate: r.targetDate,
      targetStatus: targetMissed ? "MISSED" : targetApproaching ? "APPROACHING" : "On Track",
      dateOpened: r.dateOpened,
    };
  });

  const columns: ColumnDef[] = [
    { header: "Req #", key: "reqNumber", width: 12 },
    { header: "Title", key: "title", width: 28 },
    { header: "Department", key: "department", width: 22 },
    { header: "Location", key: "location", width: 14 },
    { header: "Hiring Manager", key: "hiringManager", width: 20 },
    { header: "Recruiter(s)", key: "recruiters", width: 24 },
    { header: "Billable", key: "billable", width: 10 },
    { header: "Positions", key: "positionsTotal", width: 10, format: "number" },
    { header: "Filled", key: "positionsFilled", width: 8, format: "number" },
    { header: "Candidates", key: "candidates", width: 12, format: "number" },
    { header: "Days Open", key: "daysOpen", width: 10, format: "number" },
    { header: "Pay Min", key: "payRangeMin", width: 12, format: "currency" },
    { header: "Pay Max", key: "payRangeMax", width: 12, format: "currency" },
    { header: "Target Date", key: "targetDate", width: 14, format: "date" },
    { header: "Target Status", key: "targetStatus", width: 14 },
    { header: "Date Opened", key: "dateOpened", width: 14, format: "date" },
  ];

  return { rows, columns, title: "Open Requisition Report" };
}

export async function generateOpenReqsExcel(filters?: { departmentId?: string; recruiterId?: string }) {
  const { rows, columns, title } = await generateOpenReqsReport(filters);
  return createBrandedWorkbook(title, columns, rows, {
    sheetName: "Open Reqs",
    subtitle: `Generated: ${new Date().toLocaleDateString()} | ${rows.length} open requisitions`,
  });
}
