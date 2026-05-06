import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { programmes } from "./programmes";
import { academicYears } from "./academic-years";
import { relations } from "drizzle-orm";

export const crAssignments = pgTable("cr_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  programmeId: uuid("programme_id").notNull().references(() => programmes.id),
  yearOfStudy: integer("year_of_study").notNull(),
  academicYearId: uuid("academic_year_id").notNull().references(() => academicYears.id),
  assignedBy: uuid("assigned_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const crAssignmentsRelations = relations(crAssignments, ({ one }) => ({
  user: one(users, {
    fields: [crAssignments.userId],
    references: [users.id],
    relationName: "cr_user",
  }),
  programme: one(programmes, {
    fields: [crAssignments.programmeId],
    references: [programmes.id],
  }),
  academicYear: one(academicYears, {
    fields: [crAssignments.academicYearId],
    references: [academicYears.id],
  }),
  assigner: one(users, {
    fields: [crAssignments.assignedBy],
    references: [users.id],
    relationName: "cr_assigner",
  }),
}));
