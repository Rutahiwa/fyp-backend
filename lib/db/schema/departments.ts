import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { colleges } from "./colleges";
import { relations } from "drizzle-orm";

/** Academic department under a college (UDSM structure: college → department → programme). */
export const departments = pgTable(
  "departments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collegeId: uuid("college_id")
      .notNull()
      .references(() => colleges.id),
    name: varchar("name", { length: 255 }).notNull(),
    shortName: varchar("short_name", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("departments_college_short_name_uidx").on(t.collegeId, t.shortName),
    index("departments_college_id_idx").on(t.collegeId),
  ],
);

export const departmentsRelations = relations(departments, ({ one }) => ({
  college: one(colleges, {
    fields: [departments.collegeId],
    references: [colleges.id],
  }),
}));
