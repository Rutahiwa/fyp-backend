import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { crAssignments, users, programmes, academicYears } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api-response";
import { parsePagination } from "@/lib/utils/pagination";
import { createCrAssignmentSchema } from "@/lib/validators/cr-assignments";
import { logAction } from "@/lib/audit";

export const GET = withPermission(async (req) => {
  const { page, pageSize, offset } = parsePagination(new URL(req.url).searchParams);

  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(crAssignments);
  const total = Number(totalResult[0].count);

  const list = await db.select({
    id: crAssignments.id,
    userId: crAssignments.userId,
    userName: users.fullName,
    programmeId: crAssignments.programmeId,
    programmeName: programmes.name,
    programmeCode: programmes.code,
    yearOfStudy: crAssignments.yearOfStudy,
    academicYearId: crAssignments.academicYearId,
    academicYearLabel: academicYears.label,
    assignedBy: crAssignments.assignedBy,
    createdAt: crAssignments.createdAt,
  })
  .from(crAssignments)
  .leftJoin(users, eq(crAssignments.userId, users.id))
  .leftJoin(programmes, eq(crAssignments.programmeId, programmes.id))
  .leftJoin(academicYears, eq(crAssignments.academicYearId, academicYears.id))
  .limit(pageSize).offset(offset)
  .orderBy(desc(crAssignments.createdAt));

  return paginatedResponse(list, total, page, pageSize);
}, "assignment.manage");

export const POST = withPermission(async (req, ctx) => {
  const body = await req.json();
  const validation = createCrAssignmentSchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  const { userId, programmeId, yearOfStudy, academicYearId } = validation.data;

  // Enforce max 2 CRs per programme + yearOfStudy + academicYear
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(crAssignments).where(
    and(
      eq(crAssignments.programmeId, programmeId),
      eq(crAssignments.yearOfStudy, yearOfStudy),
      eq(crAssignments.academicYearId, academicYearId)
    )
  );
  if (Number(countResult[0].count) >= 2) {
    return errorResponse("Already 2 class representatives assigned for this class", 400);
  }

  const [created] = await db.insert(crAssignments).values({
    userId,
    programmeId,
    yearOfStudy,
    academicYearId,
    assignedBy: ctx.user.userId,
  }).returning();

  await logAction({
    userId: ctx.user.userId,
    action: "CREATE_CR_ASSIGNMENT",
    entity: "CR_ASSIGNMENT",
    entityId: created.id,
    metadata: { assignedUserId: userId },
  });

  return successResponse(created, "Class representative assigned successfully", 201);
}, "assignment.manage");
