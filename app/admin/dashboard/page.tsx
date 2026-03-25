import { prisma } from "@/lib/db/client";

export default async function AdminDashboard() {
  const [candidates, reqs, stages, users] = await Promise.all([
    prisma.candidate.findMany({
      include: { currentStage: true, requisition: true, source: true },
    }),
    prisma.requisition.findMany({
      where: { status: "OPEN" },
      include: { candidates: true, recruiters: { include: { user: true } } },
    }),
    prisma.pipelineStage.findMany({ orderBy: { order: "asc" } }),
    prisma.user.findMany({ where: { role: "RECRUITER", isActive: true } }),
  ]);

  // Leaderboard data
  const leaderboard = users.map((recruiter) => {
    const recruiterReqIds = reqs
      .filter((r) => r.recruiters.some((rr) => rr.userId === recruiter.id))
      .map((r) => r.id);
    const recruiterCandidates = candidates.filter((c) =>
      recruiterReqIds.includes(c.requisitionId)
    );
    return {
      name: recruiter.name,
      submittals: recruiterCandidates.filter((c) => c.currentStage.order >= 2).length,
      interviews: recruiterCandidates.filter((c) => c.currentStage.order >= 4).length,
      hires: recruiterCandidates.filter((c) => c.currentStage.isTerminal).length,
      activeReqs: recruiterReqIds.length,
    };
  }).sort((a, b) => b.submittals - a.submittals);

  // Pipeline funnel
  const funnel = stages.map((stage) => ({
    name: stage.name,
    count: candidates.filter((c) => c.currentStageId === stage.id).length,
  }));
  const totalCandidates = candidates.length;

  // Source effectiveness
  const sourceStats = candidates.reduce((acc, c) => {
    const sourceName = c.source?.name ?? "Direct";
    if (!acc[sourceName]) acc[sourceName] = { total: 0, hired: 0 };
    acc[sourceName].total++;
    if (c.currentStage.isTerminal) acc[sourceName].hired++;
    return acc;
  }, {} as Record<string, { total: number; hired: number }>);

  const sourceEffectiveness = Object.entries(sourceStats)
    .map(([name, stats]) => ({ name, ...stats, rate: stats.total > 0 ? Math.round((stats.hired / stats.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total);

  // KPIs
  const now = new Date();
  const staleReqs = reqs.filter((r) => {
    const daysOpen = (now.getTime() - r.dateOpened.getTime()) / (1000 * 60 * 60 * 24);
    return daysOpen > 30 && r.candidates.length === 0;
  });
  const missedTargets = reqs.filter((r) => r.targetDate && r.targetDate < now);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-denali-gray-100">Team Dashboard</h1>
        <p className="text-sm text-denali-gray-500 mt-1">Recruiting performance overview</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open Reqs", value: reqs.length, color: "text-denali-cyan" },
          { label: "Total Candidates", value: totalCandidates, color: "text-blue-400" },
          { label: "Missed Targets", value: missedTargets.length, color: missedTargets.length > 0 ? "text-denali-danger" : "text-denali-success" },
          { label: "Stale Reqs (30d+)", value: staleReqs.length, color: staleReqs.length > 0 ? "text-denali-warning" : "text-denali-success" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-5 text-center">
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-denali-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruiter Leaderboard */}
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
          <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">Recruiter Leaderboard</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-denali-gray-800">
                <th className="text-left pb-2 text-xs font-medium text-denali-gray-500 uppercase">Recruiter</th>
                <th className="text-right pb-2 text-xs font-medium text-denali-gray-500 uppercase">Reqs</th>
                <th className="text-right pb-2 text-xs font-medium text-denali-gray-500 uppercase">Submittals</th>
                <th className="text-right pb-2 text-xs font-medium text-denali-gray-500 uppercase">Interviews</th>
                <th className="text-right pb-2 text-xs font-medium text-denali-gray-500 uppercase">Hires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-denali-gray-800">
              {leaderboard.map((r, i) => (
                <tr key={r.name} className="hover:bg-denali-gray-800/50">
                  <td className="py-2.5 text-sm">
                    <span className="text-denali-gray-500 mr-2">#{i + 1}</span>
                    <span className="text-denali-gray-200 font-medium">{r.name.replace("Dev ", "")}</span>
                  </td>
                  <td className="py-2.5 text-sm text-right text-denali-gray-400">{r.activeReqs}</td>
                  <td className="py-2.5 text-sm text-right text-blue-400 font-mono">{r.submittals}</td>
                  <td className="py-2.5 text-sm text-right text-purple-400 font-mono">{r.interviews}</td>
                  <td className="py-2.5 text-sm text-right text-denali-success font-mono">{r.hires}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pipeline Funnel */}
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
          <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">Pipeline Funnel</h2>
          <div className="space-y-3">
            {funnel.map((stage, i) => {
              const pct = totalCandidates > 0 ? (stage.count / totalCandidates) * 100 : 0;
              const prevCount = i > 0 ? funnel[i - 1].count : stage.count;
              const convRate = prevCount > 0 && i > 0 ? Math.round((stage.count / prevCount) * 100) : null;
              return (
                <div key={stage.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-denali-gray-300">{stage.name}</span>
                    <div className="flex items-center gap-2">
                      {convRate !== null && (
                        <span className="text-xs text-denali-gray-600">{convRate}%</span>
                      )}
                      <span className="text-sm font-mono text-denali-gray-200">{stage.count}</span>
                    </div>
                  </div>
                  <div className="h-3 bg-denali-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-denali-cyan to-denali-cyan/60 rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Source Effectiveness */}
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
        <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">Source Effectiveness</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sourceEffectiveness.map((s) => (
            <div key={s.name} className="bg-denali-gray-800 rounded-lg p-4">
              <p className="text-sm font-medium text-denali-gray-200">{s.name}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-denali-cyan">{s.total}</span>
                <span className="text-xs text-denali-gray-500">candidates</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm font-mono text-denali-success">{s.hired}</span>
                <span className="text-xs text-denali-gray-500">hired</span>
                {s.total > 0 && (
                  <span className="text-xs text-denali-gray-600 ml-auto">{s.rate}% rate</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
