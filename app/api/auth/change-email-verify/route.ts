import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, otp } from "@/lib/db/schema";
import { eq, and, gt, desc, isNull } from "drizzle-orm";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logAction } from "@/lib/audit";
import { rateLimit } from "@/lib/utils/rate-limit";
import { z } from "zod";

const changeEmailVerifySchema = z.object({
  newEmail: z.string().email(),
  otpCode: z.string().length(6, "OTP must be exactly 6 characters"),
});

export const POST = withAuth(async (req, ctx) => {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown";

  const rl = rateLimit(`change_email_verify_${ctx.user.userId}`, 5, 15 * 60 * 1000);
  if (!rl.success) return errorResponse("Too many attempts. Please request a new code.", 429);

  const body = await req.json();
  const validation = changeEmailVerifySchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  const { newEmail, otpCode } = validation.data;

  // Double-check email is not taken (race condition guard)
  const emailTaken = await db.select({ id: users.id }).from(users)
    .where(and(eq(users.email, newEmail), isNull(users.deletedAt)))
    .limit(1);
  if (emailTaken.length > 0) return errorResponse("Email is already in use", 409);

  // Find valid OTP
  const validOtp = await db.select()
    .from(otp)
    .where(and(
      eq(otp.userId, ctx.user.userId),
      eq(otp.otpCode, otpCode),
      gt(otp.expiresAt, new Date()),
      isNull(otp.usedAt)
    ))
    .orderBy(desc(otp.createdAt))
    .limit(1);

  if (validOtp.length === 0) return errorResponse("Invalid or expired verification code", 400);

  // Mark OTP as used
  await db.update(otp)
    .set({ usedAt: new Date() })
    .where(eq(otp.id, validOtp[0].id));

  // Update email
  await db.update(users)
    .set({ email: newEmail, updatedAt: new Date() })
    .where(eq(users.id, ctx.user.userId));

  await logAction({
    userId: ctx.user.userId,
    action: "CHANGE_EMAIL_VERIFY",
    entity: "USER",
    entityId: ctx.user.userId,
    metadata: { newEmail },
    ipAddress: ip,
  });

  return successResponse({ email: newEmail }, "Email changed successfully");
});
