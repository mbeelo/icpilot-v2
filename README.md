# ICP Pilot v2 - SaaS Template with AI Integration

A production-ready SaaS template built with Next.js 15, featuring AI content generation, subscription payments, and modern web development best practices.

## 🚀 Features

- **AI Content Generation**: OpenAI GPT-4 integration with background processing
- **Subscription Management**: Stripe integration with usage-based billing
- **Authentication**: NextAuth.js with credentials and JWT
- **Database**: PostgreSQL with Drizzle ORM (type-safe)
- **UI/UX**: Tailwind CSS + Radix UI (responsive, accessible)
- **Performance Optimized**: Memory leak prevention, efficient polling
- **Background Processing**: Survives page reloads and tab switches
- **Real-time Updates**: Toast notifications and status indicators

## 📚 Documentation

- **[Template Learnings & Best Practices](./TEMPLATE_LEARNINGS.md)** - Complete guide to all patterns and optimizations
- **[Technical Architecture](./ARCHITECTURE.md)** - System design and data flow diagrams
- **[Development Guide](./CLAUDE.md)** - Project setup and development commands

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with App Router + TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: NextAuth.js with credentials provider
- **AI Integration**: OpenAI GPT-4 for content generation
- **Payments**: Stripe for subscription management
- **Styling**: Tailwind CSS v4 + Radix UI components
- **Deployment**: Vercel (recommended)

## 🚦 Quick Start

### 1. Environment Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd icpilot-v2

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### 2. Configure Environment Variables

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# Authentication (NextAuth.js)
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Integration (OpenAI)
OPENAI_API_KEY="sk-..."

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Database Setup

```bash
# Push schema to database
npx drizzle-kit push

# Optional: Open database studio
npx drizzle-kit studio
```

### 4. Development

```bash
# Start development server (with Turbopack)
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 Core Features

### AI-Powered Content Generation
- **Objection Handling**: Generate sophisticated sales objection rebuttals
- **Message Creation**: Create personalized outreach messages
- **Qualification Frameworks**: Build discovery question frameworks
- **Background Processing**: Long-running AI requests survive page reloads

### Subscription Management
- **Free Tier**: 5 outputs per month
- **Pro Tier**: Unlimited outputs
- **Usage Tracking**: Real-time limit monitoring
- **Stripe Integration**: Secure payment processing

### User Experience
- **Responsive Design**: Mobile-first, works on all devices
- **Real-time Feedback**: Toast notifications and loading states
- **Form Persistence**: Auto-save form data to localStorage
- **Intuitive UI**: Clean, modern interface with accessibility

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── dashboard/      # Main dashboard
│   └── (tools)/        # Feature pages
├── components/         # React components
│   ├── ui/            # Base UI components
│   ├── features/      # Feature-specific components
│   └── layout/        # Layout components
├── lib/               # Utility functions
│   ├── auth.ts        # Authentication config
│   ├── openai.ts      # AI integration
│   └── usage.ts       # Usage tracking
├── hooks/             # Custom React hooks
├── contexts/          # React contexts
└── db/                # Database schema and config
```

## 🔐 Security Features

- **Route Protection**: Middleware-based authentication
- **Input Validation**: Type-safe API routes
- **SQL Injection Prevention**: Drizzle ORM protection
- **XSS Protection**: React's built-in security
- **Secure Sessions**: JWT with rotation strategy

## 🚀 Performance Optimizations

### Memory Management
- Fixed useEffect dependency issues that caused memory leaks
- Proper event listener cleanup
- Efficient polling patterns

### Request Optimization
- Frontend usage limit checks prevent unnecessary API calls
- Background request system with duplicate prevention
- Automatic cleanup of old requests

### Bundle Optimization
- Tree shaking with ES modules
- Tailwind CSS purging
- Next.js automatic optimizations

## 📊 Using as a Template

### For New SaaS Projects

1. **Clone and Customize**
   ```bash
   git clone <this-repo>
   cd your-new-project
   # Update package.json, branding, content
   ```

2. **Environment Setup**
   - Set up Neon database
   - Configure OpenAI API key
   - Set up Stripe account
   - Deploy to Vercel

3. **Customization**
   - Update branding in components
   - Modify AI prompts in `lib/openai.ts`
   - Adjust subscription tiers in `lib/constants.ts`
   - Customize database schema in `db/schema.ts`

### Key Template Benefits

- **Production Ready**: Battle-tested patterns and optimizations
- **Scalable Architecture**: Clean separation of concerns
- **Modern Stack**: Latest versions of all dependencies
- **Performance Optimized**: Memory leak fixes and best practices
- **Well Documented**: Comprehensive guides and comments

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server (Turbopack)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npx drizzle-kit push    # Push schema to database
npx drizzle-kit studio  # Open database studio
npx drizzle-kit generate # Generate migrations
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

- Update `NEXTAUTH_URL` to your production domain
- Use production Stripe keys
- Ensure database connection string is for production

## 📈 Monitoring & Analytics

- **Performance**: Monitor bundle size and load times
- **Errors**: Track API failures and client errors
- **Business**: Monitor user conversion and feature usage
- **Costs**: Track OpenAI API usage and costs

## 🤝 Contributing

1. Read [TEMPLATE_LEARNINGS.md](./TEMPLATE_LEARNINGS.md) for patterns
2. Follow existing code style and structure
3. Add tests for new features
4. Update documentation as needed

## 📝 License

This project is intended as a template for SaaS applications. Use freely for your projects.

## 🔗 Links

- **Live Demo**: [Add your deployed URL]
- **Documentation**: See files in this repository
- **Support**: [Add your support contact]

---

Built with ❤️ using modern web development best practices. Perfect foundation for your next SaaS project! 🚀