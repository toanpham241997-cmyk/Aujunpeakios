import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const keysTable = pgTable("keys", {
  id: text("id").primaryKey(),
  keyValue: text("key_value").notNull().unique(),
  type: text("type").notNull().default("free"), // free | vip | custom
  expiryDate: text("expiry_date"), // ISO date string, null = never
  maxDevices: integer("max_devices").notNull().default(1),
  deviceCount: integer("device_count").notNull().default(0),
  isLocked: boolean("is_locked").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertKeySchema = createInsertSchema(keysTable).omit({ createdAt: true, updatedAt: true });
export type InsertKey = z.infer<typeof insertKeySchema>;
export type AppKey = typeof keysTable.$inferSelect;
