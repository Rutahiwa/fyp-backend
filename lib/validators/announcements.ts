import { z } from "zod";

const audienceSchema = z.object({
  targetType: z.enum(["ALL", "COLLEGE", "PROGRAMME", "PROGRAMME_YEAR", "ROLE"]),
  collegeId: z.string().uuid().optional(),
  programmeId: z.string().uuid().optional(),
  yearOfStudy: z.number().int().min(1).max(7).optional(),
  semester: z.number().int().min(1).max(3).optional(),
  roleTarget: z.string().max(50).optional(),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500).optional(),
  type: z.enum(["ANNOUNCEMENT", "NOTICE", "NEWS"]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  categoryId: z.string().uuid().optional(),
  coverImageId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  audiences: z.array(audienceSchema).min(1, "At least one audience is required"),
  mediaIds: z.array(z.string().uuid()).optional(),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  type: z.enum(["ANNOUNCEMENT", "NOTICE", "NEWS"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  coverImageId: z.string().uuid().optional().nullable(),
  academicYearId: z.string().uuid().optional().nullable(),
  audiences: z.array(audienceSchema).optional(),
  mediaIds: z.array(z.string().uuid()).optional(),
});
