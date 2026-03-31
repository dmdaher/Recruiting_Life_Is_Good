import { prisma } from "@/lib/db/client";
import { createBrandedWorkbook, type ColumnDef } from "@/lib/excel/exporter";

export async function generateAgencyFeesReport(filters?: { quarter?: string }) {
  const where: Record<string, unknown> = {};
  if (filters?.quarter) where.quarter = filters.quarter;

  const fees = await prisma.agencyFee.findMany({
    where,
    include: { agency: true, department: true },
    orderBy: [{ quarter: "desc" }, { agency: { name: "asc" } }],
  });

  const budgets = await prisma.recruitingBudget.findMany({
    include: { department: true },
  });

  const rows = fees.map((f) => {
    const budget = budgets.find((b) => b.departmentId === f.departmentId && b.quarter === f.quarter);
    return {
      agency: f.agency.name,
      department: f.department.name,
      quarter: f.quarter,
      amount: f.amount,
      invoiceDate: f.invoiceDate,
      budget: budget?.budgetAmount ?? null,
      variance: budget ? f.amount - budget.budgetAmount : null,
    };
  });

  // Summary by agency
  const agencySummary = Object.entries(
    fees.reduce((acc, f) => {
      if (!acc[f.agency.name]) acc[f.agency.name] = { total: 0, count: 0 };
      acc[f.agency.name].total += f.amount;
      acc[f.agency.name].count++;
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).map(([name, data]) => ({
    agency: name,
    department: "",
    quarter: "TOTAL",
    amount: data.total,
    invoiceDate: null,
    budget: null,
    variance: null,
  }));

  const allRows = [...rows, ...agencySummary];

  const columns: ColumnDef[] = [
    { header: "Agency", key: "agency", width: 24 },
    { header: "Department", key: "department", width: 22 },
    { header: "Quarter", key: "quarter", width: 12 },
    { header: "Fee Amount", key: "amount", width: 14, format: "currency" },
    { header: "Invoice Date", key: "invoiceDate", width: 14, format: "date" },
    { header: "Budget", key: "budget", width: 14, format: "currency" },
    { header: "Variance", key: "variance", width: 14, format: "currency" },
  ];

  return { rows: allRows, columns, title: "Agency Fees Report" };
}

export async function generateAgencyFeesExcel(filters?: { quarter?: string }) {
  const { rows, columns, title } = await generateAgencyFeesReport(filters);
  return createBrandedWorkbook(title, columns, rows, {
    sheetName: "Agency Fees",
    subtitle: `Generated: ${new Date().toLocaleDateString()} | ${rows.length} fee records`,
  });
}
