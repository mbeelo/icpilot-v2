import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sales Blog - Expert Tips & Strategies | ICP Pilot',
  description: 'Master B2B sales with expert insights on objection handling, prospecting techniques, and proven methodologies like Sandler, Challenger, and SPIN selling. Free actionable content for sales professionals.',
  keywords: [
    'sales blog',
    'B2B sales tips',
    'objection handling strategies',
    'sales prospecting techniques',
    'Sandler selling',
    'Challenger sale methodology',
    'SPIN selling techniques',
    'sales training content',
    'cold calling tips',
    'sales qualification',
    'sales psychology',
    'B2B sales best practices'
  ],
  openGraph: {
    title: 'Sales Blog - Expert Tips & Strategies | ICP Pilot',
    description: 'Master B2B sales with expert insights on objection handling, prospecting techniques, and proven sales methodologies.',
    type: 'website',
    url: '/blog',
    images: [
      {
        url: '/og-blog.png',
        width: 1200,
        height: 630,
        alt: 'ICP Pilot Sales Blog - Expert Tips & Strategies'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sales Blog - Expert Tips & Strategies | ICP Pilot',
    description: 'Master B2B sales with expert insights on objection handling and proven sales methodologies.',
    images: ['/twitter-blog.png']
  },
  alternates: {
    canonical: '/blog'
  }
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}