import { prisma } from "@/lib/db/client";

export default async function FinancialPage() {
  const [agencies, fees, budgets, bonuses] = await Promise.all([
    prisma.agency.findMany({ include: { fees: { include: { department: true } } } }),
    prisma.agencyFee.findMany({ include: { agency: true, department: true }, orderBy: { createdAt: "desc" } }),
    prisma.recruitingBudget.findMany({ include: { department: true } }),
    prisma.referralBonus.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const pendingBonuses = bonuses.filter((b) => b.status === "PENDING");
  const paidBonuses = bonuses.filter((b) => b.status === "PAID");

  // Agency breakdown
  const agencyBreakdown = agencies.map((a) => ({
    name: a.name,
    totalFees: a.fees.reduce((sum, f) => sum + f.amount, 0),
    hires: a.fees.length,
    avgFee: a.fees.length > 0 ? a.fees.reduce((sum, f) => sum + f.amount, 0) / a.fees.length : 0,
  })).filter((a) => a.totalFees > 0).sort((a, b) => b.totalFees - a.totalFees);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-denali-gray-100">Financial Tracking</h1>
        <p className="text-sm text-denali-gray-500 mt-1">Agency fees, referral bonuses, and cost per hire</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Agency Fees YTD", value: `$${totalFees.toLocaleString()}`, color: "text-denali-cyan" },
          { label: "Total Budget", value: totalBudget > 0 ? `$${totalBudget.toLocaleString()}` : "Not Set", color: "text-blue-400" },
          { label: "Pending Bonuses", value: pendingBonuses.length.toString(), color: pendingBonuses.length > 0 ? "text-denali-warning" : "text-denali-gray-400" },
          { label: "Paid Bonuses", value: `$${paidBonuses.reduce((s, b) => s + b.amount, 0).toLocaleString()}`, color: "text-denali-success" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-5 text-center">
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-denali-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Agency Fee Breakdown */}
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
        <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">Agency Fee Breakdown</h2>
        {agencyBreakdown.length === 0 ? (
          <p className="text-sm text-denali-gray-600 text-center py-8">No agency fees recorded yet — import from Filled Positions Excel to populate</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-denali-gray-800">
                <th className="text-left pb-2 text-xs font-medium text-denali-gray-500 uppercase">Agency</th>
                <th className="text-right pb-2 text-xs font-medium text-denali-gray-500 uppercase">Hires</th>
                <th className="text-right pb-2 text-xs font-medium text-denali-gray-500 uppercase">Total Fees</th>
                <th className="text-right pb-2 text-xs font-medium text-denali-gray-500 uppercase">Avg Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-denali-gray-800">
              {agencyBreakdown.map((a) => (
                <tr key={a.name} className="hover:bg-denali-gray-800/50">
                  <td className="py-2.5 text-sm text-denali-gray-200">{a.name}</td>
                  <td className="py-2.5 text-sm text-right text-denali-gray-400 font-mono">{a.hires}</td>
                  <td className="py-2.5 text-sm text-right text-denali-cyan font-mono">${a.totalFees.toLocaleString()}</td>
                  <td className="py-2.5 text-sm text-right text-denali-gray-400 font-mono">${Math.round(a.avgFee).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Referral Bonuses */}
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
        <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">Referral Bonuses</h2>
        {bonuses.length === 0 ? (
          <p className="text-sm text-denali-gray-600 text-center py-8">No referral bonuses tracked yet</p>
        ) : (
          <div className="space-y-2">
            {bonuses.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-denali-gray-800 last:border-0">
                <div>
                  <p className="text-sm text-denali-gray-200">{b.referrer}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-denali-gray-300">${b.amount.toLocaleString()}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    b.status === "PAID" ? "bg-green-900/30 text-green-400" : b.status === "APPROVED" ? "bg-blue-900/30 text-blue-400" : "bg-yellow-900/30 text-yellow-400"
                  }`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
