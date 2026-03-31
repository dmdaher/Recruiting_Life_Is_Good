import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound, validationError } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/rbac";
import { logMutation } from "@/lib/audit/service";
import { encryptField } from "@/lib/encryption/service";

// GET /api/onboarding/:id/pif
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pif = await prisma.pIFData.findFirst({
    where: { onboardingId: id },
    include: { equipmentPackage: true },
  });
  if (!pif) return notFound("PIF data");
  return success(pif);
}

// POST /api/onboarding/:id/pif — Submit unified PIF + IT form
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const onboarding = await prisma.onboardingRecord.findUnique({ where: { id } });
  if (!onboarding) return notFound("Onboarding record");

  if (!body.employeeName || !body.positionTitle || !body.managerName || !body.accountingCode) {
    return validationError("Missing required PIF fields: employeeName, positionTitle, managerName, accountingCode");
  }

  // Auto-suggest equipment package if not specified
  let equipmentPackageId = body.equipmentPackageId;
  if (!equipmentPackageId && body.roleFamily) {
    const pkg = await prisma.equipmentPackage.findFirst({ where: { roleFamily: body.roleFamily, isDefault: true } });
    equipmentPackageId = pkg?.id ?? null;
  }

  const pif = await prisma.pIFData.create({
    data: {
      onboardingId: id,
      pifType: body.pifType ?? "NEW_HIRE",
      employeeName: body.employeeName,
      jobReqNumber: body.jobReqNumber ?? "",
      referrerName: body.referrerName,
      recruiterName: body.recruiterName,
      agencyName: body.agencyName,
      agencyFee: body.agencyFee,
      positionTitle: body.positionTitle,
      officeLocation: body.officeLocation ?? "",
      country: body.country ?? "US",
      neoLocation: body.neoLocation,
      clientOnsiteStartDate: body.clientOnsiteStartDate ? new Date(body.clientOnsiteStartDate) : null,
      employeeType: body.employeeType,
      bonusCommissionPlan: body.bonusCommissionPlan,
      payRate: encryptField(body.payRate),
      billRate: encryptField(body.billRate),
      managerName: body.managerName,
      accountingCode: body.accountingCode,
      supervisorRole: body.supervisorRole ?? false,
      billable: body.billable ?? true,
      salesforceAccess: body.salesforceAccess ?? false,
      cpqPermissions: body.cpqPermissions ?? false,
      kimbleApproval: body.kimbleApproval ?? false,
      kimbleTimeEntry: body.kimbleTimeEntry ?? true,
      businessCards: body.businessCards ?? false,
      itEquipmentNeeded: body.itEquipmentNeeded ?? true,
      client: body.client,
      drugScreenRequired: body.drugScreenRequired ?? false,
      tbTestRequired: body.tbTestRequired ?? false,
      additionalBGCheck: body.additionalBGCheck ?? false,
      desiredAlias: body.desiredAlias,
      hardwareType: body.hardwareType,
      peripherals: body.peripherals,
      deliveryMethod: body.deliveryMethod,
      businessReason: body.businessReason,
      additionalInfo: body.additionalInfo,
      equipmentPackageId,
    },
    include: { equipmentPackage: true },
  });

  // Update onboarding record timestamps + status
  await prisma.onboardingRecord.update({
    where: { id },
    data: {
      status: "IN_PROGRESS",
      pifSubmittedAt: new Date(),
      itRequestSubmittedAt: new Date(),
    },
  });

  // Complete PIF_SUBMITTED and IT_REQUEST_SENT milestones
  const user = await getAuthUser();
  const now = new Date();
  await prisma.onboardingMilestone.updateMany({
    where: { onboardingId: id, milestone: { in: ["PIF_SUBMITTED", "IT_REQUEST_SENT"] } },
    data: { completedAt: now },
  });

  await logMutation(user?.id ?? "system", "CREATE", "pifData", pif.id, null, {
    employeeName: body.employeeName, positionTitle: body.positionTitle,
  });

  return success(pif, 201);
}
