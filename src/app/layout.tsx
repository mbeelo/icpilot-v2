import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://icpilot.com'),
  title: {
    default: "ICP Pilot - AI-Powered Sales Enablement Platform",
    template: "%s | ICP Pilot"
  },
  description: "Transform your B2B sales process with AI-powered tools for ideal customer profiling, objection handling, message generation, and qualification frameworks. Built on proven sales methodologies.",
  keywords: [
    "sales enablement",
    "B2B sales",
    "ideal customer profile",
    "ICP",
    "objection handling",
    "sales methodology",
    "AI sales tools",
    "Sandler selling",
    "Challenger sale",
    "SPIN selling",
    "sales qualification",
    "prospecting",
    "sales automation"
  ],
  authors: [{ name: "ICP Pilot Team" }],
  creator: "ICP Pilot",
  publisher: "ICP Pilot",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://icpilot.com",
    siteName: "ICP Pilot",
    title: "ICP Pilot - AI-Powered Sales Enablement Platform",
    description: "Transform your B2B sales process with AI-powered tools for ideal customer profiling, objection handling, message generation, and qualification frameworks.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ICP Pilot - AI-Powered Sales Enablement Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ICP Pilot - AI-Powered Sales Enablement Platform",
    description: "Transform your B2B sales process with AI-powered tools for ideal customer profiling, objection handling, message generation, and qualification frameworks.",
    creator: "@icpilot",
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add your actual verification code
  },
};

import { Providers } from './providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
