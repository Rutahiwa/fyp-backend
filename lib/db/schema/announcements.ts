import { pgTable, uuid, varchar, text, boolean, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./categories";
import { media } from "./media";
import { academicYears } from "./academic-years";
import { colleges } from "./colleges";
import { programmes } from "./programmes";
import { relations } from "drizzle-orm";

// ── Main announcements table ────────────────────────────────────────────

export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: varchar("excerpt", { length: 500 }),
  type: varchar("type", { length: 20 }).notNull(), // "ANNOUNCEMENT" | "NOTICE" | "NEWS"
  status: varchar("status", { length: 20 }).notNull().default("DRAFT"),
  authorId: uuid("author_id").notNull().references(() => users.id),
  categoryId: uuid("category_id").references(() => categories.id),
  coverImageId: uuid("cover_image_id").references(() => media.id),
  isPinned: boolean("is_pinned").default(false).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  publishedAt: timestamp("published_at"),
  academicYearId: uuid("academic_year_id").references(() => academicYears.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ── Announcement audiences (targeting rules) ────────────────────────────

export const announcementAudiences = pgTable("announcement_audiences", {
  id: uuid("id").primaryKey().defaultRandom(),
  announcementId: uuid("announcement_id").notNull().references(() => announcements.id),
  targetType: varchar("target_type", { length: 20 }).notNull(),
  // "ALL" | "COLLEGE" | "PROGRAMME" | "PROGRAMME_YEAR" | "ROLE"
  collegeId: uuid("college_id").references(() => colleges.id),
  programmeId: uuid("programme_id").references(() => programmes.id),
  yearOfStudy: integer("year_of_study"),
  semester: integer("semester"),
  roleTarget: varchar("role_target", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Announcement ↔ Media junction table ─────────────────────────────────

export const announcementMedia = pgTable("announcement_media", {
  announcementId: uuid("announcement_id").notNull().references(() => announcements.id),
  mediaId: uuid("media_id").notNull().references(() => media.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.announcementId, t.mediaId] }),
}));

// ── Relations ────────────────────────────────────────────────────────────

export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  author: one(users, { fields: [announcements.authorId], references: [users.id] }),
  category: one(categories, { fields: [announcements.categoryId], references: [categories.id] }),
  coverImage: one(media, { fields: [announcements.coverImageId], references: [media.id] }),
  academicYear: one(academicYears, { fields: [announcements.academicYearId], references: [academicYears.id] }),
  audiences: many(announcementAudiences),
  mediaLinks: many(announcementMedia),
}));

export const announcementAudiencesRelations = relations(announcementAudiences, ({ one }) => ({
  announcement: one(announcements, {
    fields: [announcementAudiences.announcementId],
    references: [announcements.id],
  }),
  college: one(colleges, { fields: [announcementAudiences.collegeId], references: [colleges.id] }),
  programme: one(programmes, { fields: [announcementAudiences.programmeId], references: [programmes.id] }),
}));

export const announcementMediaRelations = relations(announcementMedia, ({ one }) => ({
  announcement: one(announcements, {
    fields: [announcementMedia.announcementId],
    references: [announcements.id],
  }),
  mediaItem: one(media, { fields: [announcementMedia.mediaId], references: [media.id] }),
}));
