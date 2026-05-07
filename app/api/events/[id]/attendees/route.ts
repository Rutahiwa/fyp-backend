import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { eventRsvps, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export const GET = withPermission(async (_req, ctx) => {
  const { id } = await ctx.params;

  const attendees = await db.select({
    id: eventRsvps.id,
    userId: users.id,
    userName: users.fullName,
    email: users.email,
    status: eventRsvps.status,
    createdAt: eventRsvps.createdAt,
  })
  .from(eventRsvps)
  .innerJoin(users, eq(eventRsvps.userId, users.id))
  .where(and(
    eq(eventRsvps.eventId, id),
    eq(eventRsvps.status, "GOING"),
  ))
  .orderBy(eventRsvps.createdAt);

  return successResponse(attendees);
}, "event.update");
