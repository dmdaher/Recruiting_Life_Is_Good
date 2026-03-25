import { prisma } from "@/lib/db/client";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";

export default async function PipelinePage() {
  const [stages, candidates, reqs] = await Promise.all([
    prisma.pipelineStage.findMany({ orderBy: { order: "asc" } }),
    prisma.candidate.findMany({
      include: {
        currentStage: true,
        requisition: true,
        source: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.requisition.findMany({
      where: { status: "OPEN" },
      include: { department: true, location: true },
    }),
  ]);

  const columns = stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    order: stage.order,
    isTerminal: stage.isTerminal,
    candidates: candidates
      .filter((c) => c.currentStageId === stage.id)
      .map((c) => {
        const daysInStage = Math.floor(
          (Date.now() - c.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          reqTitle: c.requisition.title,
          reqNumber: c.requisition.reqNumber,
          source: c.source?.name ?? "Direct",
          daysInStage,
          ndaStatus: c.ndaStatus,
          appliedAt: c.appliedAt.toISOString(),
        };
      }),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-denali-gray-100">Pipeline</h1>
          <p className="text-sm text-denali-gray-500 mt-1">
            {candidates.length} candidates across {reqs.length} open requisitions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-300 focus:outline-none focus:ring-1 focus:ring-denali-cyan">
            <option value="">All Requisitions</option>
            {reqs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.reqNumber} — {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <KanbanBoard columns={columns} />
    </div>
  );
}
