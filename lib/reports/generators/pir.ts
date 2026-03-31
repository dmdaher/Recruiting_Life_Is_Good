import { prisma } from "@/lib/db/client";
import { createBrandedWorkbook, type ColumnDef } from "@/lib/excel/exporter";

export async function generatePIRReport() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [newReqs, newHires, rescinded, referrals] = await Promise.all([
    prisma.requisition.findMany({
      where: { createdAt: { gte: weekAgo } },
      include: { department: true, hiringManager: { select: { name: true } } },
    }),
    prisma.offer.findMany({
      where: { status: "ACCEPTED", updatedAt: { gte: weekAgo } },
      include: { candidate: { select: { firstName: true, lastName: true } } },
    }),
    prisma.offer.findMany({
      where: { status: "RESCINDED", updatedAt: { gte: weekAgo } },
      include: { candidate: { select: { firstName: true, lastName: true } } },
    }),
    prisma.referralBonus.findMany({
      where: { createdAt: { gte: weekAgo } },
    }),
  ]);

  const rows = [
    ...newReqs.map((r) => ({
      category: "New Req", detail: `${r.reqNumber} — ${r.title}`,
      department: r.department.name, person: r.hiringManager.name, date: r.createdAt, amount: null,
    })),
    ...newHires.map((o) => ({
      category: "New Hire", detail: `${o.candidate.firstName} ${o.candidate.lastName}`,
      department: "", person: "", date: o.updatedAt, amount: o.salary,
    })),
    ...rescinded.map((o) => ({
      category: "Rescinded", detail: `${o.candidate.firstName} ${o.candidate.lastName} — ${o.rescindReason ?? "No reason"}`,
      department: "", person: "", date: o.updatedAt, amount: null,
    })),
    ...referrals.map((r) => ({
      category: "Referral Bonus", detail: r.referrer,
      department: "", person: "", date: r.createdAt, amount: r.amount.toString(),
    })),
  ];

  const columns: ColumnDef[] = [
    { header: "Category", key: "category", width: 16 },
    { header: "Detail", key: "detail", width: 32 },
    { header: "Department", key: "department", width: 20 },
    { header: "Person", key: "person", width: 18 },
    { header: "Date", key: "date", width: 14, format: "date" },
    { header: "Amount", key: "amount", width: 14 },
  ];

  return { rows, columns, title: "Payroll Impact Report (PIR)" };
}

export async function generatePIRExcel() {
  const { rows, columns, title } = await generatePIRReport();
  return createBrandedWorkbook(title, columns, rows, { sheetName: "PIR" });
}
