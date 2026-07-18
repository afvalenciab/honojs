import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
