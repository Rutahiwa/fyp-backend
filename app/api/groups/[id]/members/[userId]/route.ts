import { db } from "@/lib/db";
import { groupMemberships, groups } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logAction } from "@/lib/audit";

export const DELETE = withPermission(async (_req, ctx) => {
  const { id: groupId, userId: memberUserId } = await ctx.params;

  const group = await db.select({ id: groups.id }).from(groups).where(eq(groups.id, groupId)).limit(1);
  if (group.length === 0) return errorResponse("Group not found", 404);

  const [m] = await db
    .select({ id: groupMemberships.id })
    .from(groupMemberships)
    .where(
      and(
        eq(groupMemberships.groupId, groupId),
        eq(groupMemberships.userId, memberUserId),
        isNull(groupMemberships.leftAt),
      ),
    )
    .limit(1);

  if (!m) return errorResponse("Membership not found", 404);

  await db
    .update(groupMemberships)
    .set({ leftAt: new Date() })
    .where(eq(groupMemberships.id, m.id));

  await logAction({
    userId: ctx.user.userId,
    action: "REMOVE_GROUP_MEMBER",
    entity: "GROUP",
    entityId: groupId,
    metadata: { removedUserId: memberUserId },
  });

  return successResponse(null, "Member removed successfully");
}, "group.manage");
