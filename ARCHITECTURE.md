# ICP Pilot v2 - Technical Architecture

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 15 App Router │ React 18 │ TypeScript │ Tailwind CSS   │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐ │
│  │   UI Components │   │  Feature Pages  │   │   Contexts      │ │
│  │   - Radix UI    │   │  - Dashboard    │   │   - ICP         │ │
│  │   - Custom      │   │  - Tools        │   │   - Auth        │ │
│  │   - Responsive  │   │  - Library      │   │   - Usage       │ │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐ │
│  │   Auth Routes   │   │  Feature APIs   │   │  Stripe Hooks   │ │
│  │   - Login       │   │  - ICPs         │   │  - Subscriptions│ │
│  │   - Register    │   │  - Objections   │   │  - Webhooks     │ │
│  │   - Session     │   │  - Messages     │   │  - Billing      │ │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘ │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐ │
│  │  Usage Tracking │   │   AI Integration│   │   File Storage  │ │
│  │   - Limits      │   │   - OpenAI      │   │   - Session     │ │
│  │   - Analytics   │   │   - Prompts     │   │   - Temp Data   │ │
│  │   - Billing     │   │   - Streaming   │   │   - Persistence │ │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐ │
│  │    Database     │   │      AI API     │   │    Payments     │ │
│  │  PostgreSQL     │   │    OpenAI       │   │     Stripe      │ │
│  │  (Neon)         │   │    GPT-4        │   │   Subscriptions │ │
│  │  - Users        │   │    - Content    │   │   - Webhooks    │ │
│  │  - ICPs         │   │    - Generation │   │   - Portal      │ │
│  │  - Outputs      │   │    - Streaming  │   │   - Billing     │ │
│  │  - Usage Logs   │   │    - Fallbacks  │   │   - Analytics   │ │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### 1. User Authentication Flow
```
User → Login Page → NextAuth.js → Credentials Provider → Database
                      ↓
JWT Token ← Session Callback ← Database Validation
     ↓
Middleware Protection → Route Access → Feature Pages
```

### 2. AI Content Generation Flow
```
User Input → Form Validation → Usage Check → Background Request
                                   ↓
sessionStorage ← Request Tracking ← OpenAI API ← Context Building
     ↓
Polling System → Completion Check → UI Update → Database Save
                                        ↓
                               Usage Increment → Limit Check
```

### 3. Subscription Management Flow
```
Free User → Usage Limit → Upgrade Modal → Stripe Checkout
                              ↓
Webhook Handler ← Payment Success ← Stripe Processing
      ↓
Database Update → Usage Reset → Feature Unlock
```

## 🗄️ Database Schema

### Core Tables
```sql
-- Users table
users (
  id: text PRIMARY KEY,
  email: text UNIQUE NOT NULL,
  name: text,
  password_hash: text,
  subscription_tier: text DEFAULT 'free',
  usage_count: integer DEFAULT 0,
  created_at: timestamp DEFAULT NOW()
)

-- Ideal Customer Profiles
icps (
  id: text PRIMARY KEY,
  user_id: text REFERENCES users(id) ON DELETE CASCADE,
  name: text NOT NULL,
  industry: text,
  company_size: text,
  role: text,
  pain_points: jsonb,
  outcomes: jsonb,
  triggers: jsonb,
  created_at: timestamp DEFAULT NOW()
)

-- Generated Outputs
outputs (
  id: text PRIMARY KEY,
  user_id: text REFERENCES users(id) ON DELETE CASCADE,
  icp_id: text REFERENCES icps(id) ON DELETE CASCADE,
  type: text NOT NULL, -- 'objection', 'message', 'framework'
  title: text,
  data: jsonb,
  is_saved: boolean DEFAULT false,
  created_at: timestamp DEFAULT NOW()
)

-- Usage Tracking
usage_logs (
  id: text PRIMARY KEY,
  user_id: text REFERENCES users(id) ON DELETE CASCADE,
  feature: text NOT NULL,
  created_at: timestamp DEFAULT NOW()
)
```

### Relationships
- Users → ICPs (1:many)
- Users → Outputs (1:many)
- ICPs → Outputs (1:many)
- Users → Usage Logs (1:many)

## 🔧 Component Architecture

### Layout Hierarchy
```
AppLayout
├── Navigation (AppNav)
├── ICP Context Provider
├── Session Provider
└── Page Content
    ├── Feature Components
    │   ├── Form Sections
    │   ├── Output Display
    │   └── Action Buttons
    ├── Modal Components
    │   ├── Upgrade Modal
    │   └── Confirmation Dialogs
    └── UI Components
        ├── Buttons
        ├── Cards
        ├── Forms
        └── Loading States
```

### State Management Pattern
```
Global State (Context)
├── ICP Selection
├── User Session
└── Usage Limits

Local State (Component)
├── Form Data
├── Loading States
├── Modal Visibility
└── Generated Content

Persistent State (Storage)
├── User Preferences
├── Form Auto-save
├── Background Requests
└── Dismissed Banners
```

## 🚀 Performance Optimizations

### Memory Management
```typescript
// ✅ Proper useEffect dependencies
useEffect(() => {
  const interval = setInterval(poll, 3000);
  return () => clearInterval(interval);
}, [isGenerating]); // Only essential dependencies

// ✅ Event listener cleanup
useEffect(() => {
  const handler = () => { /* ... */ };
  document.addEventListener('event', handler);
  return () => document.removeEventListener('event', handler);
}, []);
```

### Request Optimization
```typescript
// ✅ Background request system
- Prevents duplicate requests
- Survives page reloads
- Handles long-running operations
- Automatic cleanup

// ✅ Usage limit checks
- Frontend validation before API calls
- Prevents token waste
- Immediate user feedback
```

### Bundle Optimization
- Tree shaking with ES modules
- Dynamic imports for large components
- Tailwind CSS purging
- Next.js automatic optimizations

## 🔐 Security Architecture

### Authentication & Authorization
```
Route Protection (Middleware)
├── Public Routes (/, /login, /register)
├── Protected Routes (/dashboard, /tools)
└── Demo Routes (/demo/*)

Session Management (NextAuth.js)
├── JWT Strategy (stateless)
├── Secure cookies
├── CSRF protection
└── Session refresh
```

### Input Validation
```typescript
// API Routes
- Request body validation
- SQL injection prevention (Drizzle ORM)
- Rate limiting considerations
- Error sanitization

// Frontend
- Form validation
- Type checking (TypeScript)
- XSS prevention (React)
```

### Data Protection
- Environment variables for secrets
- Database connection encryption
- API key rotation strategy
- No sensitive data in client bundles

## 🔄 Background Processing

### AI Request Pipeline
```
1. Request Initiation
   ├── Form validation
   ├── Usage limit check
   └── Request queuing

2. Background Processing
   ├── sessionStorage persistence
   ├── OpenAI API call
   ├── Error handling
   └── Response parsing

3. Completion Handling
   ├── Polling system
   ├── UI updates
   ├── Database saving
   └── Usage tracking
```

### Session Persistence
```typescript
// Background requests survive:
- Page reloads
- Tab switches
- Browser refresh
- Network interruptions

// Automatic cleanup:
- Completed requests (after processing)
- Old requests (after 10 minutes)
- Error requests (after handling)
```

## 📊 Monitoring & Analytics

### Performance Metrics
- Page load times
- API response times
- Memory usage patterns
- Bundle size tracking

### Business Metrics
- User registration rate
- Feature usage patterns
- Conversion funnel
- Subscription metrics

### Error Tracking
- API error rates
- Client-side errors
- Payment failures
- AI request failures

## 🚀 Deployment Architecture

### Development Environment
```
Local Development
├── Next.js dev server (Turbopack)
├── Neon database (development)
├── Local environment variables
└── Hot reload enabled
```

### Production Environment
```
Vercel Deployment
├── Automatic deployments (main branch)
├── Environment variable management
├── Edge functions (API routes)
├── CDN for static assets
└── Analytics integration
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...

# AI Integration
OPENAI_API_KEY=...

# Payments
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

## 🔮 Scalability Considerations

### Database Scaling
- Connection pooling
- Read replicas
- Query optimization
- Indexing strategy

### API Scaling
- Rate limiting
- Caching strategies
- Background job queues
- Microservices split

### Frontend Scaling
- Code splitting
- Image optimization
- PWA considerations
- Performance monitoring

This architecture provides a solid foundation for SaaS applications with AI integration, ensuring scalability, maintainability, and optimal user experience. 🎯