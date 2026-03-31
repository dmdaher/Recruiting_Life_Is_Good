import { prisma } from "@/lib/db/client";

export default async function AdminOnboardingPage() {
  const records = await prisma.onboardingRecord.findMany({
    include: {
      candidate: { include: { requisition: { include: { department: true } } } },
      milestones: true,
    },
    orderBy: { hireDate: "asc" },
  });

  const now = new Date();
  const totalOverdue = records.reduce((sum, r) => sum + r.milestones.filter((m) => !m.completedAt && m.targetDate < now).length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-denali-gray-100">Onboarding Overview</h1>
          <p className="text-sm text-denali-gray-500 mt-1">{records.length} active &middot; {totalOverdue} overdue milestones</p>
        </div>
        <form action="/api/onboarding/escalate" method="POST">
          <button type="submit" className="px-4 py-2 bg-denali-danger/10 text-denali-danger text-sm font-medium rounded-lg hover:bg-denali-danger/20 transition-colors">
            Check Escalations
          </button>
        </form>
      </div>

      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-denali-gray-800">
              {["Candidate", "Title", "Department", "Start Date", "Status", "Progress", "Overdue", "Days Left"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-denali-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-denali-gray-800">
            {records.map((r) => {
              const completed = r.milestones.filter((m) => m.completedAt).length;
              const total = r.milestones.length;
              const overdue = r.milestones.filter((m) => !m.completedAt && m.targetDate < now).length;
              const daysLeft = r.hireDate ? Math.ceil((r.hireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

              return (
                <tr key={r.id} className="hover:bg-denali-gray-800/50">
                  <td className="px-4 py-3 text-sm font-medium text-denali-gray-200">{r.candidate.firstName} {r.candidate.lastName}</td>
                  <td className="px-4 py-3 text-sm text-denali-gray-400">{r.candidate.requisition.title}</td>
                  <td className="px-4 py-3 text-sm text-denali-gray-400">{r.candidate.requisition.department.name}</td>
                  <td className="px-4 py-3 text-sm text-denali-gray-400">{r.hireDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" }) ?? "TBD"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === "DAY1_READY" ? "bg-green-900/30 text-green-400" :
                      r.status === "PIF_PENDING" ? "bg-yellow-900/30 text-yellow-400" :
                      "bg-blue-900/30 text-blue-400"
                    }`}>{r.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-denali-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-denali-cyan rounded-full" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs text-denali-gray-500">{completed}/{total}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {overdue > 0 ? <span className="text-denali-danger font-mono">{overdue}</span> : <span className="text-denali-gray-600">0</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={`font-mono ${daysLeft !== null && daysLeft <= 3 ? "text-denali-danger" : daysLeft !== null && daysLeft <= 7 ? "text-denali-warning" : "text-denali-gray-400"}`}>
                      {daysLeft !== null ? `${daysLeft}d` : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
