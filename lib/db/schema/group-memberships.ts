import {
  pgTable,
  uuid,
  timestamp,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { groups } from "./groups";
import { relations } from "drizzle-orm";

export const groupMemberships = pgTable(
  "group_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    groupId: uuid("group_id").notNull().references(() => groups.id),
    addedBy: uuid("added_by").references(() => users.id),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    leftAt: timestamp("left_at"),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
  },
  (t) => ({
    uniqUserGroup: unique().on(t.userId, t.groupId),
    userIdx: index("group_memberships_user_id_idx").on(t.userId),
    groupIdx: index("group_memberships_group_id_idx").on(t.groupId),
    leftAtIdx: index("group_memberships_left_at_idx").on(t.leftAt),
  }),
);

export const groupMembershipsRelations = relations(groupMemberships, ({ one }) => ({
  user: one(users, {
    fields: [groupMemberships.userId],
    references: [users.id],
    relationName: "membership_user",
  }),
  group: one(groups, {
    fields: [groupMemberships.groupId],
    references: [groups.id],
  }),
  adder: one(users, {
    fields: [groupMemberships.addedBy],
    references: [users.id],
    relationName: "membership_adder",
  }),
}));
