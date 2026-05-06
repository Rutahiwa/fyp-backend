import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { programmes, colleges } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { withAuth, withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { updateProgrammeSchema } from "@/lib/validators/programmes";
import { logAction } from "@/lib/audit";

export const GET = withAuth(async (_req, ctx) => {
  const { id } = await ctx.params;

  const result = await db.select({
    id: programmes.id,
    collegeId: programmes.collegeId,
    collegeName: colleges.name,
    collegeShortName: colleges.shortName,
    name: programmes.name,
    code: programmes.code,
    durationYears: programmes.durationYears,
    createdAt: programmes.createdAt,
    updatedAt: programmes.updatedAt,
  })
  .from(programmes)
  .leftJoin(colleges, eq(programmes.collegeId, colleges.id))
  .where(and(eq(programmes.id, id), isNull(programmes.deletedAt)))
  .limit(1);

  if (result.length === 0) return errorResponse("Programme not found", 404);
  return successResponse(result[0]);
});

export const PUT = withPermission(async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const validation = updateProgrammeSchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  if (validation.data.code) {
    const existing = await db.select().from(programmes).where(eq(programmes.code, validation.data.code)).limit(1);
    if (existing.length > 0 && existing[0].id !== id) return errorResponse("Programme code already exists", 409);
  }

  const [updated] = await db.update(programmes)
    .set({ ...validation.data, updatedAt: new Date() })
    .where(and(eq(programmes.id, id), isNull(programmes.deletedAt)))
    .returning();

  if (!updated) return errorResponse("Programme not found", 404);

  await logAction({
    userId: ctx.user.userId,
    action: "UPDATE_PROGRAMME",
    entity: "PROGRAMME",
    entityId: id,
  });

  return successResponse(updated, "Programme updated successfully");
}, "programme.manage");

export const DELETE = withPermission(async (req, ctx) => {
  const { id } = await ctx.params;

  const [deleted] = await db.update(programmes)
    .set({ deletedAt: new Date() })
    .where(and(eq(programmes.id, id), isNull(programmes.deletedAt)))
    .returning({ id: programmes.id });

  if (!deleted) return errorResponse("Programme not found", 404);

  await logAction({
    userId: ctx.user.userId,
    action: "DELETE_PROGRAMME",
    entity: "PROGRAMME",
    entityId: id,
  });

  return successResponse(null, "Programme deleted successfully");
}, "programme.manage");
