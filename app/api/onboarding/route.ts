import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success } from "@/lib/api/response";

// GET /api/onboarding — List all onboarding records
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const records = await prisma.onboardingRecord.findMany({
    where,
    include: {
      candidate: {
        include: {
          requisition: { include: { department: true } },
          currentStage: true,
        },
      },
      milestones: { orderBy: { targetDate: "asc" } },
    },
    orderBy: { hireDate: "asc" },
  });

  return success(records);
}
