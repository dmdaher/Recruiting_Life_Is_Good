import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound } from "@/lib/api/response";

// Skeleton — Concentra medical compliance
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const medical = await prisma.medicalCompliance.findFirst({ where: { onboardingId: id } });
  if (!medical) return success(null);
  return success(medical);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const existing = await prisma.medicalCompliance.findFirst({ where: { onboardingId: id } });
  if (!existing) return notFound("Medical compliance — hospital client hires only");
  const updated = await prisma.medicalCompliance.update({
    where: { id: existing.id },
    data: {
      drugScreenStatus: body.drugScreenStatus ?? existing.drugScreenStatus,
      drugScreenCompletedAt: body.drugScreenCompletedAt ? new Date(body.drugScreenCompletedAt) : existing.drugScreenCompletedAt,
      tbTestVisit1At: body.tbTestVisit1At ? new Date(body.tbTestVisit1At) : existing.tbTestVisit1At,
      tbTestVisit2At: body.tbTestVisit2At ? new Date(body.tbTestVisit2At) : existing.tbTestVisit2At,
      tbTestResult: body.tbTestResult ?? existing.tbTestResult,
      vaccinations: body.vaccinations ?? existing.vaccinations,
      clearanceStatus: body.clearanceStatus ?? existing.clearanceStatus,
    },
  });
  return success(updated);
}
