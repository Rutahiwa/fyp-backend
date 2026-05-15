import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { permissionGroups } from "./permission-groups";
import { relations } from "drizzle-orm";

export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  scope: varchar("scope", { length: 20 }).default("app").notNull(),
  groupId: uuid("group_id").references(() => permissionGroups.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const permissionsRelations = relations(permissions, ({ one }) => ({
  group: one(permissionGroups, {
    fields: [permissions.groupId],
    references: [permissionGroups.id],
  }),
}));
