import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(2).max(255),
  type: z.enum(["HOSTEL", "HOSTEL_BLOCK", "CLUB", "FINANCIAL", "CUSTOM"]),
  parentId: z.string().uuid().optional(),
  description: z.string().max(2000).optional(),
});

export const updateGroupSchema = createGroupSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const addGroupMembersSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, "At least one userId is required"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
