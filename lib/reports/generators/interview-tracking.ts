import { prisma } from "@/lib/db/client";
import { createBrandedWorkbook, type ColumnDef } from "@/lib/excel/exporter";

export async function generateInterviewTrackingReport() {
  const interviews = await prisma.interview.findMany({
    include: {
      candidate: {
        include: { requisition: { select: { reqNumber: true, title: true } } },
      },
      interviewers: { include: { user: { select: { name: true } } } },
    },
    orderBy: { scheduledAt: "desc" },
  });

  const rows = interviews.map((i) => ({
    date: i.scheduledAt,
    candidate: `${i.candidate.firstName} ${i.candidate.lastName}`,
    reqNumber: i.candidate.requisition.reqNumber,
    reqTitle: i.candidate.requisition.title,
    type: i.type,
    interviewers: i.interviewers.map((iv) => iv.user.name).join(", "),
    outcome: i.outcome,
    noShow: i.noShow ? "Yes" : "No",
  }));

  const columns: ColumnDef[] = [
    { header: "Date", key: "date", width: 14, format: "date" },
    { header: "Candidate", key: "candidate", width: 22 },
    { header: "Req #", key: "reqNumber", width: 12 },
    { header: "Title", key: "reqTitle", width: 24 },
    { header: "Type", key: "type", width: 12 },
    { header: "Interviewer(s)", key: "interviewers", width: 24 },
    { header: "Outcome", key: "outcome", width: 12 },
    { header: "No-Show", key: "noShow", width: 10 },
  ];

  return { rows, columns, title: "Interview Tracking Report" };
}

export async function generateInterviewTrackingExcel() {
  const { rows, columns, title } = await generateInterviewTrackingReport();
  return createBrandedWorkbook(title, columns, rows, {
    sheetName: "Interviews",
    subtitle: `Generated: ${new Date().toLocaleDateString()} | ${rows.length} interviews tracked`,
  });
}
