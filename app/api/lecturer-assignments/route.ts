import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { lecturerAssignments, users, programmes, academicYears } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api-response";
import { parsePagination } from "@/lib/utils/pagination";
import { createLecturerAssignmentSchema } from "@/lib/validators/lecturer-assignments";
import { logAction } from "@/lib/audit";

export const GET = withPermission(async (req) => {
  const { page, pageSize, offset } = parsePagination(new URL(req.url).searchParams);

  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(lecturerAssignments);
  const total = Number(totalResult[0].count);

  const list = await db.select({
    id: lecturerAssignments.id,
    lecturerId: lecturerAssignments.lecturerId,
    lecturerName: users.fullName,
    programmeId: lecturerAssignments.programmeId,
    programmeName: programmes.name,
    programmeCode: programmes.code,
    yearOfStudy: lecturerAssignments.yearOfStudy,
    semester: lecturerAssignments.semester,
    subjectName: lecturerAssignments.subjectName,
    academicYearId: lecturerAssignments.academicYearId,
    academicYearLabel: academicYears.label,
    createdAt: lecturerAssignments.createdAt,
  })
  .from(lecturerAssignments)
  .leftJoin(users, eq(lecturerAssignments.lecturerId, users.id))
  .leftJoin(programmes, eq(lecturerAssignments.programmeId, programmes.id))
  .leftJoin(academicYears, eq(lecturerAssignments.academicYearId, academicYears.id))
  .limit(pageSize).offset(offset)
  .orderBy(desc(lecturerAssignments.createdAt));

  return paginatedResponse(list, total, page, pageSize);
}, "assignment.manage");

export const POST = withPermission(async (req, ctx) => {
  const body = await req.json();
  const validation = createLecturerAssignmentSchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  const [created] = await db.insert(lecturerAssignments).values(validation.data).returning();

  await logAction({
    userId: ctx.user.userId,
    action: "CREATE_LECTURER_ASSIGNMENT",
    entity: "LECTURER_ASSIGNMENT",
    entityId: created.id,
  });

  return successResponse(created, "Lecturer assignment created successfully", 201);
}, "assignment.manage");
