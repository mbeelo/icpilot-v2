'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { SAMPLE_ICP, SAMPLE_PROSPECT, SAMPLE_FRAMEWORK_TYPE } from '@/lib/sample-data';

interface QualificationFramework {
  discoveryQuestions: {
    category: string;
    question: string;
    listenFor: string[];
  }[];
  scoringSystem: {
    criteria: string;
    green: string;
    yellow: string;
    red: string;
  }[];
  nextSteps: {
    score: string;
    action: string;
    timeline: string;
  }[];
}

const FRAMEWORK_TYPES = [
  "MEDDIC (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion)",
  "Value-Based Qualification (Business Impact, ROI Justification, Risk Mitigation)",
  "Challenger Sale (Teaching, Tailoring, Taking Control)",
  "CHAMP (Challenges, Authority, Money, Prioritization)",
  "BANT (Budget, Authority, Need, Timeline)"
];

// Sample world-class framework demonstrating sales expertise
const SAMPLE_FRAMEWORK: QualificationFramework = {
  discoveryQuestions: [
    {
      category: "Strategic Business Impact",
      question: "What's driving the urgency around solving this challenge now versus waiting another quarter?",
      listenFor: ["Competitive pressure", "Board mandate", "Financial impact", "Market timing"]
    },
    {
      category: "Economic Buyer Identification",
      question: "When you've made similar strategic technology investments in the past, who ultimately had to sign off on the business case?",
      listenFor: ["CEO involvement", "Board approval", "Procurement process", "Budget authority"]
    },
    {
      category: "ROI and Value Quantification",
      question: "If we could help you achieve the outcomes you're looking for, what would that be worth to TechFlow in terms of revenue or cost savings?",
      listenFor: ["Specific dollar amounts", "Percentage improvements", "Headcount savings", "Revenue impact"]
    },
    {
      category: "Competitive Intelligence",
      question: "How are your closest competitors handling this challenge, and what advantage would solving this first give TechFlow?",
      listenFor: ["Competitive gaps", "Market positioning", "First-mover advantage", "Industry trends"]
    },
    {
      category: "Decision Process Mapping",
      question: "Walk me through how TechFlow typically evaluates and implements new technology solutions - what does that process look like?",
      listenFor: ["Evaluation criteria", "Timeline requirements", "Stakeholder involvement", "Approval stages"]
    },
    {
      category: "Champion Development",
      question: "If you were to recommend this solution internally, what would you need from us to make the strongest possible case?",
      listenFor: ["Proof points", "References", "ROI calculations", "Risk mitigation"]
    }
  ],
  scoringSystem: [
    {
      criteria: "Business Impact Potential",
      green: "Clear ROI over $500K annually with executive sponsorship and measurable KPIs",
      yellow: "Moderate impact ($100K-$500K) with department-level support and general benefits",
      red: "Limited financial impact (<$100K) or no clear value driver identified"
    },
    {
      criteria: "Decision Authority Access",
      green: "Direct access to economic buyer with confirmed budget authority and decision timeline",
      yellow: "Access to influencer with path to economic buyer and general budget discussions",
      red: "Only technical contact with no budget insight or executive access"
    },
    {
      criteria: "Competitive Positioning",
      green: "Preferred vendor status with clear differentiation and competitive advantage",
      yellow: "In evaluation process with other vendors but strong relationship and fit",
      red: "Late to process with entrenched competition or significant disadvantages"
    },
    {
      criteria: "Timeline and Urgency",
      green: "Urgent business need with defined timeline and consequences for delay",
      yellow: "Planned initiative with general timeline but flexible implementation",
      red: "Research phase with no urgency or distant implementation timeline"
    },
    {
      criteria: "Solution Fit and Requirements",
      green: "Perfect technical fit with unique capabilities that solve critical problems",
      yellow: "Good fit with standard capabilities meeting most requirements",
      red: "Gap in key requirements or over-engineered solution for their needs"
    }
  ],
  nextSteps: [
    {
      score: "12-16 points (Green)",
      action: "Fast-track to proposal stage with technical demo",
      timeline: "Schedule within 5 business days"
    },
    {
      score: "8-11 points (Yellow)",
      action: "Nurture with case studies and ROI calculator",
      timeline: "Follow up every 2 weeks"
    },
    {
      score: "4-7 points (Red)",
      action: "Add to nurture sequence for future evaluation",
      timeline: "Quarterly check-ins"
    }
  ]
};

export default function DemoQualificationFramework() {
  const [frameworkType, setFrameworkType] = useState(SAMPLE_FRAMEWORK_TYPE);
  const [framework, setFramework] = useState<QualificationFramework | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSampleResult, setShowSampleResult] = useState(false);

  const generateFramework = async () => {
    setIsGenerating(true);

    // Simulate API delay for demo
    setTimeout(() => {
      setFramework(SAMPLE_FRAMEWORK);
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
            <p className="text-sm text-gray-600">Build qualification frameworks that close more deals</p>
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
                  <h3 className="font-semibold text-blue-900">Experience intelligent qualification frameworks</h3>
                  <p className="text-blue-700 text-sm">
                    Sample Company: <strong>{SAMPLE_ICP.companyName}</strong> •
                    Target: <strong>{SAMPLE_ICP.role}</strong> •
                    Framework: <strong>{SAMPLE_FRAMEWORK_TYPE}</strong>
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
            🔍 Qualification Framework
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Build systematic qualification processes that identify your best prospects
          </p>
        </div>

        {/* Main Input Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Which qualification framework do you want to build?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Framework Type */}
            <div>
              <label className="block text-lg font-semibold mb-4 text-gray-900">Framework Type</label>
              <div className="grid gap-3">
                {FRAMEWORK_TYPES.map((type) => (
                  <button
                    key={type}
                    className={`p-4 text-sm border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md ${
                      frameworkType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white hover:bg-blue-50'
                    }`}
                    onClick={() => setFrameworkType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <Button
                size="xl"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={generateFramework}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Building your framework...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>🚀</span>
                    Generate Qualification Framework
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {framework && (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-2xl text-green-800 text-center">
                  🔍 Your Qualification Framework
                </CardTitle>
                <p className="text-center text-green-700">Systematically qualify every prospect</p>
              </CardHeader>
            </Card>

            {/* Discovery Questions */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-blue-800">Discovery Questions</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(framework.discoveryQuestions.map(q =>
                      `${q.category}: ${q.question}\nListen for: ${q.listenFor.join(', ')}`
                    ).join('\n\n'))}
                  >
                    📋 Copy Questions
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {framework.discoveryQuestions.map((q, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-700 mb-2">{q.category}</h4>
                    <p className="text-gray-800 mb-3">{q.question}</p>
                    <div className="text-sm text-gray-600">
                      <strong>Listen for:</strong> {q.listenFor.join(', ')}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Scoring System */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-purple-800">Scoring System</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(framework.scoringSystem.map(s =>
                      `${s.criteria}:\n✅ Green: ${s.green}\n⚠️ Yellow: ${s.yellow}\n❌ Red: ${s.red}`
                    ).join('\n\n'))}
                  >
                    📋 Copy Scoring
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {framework.scoringSystem.map((scoring, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-3">{scoring.criteria}</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✅</span>
                        <span className="text-sm"><strong>Green:</strong> {scoring.green}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">⚠️</span>
                        <span className="text-sm"><strong>Yellow:</strong> {scoring.yellow}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">❌</span>
                        <span className="text-sm"><strong>Red:</strong> {scoring.red}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-orange-800">Next Steps Guide</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(framework.nextSteps.map(n =>
                      `${n.score}: ${n.action} (${n.timeline})`
                    ).join('\n'))}
                  >
                    📋 Copy Guide
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {framework.nextSteps.map((step, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-semibold text-orange-700 mb-2">{step.score}</h4>
                    <p className="text-gray-800 mb-2">{step.action}</p>
                    <p className="text-sm text-gray-600"><strong>Timeline:</strong> {step.timeline}</p>
                  </div>
                ))}
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
                Your Team Could Qualify Prospects This Systematically
              </h3>
              <p className="text-gray-600 mb-6">
                While your competitors waste time on unqualified leads, your team will have clear frameworks to identify high-value opportunities.
                This is sample data—imagine the results with your actual ICPs and sales process.
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