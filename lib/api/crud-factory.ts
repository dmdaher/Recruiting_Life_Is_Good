import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError } from "@/lib/api/response";

type ModelName = "location" | "source" | "agency" | "client" | "employeeType" | "postingChannel";

const modelMap = {
  location: prisma.location,
  source: prisma.source,
  agency: prisma.agency,
  client: prisma.client,
  employeeType: prisma.employeeType,
  postingChannel: prisma.postingChannel,
} as const;

const orderByMap: Record<ModelName, Record<string, "asc" | "desc">> = {
  location: { name: "asc" },
  source: { name: "asc" },
  agency: { name: "asc" },
  client: { name: "asc" },
  employeeType: { code: "asc" },
  postingChannel: { name: "asc" },
};

export function createCrudHandlers(modelName: ModelName) {
  const model = modelMap[modelName] as any;

  return {
    async GET() {
      const data = await model.findMany({ orderBy: orderByMap[modelName] });
      return success(data);
    },

    async POST(request: NextRequest) {
      const body = await request.json();

      if (!body.name && !body.code) {
        return validationError("Missing required field: name or code");
      }

      const record = await model.create({ data: body });
      return success(record, 201);
    },
  };
}
