import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { withAuth, withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { generateSlug } from "@/lib/utils/slug";
import { logAction } from "@/lib/audit";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  module: z.enum(["ANNOUNCEMENT", "LOST_FOUND", "FEEDBACK"]),
});

export const GET = withAuth(async (req) => {
  const url = new URL(req.url);
  const moduleFilter = url.searchParams.get("module");

  const conditions = [];
  if (moduleFilter) conditions.push(eq(categories.module, moduleFilter));

  const list = await db.select()
    .from(categories)
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(asc(categories.name));

  return successResponse(list);
});

export const POST = withPermission(async (req, ctx) => {
  const body = await req.json();
  const validation = createCategorySchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  const { name, module: mod } = validation.data;
  const slug = generateSlug(name);

  const existing = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  if (existing.length > 0) return errorResponse("A category with this name already exists", 409);

  const [created] = await db.insert(categories).values({ name, slug, module: mod }).returning();

  await logAction({
    userId: ctx.user.userId,
    action: "CREATE_CATEGORY",
    entity: "CATEGORY",
    entityId: created.id,
  });

  return successResponse(created, "Category created successfully", 201);
}, "college.manage");
