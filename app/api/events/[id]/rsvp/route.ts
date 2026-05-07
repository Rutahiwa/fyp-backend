import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { events, eventRsvps } from "@/lib/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { rsvpSchema } from "@/lib/validators/events";
import { logAction } from "@/lib/audit";

export const POST = withAuth(async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const validation = rsvpSchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  const { status } = validation.data;
  const userId = ctx.user.userId;

  // Verify event exists and is published
  const [evt] = await db.select({
    id: events.id,
    status: events.status,
    maxAttendees: events.maxAttendees,
  }).from(events)
    .where(and(eq(events.id, id), isNull(events.deletedAt)))
    .limit(1);
  if (!evt) return errorResponse("Event not found", 404);
  if (evt.status !== "PUBLISHED") return errorResponse("Event is not open for RSVP", 400);

  // Capacity check for GOING
  if (status === "GOING" && evt.maxAttendees) {
    const [goingCount] = await db.select({ count: sql<number>`count(*)` })
      .from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, id), eq(eventRsvps.status, "GOING")));

    // Check if user is already GOING — if so, they're just re-confirming
    const [myExisting] = await db.select({ status: eventRsvps.status })
      .from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, id), eq(eventRsvps.userId, userId)))
      .limit(1);

    if (myExisting?.status !== "GOING" && Number(goingCount.count) >= evt.maxAttendees) {
      return errorResponse("Event is at full capacity", 400);
    }
  }

  // Upsert RSVP
  await db.insert(eventRsvps).values({
    eventId: id,
    userId,
    status,
  }).onConflictDoUpdate({
    target: [eventRsvps.eventId, eventRsvps.userId],
    set: { status, updatedAt: new Date() },
  });

  await logAction({
    userId,
    action: "RSVP_EVENT",
    entity: "EVENT",
    entityId: id,
    metadata: { rsvpStatus: status },
  });

  return successResponse({ status }, "RSVP updated successfully");
});

export const DELETE = withAuth(async (_req, ctx) => {
  const { id } = await ctx.params;
  const userId = ctx.user.userId;

  await db.delete(eventRsvps)
    .where(and(eq(eventRsvps.eventId, id), eq(eventRsvps.userId, userId)));

  return successResponse(null, "RSVP removed successfully");
});
