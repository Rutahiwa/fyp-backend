import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { academicYears } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logAction } from "@/lib/audit";

export const POST = withPermission(async (_req, ctx) => {
  const { id } = await ctx.params;

  const existing = await db.select().from(academicYears).where(eq(academicYears.id, id)).limit(1);
  if (existing.length === 0) return errorResponse("Academic year not found", 404);

  await db.transaction(async (tx) => {
    await tx.update(academicYears).set({ isCurrent: false }).where(eq(academicYears.isCurrent, true));
    await tx.update(academicYears).set({ isCurrent: true }).where(eq(academicYears.id, id));
  });

  await logAction({
    userId: ctx.user.userId,
    action: "SET_CURRENT_ACADEMIC_YEAR",
    entity: "ACADEMIC_YEAR",
    entityId: id,
  });

  return successResponse(null, "Academic year set as current");
}, "academic_year.manage");
