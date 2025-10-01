# ICP Pilot Template - Learnings & Best Practices

This document captures all the learnings, best practices, and architectural decisions made during the development of ICP Pilot v2. Use this as a reference when creating new projects from this template.

## 🏗️ Architecture Overview

### Tech Stack Decisions
- **Framework**: Next.js 15 with App Router (modern, SSR, great DX)
- **Database**: PostgreSQL with Drizzle ORM (type-safe, migration-friendly)
- **Authentication**: NextAuth.js with credentials (flexible, secure)
- **AI Integration**: OpenAI GPT-4 (reliable, high-quality responses)
- **Payments**: Stripe (industry standard, comprehensive)
- **Styling**: Tailwind CSS v4 (utility-first, fast development)
- **UI Components**: Radix UI primitives (accessible, unstyled)

### Why These Choices?
- **Type Safety**: TypeScript + Drizzle ensures fewer runtime errors
- **Developer Experience**: Hot reload, great debugging, clear error messages
- **Scalability**: Next.js handles SSR/SSG, Drizzle handles complex queries
- **Maintainability**: Clear separation of concerns, consistent patterns

## 🚀 Performance Optimizations

### Critical Memory Leak Fixes
**❌ DON'T DO THIS:**
```typescript
// Bad - Creates memory leaks from excessive useEffect dependencies
useEffect(() => {
  const interval = setInterval(pollForCompletion, 3000);
  return () => clearInterval(interval);
}, [isGenerating, formField1, formField2]); // ← Problem: form fields cause re-runs
```

**✅ DO THIS:**
```typescript
// Good - Only depends on actual state that should trigger polling
useEffect(() => {
  const interval = setInterval(pollForCompletion, 3000);
  return () => clearInterval(interval);
}, [isGenerating]); // ← Only the necessary dependency
```

### Event Listener Cleanup Pattern
```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      fetchData();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', fetchData);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', fetchData);
  };
}, []);
```

### Avoid Code Duplication
**❌ DON'T DO THIS:**
```typescript
// Bad - Duplicate fetch logic
const saveToLibrary = async () => {
  // ... save logic
  // Duplicate the same fetch logic here
  fetch('/api/outputs').then(res => res.json()).then(data => {
    // Same processing logic...
  });
};
```

**✅ DO THIS:**
```typescript
// Good - Reuse existing functions
const saveToLibrary = async () => {
  // ... save logic
  fetchData(); // Reuse existing function
};
```

## 🔐 Authentication & Security

### NextAuth Configuration
```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // Custom credentials provider for email/password
    }),
  ],
  session: {
    strategy: 'jwt', // Stateless, scalable
  },
  pages: {
    signIn: '/login', // Custom login page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Include user ID in token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
```

### Middleware Protection
```typescript
export default withAuth(
  function middleware(req) {
    // Custom middleware logic
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow demo routes without auth
        if (req.nextUrl.pathname.startsWith('/demo')) {
          return true;
        }
        return !!token;
      }
    },
    pages: {
      signIn: '/login',
    }
  }
)
```

### Sign-Out Best Practice
**❌ DON'T DO THIS:**
```typescript
// Bad - Can cause redirect loops
onClick={() => signOut({ callbackUrl: '/' })}
```

**✅ DO THIS:**
```typescript
// Good - Manual redirect prevents loops
onClick={async () => {
  setIsSigningOut(true);
  try {
    await signOut({ redirect: false });
    window.location.href = '/login';
  } catch (error) {
    setIsSigningOut(false);
  }
}}
```

## 💳 Payment Integration

### Stripe Setup
- Use webhook for subscription status updates
- Handle 402 status codes for payment required
- Frontend usage limit checks prevent token waste

### Usage Limit Pattern
```typescript
const generateContent = async () => {
  // Check limits BEFORE making expensive AI calls
  if (!canMakeRequest()) {
    setShowUpgradeModal(true);
    return;
  }

  // Proceed with generation...
};
```

## 🤖 AI Integration Patterns

### Background Request System
- Survives page reloads with sessionStorage
- Prevents duplicate requests
- Handles long-running AI generations gracefully

```typescript
export async function startBackgroundRequest(
  endpoint: string,
  body: Record<string, unknown>,
  toolType: 'objection' | 'message' | 'framework',
) {
  // Check for existing pending requests
  const existingPending = requests.find(r =>
    r.toolType === toolType &&
    r.status === 'pending' &&
    Date.now() - r.startTime < 300000
  );

  if (existingPending) {
    return existingPending.id; // Prevent duplicates
  }

  // Start new request...
}
```

### OpenAI Best Practices
- Use GPT-4 for quality (worth the cost)
- Include rich context (ICP data, user info)
- Parse JSON responses with fallbacks
- Handle rate limits and errors gracefully

## 🗄️ Database Patterns

### Drizzle ORM Setup
```typescript
// Schema with proper relationships
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  subscriptionTier: text('subscription_tier').default('free'),
  usageCount: integer('usage_count').default(0),
});

export const outputs = pgTable('outputs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  icpId: text('icp_id').references(() => icps.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Migration Strategy
- Use `npx drizzle-kit push` for development
- Use `npx drizzle-kit generate` for production migrations
- Always backup before schema changes

## 🎨 UI/UX Patterns

### Form State Management
```typescript
// Auto-save form state to localStorage
useEffect(() => {
  if (formData.field1 || formData.field2) {
    localStorage.setItem('formData', JSON.stringify(formData));
  }
}, [formData]);
```

### Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await performAction();
  } finally {
    setIsLoading(false); // Always cleanup
  }
};
```

### Deselection Pattern
```typescript
onClick={() => {
  if (selectedItem === item) {
    setSelectedItem(''); // Deselect if already selected
  } else {
    setSelectedItem(item); // Select new item
  }
}}
```

### Modal Dismiss Pattern
```typescript
const [isDismissed, setIsDismissed] = useState(false);

useEffect(() => {
  const dismissed = localStorage.getItem('bannerDismissed');
  if (dismissed === 'true') {
    setIsDismissed(true);
  }
}, []);

const dismissBanner = () => {
  setIsDismissed(true);
  localStorage.setItem('bannerDismissed', 'true');
};
```

### Glassmorphism Effects
```css
.modal-backdrop {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.1);
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}
```

## 📱 Responsive Design

### Mobile-First Approach
```typescript
// Always design mobile-first, then add desktop features
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Content */}
</div>
```

### Touch-Friendly Interactions
- Minimum 44px touch targets
- Clear hover/focus states
- Mobile menu for navigation

## 🔍 Search & Filtering

### Comprehensive Search Function
```typescript
function searchInContent(item: any, searchTerm: string): boolean {
  const searchLower = searchTerm.toLowerCase();

  // Search in all relevant fields
  const searchableText = [
    item.title,
    item.description,
    JSON.stringify(item.data)
  ].join(' ').toLowerCase();

  return searchableText.includes(searchLower);
}
```

## 🚦 State Management

### Context for Global State
```typescript
const ICPContext = createContext<ICPContextType | undefined>(undefined);

export function ICPProvider({ children }: { children: React.ReactNode }) {
  const [selectedIcpId, setSelectedIcpId] = useState<string>('');

  // Auto-save selection
  useEffect(() => {
    if (selectedIcpId) {
      localStorage.setItem('selectedIcpId', selectedIcpId);
    }
  }, [selectedIcpId]);

  return (
    <ICPContext.Provider value={{ selectedIcpId, setSelectedIcpId }}>
      {children}
    </ICPContext.Provider>
  );
}
```

### Custom Hooks for Reusability
```typescript
export function useUsage() {
  const [usage, setUsage] = useState<UsageData | null>(null);

  const canMakeRequest = (): boolean => {
    return !usage?.hasReachedLimit;
  };

  const refreshUsage = () => {
    fetchUsage();
  };

  return { usage, canMakeRequest, refreshUsage };
}
```

## 🛠️ Development Workflow

### Environment Setup
1. **Local Development**: `npm run dev` (uses Turbopack)
2. **Database**: Neon PostgreSQL (serverless, managed)
3. **Migrations**: `npx drizzle-kit push` for development
4. **Linting**: `npm run lint` (fix issues automatically)

### Code Organization
```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
│   ├── ui/          # Basic UI primitives
│   ├── features/    # Feature-specific components
│   └── layout/      # Layout components
├── lib/             # Utility functions
├── hooks/           # Custom React hooks
├── contexts/        # React contexts
└── db/              # Database schema and utilities
```

### Git Workflow
- Feature branches for all changes
- Descriptive commit messages
- Review before merging to main

## 🐛 Common Pitfalls to Avoid

### 1. Memory Leaks
- ❌ Too many useEffect dependencies
- ❌ Missing cleanup functions
- ❌ Multiple intervals running

### 2. Performance Issues
- ❌ Fetching data on every render
- ❌ Not memoizing expensive calculations
- ❌ Large bundle sizes

### 3. State Management
- ❌ Prop drilling instead of context
- ❌ Not persisting important state
- ❌ Race conditions in async operations

### 4. Authentication
- ❌ Not handling sign-out properly
- ❌ Missing route protection
- ❌ Client-side only auth checks

### 5. UI/UX
- ❌ Missing loading states
- ❌ Poor mobile experience
- ❌ No error boundaries

## 📊 Monitoring & Analytics

### Performance Monitoring
- Monitor bundle size with `npm run build`
- Check for memory leaks in dev tools
- Profile React components if needed

### User Experience Metrics
- Track feature usage
- Monitor error rates
- Measure conversion funnels

## 🔮 Future Considerations

### Scalability Preparations
- Database indexing strategy
- CDN for static assets
- Caching strategies (Redis)
- Background job processing

### Feature Additions
- Real-time collaboration
- Advanced analytics
- API rate limiting
- Multi-tenancy support

## 📝 Key Takeaways

1. **Performance First**: Always consider memory usage and re-renders
2. **User Experience**: Loading states, error handling, mobile-first
3. **Type Safety**: Use TypeScript everywhere, Drizzle for DB
4. **Security**: Proper auth, input validation, rate limiting
5. **Maintainability**: Clear patterns, good documentation, reusable components
6. **Testing**: Consider adding tests for critical paths
7. **Monitoring**: Track performance and user behavior

## 🚀 Quick Start for New Projects

1. Clone this template
2. Update environment variables
3. Run database migrations
4. Customize branding and content
5. Deploy to Vercel/similar platform
6. Set up domain and SSL
7. Configure monitoring

This template provides a solid foundation for SaaS applications with AI integration, subscription payments, and modern web development practices. Use these learnings to build faster and avoid common pitfalls! 🎯