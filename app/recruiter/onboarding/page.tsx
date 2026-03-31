import { prisma } from "@/lib/db/client";
import Link from "next/link";

export default async function OnboardingListPage() {
  const records = await prisma.onboardingRecord.findMany({
    include: {
      candidate: { include: { requisition: { include: { department: true } } } },
      milestones: true,
    },
    orderBy: { hireDate: "asc" },
  });

  const now = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-denali-gray-100">Onboarding</h1>
        <p className="text-sm text-denali-gray-500 mt-1">{records.length} active onboardings</p>
      </div>

      {records.length === 0 ? (
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-12 text-center">
          <p className="text-sm text-denali-gray-600">No active onboardings — candidates reaching &quot;Hired&quot; stage will appear here automatically</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r) => {
            const completed = r.milestones.filter((m) => m.completedAt).length;
            const total = r.milestones.length;
            const overdue = r.milestones.filter((m) => !m.completedAt && m.targetDate < now).length;
            const daysUntilStart = r.hireDate ? Math.ceil((r.hireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

            return (
              <Link key={r.id} href={`/recruiter/onboarding/${r.id}`} className="block bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-5 hover:border-denali-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-denali-gray-200">{r.candidate.firstName} {r.candidate.lastName}</p>
                    <p className="text-xs text-denali-gray-500 mt-0.5">
                      {r.candidate.requisition.title} &middot; {r.candidate.requisition.department.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      r.status === "DAY1_READY" ? "bg-green-900/30 text-green-400" :
                      r.status === "PIF_PENDING" ? "bg-yellow-900/30 text-yellow-400" :
                      r.status === "IN_PROGRESS" ? "bg-blue-900/30 text-blue-400" :
                      "bg-denali-gray-700 text-denali-gray-400"
                    }`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                    {daysUntilStart !== null && (
                      <p className={`text-xs mt-1 ${daysUntilStart <= 3 ? "text-denali-danger" : daysUntilStart <= 7 ? "text-denali-warning" : "text-denali-gray-500"}`}>
                        {daysUntilStart > 0 ? `${daysUntilStart}d until start` : daysUntilStart === 0 ? "Starts today" : `Started ${Math.abs(daysUntilStart)}d ago`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Milestone progress bar */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-denali-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-denali-cyan rounded-full transition-all" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs text-denali-gray-500">{completed}/{total}</span>
                  {overdue > 0 && <span className="text-xs text-denali-danger">{overdue} overdue</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
