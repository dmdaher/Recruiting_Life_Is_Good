import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError } from "@/lib/api/response";

export async function GET() {
  const packages = await prisma.equipmentPackage.findMany({ orderBy: { name: "asc" } });
  return success(packages);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name || !body.hardwareType || !body.roleFamily) {
    return validationError("Missing required fields: name, hardwareType, roleFamily");
  }
  const pkg = await prisma.equipmentPackage.create({
    data: {
      name: body.name,
      hardwareType: body.hardwareType,
      peripherals: body.peripherals ?? [],
      roleFamily: body.roleFamily,
      isDefault: body.isDefault ?? false,
    },
  });
  return success(pkg, 201);
}
