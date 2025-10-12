import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
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
  painPoints: text('pain_points').array(),
  outcomes: text('outcomes').array(),
  triggers: text('triggers').array(),
  dealKillers: text('deal_killers').array(),
  companyName: text('company_name'),
  productService: text('product_service'),
  valueProposition: text('value_proposition'),
  keyDifferentiators: text('key_differentiators').array(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const outputs = pgTable('outputs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  icpId: uuid('icp_id').references(() => icps.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  input: jsonb('input'),
  output: jsonb('output').notNull(),
  isFavorite: boolean('is_favorite').default(false),
  isSaved: boolean('is_saved').default(false), // User explicitly saved to library
  isTemporary: boolean('is_temporary').default(true), // Auto-saved temp content
  sessionId: varchar('session_id', { length: 255 }), // For session-based cleanup
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

export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  metaTitle: varchar('meta_title', { length: 60 }),
  metaDescription: varchar('meta_description', { length: 160 }),
  targetKeywords: jsonb('target_keywords'), // Array of target keywords
  category: varchar('category', { length: 100 }).notNull(),
  tags: jsonb('tags'), // Array of tags
  authorName: varchar('author_name', { length: 255 }).default('ICP Pilot Team'),
  readingTime: integer('reading_time'), // Estimated reading time in minutes
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at'),
  approvalStatus: varchar('approval_status', { length: 50 }).default('pending'), // pending, approved, rejected
  rejectionFeedback: text('rejection_feedback'), // Admin feedback for regeneration
  autoPublishDate: timestamp('auto_publish_date'), // When to auto-publish if approved
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const contentCalendar = pgTable('content_calendar', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  targetKeywords: jsonb('target_keywords'),
  contentBrief: text('content_brief').notNull(),
  targetAudience: varchar('target_audience', { length: 255 }),
  contentType: varchar('content_type', { length: 100 }).notNull(), // how-to, guide, listicle, etc.
  priority: varchar('priority', { length: 20 }).default('medium'), // high, medium, low
  status: varchar('status', { length: 50 }).default('planned'), // planned, in-progress, completed, published
  blogPostId: uuid('blog_post_id').references(() => blogPosts.id),
  scheduledDate: timestamp('scheduled_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const supportRequests = pgTable('support_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 50 }).notNull(), // 'tool_suggestion' or 'bug_report'
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 50 }).default('open'), // open, in_progress, resolved, closed
  priority: varchar('priority', { length: 20 }).default('medium'), // low, medium, high, critical

  // User info
  userId: uuid('user_id').references(() => users.id),
  userName: varchar('user_name', { length: 255 }),
  userEmail: varchar('user_email', { length: 255 }),

  // Tool suggestion specific fields
  toolName: varchar('tool_name', { length: 255 }),
  useCase: text('use_case'),

  // Bug report specific fields
  stepsToReproduce: text('steps_to_reproduce'),
  expectedResult: text('expected_result'),
  actualResult: text('actual_result'),
  severity: varchar('severity', { length: 20 }),
  browser: varchar('browser', { length: 100 }),
  device: varchar('device', { length: 100 }),
  userAgent: text('user_agent'),

  // Admin fields
  assignedTo: varchar('assigned_to', { length: 255 }),
  adminNotes: text('admin_notes'),
  resolvedAt: timestamp('resolved_at'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});