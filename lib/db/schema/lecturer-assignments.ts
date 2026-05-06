import { pgTable, uuid, varchar, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { programmes } from "./programmes";
import { academicYears } from "./academic-years";
import { relations } from "drizzle-orm";

export const lecturerAssignments = pgTable("lecturer_class_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  lecturerId: uuid("lecturer_id").notNull().references(() => users.id),
  programmeId: uuid("programme_id").notNull().references(() => programmes.id),
  yearOfStudy: integer("year_of_study").notNull(),
  semester: integer("semester").notNull(),
  subjectName: varchar("subject_name", { length: 255 }).notNull(),
  academicYearId: uuid("academic_year_id").notNull().references(() => academicYears.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  uniq: unique().on(t.lecturerId, t.programmeId, t.yearOfStudy, t.semester, t.academicYearId, t.subjectName),
}));

export const lecturerAssignmentsRelations = relations(lecturerAssignments, ({ one }) => ({
  lecturer: one(users, {
    fields: [lecturerAssignments.lecturerId],
    references: [users.id],
  }),
  programme: one(programmes, {
    fields: [lecturerAssignments.programmeId],
    references: [programmes.id],
  }),
  academicYear: one(academicYears, {
    fields: [lecturerAssignments.academicYearId],
    references: [academicYears.id],
  }),
}));
