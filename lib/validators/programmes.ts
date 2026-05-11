import { z } from "zod";

export const createProgrammeSchema = z.object({
  departmentId: z.string().uuid(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters").max(20),
  durationYears: z.number().int().min(1).max(7),
});

export const updateProgrammeSchema = createProgrammeSchema.partial();
