import { prisma } from "@/lib/db/client";
import type { AuditAction } from "@/app/generated/prisma";
import { Prisma } from "@/app/generated/prisma";

type AuditParams = {
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown> | null;
  ipAddress?: string | null;
  sessionId?: string | null;
};

/**
 * Log an audit event. Fire-and-forget — never throws.
 * Audit failures must not break user operations.
 */
export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changes: (params.changes as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        ipAddress: params.ipAddress ?? null,
        sessionId: params.sessionId ?? null,
      },
    });
  } catch (error) {
    // Log to stderr but never throw — audit failures must not break operations
    console.error("[AUDIT] Failed to log audit event:", {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Log a PII read event (Tier 1 or Tier 2 field access).
 */
export async function logPIIAccess(
  userId: string,
  entityType: string,
  entityId: string,
  fields: string[],
  ipAddress?: string
): Promise<void> {
  await logAudit({
    userId,
    action: "READ_PII",
    entityType,
    entityId,
    changes: { fieldsAccessed: fields },
    ipAddress,
  });
}

/**
 * Log a data mutation with before/after state.
 */
export async function logMutation(
  userId: string,
  action: "CREATE" | "UPDATE" | "DELETE",
  entityType: string,
  entityId: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
  ipAddress?: string
): Promise<void> {
  await logAudit({
    userId,
    action,
    entityType,
    entityId,
    changes: { before, after },
    ipAddress,
  });
}

/**
 * Log a stage transition event.
 */
export async function logStageTransition(
  userId: string,
  candidateId: string,
  fromStage: string | null,
  toStage: string,
  ipAddress?: string
): Promise<void> {
  await logAudit({
    userId,
    action: "STAGE_TRANSITION",
    entityType: "candidate",
    entityId: candidateId,
    changes: { fromStage, toStage },
    ipAddress,
  });
}
