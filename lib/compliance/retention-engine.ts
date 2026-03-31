import { prisma } from "@/lib/db/client";
import { logAudit } from "@/lib/audit/service";

type PurgeResult = {
  entityType: string;
  jurisdiction: string;
  candidatesChecked: number;
  candidatesPurged: number;
  skippedDueToHold: number;
};

/**
 * Run the retention engine — identifies and optionally purges records past their retention period.
 * Respects legal holds. Logs every deletion.
 */
export async function runRetentionEngine(dryRun: boolean = true): Promise<PurgeResult[]> {
  const policies = await prisma.dataRetentionPolicy.findMany({
    where: { entityType: "candidate" },
  });

  const results: PurgeResult[] = [];
  const now = new Date();

  for (const policy of policies) {
    const cutoffDate = new Date(now.getTime() - policy.retentionDays * 24 * 60 * 60 * 1000);

    // Find candidates past retention for this jurisdiction
    const candidates = await prisma.candidate.findMany({
      where: {
        jurisdiction: policy.jurisdiction,
        createdAt: { lt: cutoffDate },
        currentStage: { isTerminal: false }, // Don't auto-purge hired employees
      },
      select: { id: true, firstName: true, lastName: true },
    });

    let purged = 0;
    let skipped = 0;

    for (const candidate of candidates) {
      // Check for legal holds
      const holds = await prisma.legalHold.findMany({
        where: { entityType: "candidate", entityId: candidate.id, releasedAt: null },
      });

      if (holds.length > 0) {
        skipped++;
        continue;
      }

      if (!dryRun) {
        await logAudit({
          action: "DELETE",
          entityType: "candidate",
          entityId: candidate.id,
          changes: {
            type: "RETENTION_PURGE",
            policy: `${policy.jurisdiction} — ${policy.retentionDays} days`,
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
          },
        });

        await prisma.candidate.delete({ where: { id: candidate.id } });
      }

      purged++;
    }

    results.push({
      entityType: "candidate",
      jurisdiction: policy.jurisdiction,
      candidatesChecked: candidates.length,
      candidatesPurged: purged,
      skippedDueToHold: skipped,
    });
  }

  return results;
}
