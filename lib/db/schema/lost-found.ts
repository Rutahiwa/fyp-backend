import { pgTable, uuid, varchar, text, boolean, integer, date, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./categories";
import { media } from "./media";
import { relations } from "drizzle-orm";

export const lostFoundItems = pgTable("lost_found_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: uuid("reporter_id").notNull().references(() => users.id),
  type: varchar("type", { length: 10 }).notNull(), // "LOST" | "FOUND"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  locationSeen: varchar("location_seen", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("OPEN"), // OPEN | RESOLVED
  dateLostOrFound: date("date_lost_or_found").notNull(),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  contactInfo: varchar("contact_info", { length: 255 }),
  viewCount: integer("view_count").default(0).notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const lostFoundMedia = pgTable("lost_found_media", {
  itemId: uuid("item_id").notNull().references(() => lostFoundItems.id),
  mediaId: uuid("media_id").notNull().references(() => media.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.itemId, t.mediaId] }),
}));

export const lostFoundItemsRelations = relations(lostFoundItems, ({ one, many }) => ({
  reporter: one(users, { fields: [lostFoundItems.reporterId], references: [users.id] }),
  category: one(categories, { fields: [lostFoundItems.categoryId], references: [categories.id] }),
  mediaLinks: many(lostFoundMedia),
}));

export const lostFoundMediaRelations = relations(lostFoundMedia, ({ one }) => ({
  item: one(lostFoundItems, { fields: [lostFoundMedia.itemId], references: [lostFoundItems.id] }),
  mediaItem: one(media, { fields: [lostFoundMedia.mediaId], references: [media.id] }),
}));
