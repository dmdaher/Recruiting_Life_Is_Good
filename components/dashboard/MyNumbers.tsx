"use client";

export function MyNumbers({
  submittals,
  interviews,
  hires,
  openReqs,
  pipelineCounts,
}: {
  submittals: number;
  interviews: number;
  hires: number;
  openReqs: number;
  pipelineCounts: { name: string; count: number }[];
}) {
  const stats = [
    { label: "Open Reqs", value: openReqs, color: "text-denali-cyan" },
    { label: "Submittals", value: submittals, color: "text-blue-400" },
    { label: "Interviews", value: interviews, color: "text-purple-400" },
    { label: "Hires", value: hires, color: "text-denali-success" },
  ];

  return (
    <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
      <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">
        My Numbers
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-denali-gray-800 rounded-lg p-4 text-center"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-denali-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Mini Pipeline Funnel */}
      <div>
        <h3 className="text-xs font-medium text-denali-gray-500 mb-2 uppercase tracking-wider">
          Pipeline Distribution
        </h3>
        <div className="space-y-1.5">
          {pipelineCounts.map((stage) => {
            const total = pipelineCounts.reduce((s, p) => s + p.count, 0);
            const pct = total > 0 ? (stage.count / total) * 100 : 0;
            return (
              <div key={stage.name} className="flex items-center gap-2">
                <span className="text-xs text-denali-gray-500 w-28 truncate">
                  {stage.name}
                </span>
                <div className="flex-1 h-2 bg-denali-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-denali-cyan rounded-full transition-all"
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-denali-gray-400 w-6 text-right">
                  {stage.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
