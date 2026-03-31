import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound } from "@/lib/api/response";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prework = await prisma.candidatePrework.findFirst({ where: { onboardingId: id } });
  if (!prework) return notFound("Prework record");
  return success(prework);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.candidatePrework.findFirst({ where: { onboardingId: id } });
  if (!existing) return notFound("Prework record");

  const updated = await prisma.candidatePrework.update({
    where: { id: existing.id },
    data: {
      i9Status: body.i9Status ?? existing.i9Status,
      i9DocumentsReceivedAt: body.i9DocumentsReceivedAt ? new Date(body.i9DocumentsReceivedAt) : existing.i9DocumentsReceivedAt,
      taxWithholdingCompleted: body.taxWithholdingCompleted ?? existing.taxWithholdingCompleted,
      companyPoliciesAcknowledged: body.companyPoliciesAcknowledged ?? existing.companyPoliciesAcknowledged,
      directDepositSetup: body.directDepositSetup ?? existing.directDepositSetup,
      emergencyContactsProvided: body.emergencyContactsProvided ?? existing.emergencyContactsProvided,
      marketingConsentSigned: body.marketingConsentSigned ?? existing.marketingConsentSigned,
      tshirtSize: body.tshirtSize ?? existing.tshirtSize,
    },
  });

  // Check if all prework items complete
  if (updated.taxWithholdingCompleted && updated.companyPoliciesAcknowledged &&
      updated.directDepositSetup && updated.emergencyContactsProvided &&
      updated.i9Status === "I9_VERIFIED") {
    await prisma.candidatePrework.update({ where: { id: existing.id }, data: { completedAt: new Date() } });
    await prisma.onboardingMilestone.updateMany({
      where: { onboardingId: id, milestone: "PREWORK_COMPLETED" },
      data: { completedAt: new Date() },
    });
    await prisma.onboardingRecord.update({ where: { id }, data: { preworkCompletedAt: new Date() } });
  }

  return success(updated);
}
