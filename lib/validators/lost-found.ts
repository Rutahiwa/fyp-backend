import { z } from "zod";

export const createLostFoundSchema = z.object({
  type: z.enum(["LOST", "FOUND"]),
  title: z.string().min(3).max(255),
  description: z.string().min(1),
  categoryId: z.string().uuid().optional(),
  locationSeen: z.string().max(255).optional(),
  dateLostOrFound: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  isAnonymous: z.boolean().default(false),
  contactInfo: z.string().max(255).optional(),
  mediaIds: z.array(z.string().uuid()).optional(),
});

export const updateLostFoundSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(1).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  locationSeen: z.string().max(255).optional().nullable(),
  type: z.enum(["LOST", "FOUND"]).optional(),
  isAnonymous: z.boolean().optional(),
  contactInfo: z.string().max(255).optional().nullable(),
  mediaIds: z.array(z.string().uuid()).optional(),
});
