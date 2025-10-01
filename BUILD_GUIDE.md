# Build & Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Required environment variables (see Environment Setup below)

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build-check  # Validate build readiness
npm run build        # Create production build
npm start           # Start production server
```

## 📋 Build Health Check

Run the automated health check before any deployment:

```bash
npm run build-check
```

This script validates:
- ✅ Environment variables are properly set
- ✅ TypeScript compilation succeeds
- ✅ All required files exist
- ✅ Dependencies are correctly configured
- ✅ Build optimizations are enabled

## 🔧 Available Scripts

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `npm run dev` | Start development server with Turbopack | Local development |
| `npm run build` | Create optimized production build | Deployment preparation |
| `npm run build:analyze` | Build with bundle analyzer | Performance optimization |
| `npm run start` | Start production server | Production deployment |
| `npm run lint` | Run ESLint checks | Code quality validation |
| `npm run lint:fix` | Auto-fix linting issues | Before commits |
| `npm run type-check` | TypeScript compilation check | Type safety validation |
| `npm run build-check` | Comprehensive build health check | Pre-deployment validation |
| `npm run pre-deploy` | Full validation pipeline | CI/CD deployment |

## 🌍 Environment Variables

### Required Variables
Create a `.env.local` file with these variables:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# AI Services
OPENAI_API_KEY=sk-...

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Optional Variables
```bash
# Development
ANALYZE=true                    # Enable bundle analyzer
NODE_ENV=development            # Environment mode

# Additional Services
ANTHROPIC_API_KEY=...          # Alternative AI provider
SENTRY_DSN=...                 # Error monitoring
```

### Environment Type Safety
All environment variables are typed in `src/types/env.d.ts`. TypeScript will validate:
- Required variables are present
- Correct variable names are used
- Type safety across the application

## 🏗️ Build Optimizations

### Next.js Configuration (`next.config.ts`)
- **Compression**: Enabled for smaller response sizes
- **Image Optimization**: WebP/AVIF formats with caching
- **Bundle Splitting**: Automatic code splitting for better performance
- **Security Headers**: X-Frame-Options, Content-Type protection
- **Package Optimization**: Tree-shaking for Radix UI and Lucide React

### TypeScript Configuration (`tsconfig.json`)
- **Strict Mode**: Full type checking enabled
- **Path Aliases**: `@/*` maps to `src/*`
- **Performance**: Skip lib checks for faster compilation
- **Modern Target**: ES2017 for optimal browser support

### Bundle Analysis
Analyze your bundle size and dependencies:
```bash
npm run build:analyze
```
This opens an interactive visualization showing:
- Bundle size breakdown
- Duplicate dependencies
- Optimization opportunities

## 🔄 Pre-commit Hooks

### Automated Quality Checks
The project includes Husky pre-commit hooks that automatically:

**Pre-commit:**
- Run ESLint with auto-fix
- Validate TypeScript compilation
- Format code with Prettier
- Only allow commits if checks pass

**Pre-push:**
- Run build health check
- Execute tests (if available)
- Prevent broken code from reaching remote

### Manual Hook Management
```bash
# Initialize hooks (automatic with npm install)
npx husky

# Skip hooks (emergency only)
git commit --no-verify
git push --no-verify
```

## 🚀 Deployment Checklist

### Pre-deployment Validation
```bash
# 1. Run comprehensive checks
npm run build-check

# 2. Verify production build
npm run build

# 3. Test production locally
npm start

# 4. Check bundle size
npm run build:analyze
```

### Environment Setup
- [ ] All required environment variables configured
- [ ] Database accessible from production environment
- [ ] Stripe webhook endpoints configured
- [ ] OpenAI API limits suitable for production load

### Performance Optimization
- [ ] Images optimized (WebP/AVIF formats)
- [ ] Bundle size under acceptable limits (< 1MB initial load)
- [ ] Tree-shaking reducing unused code
- [ ] Code splitting working correctly

### Security Checklist
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] No sensitive data in build output
- [ ] API rate limiting configured

## 🐛 Troubleshooting

### Common Build Issues

**TypeScript Compilation Errors:**
```bash
npm run type-check  # Check for type errors
npm run lint:fix    # Auto-fix linting issues
```

**Environment Variable Issues:**
```bash
npm run build-check  # Validates all env vars
```

**Bundle Size Issues:**
```bash
npm run build:analyze  # Identify large dependencies
```

**Pre-commit Hook Failures:**
```bash
npm run lint:fix      # Fix linting issues
npm run type-check    # Check TypeScript
git add .             # Stage fixes
git commit            # Retry commit
```

### Build Optimization Tips

1. **Use Dynamic Imports**: For large components not needed immediately
2. **Optimize Images**: Use Next.js Image component with proper sizing
3. **Bundle Analysis**: Regularly check for duplicate or unnecessary dependencies
4. **Environment Variables**: Only load what's needed for each environment

## 📊 Performance Monitoring

### Build Metrics to Track
- **Bundle Size**: Keep initial load under 1MB
- **Build Time**: Should complete under 2 minutes
- **Type Check Time**: Should complete under 30 seconds
- **Lighthouse Score**: Aim for 90+ performance score

### Continuous Monitoring
```bash
# Monitor build performance
npm run build:analyze

# Check type safety
npm run type-check

# Validate deployment readiness
npm run build-check
```

## 🔗 CI/CD Integration

### GitHub Actions Example
```yaml
name: Build & Deploy
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build-check
      - run: npm run build
```

### Vercel Deployment
The project is optimized for Vercel deployment:
- Automatic environment variable detection
- Edge runtime compatibility
- Serverless function optimization

## 📚 Additional Resources

- [Next.js Production Checklist](https://nextjs.org/docs/deployment)
- [TypeScript Performance Guide](https://www.typescriptlang.org/docs/handbook/performance.html)
- [Bundle Analyzer Documentation](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Husky Git Hooks](https://typicode.github.io/husky/)

---

For questions or issues, refer to the main [CLAUDE.md](./CLAUDE.md) documentation or run `npm run build-check` for automated diagnostics.