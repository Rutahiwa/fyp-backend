import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(1),
  categoryId: z.string().uuid(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]).default("DRAFT"),
  coverImageId: z.string().uuid().optional(),
  location: z.string().max(255).optional(),
  locationUrl: z.string().url().max(500).optional(),
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  maxAttendees: z.number().int().min(1).optional().nullable(),
  academicYearId: z.string().uuid().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const rsvpSchema = z.object({
  status: z.enum(["GOING", "INTERESTED", "NOT_GOING"]),
});
