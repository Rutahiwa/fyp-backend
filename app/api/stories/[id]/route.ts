import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logAction } from "@/lib/audit";

export const DELETE = withPermission(async (_req, ctx) => {
  const { id } = await ctx.params;

  const existing = await db.select({ id: stories.id })
    .from(stories)
    .where(and(eq(stories.id, id), isNull(stories.deletedAt)))
    .limit(1);

  if (existing.length === 0) return errorResponse("Story not found", 404);

  await db.update(stories)
    .set({ deletedAt: new Date() })
    .where(eq(stories.id, id));

  await logAction({
    userId: ctx.user.userId,
    action: "DELETE_STORY",
    entity: "STORY",
    entityId: id,
  });

  return successResponse(null, "Story deleted successfully");
}, "story.delete");
