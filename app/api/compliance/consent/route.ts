import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success, validationError } from "@/lib/api/response";

// GET /api/compliance/consent — List consents, optionally filtered
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get("candidateId");
  const expiringSoon = searchParams.get("expiringSoon") === "true";

  const where: Record<string, unknown> = { withdrawnAt: null };
  if (candidateId) where.candidateId = candidateId;
  if (expiringSoon) {
    where.expiresAt = { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), not: null };
  }

  const consents = await prisma.consent.findMany({
    where,
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true } },
      privacyNoticeVersion: { select: { jurisdiction: true, version: true } },
    },
    orderBy: { expiresAt: "asc" },
  });

  return success(consents);
}

// POST /api/compliance/consent — Log consent for a candidate
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.candidateId || !body.type || !body.jurisdiction) {
    return validationError("Missing required fields: candidateId, type, jurisdiction");
  }

  const privacyNotice = await prisma.privacyNoticeVersion.findFirst({
    where: { jurisdiction: body.jurisdiction, supersededAt: null },
    orderBy: { version: "desc" },
  });

  if (!privacyNotice) {
    return validationError(`No active privacy notice found for jurisdiction: ${body.jurisdiction}`);
  }

  const consent = await prisma.consent.create({
    data: {
      candidateId: body.candidateId,
      privacyNoticeVersionId: privacyNotice.id,
      type: body.type,
      jurisdiction: body.jurisdiction,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year
    },
  });

  return success(consent, 201);
}
