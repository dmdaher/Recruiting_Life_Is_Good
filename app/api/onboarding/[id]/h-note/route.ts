import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound, enforcementBlocked } from "@/lib/api/response";
import { generateHNote } from "@/lib/onboarding/h-note-generator";
import { getAuthUser } from "@/lib/auth/rbac";
import { logMutation } from "@/lib/audit/service";

// GET /api/onboarding/:id/h-note — Preview H-Note
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const hNote = await generateHNote(id);
    return success(hNote);
  } catch (e) {
    return notFound(e instanceof Error ? e.message : "H-Note generation failed");
  }
}

// POST /api/onboarding/:id/h-note — Mark H-Note as sent
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Enforcement: BG check must be cleared first
  const bgMilestone = await prisma.onboardingMilestone.findFirst({
    where: { onboardingId: id, milestone: "BG_CHECK_CLEARED" },
  });
  if (!bgMilestone?.completedAt) {
    return enforcementBlocked("H_NOTE_REQUIRES_BG_CHECK", "H-Note cannot be sent until background check clears (SOP requirement).");
  }

  const user = await getAuthUser();
  const now = new Date();

  await prisma.onboardingRecord.update({
    where: { id },
    data: { hNoteGeneratedAt: now, hNoteSentAt: now },
  });

  // Complete H_NOTE_SENT milestone
  await prisma.onboardingMilestone.updateMany({
    where: { onboardingId: id, milestone: "H_NOTE_SENT" },
    data: { completedAt: now },
  });

  await logMutation(user?.id ?? "system", "UPDATE", "onboarding", id, null, { action: "H_NOTE_SENT" });

  return success({ sent: true, sentAt: now });
}
