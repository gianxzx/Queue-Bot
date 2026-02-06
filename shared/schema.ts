import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerUsername: text("customer_username").notNull(),
  food: text("food").notNull(),
  qty: text("qty").notNull(),
  payment: text("payment").notNull(),
  totalBill: text("total_bill").notNull(),
  status: text("status").notNull().default("pending"), // pending, noted, processing, done
  staffId: text("staff_id").notNull(), // Discord ID of the staff who added it
  staffUsername: text("staff_username").notNull(),
  channelId: text("channel_id").notNull(),
  messageId: text("message_id"), // ID of the queue message to update
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  createdAt: true,
  status: true 
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
