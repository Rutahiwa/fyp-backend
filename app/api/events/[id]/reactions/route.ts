import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { reactions, events } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export const POST = withAuth(async (_req, ctx) => {
  const { id } = await ctx.params;
  const userId = ctx.user.userId;

  const evt = await db.select({ id: events.id })
    .from(events).where(and(eq(events.id, id), isNull(events.deletedAt))).limit(1);
  if (evt.length === 0) return errorResponse("Event not found", 404);

  const existing = await db.select({ id: reactions.id })
    .from(reactions)
    .where(and(
      eq(reactions.userId, userId),
      eq(reactions.targetId, id),
      eq(reactions.targetType, "EVENT"),
    ))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(reactions).where(eq(reactions.id, existing[0].id));
    return successResponse({ action: "unliked" }, "Reaction removed");
  }

  await db.insert(reactions).values({
    userId,
    targetId: id,
    targetType: "EVENT",
    type: "LIKE",
  });

  return successResponse({ action: "liked" }, "Reaction added", 201);
});
