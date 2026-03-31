import { prisma } from "@/lib/db/client";

const reportDescriptions: Record<string, { name: string; description: string; frequency: string }> = {
  "daily-recruiting": { name: "Daily Recruiting Report", description: "Submittals, interviews, offers, and hires for the day", frequency: "Daily at 5 PM" },
  "open-reqs": { name: "Open Requisition Report", description: "All open reqs with status, days open, recruiter, candidates", frequency: "Mon & Thu" },
  "ytd-performance": { name: "YTD Performance Report", description: "Hires, interviews, submittals per recruiter by period", frequency: "Weekly (Monday)" },
  "interview-tracking": { name: "Interview Tracking", description: "Auto-counted from platform data, real-time", frequency: "Real-time" },
  "rescinded-offers": { name: "Rescinded Offers", description: "Offers with status rescinded, with reason codes", frequency: "Weekly" },
  "pir": { name: "Payroll Impact Report (PIR)", description: "New reqs, new hires, referrals, date changes, rescissions", frequency: "Mon/Wed/Fri" },
  "filled-positions": { name: "Filled Positions", description: "All hires with department, recruiter, source, date", frequency: "Auto on hire" },
  "cost-per-hire": { name: "Cost per Hire", description: "(Payroll + tools + agency fees) / placements", frequency: "On-demand" },
  "referral-bonus": { name: "Referral Bonus Tracking", description: "Referrer, candidate, amount, status", frequency: "Ongoing" },
  "agency-fees": { name: "Agency Fees", description: "Fees by agency, department, quarter, budget vs. actual", frequency: "Weekly" },
  "req-audit": { name: "Requisition Audit", description: "Req history, status changes, recruiter assignments", frequency: "On-demand" },
  "time-to-fill": { name: "Time to Fill", description: "Calculated from stage transitions, filterable", frequency: "On-demand" },
};

export default async function ReportsPage() {
  const schedules = await prisma.reportSchedule.findMany({ orderBy: { reportType: "asc" } });
  const recentReports = await prisma.report.findMany({ orderBy: { generatedAt: "desc" }, take: 5 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-denali-gray-100">Reports</h1>
          <p className="text-sm text-denali-gray-500 mt-1">12 automated reports replacing manual Excel compilation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedules.map((schedule) => {
          const info = reportDescriptions[schedule.reportType] ?? { name: schedule.reportType, description: "", frequency: schedule.frequency };
          return (
            <div key={schedule.id} className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-5 hover:border-denali-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-denali-gray-200">{info.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-denali-cyan/10 text-denali-cyan">{info.frequency}</span>
              </div>
              <p className="text-xs text-denali-gray-500 mb-4">{info.description}</p>
              <div className="flex items-center gap-2">
                <button className="flex-1 py-2 px-3 bg-denali-gray-800 text-denali-gray-300 text-xs font-medium rounded-lg hover:bg-denali-gray-700 transition-colors">
                  View
                </button>
                <a
                  href={`/api/reports/${schedule.reportType}?format=excel`}
                  download
                  className="flex-1 py-2 px-3 bg-denali-cyan/10 text-denali-cyan text-xs font-medium rounded-lg hover:bg-denali-cyan/20 transition-colors text-center"
                >
                  Export Excel
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reports */}
      {recentReports.length > 0 && (
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
          <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">Recently Generated</h2>
          <div className="space-y-2">
            {recentReports.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-denali-gray-800 last:border-0">
                <span className="text-sm text-denali-gray-300">{r.type}</span>
                <span className="text-xs text-denali-gray-500">{r.generatedAt.toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
