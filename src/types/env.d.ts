declare namespace NodeJS {
  interface ProcessEnv {
    // Database
    DATABASE_URL: string;

    // Authentication
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;

    // AI Services
    OPENAI_API_KEY: string;

    // Payment Processing
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    STRIPE_PUBLISHABLE_KEY?: string;

    // Development
    NODE_ENV: 'development' | 'production' | 'test';
    ANALYZE?: string;

    // Optional
    ANTHROPIC_API_KEY?: string;

    // Logging and monitoring (optional)
    SENTRY_DSN?: string;
    VERCEL_URL?: string;
    VERCEL_ENV?: string;
  }
}