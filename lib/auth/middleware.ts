import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "./jwt";
import { db } from "../db";
import { users, rolePermissions, permissions } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { errorResponse } from "../utils/api-response";

export interface AuthResult {
  user?: JWTPayload & { isActive: boolean };
  error?: string;
  status?: number;
}

export interface AuthContext {
  user: JWTPayload & { isActive: boolean };
}

type RouteContext = { params: Promise<Record<string, string>> };
type AuthenticatedHandler = (
  req: NextRequest,
  ctx: RouteContext & AuthContext,
) => Promise<NextResponse>;

/**
 * Wraps a route handler — extracts and verifies the JWT, then injects `user`
 * into the context. Returns 401 if authentication fails.
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest, ctx: RouteContext): Promise<NextResponse> => {
    const auth = await authenticateRequest(req);
    if (auth.error || !auth.user) {
      return errorResponse(auth.error || "Unauthorized", auth.status || 401);
    }
    return handler(req, { ...ctx, user: auth.user });
  };
}

/**
 * Wraps a route handler — authenticates AND checks for a specific permission.
 * Returns 401 if unauthenticated, 403 if missing the required permission.
 */
export function withPermission(handler: AuthenticatedHandler, permissionName: string) {
  return withAuth(async (req, ctx) => {
    const hasPerm = await checkPermission(ctx.user.roleId, permissionName);
    if (!hasPerm) return errorResponse("Forbidden. Missing required permission.", 403);
    return handler(req, ctx);
  });
}

export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "Missing or invalid authorization header", status: 401 };
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return { error: "Invalid or expired token", status: 401 };
    }

    // Verify user still exists and is active
    const userResult = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    const user = userResult[0];

    if (!user || user.deletedAt) {
      return { error: "User no longer exists", status: 401 };
    }

    if (!user.isActive) {
      return { error: "User account is inactive", status: 403 };
    }

    return { user: { ...decoded, isActive: user.isActive } };
  } catch (error) {
    return { error: "Authentication failed", status: 500 };
  }
}

export async function checkPermission(roleId: string, permissionName: string): Promise<boolean> {
  const result = await db.select()
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(permissions.name, permissionName)
      )
    );

  return result.length > 0;
}
