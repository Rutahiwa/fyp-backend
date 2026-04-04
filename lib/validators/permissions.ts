import { z } from "zod";

export const createPermissionSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  groupId: z.string().uuid().optional().nullable(),
});

export const updatePermissionSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  groupId: z.string().uuid().optional().nullable(),
});
