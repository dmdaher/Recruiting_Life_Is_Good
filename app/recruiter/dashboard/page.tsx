import { prisma } from "@/lib/db/client";
import { MyCandidatesToday } from "@/components/dashboard/MyCandidatesToday";
import { MyNumbers } from "@/components/dashboard/MyNumbers";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { NewCandidates } from "@/components/dashboard/NewCandidates";

export default async function RecruiterDashboard() {
  const devUser = await prisma.user.findFirst({ where: { role: "RECRUITER" } });

  // Fetch real data from the database
  const [candidates, reqs, stages, recentCandidates, sources, allUsers] = await Promise.all([
    prisma.candidate.findMany({
      include: {
        currentStage: true,
        requisition: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.requisition.findMany({
      where: { status: "OPEN" },
      include: {
        candidates: { include: { currentStage: true } },
        recruiters: { include: { user: true } },
        department: true,
        location: true,
      },
    }),
    prisma.pipelineStage.findMany({ orderBy: { order: "asc" } }),
    prisma.candidate.findMany({
      where: {
        appliedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      include: { requisition: true, source: true },
      orderBy: { appliedAt: "desc" },
      take: 5,
    }),
    prisma.source.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { isActive: true }, select: { id: true, name: true, role: true } }),
  ]);

  // Calculate metrics
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const interviewStage = stages.find((s) => s.name === "Interview");
  const debriefStage = stages.find((s) => s.name === "Debrief");
  const offerExtStage = stages.find((s) => s.name === "Offer Extended");
  const hiredStage = stages.find((s) => s.name === "Hired");

  const candidatesNeedingAction = candidates.filter((c) => {
    const daysSinceUpdate =
      (now.getTime() - c.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 2 && !c.currentStage.isTerminal;
  });

  const interviewsToday = candidates.filter(
    (c) => c.currentStage.name === "Interview"
  );

  const awaitingDecision = candidates.filter(
    (c) =>
      c.currentStage.name === "Debrief" ||
      c.currentStage.name === "Offer Extended"
  );

  // Pipeline counts for numbers panel
  const pipelineCounts = stages.map((stage) => ({
    name: stage.name,
    count: candidates.filter((c) => c.currentStageId === stage.id).length,
  }));

  const totalSubmittals = candidates.filter(
    (c) => c.currentStage.order >= 2
  ).length;
  const totalInterviews = candidates.filter(
    (c) => c.currentStage.order >= 4
  ).length;
  const totalHires = candidates.filter((c) => c.currentStage.isTerminal).length;

  // Alerts
  const alerts: { type: "warning" | "danger"; message: string }[] = [];

  candidatesNeedingAction.forEach((c) => {
    const days = Math.floor(
      (now.getTime() - c.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    alerts.push({
      type: days > 5 ? "danger" : "warning",
      message: `${c.firstName} ${c.lastName} — no activity for ${days} days (${c.currentStage.name})`,
    });
  });

  reqs.forEach((req) => {
    if (req.targetDate && req.targetDate < now) {
      alerts.push({
        type: "danger",
        message: `REQ-${req.reqNumber} "${req.title}" — target date missed`,
      });
    } else if (
      req.targetDate &&
      req.targetDate < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    ) {
      alerts.push({
        type: "warning",
        message: `REQ-${req.reqNumber} "${req.title}" — target date approaching`,
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-denali-gray-100">Dashboard</h1>
        <p className="text-sm text-denali-gray-500 mt-1">
          Your recruiting activity at a glance
        </p>
      </div>

      {/* Hero: My Candidates Today */}
      <MyCandidatesToday
        needsFollowUp={candidatesNeedingAction.map((c) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          days: Math.floor(
            (now.getTime() - c.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
          ),
          stage: c.currentStage.name,
          reqTitle: c.requisition.title,
        }))}
        interviewsToday={interviewsToday.map((c) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          reqTitle: c.requisition.title,
        }))}
        awaitingDecision={awaitingDecision.map((c) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          stage: c.currentStage.name,
          reqTitle: c.requisition.title,
        }))}
      />

      {/* Second Row: Numbers + New Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MyNumbers
          submittals={totalSubmittals}
          interviews={totalInterviews}
          hires={totalHires}
          openReqs={reqs.length}
          pipelineCounts={pipelineCounts}
        />
        <NewCandidates
          candidates={recentCandidates.map((c) => ({
            id: c.id,
            name: `${c.firstName} ${c.lastName}`,
            reqTitle: c.requisition.title,
            source: c.source?.name ?? "Direct",
            appliedAt: c.appliedAt.toISOString(),
          }))}
        />
      </div>

      {/* Third Row: Alerts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsPanel alerts={alerts} />
        <QuickActions
          requisitions={reqs.map((r) => ({ id: r.id, reqNumber: r.reqNumber, title: r.title }))}
          sources={sources.map((s) => ({ id: s.id, name: s.name }))}
          userId={devUser?.id ?? ""}
        />
      </div>
    </div>
  );
}
