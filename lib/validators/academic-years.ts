import { z } from "zod";

export const createAcademicYearSchema = z.object({
  label: z.string().min(5, "Label must be at least 5 characters").max(20),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

export const updateAcademicYearSchema = createAcademicYearSchema.partial();
