import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { academicYears } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export const GET = withAuth(async (_req) => {
  const result = await db.select().from(academicYears).where(eq(academicYears.isCurrent, true)).limit(1);

  if (result.length === 0) return errorResponse("No current academic year set", 404);
  return successResponse(result[0]);
});
