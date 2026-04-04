import { z } from "zod";

export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  course: z.string().min(2).optional(),
  sex: z.enum(["MALE", "FEMALE"]).optional(),
  email: z.string().email().optional(),
  roleId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});
