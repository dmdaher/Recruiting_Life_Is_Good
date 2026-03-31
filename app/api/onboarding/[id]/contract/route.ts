import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound } from "@/lib/api/response";

// Skeleton — UK/Ireland contract tracking
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contract = await prisma.contractTracking.findFirst({ where: { onboardingId: id } });
  if (!contract) return success(null);
  return success(contract);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const existing = await prisma.contractTracking.findFirst({ where: { onboardingId: id } });
  if (!existing) return notFound("Contract tracking — UK/Ireland hires only");
  const updated = await prisma.contractTracking.update({
    where: { id: existing.id },
    data: {
      status: body.status ?? existing.status,
      managerSignedAt: body.managerSignedAt ? new Date(body.managerSignedAt) : existing.managerSignedAt,
      candidateSignedAt: body.candidateSignedAt ? new Date(body.candidateSignedAt) : existing.candidateSignedAt,
      finalSignedAt: body.finalSignedAt ? new Date(body.finalSignedAt) : existing.finalSignedAt,
      contractDocuSignId: body.contractDocuSignId ?? existing.contractDocuSignId,
    },
  });
  return success(updated);
}
