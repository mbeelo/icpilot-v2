'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useICP } from '@/contexts/icp-context';
import toast from 'react-hot-toast';


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
    id: "BANT (Budget, Authority, Need, Timeline)",
    icon: "💰",
    description: "Classic sales qualification focused on budget and decision-making",
    approach: "Traditional",
    bestFor: "Transactional sales with clear budget cycles"
  },
  {
    id: "MEDDIC (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion)",
    icon: "🎯",
    description: "Comprehensive framework for complex B2B sales",
    approach: "Consultative",
    bestFor: "Enterprise deals with multiple stakeholders"
  },
  {
    id: "CHAMP (Challenges, Authority, Money, Prioritization)",
    icon: "🏆",
    description: "Modern approach focusing on challenges and prioritization",
    approach: "Solution-Focused",
    bestFor: "Problem-solving sales with competitive pressure"
  },
  {
    id: "SPICED (Situation, Pain, Impact, Critical Event, Decision)",
    icon: "🌶️",
    description: "Outcome-focused framework for consultative selling",
    approach: "Value-Based",
    bestFor: "Transformation and strategic initiatives"
  },
  {
    id: "Value-Based Qualification (Business Impact, ROI Justification, Risk Mitigation)",
    icon: "📈",
    description: "Strategic qualification focused on business transformation",
    approach: "Executive",
    bestFor: "C-level strategic initiatives and major investments"
  },
  {
    id: "Challenger Sale (Teaching, Tailoring, Taking Control)",
    icon: "⚡",
    description: "Insight-driven approach that challenges customer assumptions",
    approach: "Disruptive",
    bestFor: "Competitive displacement and status quo challenge"
  }
];

const DEAL_COMPLEXITY_OPTIONS = [
  { id: 'simple', name: 'Simple', description: 'Single stakeholder, clear need' },
  { id: 'standard', name: 'Standard', description: 'Multiple stakeholders, defined process' },
  { id: 'complex', name: 'Complex', description: 'Enterprise-level, multiple departments' },
  { id: 'strategic', name: 'Strategic', description: 'Transformational, board-level impact' }
];

const STAKEHOLDER_LEVELS = [
  { id: 'individual', name: 'Individual Contributor', description: 'End users and practitioners' },
  { id: 'management', name: 'Management', description: 'Directors and VPs' },
  { id: 'executive', name: 'Executive', description: 'C-level and senior leadership' },
  { id: 'mixed', name: 'Mixed Stakeholders', description: 'Multiple organizational levels' }
];

const COMPETITIVE_SCENARIOS = [
  { id: 'greenfield', name: 'Greenfield', description: 'No existing solution in place' },
  { id: 'replacement', name: 'Replacement', description: 'Replacing existing solution' },
  { id: 'competitive', name: 'Competitive', description: 'Active competition with vendors' },
  { id: 'incumbent', name: 'Incumbent Displacement', description: 'Displacing established vendor' },
  { id: 'unknown', name: 'Unknown', description: 'Competitive landscape unclear' }
];

export function QualificationFramework() {
  const { icps, selectedIcp, isLoading } = useICP();
  const searchParams = useSearchParams();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [frameworkType, setFrameworkType] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [qualificationContext, setQualificationContext] = useState({
    dealComplexity: 'standard',
    stakeholderLevel: 'mixed',
    competitiveScenario: 'unknown'
  });
  const [showProspectInfo, setShowProspectInfo] = useState(false);
  const [prospectInfo, setProspectInfo] = useState({
    name: '',
    company: '',
    title: '',
    specificContext: ''
  });
  const [framework, setFramework] = useState<QualificationFramework | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCollapsedForm, setShowCollapsedForm] = useState(false);


  const generateFramework = async () => {
    if (!selectedIcp || !frameworkType) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/qualification/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          icpId: selectedIcp.id,
          frameworkType,
          customContext,
          prospectInfo,
          qualificationContext
        }),
      });

      if (response.status === 402) {
        setShowUpgradeModal(true);
      } else if (response.ok) {
        const data = await response.json();
        setFramework(data.framework);
        setShowCollapsedForm(true);
      } else {
        toast.error('Failed to generate framework');
      }
    } catch (error) {
      toast.error('Error generating framework');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpgrade = async () => {
    const response = await fetch('/api/stripe/create-checkout', { method: 'POST' });
    if (response.ok) {
      const { url } = await response.json();
      window.location.href = url;
    }
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

    text += `\n---\n🤖 Generated with world-class sales expertise by ICPPilot`;

    try {
      await navigator.clipboard.writeText(text);
      toast.success('World-class framework copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your ICPs...</p>
        </div>
      </div>
    );
  }

  if (icps.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-8 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Ready to build powerful qualification frameworks?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              First, let&apos;s create your Ideal Customer Profile so we can generate discovery questions tailored to your sales process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => window.location.href = '/icp-builder'} className="bg-blue-600 hover:bg-blue-700">
                Create Your First ICP (2 minutes) →
              </Button>
              <Link href="/demo/qualification-framework">
                <Button size="lg" variant="outline">
                  Or Try Demo First
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Show preview of what they'll get */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-xl text-green-800 text-center">
              🔍 Here&apos;s what you&apos;ll be able to generate:
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-700 mb-2">Discovery Questions</h4>
              <p className="text-gray-600 text-sm">Industry-specific questions that uncover pain points and buying motivations</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-700 mb-2">Scoring Criteria</h4>
              <p className="text-gray-600 text-sm">Clear frameworks to evaluate prospect fit and prioritize your pipeline</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
              <h4 className="font-semibold text-purple-700 mb-2">Follow-up Strategy</h4>
              <p className="text-gray-600 text-sm">Next steps based on qualification scores and engagement levels</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
              <h4 className="font-semibold text-orange-700 mb-2">Implementation Guide</h4>
              <p className="text-gray-600 text-sm">Step-by-step process to integrate into your existing sales workflow</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🔍 Qualification Framework</h1>
        <p className="text-xl text-gray-600">
          Build discovery systems that identify ideal prospects and predict deal success
        </p>
      </div>

      {/* Main Input Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Choose your qualification approach</CardTitle>
          <p className="text-gray-600">Select a proven framework to guide your sales conversations</p>
        </CardHeader>
        {!showCollapsedForm && (
          <CardContent className="space-y-6 transition-all duration-500">
          {/* Framework Selection */}
          <div>
            <label className="block text-lg font-semibold mb-4 text-gray-900">Qualification Framework</label>
            <div className="grid md:grid-cols-2 gap-4">
              {FRAMEWORK_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                    frameworkType === type.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setFrameworkType(type.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{type.icon}</span>
                    <span className={`font-semibold text-sm ${frameworkType === type.id ? 'text-blue-700' : 'text-gray-900'}`}>
                      {type.id.split(' (')[0]}
                    </span>
                  </div>
                  <p className={`text-xs ${frameworkType === type.id ? 'text-blue-600' : 'text-gray-600'}`}>
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Context */}
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-900">Sales Context</label>
            <textarea
              className="w-full p-4 border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Any specific qualification requirements, deal sizes, sales process notes, or special considerations..."
              rows={3}
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              This helps tailor the framework to your specific sales process and requirements
            </p>
          </div>

          {/* Prospect Info Toggle */}
          <div>
            <button
              onClick={() => setShowProspectInfo(!showProspectInfo)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2 mb-4"
            >
              {showProspectInfo ? '− Hide' : '+ Add'} specific prospect details (optional)
            </button>

            {showProspectInfo && (
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label htmlFor="prospect-name" className="block text-sm font-medium mb-1 text-gray-700">Prospect Name</label>
                  <input
                    id="prospect-name"
                    name="prospectName"
                    type="text"
                    className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                    placeholder="John Smith"
                    value={prospectInfo.name}
                    onChange={(e) => setProspectInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="prospect-company" className="block text-sm font-medium mb-1 text-gray-700">Company</label>
                  <input
                    id="prospect-company"
                    name="prospectCompany"
                    type="text"
                    className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                    placeholder="Acme Corp"
                    value={prospectInfo.company}
                    onChange={(e) => setProspectInfo(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="prospect-title" className="block text-sm font-medium mb-1 text-gray-700">Title</label>
                  <input
                    id="prospect-title"
                    name="prospectTitle"
                    type="text"
                    className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                    placeholder="VP of Sales"
                    value={prospectInfo.title}
                    onChange={(e) => setProspectInfo(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="prospect-context" className="block text-sm font-medium mb-1 text-gray-700">Context</label>
                  <input
                    id="prospect-context"
                    name="prospectContext"
                    type="text"
                    className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                    placeholder="Current challenges, initiatives..."
                    value={prospectInfo.specificContext}
                    onChange={(e) => setProspectInfo(prev => ({ ...prev, specificContext: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="pt-4">
            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={generateFramework}
              disabled={isGenerating || !frameworkType}
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
            {frameworkType && (
              <p className="text-center text-sm text-gray-500 mt-2">
                Creating {frameworkType.split(' (')[0]} framework for {selectedIcp?.name}
              </p>
            )}
          </div>
          </CardContent>
        )}
        {showCollapsedForm && (
          <CardContent className="pt-0">
            <div className="space-y-3 mb-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {frameworkType.split(' (')[0]}
                </span>
                {customContext && (
                  <>
                    <span>•</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                      Custom Context Added
                    </span>
                  </>
                )}
                {prospectInfo.name && (
                  <>
                    <span>•</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {prospectInfo.name} at {prospectInfo.company}
                    </span>
                  </>
                )}
              </div>
            </div>
            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowCollapsedForm(false)}
            >
              Edit Framework Settings
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Generated Framework */}
      {framework && (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-top-4 duration-700">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Your Qualification Framework</h2>
            <p className="text-gray-600">Complete discovery system with questions, scoring, and disqualifiers</p>
          </div>

          {/* Discovery Questions */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl text-blue-800">🗣️ Discovery Questions</CardTitle>
                <Button
                  onClick={copyFramework}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  📋 Copy All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {framework.discoveryQuestions.map((q, index) => (
                  <div key={index} className="bg-white p-5 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                        #{index + 1}
                      </span>
                      <h4 className="font-semibold text-gray-900">{q.category}</h4>
                    </div>
                    <p className="text-gray-800 mb-3 text-lg">{q.question}</p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">👂 Listen for:</span> {q.listenFor.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scoring System */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">📊 Scoring System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {framework.scoringSystem.map((score, index) => (
                  <div key={index} className="bg-white p-5 rounded-lg border">
                    <h4 className="font-semibold text-gray-900 mb-4 text-lg">{score.criteria}</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <span className="text-2xl">🟢</span>
                        <div>
                          <span className="font-bold text-green-700">Green (Qualified):</span>
                          <p className="text-gray-800 mt-1">{score.green}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                        <span className="text-2xl">🟡</span>
                        <div>
                          <span className="font-bold text-yellow-700">Yellow (Caution):</span>
                          <p className="text-gray-800 mt-1">{score.yellow}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                        <span className="text-2xl">🔴</span>
                        <div>
                          <span className="font-bold text-red-700">Red (Risk):</span>
                          <p className="text-gray-800 mt-1">{score.red}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disqualify Signals */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-2xl text-red-800">🚨 Automatic Disqualifiers</CardTitle>
              <p className="text-red-600">Red flags that indicate you should walk away</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {framework.disqualifySignals.map((signal, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                    <span className="text-red-500 text-xl mt-0.5">⚠️</span>
                    <span className="text-gray-800">{signal}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usage Guide */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-xl text-purple-800">💡 How to Use This Framework</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">1.</span>
                  <p className="text-gray-700">Ask discovery questions in order during your sales conversations</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">2.</span>
                  <p className="text-gray-700">Score each response using the Green/Yellow/Red system</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">3.</span>
                  <p className="text-gray-700">Watch for automatic disqualifiers throughout the process</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">4.</span>
                  <p className="text-gray-700">Use scoring to prioritize prospects and forecast deal likelihood</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}