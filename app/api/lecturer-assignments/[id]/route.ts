import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { lecturerAssignments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logAction } from "@/lib/audit";

export const DELETE = withPermission(async (_req, ctx) => {
  const { id } = await ctx.params;

  const existing = await db.select().from(lecturerAssignments).where(eq(lecturerAssignments.id, id)).limit(1);
  if (existing.length === 0) return errorResponse("Assignment not found", 404);

  await db.delete(lecturerAssignments).where(eq(lecturerAssignments.id, id));

  await logAction({
    userId: ctx.user.userId,
    action: "DELETE_LECTURER_ASSIGNMENT",
    entity: "LECTURER_ASSIGNMENT",
    entityId: id,
  });

  return successResponse(null, "Lecturer assignment removed successfully");
}, "assignment.manage");
