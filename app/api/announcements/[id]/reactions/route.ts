import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { reactions, announcements } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export const POST = withAuth(async (_req, ctx) => {
  const { id } = await ctx.params;
  const userId = ctx.user.userId;

  // Verify announcement exists
  const ann = await db.select({ id: announcements.id })
    .from(announcements)
    .where(and(eq(announcements.id, id), isNull(announcements.deletedAt)))
    .limit(1);
  if (ann.length === 0) return errorResponse("Announcement not found", 404);

  // Check if reaction already exists
  const existing = await db.select({ id: reactions.id })
    .from(reactions)
    .where(and(
      eq(reactions.userId, userId),
      eq(reactions.targetId, id),
      eq(reactions.targetType, "ANNOUNCEMENT"),
    ))
    .limit(1);

  if (existing.length > 0) {
    // Unlike — remove existing reaction
    await db.delete(reactions).where(eq(reactions.id, existing[0].id));
    return successResponse({ action: "unliked" }, "Reaction removed");
  }

  // Like — insert new reaction
  await db.insert(reactions).values({
    userId,
    targetId: id,
    targetType: "ANNOUNCEMENT",
    type: "LIKE",
  });

  return successResponse({ action: "liked" }, "Reaction added", 201);
});
