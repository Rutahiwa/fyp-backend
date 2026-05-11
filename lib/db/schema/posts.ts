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
import { users } from "./users";
import { media } from "./media";
import { colleges } from "./colleges";
import { departments } from "./departments";
import { programmes } from "./programmes";
import { groups } from "./groups";
import { relations } from "drizzle-orm";

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id").notNull().references(() => users.id),
    title: varchar("title", { length: 255 }),
    content: text("content").notNull(),
    /** POST | NOTICE | ALERT */
    type: varchar("type", { length: 20 }).notNull().default("POST"),
    /** DRAFT | PUBLISHED */
    status: varchar("status", { length: 20 }).notNull().default("DRAFT"),
    mediaId: uuid("media_id").references(() => media.id),
    isPinned: boolean("is_pinned").default(false).notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    index("posts_author_id_idx").on(t.authorId),
    index("posts_status_idx").on(t.status),
    index("posts_deleted_at_idx").on(t.deletedAt),
  ],
);

/**
 * Targeting rules for posts. User sees post if they match ANY row for that postId.
 * targetType: ALL | ROLE | COLLEGE | DEPARTMENT | PROGRAMME | PROGRAMME_YEAR | GROUP
 */
export const postAudiences = pgTable(
  "post_audiences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    targetType: varchar("target_type", { length: 30 }).notNull(),
    collegeId: uuid("college_id").references(() => colleges.id),
    departmentId: uuid("department_id").references(() => departments.id),
    programmeId: uuid("programme_id").references(() => programmes.id),
    yearOfStudy: integer("year_of_study"),
    roleTarget: varchar("role_target", { length: 50 }),
    groupId: uuid("group_id").references(() => groups.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("post_audiences_post_id_idx").on(t.postId),
    index("post_audiences_group_id_idx").on(t.groupId),
    index("post_audiences_programme_id_idx").on(t.programmeId),
    index("post_audiences_department_id_idx").on(t.departmentId),
    index("post_audiences_college_id_idx").on(t.collegeId),
  ],
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
    relationName: "post_author",
  }),
  coverMedia: one(media, {
    fields: [posts.mediaId],
    references: [media.id],
  }),
  audiences: many(postAudiences),
}));

export const postAudiencesRelations = relations(postAudiences, ({ one }) => ({
  post: one(posts, {
    fields: [postAudiences.postId],
    references: [posts.id],
  }),
  college: one(colleges, {
    fields: [postAudiences.collegeId],
    references: [colleges.id],
  }),
  department: one(departments, {
    fields: [postAudiences.departmentId],
    references: [departments.id],
  }),
  programme: one(programmes, {
    fields: [postAudiences.programmeId],
    references: [programmes.id],
  }),
  group: one(groups, {
    fields: [postAudiences.groupId],
    references: [groups.id],
  }),
}));
