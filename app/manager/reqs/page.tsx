import { prisma } from "@/lib/db/client";
import Link from "next/link";

export default async function ManagerReqsPage() {
  const hm = await prisma.user.findFirst({ where: { role: "HIRING_MANAGER" } });

  const reqs = await prisma.requisition.findMany({
    where: { hiringManagerId: hm?.id },
    include: {
      department: true,
      location: true,
      recruiters: { include: { user: { select: { name: true } } } },
      candidates: { include: { currentStage: true } },
    },
    orderBy: { dateOpened: "desc" },
  });

  const now = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-denali-gray-100">My Requisitions</h1>
        <p className="text-sm text-denali-gray-500 mt-1">{reqs.length} requisitions</p>
      </div>

      {reqs.length === 0 ? (
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-12 text-center">
          <p className="text-sm text-denali-gray-600">No requisitions assigned to you</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reqs.map((req) => {
            const daysOpen = Math.floor((now.getTime() - req.dateOpened.getTime()) / (1000 * 60 * 60 * 24));
            const targetMissed = req.targetDate && req.targetDate < now;
            const submittedCount = req.candidates.filter((c) => c.currentStage.name === "Submitted").length;
            const stages = ["Sourced", "Submitted", "Screen", "Interview", "Debrief", "Offer Extended", "Offer Accepted", "Hired"];

            return (
              <Link key={req.id} href={`/manager/reqs/${req.id}`} className="block bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-5 hover:border-denali-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-denali-cyan">{req.reqNumber}</span>
                      <h3 className="text-sm font-medium text-denali-gray-200">{req.title}</h3>
                    </div>
                    <p className="text-xs text-denali-gray-500 mt-1">
                      {req.department.name} &middot; {req.location.name} &middot; {req.billable ? "Billable" : "Non-Billable"}
                    </p>
                    <p className="text-xs text-denali-gray-600 mt-0.5">
                      Recruiters: {req.recruiters.map((r) => r.user.name).join(", ") || "None assigned"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      req.status === "OPEN" ? "bg-green-900/30 text-green-400" :
                      req.status === "ON_HOLD" ? "bg-yellow-900/30 text-yellow-400" :
                      req.status === "CLOSED" ? "bg-denali-gray-700 text-denali-gray-500" :
                      "bg-blue-900/30 text-blue-400"
                    }`}>{req.status.replace("_", " ")}</span>
                    <p className={`text-xs mt-1 ${targetMissed ? "text-denali-danger" : "text-denali-gray-500"}`}>
                      {daysOpen}d open {targetMissed && "· Target missed"}
                    </p>
                    {submittedCount > 0 && (
                      <p className="text-xs text-denali-warning mt-0.5">{submittedCount} awaiting your review</p>
                    )}
                  </div>
                </div>

                {/* Pipeline distribution */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 flex gap-0.5">
                    {stages.map((stageName) => {
                      const count = req.candidates.filter((c) => c.currentStage.name === stageName).length;
                      return (
                        <div key={stageName} className="flex-1">
                          <div className={`h-2 rounded-sm ${count > 0 ? "bg-denali-cyan" : "bg-denali-gray-800"}`} />
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-xs text-denali-gray-500">{req.candidates.length}/{req.positionsTotal} candidates</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
