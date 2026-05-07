import { pgTable, uuid, varchar, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const reactions = pgTable("reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  targetId: uuid("target_id").notNull(),
  targetType: varchar("target_type", { length: 20 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("LIKE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  uniq: unique().on(t.userId, t.targetId, t.targetType),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, { fields: [reactions.userId], references: [users.id] }),
}));
