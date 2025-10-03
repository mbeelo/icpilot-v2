'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useICP } from '@/contexts/icp-context';
import { useUsage } from '@/hooks/use-usage';
import toast from 'react-hot-toast';
import { startBackgroundRequest, useVisibilityHandler, checkForRecentRequests, markToastShown } from '@/lib/background-requests';

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
  const { canMakeRequest, hasReachedLimit, refreshUsage } = useUsage();
  const searchParams = useSearchParams();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isCreatingSample, setIsCreatingSample] = useState(false);
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

  // Handle background request completion (polling every 3 seconds)
  useEffect(() => {
    const pollForCompletion = () => {
      const status = checkForRecentRequests(
        'framework',
        (result: { framework: QualificationFramework }) => {
          // Found completed request
          setFramework(result.framework);
          setShowCollapsedForm(true);
          setIsGenerating(false);
          toast.success('Qualification framework generated successfully!');
          // Refresh usage data after successful generation
          refreshUsage();
        },
        (toastShown: boolean) => {
          // Still pending - keep loading state and show toast only if not shown yet
          if (!isGenerating) {
            setIsGenerating(true);
          }
          if (!toastShown) {
            toast('Qualification framework is still generating...', { icon: '⏳' });
            markToastShown('framework');
          }
        },
        (error: string) => {
          // Handle errors from background requests
          setIsGenerating(false);
          if (error === 'PAYMENT_REQUIRED') {
            setShowUpgradeModal(true);
          } else {
            toast.error('Failed to generate framework');
          }
        }
      );
    };

    // Poll every 3 seconds if we're generating, or do initial check
    if (isGenerating) {
      const interval = setInterval(pollForCompletion, 3000);
      return () => clearInterval(interval);
    } else {
      // Do one immediate check to see if we should start generating
      pollForCompletion();
    }
  }, [isGenerating]);

  // Check for recent requests on component mount (handles page reloads) - silent version
  useEffect(() => {
    const status = checkForRecentRequests(
      'framework',
      (result: { framework: QualificationFramework }) => {
        // Found completed request
        setFramework(result.framework);
        setShowCollapsedForm(true);
        setIsGenerating(false);
        toast.success('Found recently generated qualification framework!');
        // Refresh usage data after successful generation
        refreshUsage();
      },
      (toastShown: boolean) => {
        // Found pending request - set state but don't show toast (polling will handle that)
        setIsGenerating(true);
      },
      (error: string) => {
        // Handle errors from mount-time check
        setIsGenerating(false);
        if (error === 'PAYMENT_REQUIRED') {
          setShowUpgradeModal(true);
        } else {
          toast.error('Failed to generate framework');
        }
      }
    );

    // If no recent activity, ensure we're not in loading state
    if (status === 'none') {
      setIsGenerating(false);
    }
  }, []); // Only run on mount

  const generateFramework = async () => {
    if (!selectedIcp || !frameworkType) return;

    // Check usage limits before making API request
    if (!canMakeRequest()) {
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      await startBackgroundRequest(
        '/api/qualification/generate',
        {
          icpId: selectedIcp.id,
          frameworkType,
          customContext,
          prospectInfo,
          qualificationContext
        },
        'framework'
        // No callbacks - let the background system and useEffect handle completion
      );
    } catch (error) {
      toast.error('Error starting generation');
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

  const createSampleICP = async () => {
    setIsCreatingSample(true);
    try {
      const response = await fetch('/api/icps/sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Sample ICP created! Perfect for learning world-class frameworks.');
        // Refresh the page to show the new ICP
        window.location.reload();
      } else {
        toast.error('Failed to create sample ICP');
      }
    } catch (error) {
      toast.error('Error creating sample ICP');
    } finally {
      setIsCreatingSample(false);
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

    text += `\n---\n🤖 Generated with world-class sales expertise by ICP Pilot`;

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

  if (!icps || icps.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Ready to create world-class qualification frameworks?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              First, let&apos;s create your Ideal Customer Profile so we can generate frameworks that demonstrate true sales expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" onClick={() => window.location.href = '/icp-builder'} className="bg-blue-600 hover:bg-blue-700">
                Create Your First ICP (2 minutes) →
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={createSampleICP}
                disabled={isCreatingSample}
              >
                {isCreatingSample ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Creating...
                  </div>
                ) : (
                  <>Start with Sample ICP Template ⭐</>
                )}
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
              🏆 Here&apos;s what you&apos;ll be able to generate:
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-700 mb-2">Strategic Discovery Questions</h4>
              <p className="text-gray-600 text-sm">Sophisticated questions that position you as a trusted advisor and uncover true business impact</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-700 mb-2">Advanced Scoring Systems</h4>
              <p className="text-gray-600 text-sm">Multi-dimensional qualification criteria that demonstrate enterprise sales expertise</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
              <h4 className="font-semibold text-purple-700 mb-2">Expert-Level Methodologies</h4>
              <p className="text-gray-600 text-sm">MEDDIC, Value-Based, Challenger Sale frameworks that differentiate you from competition</p>
            </div>
          </CardContent>
        </Card>

        {/* Sales Methodology Preview */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-800 text-center">
              💡 Advanced Sales Methodologies Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border-l-4 border-blue-500">
                  <h5 className="font-semibold text-blue-700 text-sm">MEDDIC Framework</h5>
                  <p className="text-xs text-gray-600">Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion</p>
                </div>
                <div className="bg-white p-3 rounded-lg border-l-4 border-green-500">
                  <h5 className="font-semibold text-green-700 text-sm">Value-Based Qualification</h5>
                  <p className="text-xs text-gray-600">Business Impact, ROI Justification, Risk Mitigation focus</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border-l-4 border-purple-500">
                  <h5 className="font-semibold text-purple-700 text-sm">Challenger Sale</h5>
                  <p className="text-xs text-gray-600">Teaching, Tailoring, Taking Control methodology</p>
                </div>
                <div className="bg-white p-3 rounded-lg border-l-4 border-orange-500">
                  <h5 className="font-semibold text-orange-700 text-sm">CHAMP Framework</h5>
                  <p className="text-xs text-gray-600">Challenges, Authority, Money, Prioritization approach</p>
                </div>
              </div>
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎯 World-Class Qualification Framework
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Generate sophisticated discovery frameworks that demonstrate true sales expertise
        </p>
      </div>

      {/* Main Framework Generation */}
      <Card className={`border-2 transition-all duration-500 ${showCollapsedForm ? 'shadow-sm' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Build Your Expert Qualification Framework</CardTitle>
              {!showCollapsedForm && (
                <p className="text-gray-600">Create world-class discovery questions that position you as a strategic advisor</p>
              )}
              {showCollapsedForm && (
                <p className="text-sm text-gray-500">
                  {frameworkType ? `${frameworkType.split(' (')[0]} Framework Generated` : 'Framework Generated'}
                </p>
              )}
            </div>
            {showCollapsedForm && (
              <button
                onClick={() => setShowCollapsedForm(false)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <span>✏️</span> Edit
              </button>
            )}
          </div>
        </CardHeader>
        {!showCollapsedForm && (
          <CardContent className="space-y-8 transition-all duration-500">
          {/* Framework Selection */}
          <div>
            <label className="block text-lg font-semibold mb-4 text-gray-900">Sales Methodology Framework</label>
            <div className="grid md:grid-cols-2 gap-6">
              {FRAMEWORK_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`p-5 border-2 rounded-lg text-left transition-all hover:shadow-lg ${
                    frameworkType === type.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  onClick={() => setFrameworkType(type.id)}
                >
                  <div className="flex items-start gap-6 mb-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm mb-1">
                        {type.id.split(' ')[0]}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {type.approach}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{type.description}</p>
                  <p className="text-blue-600 text-xs font-medium">
                    <strong>Best for:</strong> {type.bestFor}
                  </p>
                </button>
              ))}
            </div>
          </div>


          {/* Custom Context */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              Additional Context (Optional)
            </label>
            <textarea
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder="Any specific context, industry nuances, or strategic considerations..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
              rows={3}
            />
          </div>

          {/* Advanced Options Toggle */}
          <div>
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>{showAdvancedOptions ? '▼' : '▶'}</span>
              Advanced Qualification Context
            </button>

            {showAdvancedOptions && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg space-y-6">
                {/* Deal Complexity */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-900">Deal Complexity</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DEAL_COMPLEXITY_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        className={`p-3 text-sm border-2 rounded-lg text-left transition-all ${
                          qualificationContext.dealComplexity === option.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white hover:bg-blue-50'
                        }`}
                        onClick={() => setQualificationContext({
                          ...qualificationContext,
                          dealComplexity: option.id
                        })}
                      >
                        <div className="font-medium">{option.name}</div>
                        <div className="text-xs mt-1 opacity-70">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stakeholder Level */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-900">Primary Stakeholder Level</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {STAKEHOLDER_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        className={`p-3 text-sm border-2 rounded-lg text-left transition-all ${
                          qualificationContext.stakeholderLevel === level.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white hover:bg-blue-50'
                        }`}
                        onClick={() => setQualificationContext({
                          ...qualificationContext,
                          stakeholderLevel: level.id
                        })}
                      >
                        <div className="font-medium">{level.name}</div>
                        <div className="text-xs mt-1 opacity-70">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Competitive Scenario */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-900">Competitive Scenario</label>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {COMPETITIVE_SCENARIOS.map((scenario) => (
                      <button
                        key={scenario.id}
                        className={`p-3 text-sm border-2 rounded-lg text-left transition-all ${
                          qualificationContext.competitiveScenario === scenario.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white hover:bg-blue-50'
                        }`}
                        onClick={() => setQualificationContext({
                          ...qualificationContext,
                          competitiveScenario: scenario.id
                        })}
                      >
                        <div className="font-medium">{scenario.name}</div>
                        <div className="text-xs mt-1 opacity-70">{scenario.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prospect Information */}
          <div>
            <button
              onClick={() => setShowProspectInfo(!showProspectInfo)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>{showProspectInfo ? '▼' : '▶'}</span>
              Add Specific Prospect Information
            </button>

            {showProspectInfo && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prospect Name</label>
                    <input
                      type="text"
                      value={prospectInfo.name}
                      onChange={(e) => setProspectInfo({...prospectInfo, name: e.target.value})}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Company</label>
                    <input
                      type="text"
                      value={prospectInfo.company}
                      onChange={(e) => setProspectInfo({...prospectInfo, company: e.target.value})}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={prospectInfo.title}
                      onChange={(e) => setProspectInfo({...prospectInfo, title: e.target.value})}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="VP Sales"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Specific Context</label>
                  <textarea
                    value={prospectInfo.specificContext}
                    onChange={(e) => setProspectInfo({...prospectInfo, specificContext: e.target.value})}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                    rows={2}
                    placeholder="Recent company news, specific challenges, competitive situation..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="pt-4">
            <Button
              size="xl"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={generateFramework}
              disabled={!frameworkType || isGenerating}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                Creating {frameworkType.split(' ')[0]} framework with advanced sales methodology
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
                  {frameworkType ? frameworkType.split(' (')[0] : 'Framework'}
                </span>
                {qualificationContext.stakeholderLevel && (
                  <>
                    <span>•</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                      {STAKEHOLDER_LEVELS.find(s => s.id === qualificationContext.stakeholderLevel)?.name}
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

      {/* Results Display */}
      {framework && (
        <div className="space-y-6">
          {/* Framework Header */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-green-800">
                  🎯 Your Expert Qualification Framework
                </CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyFramework}
                >
                  📋 Copy Framework
                </Button>
              </div>
              <p className="text-green-700">World-class discovery questions that demonstrate sales expertise</p>
            </CardHeader>
          </Card>

          {/* Discovery Questions */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-blue-800">📋 Discovery Questions</CardTitle>
              <p className="text-gray-600">Strategic questions that position you as a trusted advisor</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {framework.discoveryQuestions.map((question, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start gap-6 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-700 mb-2">{question.category}</h4>
                      <p className="text-gray-800 font-medium mb-3">{question.question}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="border-l-4 border-gray-400 pl-4 py-2">
                      <h4 className="font-semibold text-blue-700 mb-2">Listen for:</h4>
                      <div className="flex flex-wrap gap-1">
                        {question.listenFor.map((signal, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                            {signal}
                          </span>
                        ))}
                      </div>
                    </div>

                    {question.followUp && (
                      <div className="border-l-4 border-gray-400 pl-4 py-2">
                        <h4 className="font-semibold text-blue-700 mb-2">Follow-up:</h4>
                        <p className="text-gray-800">{question.followUp}</p>
                      </div>
                    )}

                    {question.valueDemo && (
                      <div className="border-l-4 border-gray-400 pl-4 py-2">
                        <h4 className="font-semibold text-blue-700 mb-2">Expertise Demo:</h4>
                        <p className="text-gray-800">{question.valueDemo}</p>
                      </div>
                    )}
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
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="font-semibold text-blue-700">{criteria.criteria}</h4>
                    {criteria.weight && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                        {criteria.weight} priority
                      </span>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="border-l-4 border-gray-400 pl-4 py-2">
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">🟢</span>
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2">Green:</h4>
                          <p className="text-gray-800">{criteria.green}</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-l-4 border-gray-400 pl-4 py-2">
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-500 font-bold">🟡</span>
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2">Yellow:</h4>
                          <p className="text-gray-800">{criteria.yellow}</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-l-4 border-gray-400 pl-4 py-2">
                      <div className="flex items-start gap-3">
                        <span className="text-red-500 font-bold">🔴</span>
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2">Red:</h4>
                          <p className="text-gray-800">{criteria.red}</p>
                        </div>
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

          {/* Contextual Sales Coaching */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-xl text-blue-800 text-center">
                🎯 Why This Framework Positions You as an Expert
              </CardTitle>
              <p className="text-blue-700 text-center">Understanding the sales psychology behind each question</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Methodology Approach */}
              <div className="bg-white p-5 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-700 mb-3">🧠 {frameworkType.split(' ')[0]} Methodology Approach</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Discovery Strategy:</strong> Each question is designed to position you as a strategic advisor, not a vendor.
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Best for:</strong> Complex B2B sales with multiple stakeholders and long decision cycles.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Executive Positioning:</strong> Questions demonstrate industry expertise and peer-level understanding.
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Psychology:</strong> Creates cognitive authority through sophisticated business questioning.
                    </p>
                  </div>
                </div>
              </div>

              {/* Question Strategy Breakdown */}
              <div className="bg-white p-5 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-green-700 mb-3">💡 Question Strategy Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="text-green-600 font-bold">1.</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Strategic Business Impact Questions</p>
                      <p className="text-xs text-gray-600">Elevate the conversation to business outcomes vs. features. Shows you understand their world.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-600 font-bold">2.</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Decision Process & Authority Mapping</p>
                      <p className="text-xs text-gray-600">Sophisticated qualification that demonstrates enterprise sales experience.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-purple-600 font-bold">3.</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Competitive Intelligence & Market Positioning</p>
                      <p className="text-xs text-gray-600">Shows market expertise and helps you understand their competitive landscape.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Techniques */}
              <div className="bg-white p-5 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-semibold text-purple-700 mb-3">🎯 Advanced Qualification Techniques</h4>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="font-medium text-gray-800 mb-1">Value-Based Discovery</p>
                    <p className="text-gray-600">Every question connects to measurable business impact and ROI justification.</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 mb-1">Challenger Sale Elements</p>
                    <p className="text-gray-600">Reframe their thinking and challenge assumptions about their current approach.</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 mb-1">Executive Buyer Identification</p>
                    <p className="text-gray-600">Systematically map decision authority and budget ownership.</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 mb-1">Champion Development</p>
                    <p className="text-gray-600">Questions designed to identify and develop internal advocates.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expertise Demonstration */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-800 text-center">
                🏆 How This Differentiates You From Competition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-700 mb-2">Strategic Discovery</h4>
                  <p className="text-gray-600 text-sm">While competitors ask about budget and timeline, you&apos;re uncovering business transformation opportunities</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-700 mb-2">Executive Positioning</h4>
                  <p className="text-gray-600 text-sm">Your questions demonstrate peer-level expertise that C-suite executives respect and value</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-semibold text-purple-700 mb-2">Consultative Authority</h4>
                  <p className="text-gray-600 text-sm">The discovery process itself becomes a strategic consulting session that builds trust</p>
                </div>
              </div>
              <div className="text-center pt-4">
                <p className="text-yellow-800 font-medium">Result: You&apos;re positioned as a strategic advisor, not just another vendor</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}