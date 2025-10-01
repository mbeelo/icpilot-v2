'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { SAMPLE_ICP, SAMPLE_PROSPECT } from '@/lib/sample-data';

interface QualificationFramework {
  discoveryQuestions: {
    category: string;
    question: string;
    listenFor: string[];
    followUp?: string;
    valueDemo?: string;
  }[];
  scoringSystem: {
    criteria: string;
    green: string;
    yellow: string;
    red: string;
    weight?: string;
  }[];
  disqualifySignals: string[];
}

const FRAMEWORK_TYPES = [
  {
    id: "MEDDIC (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion)",
    icon: "🎯",
    description: "Comprehensive framework for complex B2B sales",
    approach: "Consultative"
  },
  {
    id: "Value-Based Qualification (Business Impact, ROI Justification, Risk Mitigation)",
    icon: "📈",
    description: "Strategic qualification focused on business transformation",
    approach: "Executive"
  },
  {
    id: "Challenger Sale (Teaching, Tailoring, Taking Control)",
    icon: "⚡",
    description: "Insight-driven approach that challenges customer assumptions",
    approach: "Disruptive"
  }
];

// Sample world-class qualification framework for demo
const SAMPLE_FRAMEWORK: QualificationFramework = {
  discoveryQuestions: [
    {
      category: "Strategic Business Impact",
      question: "What's driving the urgency around solving this challenge now versus waiting another quarter?",
      listenFor: ["competitive pressure", "board mandate", "financial impact", "market timing"],
      followUp: "dig into competitive implications and market windows",
      valueDemo: "demonstrates understanding of business timing and market dynamics"
    },
    {
      category: "Economic Buyer Identification",
      question: "When you've made similar strategic technology investments in the past, who ultimately had to sign off on the business case?",
      listenFor: ["CEO involvement", "board approval", "procurement process", "budget authority"],
      followUp: "map the complete approval chain and identify champions",
      valueDemo: "shows expertise in enterprise sales and decision-making processes"
    },
    {
      category: "ROI and Value Quantification",
      question: "If we could help you achieve the outcomes you're looking for, what would that be worth to TechFlow in terms of revenue or cost savings?",
      listenFor: ["specific dollar amounts", "percentage improvements", "headcount savings", "revenue impact"],
      followUp: "build detailed business case with measurable outcomes",
      valueDemo: "positions conversation around business value rather than features"
    },
    {
      category: "Competitive Intelligence",
      question: "How are your closest competitors handling this challenge, and what advantage would solving this first give TechFlow?",
      listenFor: ["competitive gaps", "market positioning", "first-mover advantage", "industry trends"],
      followUp: "explore differentiation opportunities and market positioning",
      valueDemo: "demonstrates market knowledge and strategic thinking"
    },
    {
      category: "Decision Process Mapping",
      question: "Walk me through how TechFlow typically evaluates and implements new technology solutions - what does that process look like?",
      listenFor: ["evaluation criteria", "timeline requirements", "stakeholder involvement", "approval stages"],
      followUp: "align our process with their buying journey",
      valueDemo: "shows respect for their process while gathering intelligence"
    },
    {
      category: "Risk Assessment",
      question: "What concerns or risks would you anticipate the leadership team having about implementing a solution like this?",
      listenFor: ["integration complexity", "change management", "ROI uncertainty", "vendor risk"],
      followUp: "proactively address concerns and build risk mitigation plan",
      valueDemo: "demonstrates business maturity and risk awareness"
    },
    {
      category: "Champion Development",
      question: "If you were to recommend this solution internally, what would you need from us to make the strongest possible case?",
      listenFor: ["proof points", "references", "ROI calculations", "risk mitigation"],
      followUp: "equip champion with tools for internal selling",
      valueDemo: "positions prospect as partner in the sales process"
    },
    {
      category: "Metrics and Success Criteria",
      question: "How would you and your leadership team measure the success of this initiative 12 months from now?",
      listenFor: ["KPI definitions", "measurement methods", "success metrics", "timeline expectations"],
      followUp: "align our solution with their success criteria",
      valueDemo: "shows commitment to measurable outcomes and long-term success"
    }
  ],
  scoringSystem: [
    {
      criteria: "Business Impact Potential",
      green: "Clear ROI over $500K annually with executive sponsorship and measurable KPIs",
      yellow: "Moderate impact ($100K-$500K) with department-level support and general benefits",
      red: "Limited financial impact (<$100K) or no clear value driver identified",
      weight: "high"
    },
    {
      criteria: "Decision Authority Access",
      green: "Direct access to economic buyer with confirmed budget authority and decision timeline",
      yellow: "Access to influencer with path to economic buyer and general budget discussions",
      red: "Only technical contact with no budget insight or executive access",
      weight: "high"
    },
    {
      criteria: "Competitive Positioning",
      green: "Preferred vendor status with clear differentiation and competitive advantage",
      yellow: "In evaluation process with other vendors but strong relationship and fit",
      red: "Late to process with entrenched competition or significant disadvantages",
      weight: "medium"
    },
    {
      criteria: "Timeline and Urgency",
      green: "Urgent business need with defined timeline and consequences for delay",
      yellow: "Planned initiative with general timeline but flexible implementation",
      red: "Research phase with no urgency or distant implementation timeline",
      weight: "medium"
    },
    {
      criteria: "Solution Fit and Requirements",
      green: "Perfect technical fit with unique capabilities that solve critical problems",
      yellow: "Good fit with standard capabilities meeting most requirements",
      red: "Gap in key requirements or over-engineered solution for their needs",
      weight: "low"
    }
  ],
  disqualifySignals: [
    "No clear business problem or impact - purely research-based inquiry",
    "Budget cycles misaligned with decision timeline by more than 6 months",
    "Previous bad experience with our company or similar solutions",
    "Technical requirements outside our capabilities or platform limitations",
    "Procurement-led process with lowest price as primary decision criteria",
    "Multiple failed implementations of similar solutions in past 2 years",
    "Economic buyer strongly committed to incumbent vendor or competitive solution",
    "Organizational change freeze or hiring freeze that prevents implementation"
  ]
};

export default function DemoQualificationFramework() {
  const [frameworkType, setFrameworkType] = useState(FRAMEWORK_TYPES[0].id);
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

  const copyFramework = async () => {
    if (!framework) return;

    let text = `🎯 WORLD-CLASS QUALIFICATION FRAMEWORK\n\n`;
    text += `📋 DISCOVERY QUESTIONS:\n`;
    framework.discoveryQuestions.forEach((q, i) => {
      text += `\n${i + 1}. ${q.category}\n`;
      text += `   Question: ${q.question}\n`;
      text += `   Listen for: ${q.listenFor.join(', ')}\n`;
      if (q.followUp) {
        text += `   Follow-up: ${q.followUp}\n`;
      }
      if (q.valueDemo) {
        text += `   Value Demo: ${q.valueDemo}\n`;
      }
    });

    text += `\n📊 SCORING SYSTEM:\n`;
    framework.scoringSystem.forEach((s, i) => {
      text += `\n${s.criteria}${s.weight ? ` (${s.weight} priority)` : ''}:\n`;
      text += `  🟢 Green: ${s.green}\n`;
      text += `  🟡 Yellow: ${s.yellow}\n`;
      text += `  🔴 Red: ${s.red}\n`;
    });

    text += `\n🚩 DISQUALIFICATION SIGNALS:\n`;
    framework.disqualifySignals.forEach((signal, i) => {
      text += `• ${signal}\n`;
    });

    text += `\n---\n🤖 Generated by ICPPilot`;

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
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
            <h1 className="text-2xl font-bold text-blue-600">ICPPilot Demo</h1>
            <p className="text-sm text-gray-600">World-class qualification frameworks that demonstrate sales expertise</p>
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
                  <h3 className="font-semibold text-blue-900">Experience world-class qualification frameworks</h3>
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
            🎯 Qualification Framework
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Generate sophisticated discovery frameworks that demonstrate true sales expertise
          </p>
        </div>

        {/* Main Input Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">What type of qualification framework do you need?</CardTitle>
            <p className="text-gray-600">Experience expert-level discovery questions and scoring systems</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Framework Type */}
            <div>
              <label className="block text-lg font-semibold mb-4 text-gray-900">Sales Methodology Framework</label>
              <div className="grid md:grid-cols-1 gap-3">
                {FRAMEWORK_TYPES.map((type) => (
                  <button
                    key={type.id}
                    className={`p-4 text-sm border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md ${
                      frameworkType === type.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white hover:bg-blue-50'
                    }`}
                    onClick={() => setFrameworkType(type.id)}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-xl">{type.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{type.id.split(' ')[0]}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {type.approach}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{type.description}</p>
                      </div>
                    </div>
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
                    Crafting world-class framework...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>🚀</span>
                    Generate Expert Qualification Framework
                  </div>
                )}
              </Button>
              {frameworkType && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Generating {frameworkType.split(' ')[0]} framework with advanced sales methodology
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results - World-Class Framework */}
        {framework && (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-green-800 text-center">
                    🎯 Your Expert Qualification Framework
                  </CardTitle>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={copyFramework}
                  >
                    📋 Copy All
                  </Button>
                </div>
                <p className="text-center text-green-700">World-class discovery questions that demonstrate true sales expertise</p>
              </CardHeader>
            </Card>

            {/* Discovery Questions */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-blue-800">📋 Expert Discovery Questions</CardTitle>
                <p className="text-gray-600">Strategic questions that position you as a trusted advisor</p>
              </CardHeader>
              <CardContent className="space-y-5">
                {framework.discoveryQuestions.map((question, index) => (
                  <div key={index} className="bg-white p-5 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-700 mb-2">{question.category}</h4>
                        <p className="text-gray-800 font-medium mb-3">{question.question}</p>

                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Listen for:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {question.listenFor.map((signal, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {signal}
                                </span>
                              ))}
                            </div>
                          </div>

                          {question.followUp && (
                            <div>
                              <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Follow-up:</span>
                              <p className="text-sm text-gray-600 mt-1">{question.followUp}</p>
                            </div>
                          )}

                          {question.valueDemo && (
                            <div>
                              <span className="text-xs font-semibold text-green-500 uppercase tracking-wide">Expertise Demo:</span>
                              <p className="text-sm text-gray-600 mt-1">{question.valueDemo}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Scoring System */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-purple-800">📊 Scoring System</CardTitle>
                <p className="text-gray-600">Comprehensive criteria for deal progression</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {framework.scoringSystem.map((criteria, index) => (
                  <div key={index} className="bg-white p-5 rounded-lg border">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-semibold text-gray-900">{criteria.criteria}</h4>
                      {criteria.weight && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                          {criteria.weight} priority
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">🟢</span>
                        <div>
                          <span className="font-medium text-green-700">Green:</span>
                          <p className="text-gray-700">{criteria.green}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-500 font-bold">🟡</span>
                        <div>
                          <span className="font-medium text-yellow-700">Yellow:</span>
                          <p className="text-gray-700">{criteria.yellow}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-red-500 font-bold">🔴</span>
                        <div>
                          <span className="font-medium text-red-700">Red:</span>
                          <p className="text-gray-700">{criteria.red}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Disqualification Signals */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-red-800">🚩 Disqualification Signals</CardTitle>
                <p className="text-gray-600">Clear indicators to protect your time and resources</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {framework.disqualifySignals.map((signal, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <span className="text-red-500 font-bold">⚠️</span>
                      <p className="text-gray-800 text-sm">{signal}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                    <h4 className="font-semibold text-blue-700 mb-2">Strategic Discovery</h4>
                    <p className="text-gray-600 text-sm">Questions that uncover business impact and decision dynamics</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-700 mb-2">Executive Positioning</h4>
                    <p className="text-gray-600 text-sm">Demonstrates peer-level expertise and industry authority</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-semibold text-purple-700 mb-2">Value Creation</h4>
                    <p className="text-gray-600 text-sm">Discovery process itself creates value and builds trust</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CTA after showing results */}
        {showSampleResult && (
          <Card className="border-green-500 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="py-6 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Your Team Could Demonstrate This Level of Expertise
              </h3>
              <p className="text-gray-600 mb-6">
                While your competitors use basic qualification checklists, your team will have world-class frameworks that demonstrate true sales mastery.
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