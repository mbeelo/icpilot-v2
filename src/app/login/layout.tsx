import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sign In - ICP Pilot | Access Your Sales Enablement Dashboard",
  description: "Sign in to your ICP Pilot account to access AI-powered sales tools, objection rebuttals, cold message templates, and qualification frameworks. Secure login for sales professionals.",
  robots: "noindex, nofollow",
  alternates: {
    canonical: "/login"
  }
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}