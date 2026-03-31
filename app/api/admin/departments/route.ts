import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError } from "@/lib/api/response";

// GET /api/admin/departments
export async function GET() {
  const departments = await prisma.department.findMany({
    orderBy: { code: "asc" },
    include: { _count: { select: { requisitions: true, users: true } } },
  });
  return success(departments);
}

// POST /api/admin/departments
export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.code || !body.name) {
    return validationError("Missing required fields: code, name");
  }

  const dept = await prisma.department.create({
    data: { code: body.code, name: body.name },
  });
  return success(dept, 201);
}
