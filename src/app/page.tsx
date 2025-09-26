import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">ICPPilot</h1>
          <div className="flex items-center gap-4">
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
            Transform Your ICP Into<br/>
            <span className="text-blue-600">Proven Sales Assets</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Stop wasting time crafting objection rebuttals, cold messages, and qualification frameworks from scratch. 
            ICPPilot generates AI-powered sales content tailored to your exact buyer persona.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                See How It Works
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            5 free outputs/month • No credit card required
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sales Teams Waste Hours on Content Creation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every rep recreates the same rebuttals, messages, and frameworks for every prospect. 
              It's inefficient, inconsistent, and burns time you should spend selling.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hours Per Week Wasted</h3>
              <p className="text-gray-600">
                Reps spend 6+ hours weekly writing objection rebuttals, personalized messages, and discovery questions
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Inconsistent Messaging</h3>
              <p className="text-gray-600">
                Every rep handles objections differently, leading to varied results and missed revenue
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <div className="text-4xl mb-4">📉</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lost Deals</h3>
              <p className="text-gray-600">
                Generic responses and poor qualification mean you're talking to the wrong prospects
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
                Your ICP becomes the foundation for every sales asset ICPPilot creates.
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
                  <span>Your company's value proposition and differentiators</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg">
              <div className="text-sm text-gray-500 mb-2">Example ICP</div>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="font-semibold text-gray-900">SaaS Startup CEOs</p>
                <p className="text-sm text-gray-600 mt-1">B2B SaaS • 10-50 employees • $1M-$5M ARR</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 md:order-1 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg">
              <div className="text-sm text-gray-500 mb-2">Generated Rebuttal</div>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="text-sm text-gray-800 italic">"It's too expensive"</p>
                <p className="text-sm text-gray-600 mt-2">I understand budget concerns, especially in early-stage SaaS...</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="text-blue-600 font-semibold mb-2">💪 Objection Killer</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Handle Any Objection with Confidence
              </h3>
              <p className="text-gray-600 mb-4">
                Never get stuck on an objection again. Generate contextual rebuttals that reframe, 
                provide evidence, bridge to value, and include a micro-ask to move the deal forward.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Structured 4-part rebuttal framework</span>
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
                  <span>Personalized to prospect's company and role</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg">
              <div className="text-sm text-gray-500 mb-2">Cold LinkedIn Message</div>
              <div className="bg-white p-4 rounded-md shadow-sm text-sm text-gray-800">
                <p className="font-semibold mb-2">Re: Series A funding</p>
                <p>Congrats on the raise, John. Noticed you're scaling the team...</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg">
              <div className="text-sm text-gray-500 mb-2">BANT Framework</div>
              <div className="bg-white p-4 rounded-md shadow-sm text-sm">
                <p className="font-semibold text-gray-900">Budget</p>
                <p className="text-gray-600 mt-1">What's your current spend on sales tools?</p>
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
                  <span>ICP-specific deal breakers</span>
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free. Upgrade when you're ready for unlimited.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg border">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
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
                <span className="bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-blue-100">/month</span>
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
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Stop Wasting Time on Sales Content?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join sales teams who've cut content creation time by 80% with ICPPilot
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            5 free outputs • No credit card required • 2-minute setup
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold text-blue-600 mb-4 md:mb-0">
              ICPPilot
            </div>
            <div className="flex gap-8 text-sm text-gray-600">
              <Link href="/login" className="hover:text-gray-900">Sign In</Link>
              <Link href="/register" className="hover:text-gray-900">Get Started</Link>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-8">
            © 2025 ICPPilot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}