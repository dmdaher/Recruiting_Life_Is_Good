import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import { AdvanceButton, PassButton } from "@/components/manager/ReviewActions";

export default async function ManagerReqDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const req = await prisma.requisition.findUnique({
    where: { id },
    include: {
      department: true,
      location: true,
      hiringManager: true,
      recruiters: { include: { user: { select: { name: true } } } },
      candidates: {
        include: {
          currentStage: true,
          source: true,
          interviews: { orderBy: { scheduledAt: "desc" }, take: 1 },
          offers: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!req) notFound();

  const screenStage = await prisma.pipelineStage.findFirst({ where: { name: "Screen" } });
  const now = new Date();
  const daysOpen = Math.floor((now.getTime() - req.dateOpened.getTime()) / (1000 * 60 * 60 * 24));

  // Group candidates by stage
  const stages = ["Sourced", "Submitted", "Screen", "Interview", "Debrief", "Offer Extended", "Offer Accepted", "Hired"];
  const candidatesByStage = stages.map((name) => ({
    name,
    candidates: req.candidates.filter((c) => c.currentStage.name === name),
  })).filter((g) => g.candidates.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-denali-cyan">{req.reqNumber}</span>
            <h1 className="text-2xl font-bold text-denali-gray-100">{req.title}</h1>
          </div>
          <p className="text-sm text-denali-gray-500 mt-1">
            {req.department.name} &middot; {req.location.name} &middot; {daysOpen}d open &middot; {req.candidates.length}/{req.positionsTotal} candidates
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            req.status === "OPEN" ? "bg-green-900/30 text-green-400" : "bg-denali-gray-700 text-denali-gray-400"
          }`}>{req.status.replace("_", " ")}</span>
          {req.payRangeMin && req.payRangeMax && (
            <p className="text-xs text-denali-gray-500 mt-1">${(req.payRangeMin / 1000).toFixed(0)}k – ${(req.payRangeMax / 1000).toFixed(0)}k</p>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Candidates", value: req.candidates.length, color: "text-denali-cyan" },
          { label: "Awaiting Review", value: req.candidates.filter((c) => c.currentStage.name === "Submitted").length, color: "text-denali-warning" },
          { label: "In Interview", value: req.candidates.filter((c) => c.currentStage.name === "Interview").length, color: "text-purple-400" },
          { label: "Offers", value: req.candidates.filter((c) => ["Offer Extended", "Offer Accepted"].includes(c.currentStage.name)).length, color: "text-denali-success" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-4 text-center">
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-denali-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Candidates by Stage */}
      {candidatesByStage.map((group) => (
        <div key={group.name} className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
          <h2 className="text-sm font-semibold text-denali-gray-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-denali-cyan" />
            {group.name}
            <span className="text-xs text-denali-gray-500 font-normal">({group.candidates.length})</span>
          </h2>
          <div className="space-y-3">
            {group.candidates.map((c) => {
              const daysSinceUpdate = Math.floor((now.getTime() - c.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
              const lastInterview = c.interviews[0];
              const lastOffer = c.offers[0];

              return (
                <div key={c.id} className="flex items-center justify-between p-4 bg-denali-gray-800 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-denali-gray-200">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-denali-gray-500 mt-0.5">
                      {c.source?.name ?? "Direct"} &middot; {daysSinceUpdate}d in stage
                      {lastInterview && ` · Interview ${lastInterview.outcome}`}
                      {lastOffer && ` · Offer ${lastOffer.status}`}
                    </p>
                    {c.notes && <p className="text-xs text-denali-gray-600 mt-1 italic">{c.notes.slice(0, 100)}</p>}
                  </div>

                  {/* Actions based on stage */}
                  <div className="flex items-center gap-2 ml-4">
                    {group.name === "Submitted" && screenStage && (
                      <>
                        <AdvanceButton candidateId={c.id} toStageId={screenStage.id} userId={req.hiringManagerId} />
                        <PassButton candidateId={c.id} userId={req.hiringManagerId} />
                      </>
                    )}
                    {group.name === "Debrief" && (
                      <span className="text-xs px-2 py-1 bg-purple-900/30 text-purple-400 rounded">Decision needed</span>
                    )}
                    {(group.name === "Offer Extended" || group.name === "Offer Accepted") && (
                      <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded">{c.currentStage.name}</span>
                    )}
                    {group.name === "Hired" && (
                      <span className="text-xs px-2 py-1 bg-denali-success/20 text-denali-success rounded">Hired</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {req.candidates.length === 0 && (
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-12 text-center">
          <p className="text-sm text-denali-gray-600">No candidates yet for this requisition</p>
        </div>
      )}
    </div>
  );
}
