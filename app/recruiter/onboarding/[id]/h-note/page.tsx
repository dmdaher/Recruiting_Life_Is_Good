import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import { HNotePreview } from "@/components/onboarding/HNotePreview";

export default async function HNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const record = await prisma.onboardingRecord.findUnique({
    where: { id },
    include: {
      candidate: { include: { source: true } },
      pifData: true,
      milestones: { where: { milestone: "BG_CHECK_CLEARED" } },
    },
  });

  if (!record) notFound();

  const bgCleared = record.milestones[0]?.completedAt !== null && record.milestones[0]?.completedAt !== undefined;
  const alreadySent = record.hNoteSentAt !== null;

  // Build H-Note fields for preview
  const pif = record.pifData;
  const candidate = record.candidate;
  const startDate = record.hireDate?.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) ?? "TBD";

  const hNoteFields = pif ? [
    { label: "Employee Name", value: pif.employeeName },
    { label: "Desired Alias", value: pif.desiredAlias ?? "N/A" },
    { label: "Position Title", value: pif.positionTitle },
    { label: "Accounting Code", value: pif.accountingCode },
    { label: "Employee Type", value: pif.employeeType ?? "N/A" },
    { label: "Orientation (Hire Date)", value: startDate },
    { label: "Client Onsite Start Date", value: pif.clientOnsiteStartDate?.toLocaleDateString() ?? "N/A" },
    { label: "Sourced From", value: candidate.source?.name ?? pif.agencyName ?? "Direct" },
    { label: "3MD Manager", value: pif.managerName },
    { label: "Client", value: pif.client ?? "N/A" },
    { label: "Employee Position ID", value: record.employeePositionId ?? "Pending ADP assignment" },
    { label: "Contact Phone", value: candidate.phone ?? "On file" },
    { label: "Office Location", value: pif.officeLocation },
    { label: "Country", value: pif.country },
    { label: "Contact Email", value: candidate.email },
    { label: "Supervisor Role", value: pif.supervisorRole ? "Yes" : "No" },
    { label: "Salesforce CRM Access", value: pif.salesforceAccess ? "Yes" : "No" },
    { label: "CPQ Permissions", value: pif.cpqPermissions ? "Yes" : "No" },
    { label: "Kimble Approval", value: pif.kimbleApproval ? "Yes" : "No" },
    { label: "Kimble Time Entry", value: pif.kimbleTimeEntry ? "Yes" : "No" },
    { label: "3MD Email Address", value: record.denaliEmail ?? "Pending assignment" },
  ] : [];

  const subject = pif
    ? `H-Note: ${candidate.lastName}, ${candidate.firstName} | ${startDate} | ${pif.officeLocation}`
    : "PIF not yet submitted";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-denali-gray-100">H-Note</h1>
        <p className="text-sm text-denali-gray-500 mt-1">
          {alreadySent ? `Sent ${record.hNoteSentAt?.toLocaleDateString()}` : "Preview and send when ready"}
        </p>
      </div>

      {!pif ? (
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-12 text-center">
          <p className="text-sm text-denali-gray-600">PIF must be submitted before H-Note can be generated</p>
        </div>
      ) : (
        <HNotePreview
          onboardingId={id}
          subject={subject}
          fields={hNoteFields}
          bgCleared={bgCleared}
          alreadySent={alreadySent}
          sentAt={record.hNoteSentAt?.toISOString() ?? null}
        />
      )}
    </div>
  );
}
