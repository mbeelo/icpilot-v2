import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Create Account - ICP Pilot | Start Your Free Sales Enablement Trial",
  description: "Sign up for ICP Pilot and transform your B2B sales process. Get started with AI-powered objection rebuttals, cold message generation, and sales qualification frameworks. Free trial available.",
  keywords: [
    "sales enablement signup",
    "B2B sales software trial",
    "AI sales tools free trial",
    "objection handling software",
    "sales automation platform",
    "create sales account"
  ],
  openGraph: {
    title: "Start Your Free Trial - ICP Pilot Sales Enablement Platform",
    description: "Join thousands of sales professionals using ICP Pilot to generate personalized objection rebuttals and sales content. Start your free trial today.",
    type: "website",
    url: "/register"
  },
  alternates: {
    canonical: "/register"
  }
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}