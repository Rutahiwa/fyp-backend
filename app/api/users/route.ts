import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, roles } from "@/lib/db/schema";
import { eq, ilike, or, and, desc, isNull, sql } from "drizzle-orm";
import { authenticateRequest, checkPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api-response";
import { parsePagination } from "@/lib/utils/pagination";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (auth.error || !auth.user) {
      return errorResponse(auth.error || "Unauthorized", auth.status || 401);
    }

    const hasPermission = await checkPermission(auth.user.roleId, "user.read");
    if (!hasPermission) {
      return errorResponse("Forbidden. Missing required permission.", 403);
    }

    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const { page, pageSize, offset } = parsePagination(searchParams);
    const qsSearch = searchParams.get("search") || "";

    const conditions = [isNull(users.deletedAt)];

    if (qsSearch) {
      const orCond = or(
        ilike(users.fullName, `%${qsSearch}%`),
        ilike(users.registrationNumber, `%${qsSearch}%`),
        ilike(users.email, `%${qsSearch}%`)
      );
      if (orCond) conditions.push(orCond);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const baseQuery = db.select({
      id: users.id,
      fullName: users.fullName,
      registrationNumber: users.registrationNumber,
      course: users.course,
      sex: users.sex,
      email: users.email,
      isActive: users.isActive,
      roleId: users.roleId,
      roleName: roles.name,
      createdAt: users.createdAt,
    }).from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(whereClause);

    const totalRecordsResult = await db.select({ count: sql<number>`count(*)` }).from(users).where(whereClause);
    const totalRecords = Number(totalRecordsResult[0].count);

    const usersList = await baseQuery.limit(pageSize).offset(offset).orderBy(desc(users.createdAt));

    return paginatedResponse(usersList, totalRecords, page, pageSize);
  } catch (error) {
    console.error("Users list error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Admins creating users directly
export async function POST(req: NextRequest) {
  return errorResponse("Use /api/auth/register for user creation", 400);
}
