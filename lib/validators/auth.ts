import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  registrationNumber: z.string().min(5, "Registration number is required"),
  course: z.string().min(2, "Course is required"),
  sex: z.enum(["MALE", "FEMALE"]),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const generateOtpSchema = z.object({
  email: z.string().email(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otpCode: z.string().length(6, "OTP must be exactly 6 characters"),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
