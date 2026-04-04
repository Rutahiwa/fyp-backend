import { NextRequest } from "next/server";
import { verifyToken, JWTPayload } from "./jwt";
import { db } from "../db";
import { users, rolePermissions, permissions } from "../db/schema";
import { eq, and } from "drizzle-orm";

export interface AuthResult {
  user?: JWTPayload & { isActive: boolean };
  error?: string;
  status?: number;
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
