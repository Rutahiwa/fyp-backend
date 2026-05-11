import { z } from "zod";

export const createDepartmentSchema = z.object({
  collegeId: z.string().uuid(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  shortName: z
    .string()
    .min(1, "Short name is required")
    .max(50, "Short name must be at most 50 characters"),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();
