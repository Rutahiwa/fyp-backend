import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { feedback, categories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { createFeedbackSchema } from "@/lib/validators/feedback";
import { logAction } from "@/lib/audit";

export const GET = withAuth(async (_req, ctx) => {
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
  })
  .from(feedback)
  .leftJoin(categories, eq(feedback.categoryId, categories.id))
  .where(eq(feedback.userId, ctx.user.userId))
  .orderBy(desc(feedback.createdAt));

  return successResponse(list);
});

export const POST = withAuth(async (req, ctx) => {
  const body = await req.json();
  const validation = createFeedbackSchema.safeParse(body);
  if (!validation.success) return errorResponse("Validation failed", 400, validation.error.format());

  const d = validation.data;

  const [created] = await db.insert(feedback).values({
    userId: ctx.user.userId,
    categoryId: d.categoryId,
    subject: d.subject,
    description: d.description,
  }).returning();

  await logAction({
    userId: ctx.user.userId,
    action: "SUBMIT_FEEDBACK",
    entity: "FEEDBACK",
    entityId: created.id,
    metadata: { subject: d.subject },
  });

  return successResponse(created, "Feedback submitted successfully", 201);
});
