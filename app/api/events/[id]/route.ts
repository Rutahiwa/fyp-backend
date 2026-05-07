import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { events, eventRsvps, users, eventCategories, media } from "@/lib/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { withAuth, withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { updateEventSchema } from "@/lib/validators/events";
import { logAction } from "@/lib/audit";

export const GET = withAuth(async (_req, ctx) => {
  const { id } = await ctx.params;

  const result = await db.select({
    id: events.id,
    title: events.title,
    slug: events.slug,
    description: events.description,
    categoryId: events.categoryId,
    categoryName: eventCategories.name,
    categoryIcon: eventCategories.iconName,
    status: events.status,
    location: events.location,
    locationUrl: events.locationUrl,
    startDateTime: events.startDateTime,
    endDateTime: events.endDateTime,
    maxAttendees: events.maxAttendees,
    isPinned: events.isPinned,
    viewCount: events.viewCount,
    publishedAt: events.publishedAt,
    academicYearId: events.academicYearId,
    createdAt: events.createdAt,
    updatedAt: events.updatedAt,
    organizerId: users.id,
    organizerName: users.fullName,
    coverImageId: media.id,
    coverImageUrl: media.url,
  })
  .from(events)
  .leftJoin(users, eq(events.organizerId, users.id))
  .leftJoin(eventCategories, eq(events.categoryId, eventCategories.id))
  .leftJoin(media, eq(events.coverImageId, media.id))
  .where(and(eq(events.id, id), isNull(events.deletedAt)))
  .limit(1);

  if (result.length === 0) return errorResponse("Event not found", 404);
  const e = result[0];

  // RSVP counts
  const goingCount = await db.select({ count: sql<number>`count(*)` })
    .from(eventRsvps)
    .where(and(eq(eventRsvps.eventId, id), eq(eventRsvps.status, "GOING")));
  const interestedCount = await db.select({ count: sql<number>`count(*)` })
    .from(eventRsvps)
    .where(and(eq(eventRsvps.eventId, id), eq(eventRsvps.status, "INTERESTED")));

  // Increment viewCount
  db.update(events).set({ viewCount: sql`${events.viewCount} + 1` }).where(eq(events.id, id)).execute().catch(() => {});

  return successResponse({
    id: e.id,
    title: e.title,
    slug: e.slug,
    description: e.description,
    status: e.status,
    location: e.location,
    locationUrl: e.locationUrl,
    startDateTime: e.startDateTime,
    endDateTime: e.endDateTime,
    maxAttendees: e.maxAttendees,
    isPinned: e.isPinned,
    viewCount: e.viewCount,
    publishedAt: e.publishedAt,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    goingCount: Number(goingCount[0].count),
    interestedCount: Number(interestedCount[0].count),
    organizer: { id: e.organizerId, fullName: e.organizerName },
    category: { id: e.categoryId, name: e.categoryName, iconName: e.categoryIcon },
    coverImage: e.coverImageUrl ? { id: e.coverImageId, url: e.coverImageUrl } : null,
  });
});

export const PUT = withPermission(async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const validation = updateEventSchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  const [existing] = await db.select({ status: events.status, organizerId: events.organizerId })
    .from(events).where(and(eq(events.id, id), isNull(events.deletedAt))).limit(1);
  if (!existing) return errorResponse("Event not found", 404);

  const d = validation.data;
  const updateData: Record<string, any> = { updatedAt: new Date() };
  if (d.title !== undefined) updateData.title = d.title;
  if (d.description !== undefined) updateData.description = d.description;
  if (d.categoryId !== undefined) updateData.categoryId = d.categoryId;
  if (d.status !== undefined) updateData.status = d.status;
  if (d.location !== undefined) updateData.location = d.location;
  if (d.locationUrl !== undefined) updateData.locationUrl = d.locationUrl;
  if (d.startDateTime !== undefined) updateData.startDateTime = new Date(d.startDateTime);
  if (d.endDateTime !== undefined) updateData.endDateTime = new Date(d.endDateTime);
  if (d.maxAttendees !== undefined) updateData.maxAttendees = d.maxAttendees;
  if (d.coverImageId !== undefined) updateData.coverImageId = d.coverImageId;
  if (d.academicYearId !== undefined) updateData.academicYearId = d.academicYearId;
  if (d.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
    updateData.publishedAt = new Date();
  }

  await db.update(events).set(updateData).where(eq(events.id, id));

  await logAction({
    userId: ctx.user.userId,
    action: "UPDATE_EVENT",
    entity: "EVENT",
    entityId: id,
  });

  return successResponse(null, "Event updated successfully");
}, "event.update");

export const DELETE = withPermission(async (req, ctx) => {
  const { id } = await ctx.params;

  const [existing] = await db.select({ id: events.id })
    .from(events).where(and(eq(events.id, id), isNull(events.deletedAt))).limit(1);
  if (!existing) return errorResponse("Event not found", 404);

  await db.update(events).set({ deletedAt: new Date() }).where(eq(events.id, id));

  await logAction({
    userId: ctx.user.userId,
    action: "DELETE_EVENT",
    entity: "EVENT",
    entityId: id,
  });

  return successResponse(null, "Event deleted successfully");
}, "event.delete");
