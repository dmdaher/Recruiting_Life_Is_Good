import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound, enforcementBlocked } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/rbac";

// PUT /api/onboarding/:id/equipment — Update equipment tracking
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const pif = await prisma.pIFData.findFirst({ where: { onboardingId: id } });
  if (!pif) return notFound("PIF data — submit PIF first");

  // Enforcement: can't ship/stage equipment until H-Note sent
  if (body.equipmentShippedAt || body.equipmentSetupConfirmedAt) {
    const hNote = await prisma.onboardingMilestone.findFirst({
      where: { onboardingId: id, milestone: "H_NOTE_SENT" },
    });
    if (!hNote?.completedAt) {
      return enforcementBlocked("EQUIPMENT_REQUIRES_H_NOTE", "IT will not ship equipment until the H-Note has gone out (SOP requirement).");
    }
  }

  const user = await getAuthUser();

  const updated = await prisma.pIFData.update({
    where: { id: pif.id },
    data: {
      equipmentTrackingNumber: body.equipmentTrackingNumber ?? pif.equipmentTrackingNumber,
      equipmentShippedAt: body.equipmentShippedAt ? new Date(body.equipmentShippedAt) : pif.equipmentShippedAt,
      equipmentDeliveredAt: body.equipmentDeliveredAt ? new Date(body.equipmentDeliveredAt) : pif.equipmentDeliveredAt,
      equipmentDeskLocation: body.equipmentDeskLocation ?? pif.equipmentDeskLocation,
      equipmentSetupConfirmedAt: body.equipmentSetupConfirmedAt ? new Date(body.equipmentSetupConfirmedAt) : pif.equipmentSetupConfirmedAt,
      equipmentSetupConfirmedById: body.equipmentSetupConfirmedAt ? user?.id : pif.equipmentSetupConfirmedById,
    },
  });

  // Complete equipment milestones
  if (body.equipmentShippedAt || body.equipmentDeskLocation) {
    await prisma.onboardingMilestone.updateMany({
      where: { onboardingId: id, milestone: "EQUIPMENT_SHIPPED_OR_STAGED", completedAt: null },
      data: { completedAt: new Date() },
    });
    await prisma.onboardingRecord.update({ where: { id }, data: { itEquipmentReadyAt: null } });
  }

  if (body.equipmentSetupConfirmedAt || body.equipmentDeliveredAt) {
    await prisma.onboardingMilestone.updateMany({
      where: { onboardingId: id, milestone: "EQUIPMENT_CONFIRMED", completedAt: null },
      data: { completedAt: new Date() },
    });
    await prisma.onboardingRecord.update({ where: { id }, data: { itEquipmentReadyAt: new Date() } });
  }

  return success(updated);
}
