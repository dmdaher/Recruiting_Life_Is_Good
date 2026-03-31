import { prisma } from "@/lib/db/client";
import { createBrandedWorkbook, type ColumnDef } from "@/lib/excel/exporter";

export async function generateYTDPerformanceReport() {
  const users = await prisma.user.findMany({ where: { role: "RECRUITER", isActive: true } });
  const stages = await prisma.pipelineStage.findMany({ orderBy: { order: "asc" } });
  const reqs = await prisma.requisition.findMany({
    include: {
      recruiters: true,
      candidates: { include: { currentStage: true, source: true } },
    },
  });

  const rows = users.map((recruiter) => {
    const recruiterReqIds = reqs
      .filter((r) => r.recruiters.some((rr) => rr.userId === recruiter.id))
      .map((r) => r.id);

    const candidates = reqs
      .flatMap((r) => r.candidates)
      .filter((c) => recruiterReqIds.includes(c.requisitionId));

    const submittals = candidates.filter((c) => c.currentStage.order >= 2).length;
    const interviews = candidates.filter((c) => c.currentStage.order >= 4).length;
    const hires = candidates.filter((c) => c.currentStage.isTerminal).length;
    const conversionRate = submittals > 0 ? Math.round((hires / submittals) * 100) : 0;

    return {
      recruiter: recruiter.name,
      activeReqs: recruiterReqIds.length,
      totalCandidates: candidates.length,
      submittals,
      interviews,
      hires,
      conversionRate,
      submitToInterview: submittals > 0 ? Math.round((interviews / submittals) * 100) : 0,
      interviewToHire: interviews > 0 ? Math.round((hires / interviews) * 100) : 0,
    };
  });

  // Sort by hires descending
  rows.sort((a, b) => b.hires - a.hires);

  // Add totals row
  const totals = {
    recruiter: "TOTAL",
    activeReqs: rows.reduce((s, r) => s + r.activeReqs, 0),
    totalCandidates: rows.reduce((s, r) => s + r.totalCandidates, 0),
    submittals: rows.reduce((s, r) => s + r.submittals, 0),
    interviews: rows.reduce((s, r) => s + r.interviews, 0),
    hires: rows.reduce((s, r) => s + r.hires, 0),
    conversionRate: 0,
    submitToInterview: 0,
    interviewToHire: 0,
  };
  totals.conversionRate = totals.submittals > 0 ? Math.round((totals.hires / totals.submittals) * 100) : 0;
  totals.submitToInterview = totals.submittals > 0 ? Math.round((totals.interviews / totals.submittals) * 100) : 0;
  totals.interviewToHire = totals.interviews > 0 ? Math.round((totals.hires / totals.interviews) * 100) : 0;

  rows.push(totals);

  const columns: ColumnDef[] = [
    { header: "Recruiter", key: "recruiter", width: 22 },
    { header: "Active Reqs", key: "activeReqs", width: 12, format: "number" },
    { header: "Total Candidates", key: "totalCandidates", width: 16, format: "number" },
    { header: "Submittals", key: "submittals", width: 12, format: "number" },
    { header: "Interviews", key: "interviews", width: 12, format: "number" },
    { header: "Hires", key: "hires", width: 10, format: "number" },
    { header: "Submit→Hire %", key: "conversionRate", width: 14, format: "percentage" },
    { header: "Submit→Interview %", key: "submitToInterview", width: 16, format: "percentage" },
    { header: "Interview→Hire %", key: "interviewToHire", width: 16, format: "percentage" },
  ];

  return { rows, columns, title: "YTD Performance Report" };
}

export async function generateYTDPerformanceExcel() {
  const { rows, columns, title } = await generateYTDPerformanceReport();
  return createBrandedWorkbook(title, columns, rows, {
    sheetName: "YTD Performance",
    subtitle: `Generated: ${new Date().toLocaleDateString()} | Recruiter performance YTD`,
  });
}
