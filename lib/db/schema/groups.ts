import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/** Segments outside the academic hierarchy (hostels, clubs, financial, custom). */
export const groups = pgTable(
  "groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    /** HOSTEL | HOSTEL_BLOCK | CLUB | FINANCIAL | CUSTOM */
    type: varchar("type", { length: 30 }).notNull(),
    parentId: uuid("parent_id").references((): AnyPgColumn => groups.id),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("groups_type_idx").on(t.type),
    index("groups_parent_id_idx").on(t.parentId),
  ],
);

export const groupsRelations = relations(groups, ({ one, many }) => ({
  parent: one(groups, {
    fields: [groups.parentId],
    references: [groups.id],
    relationName: "groupHierarchy",
  }),
  children: many(groups, {
    relationName: "groupHierarchy",
  }),
}));
