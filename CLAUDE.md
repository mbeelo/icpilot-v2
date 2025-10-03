# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ICP Pilot v2 is a B2B sales enablement platform that helps sales teams create ideal customer profiles (ICPs), generate objection rebuttals, craft personalized outreach messages, and build qualification frameworks. The application uses AI (OpenAI GPT-4) to generate personalized sales content based on user-defined ICPs.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Production build**: `npm run build`
- **Start production**: `npm start`
- **Linting**: `npm run lint`
- **Database migrations**: `npx drizzle-kit push` (pushes schema changes to database)
- **Database studio**: `npx drizzle-kit studio` (opens database browser UI)
- **Generate migrations**: `npx drizzle-kit generate` (generates migration files)

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router and TypeScript
- **Database**: PostgreSQL (Supabase) with Drizzle ORM
- **Authentication**: Supabase Auth with server-side session management
- **AI Integration**: OpenAI GPT-4 for content generation
- **Payments**: Stripe for subscription management
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives

### Core Features
1. **ICP Builder** (`/icp-builder`): Create and manage ideal customer profiles
2. **Objection Killer** (`/objection-killer`): Generate AI-powered objection rebuttals
3. **Message Generator** (`/message-generator`): Create personalized outreach messages
4. **Qualification Framework** (`/qualification-framework`): Build sales qualification criteria
5. **Output Library** (`/library`): Save and manage generated sales content

### Database Schema
Located in `src/db/schema.ts` with six main tables:
- **users**: User accounts with subscription info and usage tracking
- **icps**: Ideal customer profiles with industry, role, pain points, etc. (uses PostgreSQL arrays)
- **outputs**: Generated content (objections, messages, frameworks)
- **usageLogs**: Feature usage tracking for analytics
- **blogPosts**: Blog content management
- **supportRequests**: User feedback and bug reports

### Authentication & Authorization
- Supabase Auth configuration with server-side session management
- Session handling in `src/lib/session.ts` using `getCurrentUser()`
- Protected routes defined in `middleware.ts`
- Cookie-based authentication with Supabase client

### AI Content Generation
All AI functions are in `src/lib/openai.ts`:
- `generateObjectionRebuttal()`: Creates structured objection responses
- `generateMessages()`: Generates 3 variants of outreach messages
- `generateQualificationFramework()`: Creates discovery questions and scoring

### Subscription & Usage Management
- Free tier: 5 outputs limit
- Pro/Team tiers: Unlimited outputs
- Usage tracking in `src/lib/usage.ts`
- Subscription constants in `src/lib/constants.ts`

## Key File Locations

### Configuration
- `drizzle.config.ts`: Database configuration (outputs to `./drizzle` directory)
- `next.config.ts`: Next.js configuration
- `tsconfig.json`: TypeScript configuration with path aliases (`@/*` → `src/*`)
- `middleware.ts`: Route protection middleware

### Database
- `src/db/index.ts`: Database connection setup
- `src/db/schema.ts`: Complete database schema definitions

### Authentication
- `src/lib/session.ts`: Supabase session management
- `src/lib/supabase.ts`: Supabase client configuration
- `src/lib/supabase-server.ts`: Server-side Supabase client
- `src/app/auth/`: Authentication pages (login, register)
- `src/components/auth/`: Authentication components

### API Routes
- `src/app/api/icps/`: ICP CRUD operations
- `src/app/api/objections/generate/`: Objection rebuttal generation
- `src/app/api/messages/generate/`: Message generation
- `src/app/api/qualification/generate/`: Framework generation
- `src/app/api/outputs/`: Output library management
- `src/app/api/stripe/`: Subscription webhook handling

### UI Components
- `src/components/ui/`: Reusable UI components (Button, Card, etc.)
- `src/components/layout/`: App navigation and layout
- `src/components/features/`: Feature-specific components

### Utilities
- `src/lib/utils.ts`: General utility functions (cn for className merging)
- `src/lib/usage.ts`: Usage limit checking and tracking
- `src/lib/constants.ts`: Subscription tiers, limits, and feature definitions

## Development Guidelines

### Database Operations
- Use Drizzle ORM for all database operations
- Connection is set up in `src/db/index.ts` using Supabase PostgreSQL
- Run `npx drizzle-kit push` after schema changes
- All queries should use the exported `db` instance and schema types
- **Important**: Arrays should use `text().array()` for PostgreSQL compatibility, not JSONB

### API Route Patterns
- Check authentication first: `const user = await getCurrentUser()`
- Validate user permissions and subscription limits
- Use `checkAndIncrementUsage()` for feature usage tracking
- Return proper HTTP status codes and error messages

### AI Integration Guidelines
- All OpenAI calls go through functions in `src/lib/openai.ts`
- Use GPT-4 model for best quality output
- Always include ICP context and company information when available
- Parse JSON responses and handle errors gracefully
- Personalize outputs using prospect information when provided

### Component Development
- Use TypeScript interfaces for props
- Follow existing patterns in `src/components/features/`
- Use Radix UI for interactive components
- Apply Tailwind classes using `cn()` utility for conditional styling
- Handle loading and error states appropriately

### Environment Variables Required
- `DATABASE_URL`: Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `OPENAI_API_KEY`: OpenAI API key for content generation
- `STRIPE_SECRET_KEY`: Stripe secret key for payments
- `STRIPE_PRICE_ID_PRO`: Stripe price ID for Pro subscription
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook endpoint secret
- `NODE_ENV`: Environment (development/production)