import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://icpilot.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/login',
          '/register',
          '/blog',
          '/blog/*',
          '/support',
          '/demo/*'
        ],
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/icp-builder/*',
          '/objection-killer',
          '/message-generator',
          '/qualification-framework',
          '/library',
          '/account',
          '/admin',
          '/admin/*',
          '/api/*',
          '/_next/*',
          '/private/*'
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],
      },
      {
        userAgent: 'Claude-Web',
        disallow: ['/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}