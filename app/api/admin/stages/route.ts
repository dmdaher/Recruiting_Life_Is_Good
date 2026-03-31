import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError } from "@/lib/api/response";

// GET /api/admin/stages
export async function GET() {
  const stages = await prisma.pipelineStage.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { candidates: true } } },
  });
  return success(stages);
}

// POST /api/admin/stages — Add new pipeline stage
export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name || body.order == null) {
    return validationError("Missing required fields: name, order");
  }

  // Shift existing stages to make room
  if (body.insertAt) {
    await prisma.pipelineStage.updateMany({
      where: { order: { gte: body.order } },
      data: { order: { increment: 1 } },
    });
  }

  const stage = await prisma.pipelineStage.create({
    data: {
      name: body.name,
      order: body.order,
      isTerminal: body.isTerminal ?? false,
      requiresApproval: body.requiresApproval ?? false,
      requiresBackgroundCheck: body.requiresBackgroundCheck ?? false,
    },
  });

  return success(stage, 201);
}
