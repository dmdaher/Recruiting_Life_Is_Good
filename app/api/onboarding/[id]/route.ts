import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound } from "@/lib/api/response";

// GET /api/onboarding/:id
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await prisma.onboardingRecord.findUnique({
    where: { id },
    include: {
      candidate: { include: { requisition: { include: { department: true, location: true } }, offers: true } },
      milestones: { orderBy: { targetDate: "asc" }, include: { completedBy: { select: { name: true } } } },
      pifData: { include: { equipmentPackage: true } },
      prework: true,
      accessRequests: true,
      onboardingPlan: true,
      greeterAssignedTo: { select: { id: true, name: true } },
      contractTracking: true,
      medicalCompliance: true,
      internationalDetails: true,
    },
  });
  if (!record) return notFound("Onboarding record");
  return success(record);
}

// PUT /api/onboarding/:id
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.onboardingRecord.findUnique({ where: { id } });
  if (!existing) return notFound("Onboarding record");

  // Check if all milestones complete → auto-set DAY1_READY
  let newStatus = body.status ?? existing.status;
  if (body.checkDay1Ready) {
    const milestones = await prisma.onboardingMilestone.findMany({ where: { onboardingId: id } });
    const allComplete = milestones.every((m) => m.completedAt !== null);
    if (allComplete) newStatus = "DAY1_READY";
  }

  const updated = await prisma.onboardingRecord.update({
    where: { id },
    data: {
      status: newStatus,
      orientationDate: body.orientationDate ? new Date(body.orientationDate) : existing.orientationDate,
      orientationLocation: body.orientationLocation ?? existing.orientationLocation,
      neoTimeSlot: body.neoTimeSlot ?? existing.neoTimeSlot,
      greeterAssignedToId: body.greeterAssignedToId ?? existing.greeterAssignedToId,
      greeterLocation: body.greeterLocation ?? existing.greeterLocation,
      greeterMeetingTime: body.greeterMeetingTime ? new Date(body.greeterMeetingTime) : existing.greeterMeetingTime,
      greeterConfirmedAt: body.greeterConfirmedAt ? new Date(body.greeterConfirmedAt) : existing.greeterConfirmedAt,
      greeterNotes: body.greeterNotes ?? existing.greeterNotes,
      denaliEmail: body.denaliEmail ?? existing.denaliEmail,
      employeePositionId: body.employeePositionId ?? existing.employeePositionId,
      hNoteSentAt: body.hNoteSentAt ? new Date(body.hNoteSentAt) : existing.hNoteSentAt,
      neoEmailSentAt: body.neoEmailSentAt ? new Date(body.neoEmailSentAt) : existing.neoEmailSentAt,
      day1ReadyConfirmedAt: newStatus === "DAY1_READY" ? new Date() : existing.day1ReadyConfirmedAt,
    },
  });

  return success(updated);
}
