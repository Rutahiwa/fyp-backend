import { db } from "@/lib/db";
import { groups } from "@/lib/db/schema";
import { eq, and, isNull, asc, ilike } from "drizzle-orm";
import { withAuth, withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { createGroupSchema } from "@/lib/validators/groups";
import { logAction } from "@/lib/audit";

export const GET = withAuth(async (req) => {
  const type = new URL(req.url).searchParams.get("type");
  const search = new URL(req.url).searchParams.get("search");

  const conditions = [eq(groups.isActive, true)];
  if (type) {
    conditions.push(eq(groups.type, type));
  }
  if (search) {
    conditions.push(ilike(groups.name, `%${search}%`));
  }

  const whereClause = and(...conditions);
  const rows = await db
    .select({
      id: groups.id,
      name: groups.name,
      type: groups.type,
      parentId: groups.parentId,
      description: groups.description,
      isActive: groups.isActive,
      createdAt: groups.createdAt,
    })
    .from(groups)
    .where(whereClause)
    .orderBy(asc(groups.type), asc(groups.name));

  return successResponse(rows);
});

export const POST = withPermission(async (req, ctx) => {
  const body = await req.json();
  const validation = createGroupSchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  const d = validation.data;
  if (d.parentId) {
    const parent = await db.select({ id: groups.id }).from(groups).where(eq(groups.id, d.parentId)).limit(1);
    if (parent.length === 0) return errorResponse("Parent group not found", 404);
  }

  const [created] = await db
    .insert(groups)
    .values({
      name: d.name,
      type: d.type,
      parentId: d.parentId ?? null,
      description: d.description ?? null,
    })
    .returning();

  await logAction({
    userId: ctx.user.userId,
    action: "CREATE_GROUP",
    entity: "GROUP",
    entityId: created.id,
  });

  return successResponse(created, "Group created successfully", 201);
}, "group.manage");
