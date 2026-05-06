import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, roles } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { registerSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logAction } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.format());
    }

    const data = validation.data;

    // 2. Check if email or registrationNumber already exists
    const existingUserResult = await db.select().from(users).where(
      or(
        eq(users.email, data.email),
        eq(users.registrationNumber, data.registrationNumber)
      )
    ).limit(1);

    if (existingUserResult.length > 0) {
      return errorResponse("Email or Registration Number already exists", 409);
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(data.password);

    // 4. Fetch default "student" role
    const studentRoleResult = await db.select().from(roles).where(eq(roles.name, "student")).limit(1);
    const studentRole = studentRoleResult[0];

    if (!studentRole) {
      return errorResponse("Default student role not found. Contact administrator.", 500);
    }

    // 5. Insert into users table
    const [newUser] = await db.insert(users).values({
      fullName: data.fullName,
      registrationNumber: data.registrationNumber,
      sex: data.sex,
      email: data.email,
      password: hashedPassword,
      roleId: studentRole.id,
      programmeId: data.programmeId,
      yearOfStudy: data.yearOfStudy,
      isActive: true,
    }).returning({
      id: users.id,
      fullName: users.fullName,
      registrationNumber: users.registrationNumber,
      email: users.email,
      roleId: users.roleId,
      programmeId: users.programmeId,
      yearOfStudy: users.yearOfStudy,
      createdAt: users.createdAt,
    });

    // 6. Log audit action
    await logAction({
      userId: newUser.id,
      action: "CREATE_USER",
      entity: "USER",
      entityId: newUser.id,
      metadata: { registration: true },
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown",
      userAgent: req.headers.get("user-agent") || "Unknown",
    });

    // 7. Return user data (exclude password)
    return successResponse(newUser, "User registered successfully", 201);
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse("Internal server error", 500);
  }
}
