import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError } from "@/lib/api/response";

// GET /api/referral-bonuses
export async function GET() {
  const bonuses = await prisma.referralBonus.findMany({
    orderBy: { createdAt: "desc" },
  });
  return success(bonuses);
}

// POST /api/referral-bonuses
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.referrer || !body.amount) {
    return validationError("Missing required fields: referrer, amount");
  }

  const bonus = await prisma.referralBonus.create({
    data: {
      referrer: body.referrer,
      candidateId: body.candidateId || null,
      amount: body.amount,
      status: body.status ?? "PENDING",
    },
  });

  return success(bonus, 201);
}
