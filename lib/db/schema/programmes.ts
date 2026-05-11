import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { departments } from "./departments";
import { relations } from "drizzle-orm";

export const programmes = pgTable(
  "programmes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 20 }).notNull().unique(),
    durationYears: integer("duration_years").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    index("programmes_department_id_idx").on(t.departmentId),
    index("programmes_deleted_at_idx").on(t.deletedAt),
  ],
);

export const programmesRelations = relations(programmes, ({ one }) => ({
  department: one(departments, {
    fields: [programmes.departmentId],
    references: [departments.id],
  }),
}));
