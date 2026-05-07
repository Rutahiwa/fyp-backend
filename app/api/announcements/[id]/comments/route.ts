import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { comments, users, announcements } from "@/lib/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { createCommentSchema } from "@/lib/validators/comments";
import { logAction } from "@/lib/audit";

export const GET = withAuth(async (_req, ctx) => {
  const { id } = await ctx.params;

  // Verify announcement exists
  const ann = await db.select({ id: announcements.id })
    .from(announcements)
    .where(and(eq(announcements.id, id), isNull(announcements.deletedAt)))
    .limit(1);
  if (ann.length === 0) return errorResponse("Announcement not found", 404);

  const list = await db.select({
    id: comments.id,
    content: comments.content,
    createdAt: comments.createdAt,
    authorId: users.id,
    authorName: users.fullName,
  })
  .from(comments)
  .leftJoin(users, eq(comments.authorId, users.id))
  .where(and(
    eq(comments.targetId, id),
    eq(comments.targetType, "ANNOUNCEMENT"),
    isNull(comments.deletedAt),
  ))
  .orderBy(desc(comments.createdAt));

  return successResponse(list);
});

export const POST = withAuth(async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const validation = createCommentSchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  // Verify announcement exists and is not deleted
  const ann = await db.select({ id: announcements.id, status: announcements.status })
    .from(announcements)
    .where(and(eq(announcements.id, id), isNull(announcements.deletedAt)))
    .limit(1);
  if (ann.length === 0) return errorResponse("Announcement not found", 404);

  const [created] = await db.insert(comments).values({
    authorId: ctx.user.userId,
    targetId: id,
    targetType: "ANNOUNCEMENT",
    content: validation.data.content,
  }).returning();

  await logAction({
    userId: ctx.user.userId,
    action: "CREATE_COMMENT",
    entity: "COMMENT",
    entityId: created.id,
    metadata: { targetId: id, targetType: "ANNOUNCEMENT" },
  });

  const [withAuthor] = await db.select({
    id: comments.id,
    content: comments.content,
    createdAt: comments.createdAt,
    authorId: users.id,
    authorName: users.fullName,
  })
  .from(comments)
  .leftJoin(users, eq(comments.authorId, users.id))
  .where(eq(comments.id, created.id));

  return successResponse(withAuthor, "Comment posted successfully", 201);
});
