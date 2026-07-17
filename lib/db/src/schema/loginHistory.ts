import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { keysTable } from "./keys";

export const loginHistoryTable = pgTable("login_history", {
  id: text("id").primaryKey(),
  keyId: text("key_id").notNull().references(() => keysTable.id),
  keyValue: text("key_value").notNull(),
  deviceId: text("device_id").notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  action: text("action").notNull().default("Login"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLoginHistorySchema = createInsertSchema(loginHistoryTable).omit({ createdAt: true });
export type InsertLoginHistory = z.infer<typeof insertLoginHistorySchema>;
export type LoginHistoryEntry = typeof loginHistoryTable.$inferSelect;
