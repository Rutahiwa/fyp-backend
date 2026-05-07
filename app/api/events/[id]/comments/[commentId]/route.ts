import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { comments, roles, users as usersTable } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logAction } from "@/lib/audit";

export const DELETE = withAuth(async (req, ctx) => {
  const { id, commentId } = await ctx.params;
  const userId = ctx.user.userId;

  const [comment] = await db.select({ id: comments.id, authorId: comments.authorId })
    .from(comments)
    .where(and(
      eq(comments.id, commentId),
      eq(comments.targetId, id),
      eq(comments.targetType, "EVENT"),
      isNull(comments.deletedAt),
    ))
    .limit(1);

  if (!comment) return errorResponse("Comment not found", 404);

  const [adminCheck] = await db.select({ name: roles.name })
    .from(roles).innerJoin(usersTable, eq(usersTable.roleId, roles.id))
    .where(eq(usersTable.id, userId)).limit(1);

  if (comment.authorId !== userId && adminCheck?.name !== "admin") {
    return errorResponse("Forbidden", 403);
  }

  await db.update(comments).set({ deletedAt: new Date() }).where(eq(comments.id, commentId));

  await logAction({ userId, action: "DELETE_COMMENT", entity: "COMMENT", entityId: commentId });
  return successResponse(null, "Comment deleted successfully");
});
