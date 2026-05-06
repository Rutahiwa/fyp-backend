import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { programmes, colleges } from "@/lib/db/schema";
import { eq, asc, and, isNull, sql } from "drizzle-orm";
import { withAuth, withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api-response";
import { parsePagination } from "@/lib/utils/pagination";
import { createProgrammeSchema } from "@/lib/validators/programmes";
import { logAction } from "@/lib/audit";

export const GET = withAuth(async (req) => {
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const { page, pageSize, offset } = parsePagination(searchParams);
  const collegeId = searchParams.get("collegeId");

  const conditions = [isNull(programmes.deletedAt)];
  if (collegeId) conditions.push(eq(programmes.collegeId, collegeId));

  const whereClause = and(...conditions);

  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(programmes).where(whereClause);
  const total = Number(totalResult[0].count);

  const list = await db.select({
    id: programmes.id,
    collegeId: programmes.collegeId,
    collegeName: colleges.name,
    collegeShortName: colleges.shortName,
    name: programmes.name,
    code: programmes.code,
    durationYears: programmes.durationYears,
    createdAt: programmes.createdAt,
  })
  .from(programmes)
  .leftJoin(colleges, eq(programmes.collegeId, colleges.id))
  .where(whereClause)
  .limit(pageSize).offset(offset)
  .orderBy(asc(programmes.name));

  return paginatedResponse(list, total, page, pageSize);
});

export const POST = withPermission(async (req, ctx) => {
  const body = await req.json();
  const validation = createProgrammeSchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  const existing = await db.select().from(programmes).where(eq(programmes.code, validation.data.code)).limit(1);
  if (existing.length > 0) return errorResponse("Programme code already exists", 409);

  const [created] = await db.insert(programmes).values(validation.data).returning();

  await logAction({
    userId: ctx.user.userId,
    action: "CREATE_PROGRAMME",
    entity: "PROGRAMME",
    entityId: created.id,
  });

  return successResponse(created, "Programme created successfully", 201);
}, "programme.manage");
