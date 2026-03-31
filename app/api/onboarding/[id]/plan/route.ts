import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, notFound } from "@/lib/api/response";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await prisma.onboardingPlan.findFirst({ where: { onboardingId: id } });
  if (!plan) return success(null);
  return success(plan);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.onboardingPlan.findFirst({ where: { onboardingId: id } });
  if (existing) {
    const updated = await prisma.onboardingPlan.update({
      where: { id: existing.id },
      data: {
        meetingsToSchedule: body.meetingsToSchedule ?? existing.meetingsToSchedule,
        trainingsRequired: body.trainingsRequired ?? existing.trainingsRequired,
        firstWeekTasks: body.firstWeekTasks ?? existing.firstWeekTasks,
        notes: body.notes ?? existing.notes,
      },
    });
    return success(updated);
  }

  const plan = await prisma.onboardingPlan.create({
    data: {
      onboardingId: id,
      meetingsToSchedule: body.meetingsToSchedule ?? [],
      trainingsRequired: body.trainingsRequired ?? [],
      firstWeekTasks: body.firstWeekTasks ?? [],
      notes: body.notes,
    },
  });
  return success(plan, 201);
}
