import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, roles } from "@/lib/db/schema";
import { eq, and, isNull, ne } from "drizzle-orm";
import { authenticateRequest, checkPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logAction } from "@/lib/audit";
import { updateUserSchema } from "@/lib/validators/users";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateRequest(req);
    if (auth.error || !auth.user) {
      return errorResponse(auth.error || "Unauthorized", auth.status || 401);
    }
    const resolvedParams = await params;
    const userId = resolvedParams.id === "me" ? auth.user.userId : resolvedParams.id;

    // Must be own profile or have 'user.read' permission
    if (auth.user.userId !== userId) {
      const hasPerm = await checkPermission(auth.user.roleId, "user.read");
      if (!hasPerm) return errorResponse("Forbidden", 403);
    }

    const dbUser = await db.query.users.findFirst({
      where: and(eq(users.id, userId), isNull(users.deletedAt)),
      with: {
        role: true,
        college: true,
        programme: true,
      }
    });

    if (!dbUser) return errorResponse("User not found", 404);

    const formattedUser = {
      id: dbUser.id,
      fullName: dbUser.fullName,
      registrationNumber: dbUser.registrationNumber,
      sex: dbUser.sex,
      email: dbUser.email,
      isActive: dbUser.isActive,
      roleId: dbUser.roleId,
      roleName: dbUser.role?.name,
      collegeId: dbUser.collegeId,
      college: dbUser.college,
      programmeId: dbUser.programmeId,
      programme: dbUser.programme,
      yearOfStudy: dbUser.yearOfStudy,
      currentSemester: dbUser.currentSemester,
      createdAt: dbUser.createdAt,
      phoneNumber: (dbUser as any).phoneNumber,
    };

    return successResponse(formattedUser);
  } catch (error) {
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateRequest(req);
    if (auth.error || !auth.user) return errorResponse(auth.error || "Unauthorized", auth.status || 401);
    const resolvedParams = await params;
    const userId = resolvedParams.id === "me" ? auth.user.userId : resolvedParams.id;

    if (auth.user.userId !== userId) {
      const hasPerm = await checkPermission(auth.user.roleId, "user.update");
      if (!hasPerm) return errorResponse("Forbidden", 403);
    }

    const body = await req.json();
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

    // Only admins can change roleId or isActive
    const isAdmin = await checkPermission(auth.user.roleId, "role.update");
    if (!isAdmin && (validation.data.roleId || validation.data.isActive !== undefined)) {
      return errorResponse("Action not allowed", 403);
    }

    if (validation.data.email) {
      const existing = await db.select().from(users).where(and(eq(users.email, validation.data.email), ne(users.id, userId))).limit(1);
      if (existing.length > 0) return errorResponse("Email already taken", 409);
    }

    const [updatedUser] = await db.update(users)
      .set({ ...validation.data, updatedAt: new Date() })
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .returning({ id: users.id, fullName: users.fullName, email: users.email });

    if (!updatedUser) return errorResponse("User not found", 404);

    await logAction({
      userId: auth.user.userId,
      action: "UPDATE_USER",
      entity: "USER",
      entityId: userId,
      ipAddress: req.headers.get("x-forwarded-for") || "Unknown",
    });

    return successResponse(updatedUser, "User updated successfully");
  } catch (error) {
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateRequest(req);
    if (auth.error || !auth.user) return errorResponse(auth.error || "Unauthorized", auth.status || 401);
    
    const hasPerm = await checkPermission(auth.user.roleId, "user.delete");
    if (!hasPerm) return errorResponse("Forbidden", 403);

    const resolvedParams = await params;
    const userId = resolvedParams.id === "me" ? auth.user.userId : resolvedParams.id;

    const [deletedUser] = await db.update(users)
      .set({ deletedAt: new Date(), isActive: false })
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .returning({ id: users.id });

    if (!deletedUser) return errorResponse("User not found or already deleted", 404);

    await logAction({ userId: auth.user.userId, action: "DELETE_USER", entity: "USER", entityId: userId });

    return successResponse(null, "User deleted successfully");
  } catch (error) {
    return errorResponse("Internal server error", 500);
  }
}
