import { prisma } from "@/lib/db/client";
import { AdvanceButton, PassButton } from "@/components/manager/ReviewActions";

export default async function ManagerDashboard() {
  // In production, this would be scoped to the logged-in HM's user ID
  const hm = await prisma.user.findFirst({ where: { role: "HIRING_MANAGER" } });

  const reqs = await prisma.requisition.findMany({
    where: { hiringManagerId: hm?.id },
    include: {
      department: true,
      location: true,
      candidates: {
        include: { currentStage: true, offers: { where: { status: "DRAFT" }, take: 1 } },
      },
      recruiters: { include: { user: true } },
    },
    orderBy: { dateOpened: "desc" },
  });

  const screenStage = await prisma.pipelineStage.findFirst({ where: { name: "Screen" } });

  const now = new Date();
  const candidatesToReview = reqs.flatMap((r) =>
    r.candidates
      .filter((c) => c.currentStage.name === "Submitted")
      .map((c) => ({ ...c, reqTitle: r.title, reqNumber: r.reqNumber }))
  );

  const offersToApprove = reqs.flatMap((r) =>
    r.candidates
      .filter((c) => c.offers.length > 0)
      .map((c) => ({ ...c, reqTitle: r.title, reqNumber: r.reqNumber, offer: c.offers[0] }))
  );

  const totalCandidates = reqs.reduce((sum, r) => sum + r.candidates.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-denali-gray-100">My Hiring Dashboard</h1>
        <p className="text-sm text-denali-gray-500 mt-1">
          {reqs.length} open requisitions &middot; {totalCandidates} total candidates
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-5 text-center">
          <p className="text-3xl font-bold text-denali-cyan">{reqs.length}</p>
          <p className="text-xs text-denali-gray-500 mt-1">My Open Requisitions</p>
        </div>
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-5 text-center">
          <p className={`text-3xl font-bold ${candidatesToReview.length > 0 ? "text-denali-warning" : "text-denali-success"}`}>
            {candidatesToReview.length}
          </p>
          <p className="text-xs text-denali-gray-500 mt-1">Candidates to Review</p>
        </div>
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-5 text-center">
          <p className={`text-3xl font-bold ${offersToApprove.length > 0 ? "text-purple-400" : "text-denali-gray-400"}`}>
            {offersToApprove.length}
          </p>
          <p className="text-xs text-denali-gray-500 mt-1">Offers to Approve</p>
        </div>
      </div>

      {/* Candidates to Review */}
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
        <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">Candidates Awaiting Your Review</h2>
        {candidatesToReview.length === 0 ? (
          <p className="text-sm text-denali-gray-600 text-center py-8">No candidates waiting for review — all caught up</p>
        ) : (
          <div className="space-y-3">
            {candidatesToReview.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-denali-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-denali-gray-200">{c.firstName} {c.lastName}</p>
                  <p className="text-xs text-denali-gray-500 mt-0.5">{c.reqNumber} &middot; {c.reqTitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <AdvanceButton candidateId={c.id} toStageId={screenStage?.id ?? ""} userId={hm?.id ?? ""} />
                  <PassButton candidateId={c.id} userId={hm?.id ?? ""} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Requisitions */}
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
        <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">My Requisitions</h2>
        <div className="space-y-3">
          {reqs.map((req) => {
            const daysOpen = Math.floor((now.getTime() - req.dateOpened.getTime()) / (1000 * 60 * 60 * 24));
            const targetMissed = req.targetDate && req.targetDate < now;
            return (
              <div key={req.id} className="p-4 bg-denali-gray-800 rounded-lg hover:bg-denali-gray-700 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-denali-gray-200">{req.title}</p>
                    <p className="text-xs text-denali-gray-500 mt-0.5">
                      {req.reqNumber} &middot; {req.department.name} &middot; {req.location.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-denali-gray-300">{req.candidates.length}/{req.positionsTotal}</p>
                    <p className={`text-xs mt-0.5 ${targetMissed ? "text-denali-danger" : "text-denali-gray-500"}`}>
                      {daysOpen}d open {targetMissed && "· Target missed"}
                    </p>
                  </div>
                </div>
                {/* Mini pipeline */}
                <div className="flex gap-1 mt-3">
                  {["Sourced", "Submitted", "Screen", "Interview", "Debrief", "Offer Extended", "Offer Accepted", "Hired"].map((stageName) => {
                    const count = req.candidates.filter((c) => c.currentStage.name === stageName).length;
                    return (
                      <div key={stageName} className="flex-1 text-center">
                        <div className={`h-1.5 rounded-full ${count > 0 ? "bg-denali-cyan" : "bg-denali-gray-700"}`} />
                        <p className="text-[9px] text-denali-gray-600 mt-1">{count > 0 ? count : ""}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
