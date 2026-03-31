import { prisma } from "@/lib/db/client";
import { createBrandedWorkbook, type ColumnDef } from "@/lib/excel/exporter";

export async function generateRescindedOffersReport() {
  const offers = await prisma.offer.findMany({
    where: { status: "RESCINDED" },
    include: {
      candidate: {
        include: { requisition: { include: { department: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const rows = offers.map((o) => ({
    candidate: `${o.candidate.firstName} ${o.candidate.lastName}`,
    reqNumber: o.candidate.requisition.reqNumber,
    title: o.candidate.requisition.title,
    department: o.candidate.requisition.department.name,
    rescindReason: o.rescindReason ?? "Not specified",
    rescindDate: o.updatedAt,
  }));

  const columns: ColumnDef[] = [
    { header: "Candidate", key: "candidate", width: 22 },
    { header: "Req #", key: "reqNumber", width: 12 },
    { header: "Title", key: "title", width: 24 },
    { header: "Department", key: "department", width: 20 },
    { header: "Rescind Reason", key: "rescindReason", width: 28 },
    { header: "Date", key: "rescindDate", width: 14, format: "date" },
  ];

  return { rows, columns, title: "Rescinded Offers Report" };
}

export async function generateRescindedOffersExcel() {
  const { rows, columns, title } = await generateRescindedOffersReport();
  return createBrandedWorkbook(title, columns, rows, { sheetName: "Rescinded Offers" });
}
