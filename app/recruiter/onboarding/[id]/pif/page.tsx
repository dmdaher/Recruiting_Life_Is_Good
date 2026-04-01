import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import { PIFForm } from "@/components/onboarding/PIFForm";

export default async function PIFPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const record = await prisma.onboardingRecord.findUnique({
    where: { id },
    include: {
      candidate: {
        include: {
          requisition: { include: { department: true, location: true, hiringManager: true } },
          offers: { take: 1, orderBy: { createdAt: "desc" }, include: { employeeType: true, client: true } },
          source: true,
        },
      },
      pifData: { include: { equipmentPackage: true } },
    },
  });

  if (!record) notFound();

  const equipmentPackages = await prisma.equipmentPackage.findMany({ orderBy: { name: "asc" } });
  const devUser = await prisma.user.findFirst({ where: { role: "RECRUITER" } });

  // Pre-populate from offer/req data
  const offer = record.candidate.offers[0];
  const req = record.candidate.requisition;

  const prefill = {
    employeeName: `${record.candidate.firstName} ${record.candidate.lastName}`,
    jobReqNumber: req.reqNumber,
    recruiterName: devUser?.name ?? "",
    positionTitle: req.title,
    officeLocation: req.location.name,
    country: req.location.country,
    managerName: req.hiringManager.name,
    accountingCode: req.department.code,
    billable: req.billable,
    employeeType: offer?.employeeType?.code ?? "",
    client: offer?.client?.name ?? "",
    drugScreenRequired: offer?.clientRequiresDrugScreen ?? false,
    tbTestRequired: offer?.clientRequiresTBTest ?? false,
    additionalBGCheck: offer?.clientRequiresAdditionalBGCheck ?? false,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-denali-gray-100">
          {record.pifData ? "PIF + IT Request (Submitted)" : "Submit PIF + IT Request"}
        </h1>
        <p className="text-sm text-denali-gray-500 mt-1">
          Unified form replacing PIF email + ServiceNow IT request &mdash; for {record.candidate.firstName} {record.candidate.lastName}
        </p>
      </div>

      {record.pifData ? (
        // Read-only view of submitted PIF
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-denali-success text-lg">✅</span>
            <p className="text-sm text-denali-success font-medium">PIF submitted {record.pifSubmittedAt?.toLocaleDateString()}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Employee Name", value: record.pifData.employeeName },
              { label: "PIF Type", value: record.pifData.pifType },
              { label: "Position Title", value: record.pifData.positionTitle },
              { label: "Req #", value: record.pifData.jobReqNumber },
              { label: "Office Location", value: record.pifData.officeLocation },
              { label: "Country", value: record.pifData.country },
              { label: "Manager", value: record.pifData.managerName },
              { label: "Accounting Code", value: record.pifData.accountingCode },
              { label: "Billable", value: record.pifData.billable ? "Yes" : "No" },
              { label: "Employee Type", value: record.pifData.employeeType ?? "N/A" },
              { label: "Hardware", value: record.pifData.hardwareType ?? "N/A" },
              { label: "Delivery", value: record.pifData.deliveryMethod?.replace(/_/g, " ") ?? "N/A" },
              { label: "Desired Alias", value: record.pifData.desiredAlias ?? "N/A" },
              { label: "Equipment Package", value: record.pifData.equipmentPackage?.name ?? "Custom" },
              { label: "Salesforce Access", value: record.pifData.salesforceAccess ? "Yes" : "No" },
              { label: "CPQ Permissions", value: record.pifData.cpqPermissions ? "Yes" : "No" },
              { label: "Kimble Time Entry", value: record.pifData.kimbleTimeEntry ? "Yes" : "No" },
              { label: "Business Cards", value: record.pifData.businessCards ? "Yes" : "No" },
            ].map((item) => (
              <div key={item.label} className="bg-denali-gray-800 rounded-lg p-3">
                <p className="text-xs text-denali-gray-500">{item.label}</p>
                <p className="text-sm text-denali-gray-200 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <PIFForm
          onboardingId={id}
          prefill={prefill}
          equipmentPackages={equipmentPackages.map((p) => ({
            id: p.id,
            name: p.name,
            hardwareType: p.hardwareType,
            peripherals: p.peripherals as string[],
            roleFamily: p.roleFamily,
          }))}
        />
      )}
    </div>
  );
}
