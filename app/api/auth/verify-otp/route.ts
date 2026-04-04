import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, otp } from "@/lib/db/schema";
import { eq, and, gt, desc, isNull } from "drizzle-orm";
import { verifyOtpSchema } from "@/lib/validators/auth";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logAction } from "@/lib/audit";
import { rateLimit } from "@/lib/utils/rate-limit";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown";
    const body = await req.json();

    const validation = verifyOtpSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.format());
    }

    const { email, otpCode } = validation.data;

    // Rate limit: 5 attempts per 15 mins per email
    const rl = rateLimit(`verify_otp_${email}`, 5, 15 * 60 * 1000);
    if (!rl.success) {
      return errorResponse("Too many attempts. Please request a new OTP.", 429);
    }

    const userResult = await db.select({ id: users.id }).from(users)
      .where(and(eq(users.email, email), eq(users.isActive, true), isNull(users.deletedAt)))
      .limit(1);
    
    const user = userResult[0];
    if (!user) {
      return errorResponse("Invalid or expired OTP", 400);
    }

    // Find latest valid OTP
    const latestOtpResult = await db.select()
      .from(otp)
      .where(and(
        eq(otp.userId, user.id),
        eq(otp.otpCode, otpCode),
        gt(otp.expiresAt, new Date()),
        isNull(otp.usedAt)
      ))
      .orderBy(desc(otp.createdAt))
      .limit(1);

    const validOtp = latestOtpResult[0];

    if (!validOtp) {
      return errorResponse("Invalid or expired OTP", 400);
    }

    // Mark marked as used
    await db.update(otp)
      .set({ usedAt: new Date() })
      .where(eq(otp.id, validOtp.id));

    // Generate short-lived reset token (10 mins)
    const resetToken = jwt.sign(
      { userId: user.id, purpose: "password-reset" },
      JWT_SECRET,
      { expiresIn: "10m" as any }
    );

    await logAction({
      userId: user.id,
      action: "VERIFY_OTP",
      entity: "OTP",
      entityId: validOtp.id,
      ipAddress: ip,
    });

    return successResponse({ resetToken }, "OTP verified successfully");

  } catch (error) {
    console.error("Verify OTP error:", error);
    return errorResponse("Internal server error", 500);
  }
}
