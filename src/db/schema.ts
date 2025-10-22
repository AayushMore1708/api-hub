import { jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username'),
  email: text('email').notNull(),
  password: text('password'),
  provider: text('provider').notNull(), 
  providerId: text('provider_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const api_docs = pgTable("api_docs", {
  id: serial("id").primaryKey(),
  library: text("library").notNull(),
  source: text("source"),
  url: text("url"),
  content: text("content"),
  vector: jsonb("vector"), // optional: for embeddings
  createdAt: timestamp("created_at").defaultNow(),
});
