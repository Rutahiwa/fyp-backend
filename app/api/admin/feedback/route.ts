import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { feedback, categories, users } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { withPermission } from "@/lib/auth/middleware";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api-response";
import { parsePagination } from "@/lib/utils/pagination";

export const GET = withPermission(async (req) => {
  const sp = new URL(req.url).searchParams;
  const { page, pageSize, offset } = parsePagination(sp);
  const status = sp.get("status");

  const conditions = [];
  if (status) conditions.push(eq(feedback.status, status));

  const whereClause = conditions.length > 0 ? conditions[0] : undefined;

  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(feedback).where(whereClause);
  const total = Number(totalResult[0].count);

  const list = await db.select({
    id: feedback.id,
    subject: feedback.subject,
    description: feedback.description,
    status: feedback.status,
    adminNotes: feedback.adminNotes,
    createdAt: feedback.createdAt,
    updatedAt: feedback.updatedAt,
    categoryId: categories.id,
    categoryName: categories.name,
    userId: users.id,
    userName: users.fullName,
    userEmail: users.email,
  })
  .from(feedback)
  .leftJoin(categories, eq(feedback.categoryId, categories.id))
  .leftJoin(users, eq(feedback.userId, users.id))
  .where(whereClause)
  .orderBy(desc(feedback.createdAt))
  .limit(pageSize).offset(offset);

  return paginatedResponse(list, total, page, pageSize);
}, "feedback.manage");
