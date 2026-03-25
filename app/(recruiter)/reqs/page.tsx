import { prisma } from "@/lib/db/client";

export default async function RequisitionsPage() {
  const reqs = await prisma.requisition.findMany({
    include: {
      department: true,
      location: true,
      hiringManager: true,
      recruiters: { include: { user: true } },
      candidates: { include: { currentStage: true } },
    },
    orderBy: { dateOpened: "desc" },
  });

  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-denali-gray-100">
            Requisitions
          </h1>
          <p className="text-sm text-denali-gray-500 mt-1">
            {reqs.filter((r) => r.status === "OPEN").length} open &middot;{" "}
            {reqs.length} total
          </p>
        </div>
        <button className="px-4 py-2.5 bg-denali-cyan text-denali-black font-medium rounded-lg hover:bg-denali-cyan/90 transition-colors text-sm">
          + New Requisition
        </button>
      </div>

      {/* Requisitions Table */}
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-denali-gray-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-denali-gray-500 uppercase tracking-wider">
                  Req #
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-denali-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-denali-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-denali-gray-500 uppercase tracking-wider">
                  Recruiter(s)
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-denali-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-denali-gray-500 uppercase tracking-wider">
                  Days Open
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-denali-gray-500 uppercase tracking-wider">
                  Candidates
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-denali-gray-500 uppercase tracking-wider">
                  Pay Range
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-denali-gray-500 uppercase tracking-wider">
                  Target
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-denali-gray-800">
              {reqs.map((req) => {
                const daysOpen = Math.floor(
                  (now.getTime() - req.dateOpened.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                const targetMissed =
                  req.targetDate && req.targetDate < now;
                const targetApproaching =
                  req.targetDate &&
                  !targetMissed &&
                  req.targetDate <
                    new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

                return (
                  <tr
                    key={req.id}
                    className="hover:bg-denali-gray-800/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-denali-cyan">
                        {req.reqNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-denali-gray-200">
                          {req.title}
                        </p>
                        <p className="text-xs text-denali-gray-500">
                          {req.location.name} &middot;{" "}
                          {req.billable ? "Billable" : "Non-Billable"}
                          {req.evergreen && " · Evergreen"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-denali-gray-400">
                        {req.department.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {req.recruiters.map((r) => (
                          <span
                            key={r.id}
                            className="text-xs px-2 py-0.5 rounded-full bg-denali-gray-800 text-denali-gray-400"
                          >
                            {r.user.name.split(" ")[0]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          req.status === "OPEN"
                            ? "bg-green-900/30 text-green-400"
                            : req.status === "ON_HOLD"
                            ? "bg-yellow-900/30 text-yellow-400"
                            : req.status === "CLOSED"
                            ? "bg-denali-gray-700 text-denali-gray-500"
                            : "bg-blue-900/30 text-blue-400"
                        }`}
                      >
                        {req.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono text-denali-gray-400">
                        {daysOpen}d
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono text-denali-gray-300">
                        {req.candidates.length}
                      </span>
                      <span className="text-xs text-denali-gray-600">
                        /{req.positionsTotal}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.payRangeMin && req.payRangeMax ? (
                        <span className="text-sm text-denali-gray-400">
                          ${(req.payRangeMin / 1000).toFixed(0)}k–$
                          {(req.payRangeMax / 1000).toFixed(0)}k
                        </span>
                      ) : (
                        <span className="text-xs text-denali-danger">
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {req.targetDate ? (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            targetMissed
                              ? "text-denali-danger"
                              : targetApproaching
                              ? "text-denali-warning"
                              : "text-denali-gray-500"
                          }`}
                        >
                          {targetMissed && "🔴"}
                          {targetApproaching && !targetMissed && "🟡"}
                          {!targetMissed && !targetApproaching && "🟢"}
                          {req.targetDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-xs text-denali-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
