import { NextRequest, NextResponse } from "next/server";
import { auth } from "./config";
import { prisma } from "@/lib/db/client";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

/**
 * Get the authenticated user from the request. Returns null if not authenticated.
 * In dev mode without active session, falls back to the dev recruiter user.
 */
export async function getAuthUser(request?: NextRequest): Promise<AuthUser | null> {
  const session = await auth();

  if (session?.user) {
    return {
      id: (session.user as { id?: string }).id ?? "",
      email: session.user.email ?? "",
      name: session.user.name ?? "",
      role: (session.user as { role?: string }).role ?? "",
    };
  }

  // Dev fallback: use the first recruiter user when no session exists
  if (process.env.NODE_ENV === "development") {
    const devUser = await prisma.user.findFirst({
      where: { role: "RECRUITER", isActive: true },
    });
    if (devUser) {
      return { id: devUser.id, email: devUser.email, name: devUser.name, role: devUser.role };
    }
  }

  return null;
}

/**
 * Require authentication. Returns 401 if not authenticated.
 */
export async function requireAuth(request?: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new AuthError("Authentication required");
  }
  return user;
}

/**
 * Require specific role(s). Returns 403 if user doesn't have the required role.
 */
export async function requireRole(roles: string[], request?: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request);
  if (!roles.includes(user.role)) {
    throw new AuthError(`Access denied. Required role: ${roles.join(" or ")}`, 403);
  }
  return user;
}

/**
 * Build a WHERE clause that scopes data based on user role.
 * - RECRUITER: only sees reqs they're assigned to
 * - HIRING_MANAGER: only sees reqs where they're the hiring manager
 * - RECRUITING_MANAGER: sees everything
 */
export function scopeReqsForUser(user: AuthUser): Record<string, unknown> {
  switch (user.role) {
    case "RECRUITER":
      return { recruiters: { some: { userId: user.id } } };
    case "HIRING_MANAGER":
      return { hiringManagerId: user.id };
    case "RECRUITING_MANAGER":
      return {};
    default:
      return { id: "none" }; // deny all
  }
}

/**
 * Build a WHERE clause for candidates scoped by user role.
 */
export function scopeCandidatesForUser(user: AuthUser): Record<string, unknown> {
  switch (user.role) {
    case "RECRUITER":
      return { requisition: { recruiters: { some: { userId: user.id } } } };
    case "HIRING_MANAGER":
      return { requisition: { hiringManagerId: user.id } };
    case "RECRUITING_MANAGER":
      return {};
    default:
      return { id: "none" };
  }
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.status = status;
  }
}

/**
 * Wrap an API handler with auth + error handling.
 */
export function withAuth(
  handler: (request: NextRequest, user: AuthUser, params?: unknown) => Promise<NextResponse>,
  options?: { roles?: string[] }
) {
  return async (request: NextRequest, context?: { params?: Promise<Record<string, string>> }) => {
    try {
      const user = options?.roles
        ? await requireRole(options.roles, request)
        : await requireAuth(request);

      const params = context?.params ? await context.params : undefined;
      return handler(request, user, params);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.message, code: "AUTH_ERROR" },
          { status: error.status }
        );
      }
      throw error;
    }
  };
}
