import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError } from "@/lib/api/response";

// GET /api/search?q=term — Global candidate search across all reqs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return validationError("Search query must be at least 2 characters");
  }

  const candidates = await prisma.candidate.findMany({
    where: {
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
      ],
    },
    include: {
      currentStage: { select: { name: true } },
      requisition: { select: { reqNumber: true, title: true } },
      source: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return success(candidates);
}
