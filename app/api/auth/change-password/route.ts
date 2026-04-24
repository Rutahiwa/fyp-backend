import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { changePasswordSchema } from "@/lib/validators/auth";
import { comparePassword, hashPassword } from "@/lib/auth/password";
import { authenticateRequest } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logAction } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const auth = await authenticateRequest(req);
    if (auth.error || !auth.user) {
      return errorResponse(auth.error || "Unauthorized", auth.status || 401);
    }

    const body = await req.json();

    // 2. Validate input
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.format());
    }

    const { currentPassword, newPassword } = validation.data;
    const userId = auth.user.userId;

    // 3. Fetch user directly
    const userResult = await db.select({ password: users.password }).from(users).where(eq(users.id, userId)).limit(1);
    const user = userResult[0];

    if (!user) {
      return errorResponse("User not found", 404);
    }

    // 4. Verify old password
    const isOldPasswordMatch = await comparePassword(currentPassword, user.password);
    if (!isOldPasswordMatch) {
      return errorResponse("Incorrect current password", 400);
    }

    // 5. Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // 6. Update password in the database
    await db.update(users)
      .set({ password: hashedNewPassword, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // 7. Log audit action
    await logAction({
      userId,
      action: "CHANGE_PASSWORD",
      entity: "USER",
      entityId: userId,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown",
    });

    return successResponse(null, "Password changed successfully", 200);

  } catch (error) {
    console.error("Change password error:", error);
    return errorResponse("Internal server error", 500);
  }
}
