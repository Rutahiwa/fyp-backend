import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { academicYears } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { withAuth, withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api-response";
import { parsePagination } from "@/lib/utils/pagination";
import { createAcademicYearSchema } from "@/lib/validators/academic-years";
import { logAction } from "@/lib/audit";

export const GET = withAuth(async (req) => {
  const { page, pageSize, offset } = parsePagination(new URL(req.url).searchParams);

  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(academicYears);
  const total = Number(totalResult[0].count);

  const list = await db.select()
    .from(academicYears)
    .limit(pageSize).offset(offset)
    .orderBy(desc(academicYears.startDate));

  return paginatedResponse(list, total, page, pageSize);
});

export const POST = withPermission(async (req, ctx) => {
  const body = await req.json();
  const validation = createAcademicYearSchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  const existing = await db.select().from(academicYears).where(eq(academicYears.label, validation.data.label)).limit(1);
  if (existing.length > 0) return errorResponse("Academic year label already exists", 409);

  const [created] = await db.insert(academicYears).values({
    label: validation.data.label,
    startDate: validation.data.startDate,
    endDate: validation.data.endDate,
  }).returning();

  await logAction({
    userId: ctx.user.userId,
    action: "CREATE_ACADEMIC_YEAR",
    entity: "ACADEMIC_YEAR",
    entityId: created.id,
  });

  return successResponse(created, "Academic year created successfully", 201);
}, "academic_year.manage");
