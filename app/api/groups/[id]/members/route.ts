import { db } from "@/lib/db";
import { groups, groupMemberships, users } from "@/lib/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { addGroupMembersSchema } from "@/lib/validators/groups";
import { logAction } from "@/lib/audit";

export const GET = withPermission(async (_req, ctx) => {
  const { id: groupId } = await ctx.params;

  const group = await db.select({ id: groups.id }).from(groups).where(eq(groups.id, groupId)).limit(1);
  if (group.length === 0) return errorResponse("Group not found", 404);

  const rows = await db
    .select({
      membershipId: groupMemberships.id,
      userId: users.id,
      fullName: users.fullName,
      email: users.email,
      registrationNumber: users.registrationNumber,
      joinedAt: groupMemberships.joinedAt,
      metadata: groupMemberships.metadata,
    })
    .from(groupMemberships)
    .innerJoin(users, eq(groupMemberships.userId, users.id))
    .where(and(eq(groupMemberships.groupId, groupId), isNull(groupMemberships.leftAt)))
    .orderBy(desc(groupMemberships.joinedAt));

  return successResponse(rows);
}, "group.manage");

export const POST = withPermission(async (req, ctx) => {
  const { id: groupId } = await ctx.params;
  const body = await req.json();
  const validation = addGroupMembersSchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  const group = await db.select({ id: groups.id }).from(groups).where(eq(groups.id, groupId)).limit(1);
  if (group.length === 0) return errorResponse("Group not found", 404);

  const { userIds, metadata } = validation.data;
  const meta = metadata ?? null;

  for (const userId of userIds) {
    const u = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
    if (u.length === 0) {
      return errorResponse(`User not found: ${userId}`, 404);
    }
  }

  await db.transaction(async (tx) => {
    for (const userId of userIds) {
      await tx
        .insert(groupMemberships)
        .values({
          userId,
          groupId,
          addedBy: ctx.user.userId,
          metadata: meta,
        })
        .onConflictDoUpdate({
          target: [groupMemberships.userId, groupMemberships.groupId],
          set: {
            leftAt: null,
            addedBy: ctx.user.userId,
            metadata: meta,
            joinedAt: new Date(),
          },
        });
    }
  });

  await logAction({
    userId: ctx.user.userId,
    action: "ADD_GROUP_MEMBERS",
    entity: "GROUP",
    entityId: groupId,
    metadata: { count: userIds.length },
  });

  return successResponse({ added: userIds.length }, "Members added successfully", 201);
}, "group.manage");
