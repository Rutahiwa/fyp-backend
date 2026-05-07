import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { announcements } from "@/lib/db/schema";
import { eq, and, isNull, not, sql } from "drizzle-orm";
import { withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logAction } from "@/lib/audit";

export const POST = withPermission(async (_req, ctx) => {
  const { id } = await ctx.params;

  const existing = await db.select({ isPinned: announcements.isPinned })
    .from(announcements)
    .where(and(eq(announcements.id, id), isNull(announcements.deletedAt)))
    .limit(1);

  if (existing.length === 0) return errorResponse("Announcement not found", 404);

  const newValue = !existing[0].isPinned;

  await db.update(announcements)
    .set({ isPinned: newValue })
    .where(eq(announcements.id, id));

  await logAction({
    userId: ctx.user.userId,
    action: newValue ? "PIN_ANNOUNCEMENT" : "UNPIN_ANNOUNCEMENT",
    entity: "ANNOUNCEMENT",
    entityId: id,
  });

  return successResponse({ isPinned: newValue }, newValue ? "Announcement pinned" : "Announcement unpinned");
}, "announcement.pin");
