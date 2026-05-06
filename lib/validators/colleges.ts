import { z } from "zod";

export const createCollegeSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  shortName: z.string().min(2, "Short name must be at least 2 characters"),
});

export const updateCollegeSchema = createCollegeSchema.partial();
