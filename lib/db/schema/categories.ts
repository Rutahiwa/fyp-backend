import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  module: varchar("module", { length: 20 }).notNull(), // "ANNOUNCEMENT" | "LOST_FOUND" | "FEEDBACK"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
