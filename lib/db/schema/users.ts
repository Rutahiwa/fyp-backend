import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { roles } from "./roles";
import { colleges } from "./colleges";
import { programmes } from "./programmes";
import { relations } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    registrationNumber: varchar("registration_number", { length: 50 }).notNull().unique(),
    sex: varchar("sex", { length: 10 }).notNull(), // 'MALE' | 'FEMALE'
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    roleId: uuid("role_id").notNull().references(() => roles.id),
    collegeId: uuid("college_id").references(() => colleges.id),
    programmeId: uuid("programme_id").references(() => programmes.id),
    yearOfStudy: integer("year_of_study"),
    currentSemester: integer("current_semester"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    index("users_role_id_idx").on(t.roleId),
    index("users_college_id_idx").on(t.collegeId),
    index("users_programme_id_idx").on(t.programmeId),
    index("users_deleted_at_idx").on(t.deletedAt),
  ],
);

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  college: one(colleges, {
    fields: [users.collegeId],
    references: [colleges.id],
  }),
  programme: one(programmes, {
    fields: [users.programmeId],
    references: [programmes.id],
  }),
}));
