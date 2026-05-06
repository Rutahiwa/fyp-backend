import { z } from "zod";

export const createCrAssignmentSchema = z.object({
  userId: z.string().uuid(),
  programmeId: z.string().uuid(),
  yearOfStudy: z.number().int().min(1).max(7),
  academicYearId: z.string().uuid(),
});
