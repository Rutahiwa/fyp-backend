import { pgTable, uuid, varchar, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { colleges } from "./colleges";
import { media } from "./media";
import { relations } from "drizzle-orm";

export const stories = pgTable("stories", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id").notNull().references(() => users.id),
  collegeId: uuid("college_id").references(() => colleges.id),
  mediaId: uuid("media_id").references(() => media.id),
  caption: varchar("caption", { length: 500 }),
  backgroundColor: varchar("background_color", { length: 7 }),
  linkUrl: varchar("link_url", { length: 500 }),
  linkText: varchar("link_text", { length: 100 }),
  viewCount: integer("view_count").default(0).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const storyViews = pgTable("story_views", {
  storyId: uuid("story_id").notNull().references(() => stories.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.storyId, t.userId] }),
}));

export const storiesRelations = relations(stories, ({ one, many }) => ({
  author: one(users, { fields: [stories.authorId], references: [users.id] }),
  college: one(colleges, { fields: [stories.collegeId], references: [colleges.id] }),
  mediaItem: one(media, { fields: [stories.mediaId], references: [media.id] }),
  views: many(storyViews),
}));

export const storyViewsRelations = relations(storyViews, ({ one }) => ({
  story: one(stories, { fields: [storyViews.storyId], references: [stories.id] }),
  user: one(users, { fields: [storyViews.userId], references: [users.id] }),
}));
