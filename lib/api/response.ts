import { NextResponse } from "next/server";

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function error(
  message: string,
  code: "VALIDATION_ERROR" | "NOT_FOUND" | "CONFLICT" | "ENFORCEMENT_BLOCKED" | "SERVER_ERROR" | "AUTH_ERROR",
  status = 400,
  details?: Record<string, unknown>
) {
  return NextResponse.json({ error: message, code, details }, { status });
}

export function notFound(entity: string) {
  return error(`${entity} not found`, "NOT_FOUND", 404);
}

export function enforcementBlocked(rule: string, message: string) {
  return error(message, "ENFORCEMENT_BLOCKED", 422, { rule });
}

export function validationError(message: string, field?: string) {
  return error(message, "VALIDATION_ERROR", 400, field ? { field } : undefined);
}

export function conflictError(message: string, details?: Record<string, unknown>) {
  return error(message, "CONFLICT", 409, details);
}
