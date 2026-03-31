import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError } from "@/lib/api/response";

// GET /api/notifications?userId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) return validationError("userId query parameter is required");

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId, readAt: null },
  });

  return success({ notifications, unreadCount });
}

// POST /api/notifications/mark-read
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.notificationId) {
    // Mark single notification as read
    await prisma.notification.update({
      where: { id: body.notificationId },
      data: { readAt: new Date() },
    });
  } else if (body.userId) {
    // Mark all as read for user
    await prisma.notification.updateMany({
      where: { userId: body.userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  return success({ marked: true });
}
