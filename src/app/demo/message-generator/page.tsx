'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { SAMPLE_ICP, SAMPLE_PROSPECT, SAMPLE_TRIGGER, SAMPLE_MESSAGE_TYPE } from '@/lib/sample-data';

interface MessageOutput {
  variant: string;
  approach: string;
  bestFor: string;
  subject: string;
  message: string;
}

const MESSAGE_TYPES = [
  "Cold LinkedIn Message",
  "Follow-up Email",
  "Cold Email",
  "LinkedIn Connection Request",
  "Warm Introduction Request",
  "Break-up Email",
  "Executive Referral Request"
];

const PRESET_TRIGGERS = [
  "Just announced Series B funding of $25M",
  "Posted job openings for 3+ sales roles",
  "Mentioned scaling challenges in recent podcast",
  "Launched new product line",
  "Hired new VP of Sales",
  "CEO spoke about AI transformation at conference",
  "Competitor just raised funding - market timing",
  "Q4 budget cycles - perfect timing for solutions"
];

// Sample world-class messages for demo - these demonstrate true sales expertise
const SAMPLE_MESSAGES: MessageOutput[] = [
  {
    variant: "Market Intelligence Leader",
    approach: "Industry authority with competitive intelligence",
    bestFor: "Senior executives who value market insights",
    subject: "Sarah - TechFlow's timing advantage in the AI sales race",
    message: `Sarah, your recent Series B puts TechFlow in a fascinating position. While most workflow automation companies are still figuring out AI integration, you have 6-12 months to capture first-mover advantage before the market gets saturated.

I've been tracking the space since Zapier's AI announcements in Q2. The VPs who moved fast on AI-powered sales operations are seeing 40-60% productivity gains, while those waiting are watching competitors steal deals with better personalization.

Given your expansion from 5 to 15 reps and the current AI adoption curve, you're at the perfect inflection point. Worth 15 minutes to discuss what the market leaders in workflow automation are implementing right now?

Best regards,
[Your name]
P.S. - Happy to share the competitive intelligence report on what Notion, Airtable, and Monday.com are actually doing with AI sales tools.`
  },
  {
    variant: "Peer Advisor Approach",
    approach: "Consultative, discovery-focused dialogue",
    bestFor: "Collaborative decision makers who value strategic thinking",
    subject: "Question about TechFlow's sales scaling approach",
    message: `Sarah, congratulations on the momentum with TechFlow - scaling from 5 to 15 reps during a Series B is exactly the right move.

I'm curious about your approach to maintaining personalized outreach quality while scaling volume. Most VPs I work with in similar SaaS companies face this exact dilemma, and I've noticed two distinct paths emerging:

1. Scale first, optimize later (hire more bodies, deal with efficiency issues down the road)
2. Build AI-powered efficiency now, then scale on proven systems

The VPs taking path #2 are consistently outperforming on both speed and conversion rates. They're seeing 3+ hours saved per rep daily and 45% better response rates.

What's your current thinking on balancing speed vs. efficiency in this expansion? I'd love to share what's working for other workflow automation companies in your growth stage.

Best,
[Your name]`
  },
  {
    variant: "Urgency Catalyst",
    approach: "Time-sensitive opportunity with competitive pressure",
    bestFor: "Results-driven leaders who respond to competitive timing",
    subject: "TechFlow's 90-day AI advantage window",
    message: `Sarah, the timing on TechFlow's Series B couldn't be better - you have a narrow window to capture significant competitive advantage.

Here's what I'm seeing in the workflow automation space: companies implementing AI-powered sales operations in Q4 2024 vs Q2 2025 are showing 80% better results. The early movers are capturing market share while competitors are still manually researching prospects.

With your funding and expansion timeline, you have 90 days to implement systems that could give TechFlow 6+ months of competitive advantage. After Q1, every workflow automation company will have similar capabilities.

Specific data from similar SaaS companies:
→ 65% reduction in research time per rep
→ 340% improvement in personalization quality
→ $400K-$800K annual productivity impact for teams your size

Given your growth targets and the competitive timing, this quarter might be the difference between leading the market or playing catch-up.

Worth a brief call to discuss implementation timelines?

Best,
[Your name]`
  }
];

export default function DemoMessageGenerator() {
  const [messageType, setMessageType] = useState(SAMPLE_MESSAGE_TYPE);
  const [trigger, setTrigger] = useState(SAMPLE_TRIGGER);
  const [messages, setMessages] = useState<MessageOutput[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSampleResult, setShowSampleResult] = useState(false);

  const generateMessages = async () => {
    setIsGenerating(true);

    // Simulate API delay for demo
    setTimeout(() => {
      setMessages(SAMPLE_MESSAGES);
      setIsGenerating(false);
      setShowSampleResult(true);
    }, 2500);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with CTA */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">ICP Pilot Demo</h1>
            <p className="text-sm text-gray-600">World-class outreach messages that demonstrate sales expertise</p>
          </div>
          <Link href="/register">
            <Button className="bg-green-600 hover:bg-green-700">
              Get Your Competitive Edge
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Demo Info Banner */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl">👋</div>
                <div>
                  <h3 className="font-semibold text-blue-900">Experience world-class message generation</h3>
                  <p className="text-blue-700 text-sm">
                    Sample Company: <strong>{SAMPLE_ICP.companyName}</strong> •
                    Target: <strong>{SAMPLE_ICP.role}</strong> •
                    Prospect: <strong>{SAMPLE_PROSPECT.name}</strong> at <strong>{SAMPLE_PROSPECT.company}</strong>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-700 text-xs font-medium">Trusted by 500+ sales professionals</p>
                <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">
                  ⭐⭐⭐⭐⭐ <span className="text-blue-600 text-xs ml-1">4.9/5</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tool Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ✉️ Message Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Generate world-class outreach messages that demonstrate sales expertise
          </p>
        </div>

        {/* Main Input Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">What type of message do you need?</CardTitle>
            <p className="text-gray-600">Experience 3 expert message variants for any situation</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Message Type */}
            <div>
              <label className="block text-lg font-semibold mb-4 text-gray-900">Message Type</label>
              <div className="grid md:grid-cols-2 gap-3">
                {MESSAGE_TYPES.map((type) => (
                  <button
                    key={type}
                    className={`p-4 text-sm border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md ${
                      messageType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white hover:bg-blue-50'
                    }`}
                    onClick={() => setMessageType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Trigger */}
            <div>
              <label className="block text-lg font-semibold mb-4 text-gray-900">What triggered this outreach?</label>
              <div className="grid gap-3">
                {PRESET_TRIGGERS.map((preset) => (
                  <button
                    key={preset}
                    className={`p-4 text-sm border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md ${
                      trigger === preset
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white hover:bg-blue-50'
                    }`}
                    onClick={() => setTrigger(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <Button
                size="xl"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={generateMessages}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Crafting world-class messages...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>🚀</span>
                    Generate Expert Messages (3 Variants)
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {messages.length > 0 && (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-green-800 text-center">
                    🎯 Your Expert Message Variants
                  </CardTitle>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const allMessages = messages.map(m =>
                        `${m.variant.toUpperCase()}\nSubject: ${m.subject}\n\n${m.message}\n`
                      ).join('\n---\n\n');
                      const fullText = `OUTREACH MESSAGES FOR: ${SAMPLE_PROSPECT.name} at ${SAMPLE_PROSPECT.company}\n\n${allMessages}\n---\nGenerated by ICP Pilot`;
                      navigator.clipboard.writeText(fullText);
                    }}
                  >
                    📋 Copy All
                  </Button>
                </div>
                <p className="text-center text-green-700">3 world-class message variants demonstrating true sales expertise</p>
              </CardHeader>
            </Card>

            {messages.map((msg, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-blue-800">
                        {msg.variant}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{msg.approach}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        <strong>Best for:</strong> {msg.bestFor}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`Subject: ${msg.subject}\n\n${msg.message}`)}
                    >
                      📋 Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-700 mb-2">Subject Line:</h4>
                    <p className="text-gray-800">{msg.subject}</p>
                  </div>
                  <div className="bg-white p-5 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">{msg.message}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Expertise Demonstration */}
        {messages.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-800 text-center">
                🏆 Notice the Sales Expertise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-700 mb-2">Market Intelligence</h4>
                  <p className="text-gray-600 text-sm">References specific competitors, funding intelligence, and timing insights</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-700 mb-2">Strategic Positioning</h4>
                  <p className="text-gray-600 text-sm">Demonstrates peer-level expertise and industry authority</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-semibold text-purple-700 mb-2">Credible Metrics</h4>
                  <p className="text-gray-600 text-sm">Uses specific ROI data, timeframes, and performance benchmarks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA after showing results */}
        {showSampleResult && (
          <Card className="border-green-500 bg-green-50">
            <CardContent className="py-6 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Your Team Could Demonstrate This Level of Expertise
              </h3>
              <p className="text-gray-600 mb-6">
                While your competitors send generic templates, your team will have world-class messages that demonstrate true sales mastery.
                This is sample data—imagine the results with your actual ICPs and prospect context.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Get Your Competitive Advantage Now
                  </Button>
                </Link>
                <Link href="/demo/objection-killer">
                  <Button size="lg" variant="outline">
                    See Objection Killer Too
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}