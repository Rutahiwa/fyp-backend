import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { stories, storyViews } from "@/lib/db/schema";
import { eq, and, gt, isNull, sql } from "drizzle-orm";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export const POST = withAuth(async (_req, ctx) => {
  const { id } = await ctx.params;
  const userId = ctx.user.userId;

  // Verify story exists and is active
  const story = await db.select({ id: stories.id })
    .from(stories)
    .where(and(
      eq(stories.id, id),
      isNull(stories.deletedAt),
      gt(stories.expiresAt, new Date()),
    ))
    .limit(1);

  if (story.length === 0) return errorResponse("Story not found or expired", 404);

  // Upsert view record (ON CONFLICT DO NOTHING — composite PK handles uniqueness)
  await db.insert(storyViews)
    .values({ storyId: id, userId })
    .onConflictDoNothing({ target: [storyViews.storyId, storyViews.userId] });

  // Increment viewCount if this is a new view (fire-and-forget)
  db.update(stories)
    .set({ viewCount: sql`${stories.viewCount} + 1` })
    .where(eq(stories.id, id))
    .execute()
    .catch(() => {});

  return successResponse({ viewed: true }, "Story marked as viewed");
});
