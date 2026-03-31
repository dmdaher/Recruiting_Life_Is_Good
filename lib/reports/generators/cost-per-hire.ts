import { prisma } from "@/lib/db/client";
import { createBrandedWorkbook, type ColumnDef } from "@/lib/excel/exporter";

export async function generateCostPerHireReport() {
  const [fees, config, hiredStage, departments] = await Promise.all([
    prisma.agencyFee.findMany({ include: { agency: true, department: true } }),
    prisma.costPerHireConfig.findFirst({ orderBy: { effectiveDate: "desc" } }),
    prisma.pipelineStage.findFirst({ where: { isTerminal: true } }),
    prisma.department.findMany(),
  ]);

  const hireCount = hiredStage
    ? await prisma.candidate.count({ where: { currentStageId: hiredStage.id } })
    : 0;

  const totalAgencyFees = fees.reduce((s, f) => s + f.amount, 0);
  const payrollCost = config?.payrollCost ?? 0;
  const toolsCost = config?.toolsCost ?? 0;
  const totalCost = totalAgencyFees + payrollCost + toolsCost;
  const costPerHire = hireCount > 0 ? totalCost / hireCount : 0;

  // By department
  const byDept = departments.map((dept) => {
    const deptFees = fees.filter((f) => f.departmentId === dept.id).reduce((s, f) => s + f.amount, 0);
    return {
      department: dept.name, agencyFees: deptFees, payroll: payrollCost / departments.length,
      tools: toolsCost / departments.length, totalCost: deptFees + (payrollCost + toolsCost) / departments.length,
      hires: 0, costPerHire: 0,
    };
  }).filter((d) => d.agencyFees > 0);

  const summaryRows = [
    { department: "TOTAL", agencyFees: totalAgencyFees, payroll: payrollCost, tools: toolsCost, totalCost, hires: hireCount, costPerHire },
    ...byDept,
  ];

  const columns: ColumnDef[] = [
    { header: "Department", key: "department", width: 22 },
    { header: "Agency Fees", key: "agencyFees", width: 14, format: "currency" },
    { header: "Payroll Cost", key: "payroll", width: 14, format: "currency" },
    { header: "Tools Cost", key: "tools", width: 14, format: "currency" },
    { header: "Total Cost", key: "totalCost", width: 14, format: "currency" },
    { header: "Hires", key: "hires", width: 10, format: "number" },
    { header: "Cost per Hire", key: "costPerHire", width: 14, format: "currency" },
  ];

  return { rows: summaryRows, columns, title: "Cost per Hire Report" };
}

export async function generateCostPerHireExcel() {
  const { rows, columns, title } = await generateCostPerHireReport();
  return createBrandedWorkbook(title, columns, rows, { sheetName: "Cost per Hire" });
}
