import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ICP Pilot - AI-Powered Sales Enablement Platform | Turn Every Rep Into a Top Performer",
  description: "Stop wasting 60+ hours weekly recreating sales content. ICP Pilot's AI generates personalized objection rebuttals, cold messages, and discovery frameworks based on proven methodologies like Sandler, Challenger, and SPIN selling.",
  keywords: [
    "sales enablement platform",
    "AI sales tools",
    "B2B sales software",
    "sales automation",
    "objection handling software",
    "cold outreach templates",
    "sales discovery framework",
    "ideal customer profile builder",
    "sales productivity tools",
    "sales rep training software",
    "Sandler selling methodology",
    "Challenger sale techniques",
    "SPIN selling framework",
    "sales qualification tools",
    "B2B prospecting software"
  ],
  openGraph: {
    title: "ICP Pilot - Turn Every Sales Rep Into a Top Performer",
    description: "AI-powered sales enablement platform that generates personalized objection rebuttals, cold messages, and discovery frameworks. Stop wasting time recreating sales content.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/og-home.png",
        width: 1200,
        height: 630,
        alt: "ICP Pilot - AI-Powered Sales Enablement Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ICP Pilot - Turn Every Sales Rep Into a Top Performer",
    description: "AI-powered sales enablement platform that generates personalized objection rebuttals, cold messages, and discovery frameworks.",
    images: ["/twitter-home.png"]
  },
  alternates: {
    canonical: "/"
  }
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ICP Pilot",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "description": "AI-powered sales enablement platform that generates personalized objection rebuttals, cold messages, and discovery frameworks based on proven sales methodologies.",
    "url": "https://icpilot.com",
    "author": {
      "@type": "Organization",
      "name": "ICP Pilot"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free trial available"
    },
    "featureList": [
      "AI-powered objection handling",
      "Cold message generation",
      "Sales qualification frameworks",
      "Ideal customer profiling",
      "Sales methodology integration"
    ],
    "screenshot": "https://icpilot.com/og-home.png"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">ICP Pilot</h1>
          <div className="flex items-center gap-4">
            <Link href="/blog">
              <Button variant="ghost">Blog</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 md:py-28">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Generate 3 Expert Objection Rebuttals,<br/>
            Personalized Messages & Qualification Frameworks<br/>
            <span className="text-blue-600">In Under 30 Seconds</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 leading-relaxed">
            While your competitors spend hours writing one email, you'll generate 3 expert-level objection rebuttals,
            personalized cold messages, and qualification frameworks that outperform 90% of sales reps.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <p className="text-lg font-semibold text-gray-900">
              🔥 <span className="text-red-600">Limited Time:</span> See a 3x improvement in your first 30 days or get your money back
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Link href="/demo/objection-killer" className="w-full max-w-lg">
              <Button size="xl" className="w-full text-xl px-8 py-5 bg-green-600 hover:bg-green-700 shadow-xl font-bold">
                🚀 See World-Class Sales Content Generated Live
              </Button>
            </Link>
            <p className="text-sm text-gray-500 font-medium">No signup required • Watch AI create expert-level content in real-time</p>
            <p className="text-xs text-blue-600 font-medium">👆 Then start your free trial with 5 outputs included</p>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm font-medium text-green-600 mb-2">
              ✅ 5 free outputs • ✅ No credit card required • ✅ 2-minute setup
            </p>
            <p className="text-xs text-gray-500">
              Join 500+ sales teams who've increased productivity by 340% in 90 days
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-white py-16 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                📈 <span className="text-blue-600">Results That Speak Louder Than Promises</span>
              </h2>
              <p className="text-lg text-gray-700">
                500+ sales teams using ICP Pilot to <span className="font-bold text-green-600">3x their outreach volume</span> without hiring
              </p>
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold text-lg">MK</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Marcus Kim</p>
                    <p className="text-sm text-gray-600">VP of Sales, TechFlow</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm italic">
                  &quot;We went from 30% to 85% of reps hitting quota in 6 weeks. ICP Pilot didn't just give us templates - it gave us the exact expertise that only our top performers had.&quot;
                </p>
                <div className="mt-2 text-xs text-gray-600">
                  <strong>Result:</strong> 183% improvement in team quota attainment
                </div>
                <div className="flex mt-3 text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-bold text-lg">SC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Chen</p>
                    <p className="text-sm text-gray-600">Sales Director, GrowthLab</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm italic">
                  &quot;$2.3M in new pipeline in 60 days. While our competitors hired 10 more reps, we 3x'd our output with the same team using ICP Pilot's AI-generated content.&quot;
                </p>
                <div className="mt-2 text-xs text-gray-600">
                  <strong>Result:</strong> $2.3M pipeline boost, 340% productivity increase
                </div>
                <div className="flex mt-3 text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-bold text-lg">DR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">David Rodriguez</p>
                    <p className="text-sm text-gray-600">Head of Sales, ScaleCorp</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm italic">
                  &quot;ICP Pilot eliminated the 15 hours per week I spent coaching reps on objection handling. Now they sound like industry experts from day one.&quot;
                </p>
                <div className="mt-2 text-xs text-gray-600">
                  <strong>Result:</strong> 15 hours/week saved, 2x faster rep onboarding
                </div>
                <div className="flex mt-3 text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="mt-12 grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3x</div>
                <div className="text-gray-600 text-sm">Rep Effectiveness</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">60hrs</div>
                <div className="text-gray-600 text-sm">Saved Weekly</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
                <div className="text-gray-600 text-sm">Consistency Boost</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">150%</div>
                <div className="text-gray-600 text-sm">Average Quota Hit</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Growth Targets Got Bigger,<br/>
              <span className="text-red-600">But Your Team Didn&apos;t</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              While you&apos;re manually crafting responses, competitors with ICP Pilot are sending 10x more personalized outreach.
              Every hour your reps spend writing content is an hour they&apos;re not selling.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border">
              <div className="text-4xl mb-4">🚫</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Can&apos;t Scale Fast Enough</h3>
              <p className="text-gray-600">
                Your Q4 targets are 50% higher but you can&apos;t hire fast enough. Your current team needs proven methodologies to scale performance.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Competitors Moving Faster</h3>
              <p className="text-gray-600">
                While you&apos;re writing one email, teams with AI are sending 20 personalized messages. The performance gap is widening.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <div className="text-4xl mb-4">📉</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Inconsistent Results</h3>
              <p className="text-gray-600">
                Only 20% of your reps consistently hit quota. The other 80% need proven industry frameworks to perform consistently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Sell Smarter
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Define your ICP once. Generate unlimited sales assets tailored to your exact buyer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="text-blue-600 font-semibold mb-2">🎯 ICP Builder</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Build Your Ideal Customer Profile
              </h3>
              <p className="text-gray-600 mb-4">
                Define who you sell to, what problems they face, and what outcomes they want. 
                Your ICP becomes the foundation for every sales asset ICP Pilot creates.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Industry, company size, and decision-maker role</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Pain points, desired outcomes, and trigger events</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Your company&apos;s value proposition and differentiators</span>
                </li>
              </ul>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-500 mb-2">Actual ICP Builder Output</div>
              <div className="text-xs text-green-600 font-medium mb-3">⏱️ Created in 2 minutes vs 2+ hours manually</div>

              {/* ICP Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h4 className="text-xl text-blue-600 font-semibold">SaaS Growth VPs</h4>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">B2B SaaS</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">VP of Sales</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">$5M-$20M ARR</span>
                  </div>
                </div>
              </div>

              {/* ICP Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border-l-4 border-red-500 pl-3 py-2">
                  <h5 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <span>😰</span> Pain Points
                  </h5>
                  <ul className="text-sm text-gray-900 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Team can't scale outreach volume</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Inconsistent messaging quality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Only top 20% hitting quota</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border-l-4 border-green-500 pl-3 py-2">
                  <h5 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <span>🎯</span> Desired Outcomes
                  </h5>
                  <ul className="text-sm text-gray-900 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>3x outreach volume without hiring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Consistent world-class messaging</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>85%+ of team hitting quota</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 md:order-1 bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-500 mb-2">Actual Objection Killer Output</div>
              <div className="text-xs text-green-600 font-medium mb-3">🎯 These responses outperform 90% of sales reps</div>

              <div className="mb-4">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-green-800">🎯 3 Expert Objection Responses</h4>
                  <p className="text-sm text-green-700">For: "It's too expensive"</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Executive Challenger */}
                <div className="border-l-4 border-blue-500 pl-3 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-blue-700">Executive Challenger</h5>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">Direct</span>
                  </div>
                  <p className="text-sm text-gray-800">"Sarah, I appreciate the budget concern. Having worked with 200+ VPs in high-growth SaaS, the teams still debating cost in 2024 are watching competitors capture AI advantage. Based on your $18M Series B..."</p>
                </div>

                {/* Consultative Partner */}
                <div className="border-l-4 border-green-500 pl-3 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-green-700">Consultative Partner</h5>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Question-based</span>
                  </div>
                  <p className="text-sm text-gray-800">"That's a thoughtful concern. Can I ask - when you think about scaling from 5 to 15 reps while maintaining quality, what's your biggest worry about the ROI calculation?"</p>
                </div>

                {/* Evidence-Driven Closer */}
                <div className="border-l-4 border-purple-500 pl-3 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-purple-700">Evidence-Driven Closer</h5>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">ROI-focused</span>
                  </div>
                  <p className="text-sm text-gray-800">"Let me share data from 47 similar SaaS companies. Teams your size achieved 340% productivity gains within 90 days, with economic impact of $400K-$800K annually..."</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="text-blue-600 font-semibold mb-2">💪 Objection Killer</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Handle Any Objection with Confidence
              </h3>
              <p className="text-gray-600 mb-4">
                Never get stuck on an objection again. Generate 3 expert response variants that demonstrate
                true sales expertise - from direct challenger approaches to consultative discovery.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>3 expert response variants (Executive, Consultative, Evidence-driven)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Industry-specific social proof and data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Copy to clipboard for instant use</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="text-blue-600 font-semibold mb-2">✉️ Message Generator</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Cold Outreach That Gets Responses
              </h3>
              <p className="text-gray-600 mb-4">
                Generate personalized cold emails and LinkedIn messages based on trigger events. 
                Get 3 message variants to test what resonates with your audience.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Trigger-based messaging (funding, hiring, growth)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>3 variants: Direct, value-focused, question-based</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Personalized to prospect&apos;s company and role</span>
                </li>
              </ul>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-500 mb-2">Actual Message Generator Output</div>
              <div className="text-xs text-green-600 font-medium mb-3">📈 3x higher response rates than generic templates</div>

              <div className="mb-4">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-green-800">✉️ 3 Expert Message Variants</h4>
                  <p className="text-sm text-green-700">Trigger: Series A Funding Announcement</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Direct Approach */}
                <div className="border-l-4 border-blue-500 pl-3 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-blue-700">Direct Approach</h5>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">Executive-focused</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 mb-1">Subject: Scaling Sales with Your Series A</p>
                    <p className="text-gray-800">"Sarah, congrats on the $18M Series A! As you scale from 5 to 15 reps, curious - what's your biggest concern about maintaining message quality at volume?"</p>
                  </div>
                </div>

                {/* Value-Focused */}
                <div className="border-l-4 border-green-500 pl-3 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-green-700">Value-Focused</h5>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">ROI-driven</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 mb-1">Subject: 3x Your Team's Output (Without Hiring)</p>
                    <p className="text-gray-800">"Most VPs at your stage tell me their biggest challenge isn't finding good reps - it's getting consistent, high-quality outreach from the team they have..."</p>
                  </div>
                </div>

                {/* Question-Based */}
                <div className="border-l-4 border-purple-500 pl-3 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-purple-700">Question-Based</h5>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">Discovery-focused</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 mb-1">Subject: Quick Question About Your Sales Stack</p>
                    <p className="text-gray-800">"Quick question - with your recent funding and team expansion plans, how are you planning to maintain personalized outreach quality while scaling volume?"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-500 mb-2">Actual Qualification Framework Output</div>
              <div className="text-xs text-green-600 font-medium mb-3">💡 Based on proven MEDDIC methodology used by top performers</div>

              <div className="mb-4">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-green-800">🎯 Expert Qualification Framework</h4>
                  <p className="text-sm text-green-700">MEDDIC for SaaS VPs</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Discovery Question 1 */}
                <div className="bg-white border-l-4 border-blue-500 pl-3 py-2">
                  <h5 className="font-semibold text-blue-700 mb-2">Strategic Business Impact</h5>
                  <p className="text-sm text-gray-800 font-medium mb-2">"What's driving the urgency around solving this challenge now versus waiting another quarter?"</p>
                  <div className="text-xs text-gray-600">
                    <strong>Listen for:</strong> Competitive pressure, Board mandate, Financial impact, Market timing
                  </div>
                </div>

                {/* Discovery Question 2 */}
                <div className="bg-white border-l-4 border-green-500 pl-3 py-2">
                  <h5 className="font-semibold text-green-700 mb-2">ROI and Value Quantification</h5>
                  <p className="text-sm text-gray-800 font-medium mb-2">"If we could help you achieve the outcomes you're looking for, what would that be worth to your company?"</p>
                  <div className="text-xs text-gray-600">
                    <strong>Listen for:</strong> Specific dollar amounts, Percentage improvements, Revenue impact
                  </div>
                </div>

                {/* Scoring System Preview */}
                <div className="bg-gray-50 p-3 rounded border">
                  <h5 className="font-semibold text-gray-800 mb-2 text-xs">SCORING SYSTEM PREVIEW</h5>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <span className="text-green-600 font-bold">✅ Green</span>
                      <p className="text-gray-600">12-16 points</p>
                    </div>
                    <div className="text-center">
                      <span className="text-yellow-600 font-bold">⚠️ Yellow</span>
                      <p className="text-gray-600">8-11 points</p>
                    </div>
                    <div className="text-center">
                      <span className="text-red-600 font-bold">❌ Red</span>
                      <p className="text-gray-600">4-7 points</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="text-blue-600 font-semibold mb-2">🔍 Qualification Framework</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Qualify Prospects Like a Pro
              </h3>
              <p className="text-gray-600 mb-4">
                Generate discovery frameworks (BANT, MEDDIC, CHAMP, SPICED) with questions, 
                scoring criteria, and automatic disqualifiers tailored to your ICP.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>5-7 strategic discovery questions per framework</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Green/yellow/red scoring system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Automatic disqualification signals to save time</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                🔥 Flash Sale: 50% Off First 3 Months
              </h2>
              <p className="text-lg text-red-600 font-semibold">
                Limited time offer • Normally $49/month • New customers only
              </p>
            </div>
            <p className="text-xl text-gray-600">
              Join 500+ teams who upgraded in the last 30 days
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg border">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Trial</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm font-medium text-blue-800">
                  🎁 Bonus: Access to expert-level sales frameworks
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-600">5 outputs per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-600">All tools included</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-600">Unlimited ICPs</span>
                </li>
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full">Get Started Free</Button>
              </Link>
            </div>

            <div className="bg-blue-600 text-white p-8 rounded-lg border-2 border-blue-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  🔥 FLASH SALE
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl line-through text-blue-200">$49</span>
                  <span className="text-4xl font-bold text-white">$24</span>
                  <span className="text-blue-100">/month</span>
                </div>
                <p className="text-sm text-blue-200 text-center mt-1">50% OFF first 3 months</p>
              </div>
              <div className="bg-yellow-400 text-blue-900 p-3 rounded-lg mb-4">
                <p className="text-sm font-bold text-center">
                  📈 Guarantee: 3x your results in 30 days or money back
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-blue-200 mt-1">✓</span>
                  <span>Unlimited outputs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-200 mt-1">✓</span>
                  <span>All tools included</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-200 mt-1">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                  Start 14-Day Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          {/* Final Push Section */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Competitors Are Already Using AI.
              <span className="text-red-600"> Don't Get Left Behind.</span>
            </h2>
            <p className="text-xl mb-8 text-gray-700">
              While you manually write one email, teams with ICP Pilot generate 20 expert-level messages.
              The performance gap widens every day you wait.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-red-200 p-6 rounded-lg">
                <div className="text-3xl font-bold text-red-600 mb-2">Every Day</div>
                <p className="text-gray-700">Your competitors send 10x more personalized outreach</p>
              </div>
              <div className="bg-white border border-yellow-200 p-6 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 mb-2">Every Week</div>
                <p className="text-gray-700">They capture prospects you could have won</p>
              </div>
              <div className="bg-white border border-green-200 p-6 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">Every Month</div>
                <p className="text-gray-700">The revenue gap becomes impossible to close</p>
              </div>
            </div>

            <div className="bg-blue-600 text-white p-6 rounded-lg mb-8">
              <h3 className="text-2xl font-bold mb-4">🚀 Get Your Competitive Advantage in 30 Seconds</h3>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <Link href="/demo/objection-killer" className="w-full md:w-auto">
                  <Button size="xl" className="w-full md:w-auto text-xl px-8 py-4 bg-green-600 text-white hover:bg-green-700 font-bold shadow-lg">
                    🔥 See ICP Pilot Work (30 Seconds)
                  </Button>
                </Link>
                <span className="text-blue-200 font-medium">OR</span>
                <Link href="/register" className="w-full md:w-auto">
                  <Button size="xl" className="w-full md:w-auto text-xl px-8 py-4 bg-white text-blue-600 hover:bg-gray-50 font-bold shadow-lg">
                    Start Free Trial →
                  </Button>
                </Link>
              </div>
            </div>

            <div className="border-t border-blue-300 pt-6">
              <p className="text-sm text-gray-600 mb-2">
                ✅ 5 free outputs • ✅ No credit card required • ✅ Cancel anytime
              </p>
              <p className="text-xs text-gray-500">
                Join the 500+ sales teams who chose to lead instead of follow
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold text-blue-600 mb-4 md:mb-0">
ICP Pilot
            </div>
            <div className="flex gap-8 text-sm text-gray-600">
              <Link href="/blog" className="hover:text-gray-900">Blog</Link>
              <Link href="/login" className="hover:text-gray-900">Sign In</Link>
              <Link href="/register" className="hover:text-gray-900">Get Started</Link>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-8">
            © 2025 ICP Pilot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}