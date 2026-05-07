import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { eventCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { withAuth, withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { generateSlug } from "@/lib/utils/slug";
import { logAction } from "@/lib/audit";
import { z } from "zod";

const createEventCategorySchema = z.object({
  name: z.string().min(2).max(100),
  iconName: z.string().min(1).max(50).optional(),
});

export const GET = withAuth(async () => {
  const list = await db.select()
    .from(eventCategories)
    .orderBy(eventCategories.name);

  return successResponse(list);
});

export const POST = withPermission(async (req, ctx) => {
  const body = await req.json();
  const validation = createEventCategorySchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  const { name, iconName } = validation.data;
  const slug = generateSlug(name);

  const existing = await db.select().from(eventCategories).where(eq(eventCategories.slug, slug)).limit(1);
  if (existing.length > 0) return errorResponse("An event category with this name already exists", 409);

  const [created] = await db.insert(eventCategories).values({
    name,
    slug,
    iconName: iconName || null,
  }).returning();

  await logAction({
    userId: ctx.user.userId,
    action: "CREATE_EVENT_CATEGORY",
    entity: "EVENT_CATEGORY",
    entityId: created.id,
  });

  return successResponse(created, "Event category created successfully", 201);
}, "college.manage");
