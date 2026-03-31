import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function OnboardingDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const record = await prisma.onboardingRecord.findUnique({
    where: { id },
    include: {
      candidate: { include: { requisition: { include: { department: true, location: true } } } },
      milestones: { orderBy: { targetDate: "asc" } },
      pifData: { include: { equipmentPackage: true } },
      prework: true,
      accessRequests: true,
      greeterAssignedTo: { select: { name: true } },
    },
  });

  if (!record) notFound();

  const now = new Date();
  const daysUntilStart = record.hireDate ? Math.ceil((record.hireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const completed = record.milestones.filter((m) => m.completedAt).length;
  const total = record.milestones.length;

  const milestoneLabels: Record<string, string> = {
    PIF_SUBMITTED: "PIF Submitted",
    IT_REQUEST_SENT: "IT Request Sent",
    BG_CHECK_INITIATED: "BG Check Initiated",
    BG_CHECK_CLEARED: "BG Check Cleared",
    H_NOTE_SENT: "H-Note Sent",
    NEO_EMAIL_SENT: "NEO Email Sent",
    EQUIPMENT_SHIPPED_OR_STAGED: "Equipment Shipped/Staged",
    EQUIPMENT_CONFIRMED: "Equipment Confirmed",
    PREWORK_COMPLETED: "Prework Completed",
    GREETER_ASSIGNED: "Greeter Assigned",
    GREETER_CONFIRMED: "Greeter Confirmed",
    PAYROLL_NOTIFIED: "Payroll Notified",
    DAY1_CONFIRMED: "Day 1 Confirmed",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-denali-gray-100">
            Onboarding: {record.candidate.firstName} {record.candidate.lastName}
          </h1>
          <p className="text-sm text-denali-gray-500 mt-1">
            {record.candidate.requisition.title} &middot; {record.candidate.requisition.department.name} &middot; {record.candidate.requisition.location.name}
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            record.status === "DAY1_READY" ? "bg-green-900/30 text-green-400" :
            record.status === "PIF_PENDING" ? "bg-yellow-900/30 text-yellow-400" :
            "bg-blue-900/30 text-blue-400"
          }`}>
            {record.status.replace(/_/g, " ")}
          </span>
          {daysUntilStart !== null && (
            <p className={`text-sm mt-1 font-mono ${daysUntilStart <= 3 ? "text-denali-danger" : daysUntilStart <= 7 ? "text-denali-warning" : "text-denali-gray-400"}`}>
              {daysUntilStart > 0 ? `${daysUntilStart} days until start` : daysUntilStart === 0 ? "Starts today!" : `Started ${Math.abs(daysUntilStart)} days ago`}
            </p>
          )}
        </div>
      </div>

      {/* Start Date + Orientation Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Start Date", value: record.hireDate?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) ?? "TBD" },
          { label: "Orientation", value: record.orientationLocation === "REDMOND_ONSITE" ? "Redmond (Onsite)" : record.orientationLocation === "WEBEX_REMOTE" ? "WebEx (Remote)" : "TBD" },
          { label: "Milestones", value: `${completed}/${total} complete` },
          { label: "Denali Email", value: record.denaliEmail ?? "Pending" },
        ].map((item) => (
          <div key={item.label} className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-4 text-center">
            <p className="text-lg font-bold text-denali-cyan">{item.value}</p>
            <p className="text-xs text-denali-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Milestone Tracker */}
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
        <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">Milestone Tracker</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {record.milestones.map((m) => {
            const isOverdue = !m.completedAt && m.targetDate < now;
            const icon = m.completedAt ? "✅" : isOverdue ? "🔴" : m.escalatedAt ? "🟡" : "⬜";

            return (
              <div key={m.id} className={`flex items-center justify-between p-3 rounded-lg ${
                m.completedAt ? "bg-green-950/20 border border-green-900/20" :
                isOverdue ? "bg-red-950/20 border border-red-900/20" :
                "bg-denali-gray-800"
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <p className="text-sm text-denali-gray-200">{milestoneLabels[m.milestone] ?? m.milestone}</p>
                    <p className="text-xs text-denali-gray-500">
                      Target: {m.targetDate.toLocaleDateString()}
                      {m.completedAt && ` · Done: ${m.completedAt.toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                {isOverdue && <span className="text-xs text-denali-danger font-medium">OVERDUE</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/recruiter/onboarding/${id}/pif`} className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-5 hover:border-denali-cyan/30 transition-colors text-center">
          <span className="text-2xl">📋</span>
          <p className="text-sm font-medium text-denali-gray-200 mt-2">{record.pifData ? "View PIF" : "Submit PIF"}</p>
          <p className="text-xs text-denali-gray-500 mt-1">{record.pifData ? "Submitted" : "Required"}</p>
        </Link>
        <Link href={`/recruiter/onboarding/${id}/h-note`} className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-5 hover:border-denali-cyan/30 transition-colors text-center">
          <span className="text-2xl">📨</span>
          <p className="text-sm font-medium text-denali-gray-200 mt-2">{record.hNoteSentAt ? "H-Note Sent" : "H-Note Preview"}</p>
          <p className="text-xs text-denali-gray-500 mt-1">{record.hNoteSentAt ? record.hNoteSentAt.toLocaleDateString() : "Pending BG check"}</p>
        </Link>
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-5 text-center">
          <span className="text-2xl">👤</span>
          <p className="text-sm font-medium text-denali-gray-200 mt-2">Greeter</p>
          <p className="text-xs text-denali-gray-500 mt-1">
            {record.greeterAssignedTo ? `${record.greeterAssignedTo.name}${record.greeterConfirmedAt ? " ✅" : " (unconfirmed)"}` : "Not assigned"}
          </p>
        </div>
      </div>

      {/* Equipment Status */}
      {record.pifData && (
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
          <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">Equipment Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-denali-gray-800 rounded-lg p-3">
              <p className="text-xs text-denali-gray-500">Hardware</p>
              <p className="text-sm text-denali-gray-200 mt-1">{record.pifData.hardwareType ?? "TBD"}</p>
            </div>
            <div className="bg-denali-gray-800 rounded-lg p-3">
              <p className="text-xs text-denali-gray-500">Delivery</p>
              <p className="text-sm text-denali-gray-200 mt-1">{record.pifData.deliveryMethod?.replace(/_/g, " ") ?? "TBD"}</p>
            </div>
            <div className="bg-denali-gray-800 rounded-lg p-3">
              <p className="text-xs text-denali-gray-500">Tracking</p>
              <p className="text-sm text-denali-gray-200 mt-1">{record.pifData.equipmentTrackingNumber ?? "N/A"}</p>
            </div>
            <div className="bg-denali-gray-800 rounded-lg p-3">
              <p className="text-xs text-denali-gray-500">Status</p>
              <p className={`text-sm mt-1 ${record.pifData.equipmentSetupConfirmedAt ? "text-denali-success" : "text-denali-warning"}`}>
                {record.pifData.equipmentSetupConfirmedAt ? "Confirmed ✅" : record.pifData.equipmentShippedAt ? "Shipped" : "Pending"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prework Status */}
      {record.prework && (
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
          <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">Candidate Prework</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "I-9 Verification", done: record.prework.i9Status === "I9_VERIFIED" },
              { label: "Tax Withholding", done: record.prework.taxWithholdingCompleted },
              { label: "Company Policies", done: record.prework.companyPoliciesAcknowledged },
              { label: "Direct Deposit", done: record.prework.directDepositSetup },
              { label: "Emergency Contacts", done: record.prework.emergencyContactsProvided },
              { label: "Marketing Consent", done: record.prework.marketingConsentSigned },
            ].map((item) => (
              <div key={item.label} className={`flex items-center gap-2 p-3 rounded-lg ${item.done ? "bg-green-950/20" : "bg-denali-gray-800"}`}>
                <span>{item.done ? "✅" : "⬜"}</span>
                <span className="text-sm text-denali-gray-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
