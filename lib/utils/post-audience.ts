import { db } from "@/lib/db";
import {
  users,
  roles,
  programmes,
  groupMemberships,
  postAudiences,
} from "@/lib/db/schema";
import { eq, and, or, isNull, inArray } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

export type UserPostProfile = {
  roleName: string | null;
  collegeId: string | null;
  programmeId: string | null;
  departmentId: string | null;
  yearOfStudy: number | null;
};

export async function getUserPostProfile(userId: string): Promise<UserPostProfile | null> {
  const [row] = await db
    .select({
      roleName: roles.name,
      collegeId: users.collegeId,
      programmeId: users.programmeId,
      departmentId: programmes.departmentId,
      yearOfStudy: users.yearOfStudy,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .leftJoin(programmes, eq(users.programmeId, programmes.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) return null;
  return {
    roleName: row.roleName ?? null,
    collegeId: row.collegeId ?? null,
    programmeId: row.programmeId ?? null,
    departmentId: row.departmentId ?? null,
    yearOfStudy: row.yearOfStudy ?? null,
  };
}

/** Active group IDs for the user (leftAt is null). */
export async function getActiveGroupIdsForUser(userId: string): Promise<string[]> {
  const rows = await db
    .select({ groupId: groupMemberships.groupId })
    .from(groupMemberships)
    .where(and(eq(groupMemberships.userId, userId), isNull(groupMemberships.leftAt)));
  return rows.map((r) => r.groupId);
}

/**
 * Build OR conditions for post_audiences matching the given profile + group IDs.
 */
export function buildPostAudienceConditions(
  profile: UserPostProfile,
  groupIds: string[],
): SQL[] {
  const audienceConditions: SQL[] = [eq(postAudiences.targetType, "ALL")];

  if (profile.roleName) {
    audienceConditions.push(
      and(
        eq(postAudiences.targetType, "ROLE"),
        eq(postAudiences.roleTarget, profile.roleName),
      )!,
    );
  }
  if (profile.collegeId) {
    audienceConditions.push(
      and(eq(postAudiences.targetType, "COLLEGE"), eq(postAudiences.collegeId, profile.collegeId))!,
    );
  }
  if (profile.departmentId) {
    audienceConditions.push(
      and(
        eq(postAudiences.targetType, "DEPARTMENT"),
        eq(postAudiences.departmentId, profile.departmentId),
      )!,
    );
  }
  if (profile.programmeId) {
    audienceConditions.push(
      and(
        eq(postAudiences.targetType, "PROGRAMME"),
        eq(postAudiences.programmeId, profile.programmeId),
      )!,
    );
    if (profile.yearOfStudy != null) {
      audienceConditions.push(
        and(
          eq(postAudiences.targetType, "PROGRAMME_YEAR"),
          eq(postAudiences.programmeId, profile.programmeId),
          eq(postAudiences.yearOfStudy, profile.yearOfStudy),
        )!,
      );
    }
  }
  if (groupIds.length > 0) {
    audienceConditions.push(
      and(eq(postAudiences.targetType, "GROUP"), inArray(postAudiences.groupId, groupIds))!,
    );
  }

  return audienceConditions;
}

/** Subquery: post IDs visible to this user by audience rules. */
export function matchingPostIdsSubquery(audienceConditions: SQL[]) {
  return db
    .select({ id: postAudiences.postId })
    .from(postAudiences)
    .where(or(...audienceConditions));
}
