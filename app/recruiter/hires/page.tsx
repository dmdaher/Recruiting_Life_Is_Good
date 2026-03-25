import { prisma } from "@/lib/db/client";

export default async function HiresPage() {
  const hiredStage = await prisma.pipelineStage.findFirst({ where: { name: "Hired" } });
  const offerAcceptedStage = await prisma.pipelineStage.findFirst({ where: { name: "Offer Accepted" } });

  const hiredCandidates = await prisma.candidate.findMany({
    where: {
      currentStageId: { in: [hiredStage?.id, offerAcceptedStage?.id].filter(Boolean) as string[] },
    },
    include: {
      requisition: { include: { department: true, location: true } },
      source: true,
      offers: { take: 1, orderBy: { createdAt: "desc" } },
      currentStage: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-denali-gray-100">Filled Positions</h1>
        <p className="text-sm text-denali-gray-500 mt-1">{hiredCandidates.length} hires tracked</p>
      </div>

      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-denali-gray-800">
                {["Name", "Title", "Department", "Location", "Source", "Stage", "Date"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-denali-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-denali-gray-800">
              {hiredCandidates.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-denali-gray-600">No hires yet — candidates reaching &quot;Hired&quot; stage will appear here</td></tr>
              ) : (
                hiredCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-denali-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-denali-gray-200">{c.firstName} {c.lastName}</td>
                    <td className="px-4 py-3 text-sm text-denali-gray-400">{c.requisition.title}</td>
                    <td className="px-4 py-3 text-sm text-denali-gray-400">{c.requisition.department.name}</td>
                    <td className="px-4 py-3 text-sm text-denali-gray-400">{c.requisition.location.name}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-denali-gray-800 text-denali-gray-400">{c.source?.name ?? "Direct"}</span></td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-green-900/30 text-green-400">{c.currentStage.name}</span></td>
                    <td className="px-4 py-3 text-sm text-denali-gray-500">{c.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
