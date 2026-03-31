import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/rbac";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requests = await prisma.accessRequest.findMany({
    where: { onboardingId: id },
    orderBy: { requestedAt: "desc" },
  });
  return success(requests);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  if (!body.systemName) return validationError("Missing systemName");

  const user = await getAuthUser();
  const req = await prisma.accessRequest.create({
    data: { onboardingId: id, systemName: body.systemName, requestedById: user?.id },
  });
  return success(req, 201);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  if (!body.requestId) return validationError("Missing requestId");

  await prisma.accessRequest.update({
    where: { id: body.requestId },
    data: { status: "ACCESS_COMPLETED", completedAt: new Date() },
  });
  return success({ completed: true });
}
