import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { stories, storyViews, users, colleges, media } from "@/lib/db/schema";
import { eq, and, isNull, gt, desc, sql } from "drizzle-orm";
import { withAuth, withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { createStorySchema } from "@/lib/validators/stories";
import { logAction } from "@/lib/audit";

export const GET = withAuth(async (_req, ctx) => {
  const userId = ctx.user.userId;

  const activeStories = await db.select({
    id: stories.id,
    caption: stories.caption,
    backgroundColor: stories.backgroundColor,
    linkUrl: stories.linkUrl,
    linkText: stories.linkText,
    viewCount: stories.viewCount,
    expiresAt: stories.expiresAt,
    createdAt: stories.createdAt,
    authorId: users.id,
    authorName: users.fullName,
    collegeId: colleges.id,
    collegeName: colleges.name,
    collegeShortName: colleges.shortName,
    mediaId: media.id,
    mediaUrl: media.url,
    mediaType: media.type,
  })
  .from(stories)
  .leftJoin(users, eq(stories.authorId, users.id))
  .leftJoin(colleges, eq(stories.collegeId, colleges.id))
  .leftJoin(media, eq(stories.mediaId, media.id))
  .where(and(
    isNull(stories.deletedAt),
    gt(stories.expiresAt, new Date()),
  ))
  .orderBy(desc(stories.createdAt));

  // Get viewed story IDs for the current user
  const viewed = await db.select({ storyId: storyViews.storyId })
    .from(storyViews)
    .where(eq(storyViews.userId, userId));

  const viewedSet = new Set(viewed.map(v => v.storyId));

  const data = activeStories.map(s => ({
    id: s.id,
    caption: s.caption,
    backgroundColor: s.backgroundColor,
    linkUrl: s.linkUrl,
    linkText: s.linkText,
    viewCount: s.viewCount,
    expiresAt: s.expiresAt,
    createdAt: s.createdAt,
    hasViewed: viewedSet.has(s.id),
    author: { id: s.authorId, fullName: s.authorName },
    college: s.collegeId ? { id: s.collegeId, name: s.collegeName, shortName: s.collegeShortName } : null,
    media: s.mediaId ? { id: s.mediaId, url: s.mediaUrl, type: s.mediaType } : null,
  }));

  return successResponse(data);
});

export const POST = withPermission(async (req, ctx) => {
  const body = await req.json();
  const validation = createStorySchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  const d = validation.data;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 hours

  const [created] = await db.insert(stories).values({
    authorId: ctx.user.userId,
    collegeId: d.collegeId || null,
    mediaId: d.mediaId,
    caption: d.caption || null,
    backgroundColor: d.backgroundColor || null,
    linkUrl: d.linkUrl || null,
    linkText: d.linkText || null,
    expiresAt,
  }).returning();

  await logAction({
    userId: ctx.user.userId,
    action: "CREATE_STORY",
    entity: "STORY",
    entityId: created.id,
  });

  return successResponse(created, "Story created successfully", 201);
}, "story.create");
