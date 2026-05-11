import { z } from "zod";

const audienceSchema = z
  .object({
    targetType: z.enum([
      "ALL",
      "ROLE",
      "COLLEGE",
      "DEPARTMENT",
      "PROGRAMME",
      "PROGRAMME_YEAR",
      "GROUP",
    ]),
    collegeId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
    programmeId: z.string().uuid().optional(),
    yearOfStudy: z.number().int().min(1).max(7).optional(),
    roleTarget: z.string().max(50).optional(),
    groupId: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    const add = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", message, path: [path] });
    switch (data.targetType) {
      case "COLLEGE":
        if (!data.collegeId) add("collegeId", "collegeId is required for COLLEGE audience");
        break;
      case "DEPARTMENT":
        if (!data.departmentId) add("departmentId", "departmentId is required for DEPARTMENT audience");
        break;
      case "PROGRAMME":
        if (!data.programmeId) add("programmeId", "programmeId is required for PROGRAMME audience");
        break;
      case "PROGRAMME_YEAR":
        if (!data.programmeId) add("programmeId", "programmeId is required for PROGRAMME_YEAR audience");
        if (data.yearOfStudy == null) add("yearOfStudy", "yearOfStudy is required for PROGRAMME_YEAR audience");
        break;
      case "ROLE":
        if (!data.roleTarget?.trim()) add("roleTarget", "roleTarget is required for ROLE audience");
        break;
      case "GROUP":
        if (!data.groupId) add("groupId", "groupId is required for GROUP audience");
        break;
      default:
        break;
    }
  });

export const createPostSchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["POST", "NOTICE", "ALERT"]).default("POST"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  mediaId: z.string().uuid().optional(),
  audiences: z.array(audienceSchema).min(1, "At least one audience is required"),
});

export const updatePostSchema = z.object({
  title: z.string().max(255).optional().nullable(),
  content: z.string().min(1).optional(),
  type: z.enum(["POST", "NOTICE", "ALERT"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  mediaId: z.string().uuid().optional().nullable(),
  audiences: z.array(audienceSchema).optional(),
});
