import { z } from "zod";

export const createLecturerAssignmentSchema = z.object({
  lecturerId: z.string().uuid(),
  programmeId: z.string().uuid(),
  yearOfStudy: z.number().int().min(1).max(7),
  semester: z.number().int().min(1).max(3),
  subjectName: z.string().min(2, "Subject name is required").max(255),
  academicYearId: z.string().uuid(),
});
