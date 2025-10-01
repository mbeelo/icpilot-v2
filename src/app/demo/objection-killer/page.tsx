'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { SAMPLE_ICP, SAMPLE_PROSPECT, SAMPLE_OBJECTION } from '@/lib/sample-data';

interface ObjectionResponse {
  variant: string;
  approach: string;
  bestFor: string;
  response: string;
}

const PRESET_OBJECTIONS = [
  "We already have Outreach and Salesloft in our tech stack",
  "It's too expensive for our current budget",
  "We need to think about it more",
  "Not the right time with everything going on",
  "Your competitor quoted us a lower price"
];

// Sample world-class responses for demo - these demonstrate true sales expertise
const SAMPLE_RESPONSES: ObjectionResponse[] = [
  {
    variant: "Executive Challenger",
    approach: "Direct, insight-driven challenge",
    bestFor: "C-level executives and senior decision makers",
    response: `Sarah, I appreciate you bringing up your existing stack. Having worked with over 200 VPs of Sales in high-growth SaaS, I can tell you that the companies still debating stack consolidation in 2024 are the ones losing market share. The leaders in your space - companies like Gong, Outreach, and Salesloft themselves - made the switch to AI-native solutions 6-12 months ago because they realized their legacy tools were built for a pre-AI world.

Based on TechFlow's $18M Series B and your plan to scale from 5 to 15 reps, you're positioned to either be the VP who captures AI-powered competitive advantage or the one explaining to the board why you're still manually researching prospects while competitors automate everything. The data shows VPs who implement AI solutions during high-growth phases typically see 40-60% better team performance than those who wait.

Given your role and the board's growth expectations, waiting another quarter could cost you significant competitive positioning. What would it mean for TechFlow if you were 6 months ahead of your competition instead of 6 months behind?`
  },
  {
    variant: "Consultative Partner",
    approach: "Question-based, discovery-focused",
    bestFor: "Directors and managers who value collaboration",
    response: `Sarah, that's a thoughtful concern about your existing stack, and I'd like to explore this with you. In my experience working with VPs at similar high-growth SaaS companies, this question usually surfaces when there's a deeper consideration about ROI and team efficiency at play.

Can I ask - when you think about scaling from 5 to 15 reps while maintaining the same personalized outreach quality, what's your biggest concern? I'm curious because most VPs tell me their current tools handle volume well, but struggle with the AI-powered personalization that's becoming table stakes in enterprise sales.

Help me understand - if you continue with Outreach and Salesloft for the next 12 months, where do you see TechFlow relative to competitors who are already using AI for prospect research and message personalization? What's been your experience with those tools when it comes to reducing the 3+ hours per day your reps spend on manual research?

I ask because the most successful VPs I work with often tell me the biggest risk wasn't investing in new technology - it was the opportunity cost of staying with solutions that couldn't scale with their AI-native competitors. If we could demonstrate clear ROI and seamless integration within 60 days, how would that change your thinking about your current stack?`
  },
  {
    variant: "Evidence-Driven Closer",
    approach: "ROI-focused with specific proof points",
    bestFor: "Analytical buyers and procurement influence",
    response: `Sarah, let me share some specific data that directly addresses your current stack. I just completed a ROI analysis with 47 SaaS companies using Outreach and Salesloft, all similar to TechFlow in growth stage and team size.

Companies that integrated our AI layer on top of their existing stack achieved average productivity gains of 340% within 90 days, with total economic impact ranging from $400K-$800K annually for teams your size. More specifically, VPs dealing with scaling challenges saw average reductions of 65% in research time and 45% improvement in response rates.

Here's what's compelling: companies that implemented AI-powered personalization in Q1 vs Q4 of last year showed 80% better results, primarily because they captured first-mover advantage while competitors were still manually researching prospects. Your closest competitors in the workflow automation space - without naming names - are already implementing AI-native solutions.

But here's the critical timing factor: with your $18M Series B and aggressive growth targets, the window for capturing competitive advantage is closing rapidly. We can integrate with your existing Outreach and Salesloft setup, have you operational in 30 days, and guarantee measurable ROI within 90 days.

Given the documented results, competitive timing, and your growth objectives, what specific information would you need to move forward this quarter? Because waiting until Q2 could mean watching competitors capture the market position you're planning to take.`
  }
];

export default function DemoObjectionKiller() {
  const [objection, setObjection] = useState(SAMPLE_OBJECTION);
  const [responses, setResponses] = useState<ObjectionResponse[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSampleResult, setShowSampleResult] = useState(false);

  const generateRebuttal = async () => {
    setIsGenerating(true);

    // Simulate API delay for demo
    setTimeout(() => {
      setResponses(SAMPLE_RESPONSES);
      setIsGenerating(false);
      setShowSampleResult(true);
    }, 2500);
  };

  const copyToClipboard = async (response: ObjectionResponse) => {
    try {
      await navigator.clipboard.writeText(response.response);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = response.response;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const copyAllResponses = async () => {
    if (!responses.length) return;

    const allResponses = responses.map(r =>
      `${r.variant.toUpperCase()}\n${r.response}\n`
    ).join('\n---\n\n');

    const fullText = `OBJECTION: "${objection}"\n\n${allResponses}\n---\nGenerated by ICP Pilot`;

    try {
      await navigator.clipboard.writeText(fullText);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with CTA */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">ICP Pilot Demo</h1>
            <p className="text-sm text-gray-600">World-class objection handling that demonstrates sales expertise</p>
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
                  <h3 className="font-semibold text-blue-900">Experience world-class objection handling</h3>
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
            💪 Objection Killer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Generate world-class objection responses that demonstrate sales expertise
          </p>
        </div>

        {/* Main Input Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">What objection are you facing?</CardTitle>
            <p className="text-gray-600">Experience 3 expert response variants for any situation</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preset Objections */}
            <div>
              <label className="block text-lg font-semibold mb-4 text-gray-900">Common Objections</label>
              <div className="grid md:grid-cols-1 gap-3">
                {PRESET_OBJECTIONS.map((preset) => (
                  <button
                    key={preset}
                    className={`p-4 text-sm border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md ${
                      objection === preset
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white hover:bg-blue-50'
                    }`}
                    onClick={() => setObjection(preset)}
                  >
                    &ldquo;{preset}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <Button
                size="xl"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={generateRebuttal}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Crafting world-class responses...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>🚀</span>
                    Generate Expert Objection Responses (3 Variants)
                  </div>
                )}
              </Button>
              {objection && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Generating expert responses for: &ldquo;{objection}&rdquo;
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results - 3 World-Class Variants */}
        {responses.length > 0 && (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-green-800 text-center">
                    🎯 Your Expert Objection Responses
                  </CardTitle>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={copyAllResponses}
                  >
                    📋 Copy All
                  </Button>
                </div>
                <p className="text-center text-green-700">3 world-class response variants demonstrating true sales expertise</p>
              </CardHeader>
            </Card>

            {responses.map((response, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-blue-800">
                        {response.variant}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{response.approach}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        <strong>Best for:</strong> {response.bestFor}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(response)}
                    >
                      📋 Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-5 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {response.response}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Expertise Demonstration */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-xl text-yellow-800 text-center">
                  🏆 Notice the Sales Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-700 mb-2">Industry Intelligence</h4>
                    <p className="text-gray-600 text-sm">References specific competitors, market trends, and timing intelligence</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-700 mb-2">Credible Metrics</h4>
                    <p className="text-gray-600 text-sm">Uses specific ROI data, timeframes, and performance benchmarks</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-semibold text-purple-700 mb-2">Executive Positioning</h4>
                    <p className="text-gray-600 text-sm">Demonstrates peer-level expertise and industry authority</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
                While your competitors struggle with generic rebuttals, your team will have world-class responses that demonstrate true sales mastery.
                This is sample data—imagine the results with your actual ICPs and prospect context.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Get Your Competitive Advantage Now
                  </Button>
                </Link>
                <Link href="/demo/message-generator">
                  <Button size="lg" variant="outline">
                    See Message Generator Too
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