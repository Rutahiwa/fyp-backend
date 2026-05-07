import { z } from "zod";

export const createFeedbackSchema = z.object({
  categoryId: z.string().uuid(),
  subject: z.string().min(3).max(255),
  description: z.string().min(1),
});

export const updateFeedbackStatusSchema = z.object({
  status: z.enum(["PENDING", "REVIEWED", "RESOLVED"]),
  adminNotes: z.string().max(2000).optional(),
});
