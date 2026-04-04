import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, otp } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { hashPassword } from "@/lib/auth/password";
import { logAction } from "@/lib/audit";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown";
    const body = await req.json();

    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.format());
    }

    const { resetToken, newPassword } = validation.data;

    try {
      const decoded = jwt.verify(resetToken, JWT_SECRET) as any;

      if (!decoded || decoded.purpose !== "password-reset") {
        return errorResponse("Invalid or expired reset token", 401);
      }

      const userId = decoded.userId;

      // Ensure user is active and exists
      const userResult = await db.select({ id: users.id }).from(users)
        .where(and(eq(users.id, userId), isNull(users.deletedAt)))
        .limit(1);

      if (userResult.length === 0) {
        return errorResponse("User not found", 404);
      }

      // Hash password and update
      const hashedNewPassword = await hashPassword(newPassword);

      await db.update(users)
        .set({ password: hashedNewPassword, updatedAt: new Date() })
        .where(eq(users.id, userId));

      // Cleanup remaining OTPs
      await db.update(otp)
        .set({ usedAt: new Date() })
        .where(and(eq(otp.userId, userId), isNull(otp.usedAt)));

      await logAction({
        userId,
        action: "RESET_PASSWORD",
        entity: "USER",
        entityId: userId,
        ipAddress: ip,
      });

      return successResponse(null, "Password has been successfully reset");
    } catch (err) {
      return errorResponse("Invalid or expired reset token", 401);
    }
  } catch (error) {
    console.error("Reset password error:", error);
    return errorResponse("Internal server error", 500);
  }
}
