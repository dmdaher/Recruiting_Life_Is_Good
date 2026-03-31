import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { success } from "@/lib/api/response";
import { runRetentionEngine } from "@/lib/compliance/retention-engine";

// GET /api/compliance/retention — Dry run: show what would be purged
export async function GET() {
  const results = await runRetentionEngine(true); // dry run
  const policies = await prisma.dataRetentionPolicy.findMany({
    orderBy: [{ entityType: "asc" }, { jurisdiction: "asc" }],
  });

  return success({ dryRun: true, results, policies });
}

// POST /api/compliance/retention — Execute purge (requires confirmation)
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.confirm !== true) {
    return success({
      message: "Dry run only. Send { confirm: true } to execute the purge.",
      results: await runRetentionEngine(true),
    });
  }

  const results = await runRetentionEngine(false); // actual purge
  return success({ executed: true, results });
}
