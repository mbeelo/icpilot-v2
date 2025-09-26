import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  subscriptionTier: varchar('subscription_tier', { length: 50 }).default('free'),
  subscriptionStatus: varchar('subscription_status', { length: 50 }).default('inactive'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  usageCount: integer('usage_count').default(0),
  objectionsGenerated: integer('objections_generated').default(0),
  messagesGenerated: integer('messages_generated').default(0),
  frameworksGenerated: integer('frameworks_generated').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const icps = pgTable('icps', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  industry: varchar('industry', { length: 255 }),
  companySize: varchar('company_size', { length: 100 }),
  role: varchar('role', { length: 255 }),
  painPoints: jsonb('pain_points'),
  outcomes: jsonb('outcomes'),
  triggers: jsonb('triggers'),
  dealKillers: jsonb('deal_killers'),
  companyName: text('company_name'),
  productService: text('product_service'),
  valueProposition: text('value_proposition'),
  keyDifferentiators: text('key_differentiators').array(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const outputs = pgTable('outputs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  icpId: uuid('icp_id').references(() => icps.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  input: jsonb('input').notNull(),
  output: jsonb('output').notNull(),
  isFavorite: boolean('is_favorite').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  feature: varchar('feature', { length: 100 }).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});