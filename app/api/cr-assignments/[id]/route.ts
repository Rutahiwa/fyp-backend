import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { crAssignments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logAction } from "@/lib/audit";

export const DELETE = withPermission(async (_req, ctx) => {
  const { id } = await ctx.params;

  const existing = await db.select().from(crAssignments).where(eq(crAssignments.id, id)).limit(1);
  if (existing.length === 0) return errorResponse("CR assignment not found", 404);

  await db.delete(crAssignments).where(eq(crAssignments.id, id));

  await logAction({
    userId: ctx.user.userId,
    action: "DELETE_CR_ASSIGNMENT",
    entity: "CR_ASSIGNMENT",
    entityId: id,
  });

  return successResponse(null, "CR assignment removed successfully");
}, "assignment.manage");
