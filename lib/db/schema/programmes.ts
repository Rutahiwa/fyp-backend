import { pgTable, uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { colleges } from "./colleges";
import { relations } from "drizzle-orm";

export const programmes = pgTable("programmes", {
  id: uuid("id").primaryKey().defaultRandom(),
  collegeId: uuid("college_id").notNull().references(() => colleges.id),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  durationYears: integer("duration_years").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const programmesRelations = relations(programmes, ({ one }) => ({
  college: one(colleges, {
    fields: [programmes.collegeId],
    references: [colleges.id],
  }),
}));
