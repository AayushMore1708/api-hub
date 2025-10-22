import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username'),
  email: text('email').notNull(),
  password: text('password'),
  provider: text('provider').notNull(), 
  providerId: text('provider_id'),
  createdAt: timestamp('created_at').defaultNow(),
});