import { prisma } from "@/lib/db/client";

export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-denali-gray-100">Audit Log</h1>
        <p className="text-sm text-denali-gray-500 mt-1">Immutable record of all platform activity — 7-year retention (SOC 2)</p>
      </div>

      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-denali-gray-600">No audit events recorded yet</p>
            <p className="text-xs text-denali-gray-700 mt-1">All data mutations and PII access events will be logged here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-denali-gray-800">
                  {["Timestamp", "User", "Action", "Entity", "Details", "IP"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-denali-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-denali-gray-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-denali-gray-800/50">
                    <td className="px-4 py-2.5 text-xs text-denali-gray-500 font-mono">{log.timestamp.toISOString().replace("T", " ").slice(0, 19)}</td>
                    <td className="px-4 py-2.5 text-sm text-denali-gray-300">{log.user?.name ?? "System"}</td>
                    <td className="px-4 py-2.5"><span className="text-xs px-2 py-0.5 rounded-full bg-denali-gray-800 text-denali-gray-400">{log.action}</span></td>
                    <td className="px-4 py-2.5 text-sm text-denali-gray-400">{log.entityType}</td>
                    <td className="px-4 py-2.5 text-xs text-denali-gray-600 max-w-xs truncate">{log.changes ? JSON.stringify(log.changes).slice(0, 80) : "—"}</td>
                    <td className="px-4 py-2.5 text-xs text-denali-gray-600 font-mono">{log.ipAddress ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
