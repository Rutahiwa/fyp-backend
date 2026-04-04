import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, roles } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { loginSchema } from "@/lib/validators/auth";
import { comparePassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logAction } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.format());
    }

    const { email, password } = validation.data;

    // 2. Fetch user by email (active & not deleted)
    const userResult = await db.select({
      id: users.id,
      email: users.email,
      password: users.password,
      isActive: users.isActive,
      roleId: users.roleId,
      roleName: roles.name,
      fullName: users.fullName,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

    const user = userResult[0];

    // Check if user exists
    if (!user) {
      return errorResponse("Invalid credentials", 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse("Account is suspended or inactive", 403);
    }

    // 3. Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse("Invalid credentials", 401);
    }

    // 4. Generate JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    // 5. Log audit action
    await logAction({
      userId: user.id,
      action: "LOGIN",
      entity: "USER",
      entityId: user.id,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown",
      userAgent: req.headers.get("user-agent") || "Unknown",
    });

    // 6. Return response (exclude password)
    return successResponse(
      {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          roleId: user.roleId,
          roleName: user.roleName,
        }
      },
      "Login successful",
      200
    );

  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Internal server error", 500);
  }
}
