import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { academicYears } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { withAuth, withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { updateAcademicYearSchema } from "@/lib/validators/academic-years";
import { logAction } from "@/lib/audit";

export const GET = withAuth(async (_req, ctx) => {
  const { id } = await ctx.params;

  const result = await db.select().from(academicYears).where(eq(academicYears.id, id)).limit(1);
  if (result.length === 0) return errorResponse("Academic year not found", 404);
  return successResponse(result[0]);
});

export const PUT = withPermission(async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const validation = updateAcademicYearSchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  if (validation.data.label) {
    const existing = await db.select().from(academicYears).where(eq(academicYears.label, validation.data.label)).limit(1);
    if (existing.length > 0 && existing[0].id !== id) return errorResponse("Academic year label already exists", 409);
  }

  const [updated] = await db.update(academicYears)
    .set({ ...validation.data, updatedAt: new Date() })
    .where(eq(academicYears.id, id))
    .returning();

  if (!updated) return errorResponse("Academic year not found", 404);

  await logAction({
    userId: ctx.user.userId,
    action: "UPDATE_ACADEMIC_YEAR",
    entity: "ACADEMIC_YEAR",
    entityId: id,
  });

  return successResponse(updated, "Academic year updated successfully");
}, "academic_year.manage");
