import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, otp } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logAction } from "@/lib/audit";
import { sendOtpEmail } from "@/lib/mail";
import { rateLimit } from "@/lib/utils/rate-limit";
import crypto from "crypto";
import { z } from "zod";

const changeEmailRequestSchema = z.object({
  newEmail: z.string().email(),
});

export const POST = withAuth(async (req, ctx) => {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown";

  const rl = rateLimit(`change_email_${ctx.user.userId}`, 3, 15 * 60 * 1000);
  if (!rl.success) return errorResponse("Too many requests. Please try again later.", 429);

  const body = await req.json();
  const validation = changeEmailRequestSchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  const { newEmail } = validation.data;

  // Check if new email is already taken
  const existing = await db.select({ id: users.id }).from(users)
    .where(and(eq(users.email, newEmail), isNull(users.deletedAt)))
    .limit(1);
  if (existing.length > 0) return errorResponse("Email is already in use", 409);

  // Invalidate existing unused OTPs for this user
  await db.update(otp)
    .set({ usedAt: new Date() })
    .where(and(eq(otp.userId, ctx.user.userId), isNull(otp.usedAt)));

  // Generate OTP and send to NEW email
  const otpCode = crypto.randomInt(100000, 999999).toString();
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "10", 10);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  await db.insert(otp).values({
    userId: ctx.user.userId,
    otpCode,
    expiresAt,
  });

  await sendOtpEmail(newEmail, otpCode);

  await logAction({
    userId: ctx.user.userId,
    action: "CHANGE_EMAIL_REQUEST",
    entity: "USER",
    entityId: ctx.user.userId,
    metadata: { newEmail },
    ipAddress: ip,
  });

  return successResponse(null, "Verification code sent to the new email address");
});
