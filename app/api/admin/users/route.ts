import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError, notFound } from "@/lib/api/response";

// GET /api/admin/users
export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: { department: { select: { code: true, name: true } } },
  });
  return success(users);
}

// POST /api/admin/users — Provision new user
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.email || !body.name || !body.role) {
    return validationError("Missing required fields: email, name, role");
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return validationError(`User with email ${body.email} already exists`);
  }

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      role: body.role,
      departmentId: body.departmentId || null,
    },
  });

  return success(user, 201);
}

// PUT /api/admin/users — Deactivate user
export async function PUT(request: NextRequest) {
  const body = await request.json();

  if (!body.userId) {
    return validationError("Missing required field: userId");
  }

  const user = await prisma.user.findUnique({ where: { id: body.userId } });
  if (!user) return notFound("User");

  const updated = await prisma.user.update({
    where: { id: body.userId },
    data: {
      isActive: body.isActive ?? !user.isActive,
      deactivatedAt: body.isActive === false ? new Date() : null,
    },
  });

  return success(updated);
}
