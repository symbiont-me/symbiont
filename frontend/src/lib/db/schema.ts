import { pgTable, text, serial, timestamp, varchar, integer, pgEnum } from "drizzle-orm/pg-core";

export const userSystemEnum = pgEnum("user_system_enum", ["admin", "user"]);
export const resourceCategoryEnum = pgEnum("resource_category_enum", [
  "pdf",
  "webpage",
  "audio",
  "video",
]);

export const studies = pgTable("studies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 256 }).notNull(),
});

// NOTE only one text per study
export const studyTexts = pgTable("study_texts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  studyId: integer("study_id").notNull(),
});

// NOTE multiple resources per study
export const studyResources = pgTable("study_resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  identifier: varchar("identifier", { length: 256 }).notNull(),
  category: resourceCategoryEnum("category").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  studyId: integer("study_id").notNull(),
});

// NOTE each chat is linked to multiple resources but only one study
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  studyId: integer("study_id").notNull(),
});

export type DrizzleStudyResource = typeof studyResources.$inferSelect;

// This type alias 'DrizzleChat' represents the shape of the data selected from the 'chats' table using Drizzle ORM.
export type DrizzleChat = typeof chats.$inferSelect;

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  role: userSystemEnum("role").notNull(),
});
