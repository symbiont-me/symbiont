import { pgTable, text, serial, timestamp, varchar, integer, pgEnum } from "drizzle-orm/pg-core";

export const userSystemEnum = pgEnum("user_system_enum", ["admin", "user"]);

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  pdfName: text("pdf_name").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  // pdfSize: integer("pdf_size").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  fileKey: varchar("file_key", { length: 256 }).notNull(),
});

// This type alias 'DrizzleChat' represents the shape of the data selected from the 'chats' table using Drizzle ORM.
export type DrizzleChat = typeof chats.$inferSelect;



export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  role: userSystemEnum("role").notNull(),
});
