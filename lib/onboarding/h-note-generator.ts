import { prisma } from "@/lib/db/client";
import { decryptField } from "@/lib/encryption/service";

export type HNoteData = {
  subject: string;
  fields: { label: string; value: string }[];
};

/**
 * Generate H-Note from PIF data matching the SOP template format.
 * Subject: "H-Note: Last Name, First Name | Start Date | Location"
 */
export async function generateHNote(onboardingId: string): Promise<HNoteData> {
  const onboarding = await prisma.onboardingRecord.findUnique({
    where: { id: onboardingId },
    include: {
      candidate: { include: { source: true } },
      pifData: true,
    },
  });

  if (!onboarding) throw new Error("Onboarding record not found");
  if (!onboarding.pifData) throw new Error("PIF data not submitted yet");

  const pif = onboarding.pifData;
  const candidate = onboarding.candidate;
  const startDate = onboarding.hireDate?.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) ?? "TBD";

  const subject = `H-Note: ${candidate.lastName}, ${candidate.firstName} | ${startDate} | ${pif.officeLocation}`;

  const fields = [
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
    { label: "Employee Position ID", value: onboarding.employeePositionId ?? "Pending ADP assignment" },
    { label: "Contact Phone Number", value: candidate.phone ?? "On file" },
    { label: "Office Location", value: pif.officeLocation },
    { label: "Country", value: pif.country },
    { label: "Contact Email", value: candidate.email },
    { label: "Supervisor Role", value: pif.supervisorRole ? "Yes" : "No" },
    { label: "Salesforce CRM Access Needed?", value: pif.salesforceAccess ? "Yes" : "No" },
    { label: "CPQ Permissions Needed?", value: pif.cpqPermissions ? "Yes" : "No" },
    { label: "Kimble Approval Permissions", value: pif.kimbleApproval ? "Yes" : "No" },
    { label: "Time entry in Kimble", value: pif.kimbleTimeEntry ? "Yes" : "No" },
    { label: "3MD Email Address", value: onboarding.denaliEmail ?? "Pending assignment" },
  ];

  return { subject, fields };
}
