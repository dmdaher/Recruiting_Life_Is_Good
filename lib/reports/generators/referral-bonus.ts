import { prisma } from "@/lib/db/client";
import { createBrandedWorkbook, type ColumnDef } from "@/lib/excel/exporter";

export async function generateReferralBonusReport() {
  const bonuses = await prisma.referralBonus.findMany({ orderBy: { createdAt: "desc" } });

  const rows = bonuses.map((b) => ({
    referrer: b.referrer, amount: b.amount, status: b.status,
    paidDate: b.paidDate, createdAt: b.createdAt,
  }));

  const columns: ColumnDef[] = [
    { header: "Referrer", key: "referrer", width: 22 },
    { header: "Amount", key: "amount", width: 14, format: "currency" },
    { header: "Status", key: "status", width: 12 },
    { header: "Paid Date", key: "paidDate", width: 14, format: "date" },
    { header: "Created", key: "createdAt", width: 14, format: "date" },
  ];

  return { rows, columns, title: "Referral Bonus Tracking Report" };
}

export async function generateReferralBonusExcel() {
  const { rows, columns, title } = await generateReferralBonusReport();
  return createBrandedWorkbook(title, columns, rows, { sheetName: "Referral Bonuses" });
}
