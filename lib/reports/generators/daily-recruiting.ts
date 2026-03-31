import { prisma } from "@/lib/db/client";
import { createBrandedWorkbook, type ColumnDef } from "@/lib/excel/exporter";

export async function generateDailyRecruitingReport() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [transitions, interviews, offers] = await Promise.all([
    prisma.stageTransition.findMany({
      where: { movedAt: { gte: today, lt: tomorrow } },
      include: {
        candidate: { select: { firstName: true, lastName: true } },
        toStage: { select: { name: true } },
        movedBy: { select: { name: true } },
      },
    }),
    prisma.interview.findMany({
      where: { scheduledAt: { gte: today, lt: tomorrow } },
      include: { candidate: { select: { firstName: true, lastName: true } } },
    }),
    prisma.offer.findMany({
      where: { createdAt: { gte: today, lt: tomorrow } },
      include: { candidate: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  const rows = [
    ...transitions.map((t) => ({
      time: t.movedAt, type: "Stage Move", candidate: `${t.candidate.firstName} ${t.candidate.lastName}`,
      detail: `→ ${t.toStage.name}`, by: t.movedBy.name,
    })),
    ...interviews.map((i) => ({
      time: i.scheduledAt, type: "Interview", candidate: `${i.candidate.firstName} ${i.candidate.lastName}`,
      detail: i.type, by: "",
    })),
    ...offers.map((o) => ({
      time: o.createdAt, type: "Offer Created", candidate: `${o.candidate.firstName} ${o.candidate.lastName}`,
      detail: o.status, by: "",
    })),
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const columns: ColumnDef[] = [
    { header: "Time", key: "time", width: 18, format: "date" },
    { header: "Type", key: "type", width: 14 },
    { header: "Candidate", key: "candidate", width: 22 },
    { header: "Detail", key: "detail", width: 20 },
    { header: "By", key: "by", width: 18 },
  ];

  return { rows, columns, title: "Daily Recruiting Report" };
}

export async function generateDailyRecruitingExcel() {
  const { rows, columns, title } = await generateDailyRecruitingReport();
  return createBrandedWorkbook(title, columns, rows, {
    sheetName: "Daily Report",
    subtitle: `Date: ${new Date().toLocaleDateString()} | ${rows.length} activities`,
  });
}
