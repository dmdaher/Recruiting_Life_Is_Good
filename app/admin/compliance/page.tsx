import { prisma } from "@/lib/db/client";

export default async function CompliancePage() {
  const [dsars, holds, consents, breaches, retentionPolicies] = await Promise.all([
    prisma.dSARRequest.findMany({ include: { candidate: true }, orderBy: { receivedAt: "desc" } }),
    prisma.legalHold.findMany({ where: { releasedAt: null }, include: { createdBy: true }, orderBy: { createdAt: "desc" } }),
    prisma.consent.findMany({ where: { withdrawnAt: null }, include: { candidate: true }, orderBy: { expiresAt: "asc" } }),
    prisma.dataBreach.findMany({ orderBy: { incidentDate: "desc" } }),
    prisma.dataRetentionPolicy.findMany({ orderBy: [{ entityType: "asc" }, { jurisdiction: "asc" }] }),
  ]);

  const now = new Date();
  const openDsars = dsars.filter((d) => d.status !== "COMPLETED" && d.status !== "DENIED");
  const overdueDsars = openDsars.filter((d) => d.dueDate < now);
  const expiringConsents = consents.filter((c) => c.expiresAt && c.expiresAt < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-denali-gray-100">Compliance</h1>
        <p className="text-sm text-denali-gray-500 mt-1">SOC 2, GDPR, FCRA, EEOC compliance dashboard</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Open DSARs", value: openDsars.length, color: openDsars.length > 0 ? "text-denali-warning" : "text-denali-success", sub: overdueDsars.length > 0 ? `${overdueDsars.length} overdue` : "On track" },
          { label: "Active Legal Holds", value: holds.length, color: holds.length > 0 ? "text-denali-cyan" : "text-denali-gray-400", sub: "Active" },
          { label: "Consents Expiring", value: expiringConsents.length, color: expiringConsents.length > 0 ? "text-denali-warning" : "text-denali-success", sub: "Within 30 days" },
          { label: "Data Breaches", value: breaches.length, color: breaches.length > 0 ? "text-denali-danger" : "text-denali-success", sub: breaches.length === 0 ? "None recorded" : "Review needed" },
          { label: "Retention Policies", value: retentionPolicies.length, color: "text-denali-gray-300", sub: "Configured" },
        ].map((card) => (
          <div key={card.label} className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-4 text-center">
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-denali-gray-500 mt-0.5">{card.label}</p>
            <p className="text-[10px] text-denali-gray-600 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DSAR Requests */}
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-denali-gray-100">DSAR Requests</h2>
            <button className="text-xs px-3 py-1.5 bg-denali-cyan/10 text-denali-cyan rounded-lg hover:bg-denali-cyan/20 transition-colors">+ New DSAR</button>
          </div>
          {dsars.length === 0 ? (
            <p className="text-sm text-denali-gray-600 text-center py-8">No DSAR requests — GDPR/CCPA data subject requests will appear here</p>
          ) : (
            <div className="space-y-2">
              {dsars.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-denali-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm text-denali-gray-200">{d.candidate.firstName} {d.candidate.lastName}</p>
                    <p className="text-xs text-denali-gray-500">{d.requestType} &middot; {d.jurisdiction}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      d.status === "COMPLETED" ? "bg-green-900/30 text-green-400" : d.dueDate < now ? "bg-red-900/30 text-red-400" : "bg-yellow-900/30 text-yellow-400"
                    }`}>{d.status}</span>
                    <p className="text-[10px] text-denali-gray-600 mt-1">Due {d.dueDate.toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legal Holds */}
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-denali-gray-100">Active Legal Holds</h2>
            <button className="text-xs px-3 py-1.5 bg-denali-cyan/10 text-denali-cyan rounded-lg hover:bg-denali-cyan/20 transition-colors">+ Create Hold</button>
          </div>
          {holds.length === 0 ? (
            <p className="text-sm text-denali-gray-600 text-center py-8">No active legal holds — holds prevent automated data deletion</p>
          ) : (
            <div className="space-y-2">
              {holds.map((h) => (
                <div key={h.id} className="p-3 bg-denali-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-denali-gray-200">{h.entityType}: {h.entityId.slice(0, 8)}...</p>
                    <span className="text-xs text-denali-gray-500">{h.createdAt.toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-denali-gray-500 mt-1">{h.reason}</p>
                  <p className="text-[10px] text-denali-gray-600 mt-1">Created by {h.createdBy.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Retention Policies */}
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
        <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">Data Retention Policies</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-denali-gray-800">
                <th className="text-left pb-2 text-xs font-medium text-denali-gray-500 uppercase">Entity Type</th>
                <th className="text-left pb-2 text-xs font-medium text-denali-gray-500 uppercase">Jurisdiction</th>
                <th className="text-right pb-2 text-xs font-medium text-denali-gray-500 uppercase">Retention</th>
                <th className="text-center pb-2 text-xs font-medium text-denali-gray-500 uppercase">Auto-Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-denali-gray-800">
              {retentionPolicies.map((p) => (
                <tr key={p.id} className="hover:bg-denali-gray-800/50">
                  <td className="py-2 text-sm text-denali-gray-300">{p.entityType}</td>
                  <td className="py-2 text-sm text-denali-gray-400">{p.jurisdiction}</td>
                  <td className="py-2 text-sm text-right text-denali-gray-300 font-mono">{Math.round(p.retentionDays / 365)}y ({p.retentionDays}d)</td>
                  <td className="py-2 text-center">
                    <span className={`text-xs ${p.autoDelete ? "text-denali-success" : "text-denali-gray-600"}`}>
                      {p.autoDelete ? "Yes" : "Manual"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
