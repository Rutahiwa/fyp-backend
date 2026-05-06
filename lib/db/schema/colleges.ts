import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const colleges = pgTable("colleges", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "College of Information and Communication Technologies"
  shortName: varchar("short_name", { length: 50 }).notNull().unique(), // e.g., "CoICT"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
