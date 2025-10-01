'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { useICP } from '@/contexts/icp-context';
import { useUsage } from '@/hooks/use-usage';
import toast from 'react-hot-toast';
import { startBackgroundRequest, useVisibilityHandler, checkForRecentRequests, markToastShown } from '@/lib/background-requests';

interface ObjectionResponse {
  variant: string;
  approach: string;
  bestFor: string;
  response: string;
}

const OBJECTION_TYPES = [
  {
    id: "Price & Budget Concerns",
    icon: "💰",
    description: "Cost-related objections and budget constraints",
    approach: "Value-Based",
    bestFor: "ROI-focused buyers who need quantified business case",
    examples: ["It's too expensive", "Budget is tight", "Your competitor is cheaper"]
  },
  {
    id: "Timing & Urgency Issues",
    icon: "⏰",
    description: "Timeline concerns and readiness to move forward",
    approach: "Consultative",
    bestFor: "Prospects who need business case for urgency",
    examples: ["Not the right time", "We need to think about it", "Let's revisit next quarter"]
  },
  {
    id: "Authority & Decision Making",
    icon: "👥",
    description: "Need approval or involve other stakeholders",
    approach: "Strategic",
    bestFor: "Complex B2B sales with multiple decision makers",
    examples: ["Need to check with my team", "I don't make this decision", "Need board approval"]
  },
  {
    id: "Status Quo & Satisfaction",
    icon: "🏠",
    description: "Happy with current solution or process",
    approach: "Challenger",
    bestFor: "Disrupting complacency and creating urgency",
    examples: ["We're happy with current provider", "Current process works fine", "Not ready to change"]
  },
  {
    id: "Competitive & Alternative Solutions",
    icon: "⚔️",
    description: "Comparing with competitors or alternatives",
    approach: "Differentiation",
    bestFor: "Competitive situations requiring unique positioning",
    examples: ["Looking at your competitor", "Considering building internally", "Evaluating multiple vendors"]
  },
  {
    id: "Trust & Credibility Concerns",
    icon: "🤔",
    description: "Doubts about capability or fit",
    approach: "Evidence-Based",
    bestFor: "Risk-averse buyers who need proof and validation",
    examples: ["Not sure you understand our industry", "Concern about implementation", "Need references"]
  }
];

const PRESET_OBJECTIONS = [
  "It's too expensive",
  "We need to think about it",
  "We already have a solution",
  "Not the right time",
  "Need to check with my team",
  "Your competitor is cheaper",
  "We're happy with our current provider",
  "Budget is tight this quarter",
  "We're not ready to make a change"
];

const SALES_CYCLE_OPTIONS = [
  { value: "early", label: "Early Discovery", icon: "🔍" },
  { value: "mid", label: "Mid-Cycle Evaluation", icon: "⚖️" },
  { value: "late", label: "Late Stage Decision", icon: "📋" }
];

const STAKEHOLDER_LEVELS = [
  { value: "economic", label: "Economic Buyer (C-level/VP)", icon: "👑" },
  { value: "influencer", label: "Influencer (Director/Manager)", icon: "🤝" },
  { value: "enduser", label: "End User (Individual Contributor)", icon: "👤" }
];

const RELATIONSHIP_TEMP = [
  { value: "cold", label: "Cold Outreach", icon: "❄️" },
  { value: "warm", label: "Warm Relationship", icon: "🔥" },
  { value: "existing", label: "Existing Customer", icon: "💎" }
];

const COMPETITIVE_SITUATIONS = [
  { value: "none", label: "No Competitors Mentioned", icon: "🎯" },
  { value: "evaluating", label: "Evaluating Multiple Vendors", icon: "⚖️" },
  { value: "incumbent", label: "Incumbent Solution in Place", icon: "🏰" },
  { value: "specific", label: "Specific Competitor Named", icon: "⚔️" }
];

export function ObjectionKiller() {
  const { icps, selectedIcp, isLoading } = useICP();
  const { canMakeRequest, hasReachedLimit, refreshUsage } = useUsage();
  const searchParams = useSearchParams();
  const [objection, setObjection] = useState('');
  const [objectionType, setObjectionType] = useState('Price & Budget Concerns');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [customObjection, setCustomObjection] = useState('');
  const [responses, setResponses] = useState<ObjectionResponse[]>([]);
  const [generatedObjection, setGeneratedObjection] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCollapsedForm, setShowCollapsedForm] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showProspectInfo, setShowProspectInfo] = useState(false);

  // Enhanced sales context
  const [salesContext, setSalesContext] = useState({
    salesCycle: 'mid-cycle',
    stakeholderLevel: 'mixed',
    relationshipTemp: 'warm',
    competitiveSituation: 'unknown'
  });

  const [prospectInfo, setProspectInfo] = useState({
    name: '',
    company: '',
    title: '',
    specificContext: ''
  });

  // Auto-save prospect info to localStorage
  useEffect(() => {
    const savedProspectInfo = localStorage.getItem('prospectInfo');
    if (savedProspectInfo) {
      try {
        setProspectInfo(JSON.parse(savedProspectInfo));
        setShowProspectInfo(true);
      } catch (error) {
        console.error('Error loading prospect info:', error);
      }
    }
  }, []);

  // Save prospect info whenever it changes
  useEffect(() => {
    if (prospectInfo.name || prospectInfo.company || prospectInfo.title || prospectInfo.specificContext) {
      localStorage.setItem('prospectInfo', JSON.stringify(prospectInfo));
    }
  }, [prospectInfo]);

  // Auto-save sales context
  useEffect(() => {
    const savedSalesContext = localStorage.getItem('salesContext');
    if (savedSalesContext) {
      try {
        setSalesContext(JSON.parse(savedSalesContext));
      } catch (error) {
        console.error('Error loading sales context:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (Object.values(salesContext).some(value => value)) {
      localStorage.setItem('salesContext', JSON.stringify(salesContext));
    }
  }, [salesContext]);

  // Auto-save last objection
  useEffect(() => {
    const savedObjection = localStorage.getItem('lastObjection');
    const savedCustomObjection = localStorage.getItem('lastCustomObjection');

    if (savedObjection && PRESET_OBJECTIONS.includes(savedObjection)) {
      setObjection(savedObjection);
    } else if (savedCustomObjection) {
      setCustomObjection(savedCustomObjection);
    }
  }, []);

  // Save objections when they change
  useEffect(() => {
    if (objection) {
      localStorage.setItem('lastObjection', objection);
      localStorage.removeItem('lastCustomObjection');
    }
  }, [objection]);

  useEffect(() => {
    if (customObjection) {
      localStorage.setItem('lastCustomObjection', customObjection);
      localStorage.removeItem('lastObjection');
    }
  }, [customObjection]);

  // Handle background request completion (polling every 3 seconds)
  useEffect(() => {
    const pollForCompletion = () => {
      const status = checkForRecentRequests(
        'objection',
        (result: any) => {
          // Found completed request - rebuttal is directly in result from API response
          setResponses(result.rebuttal || result);
          setGeneratedObjection(objection || customObjection);
          setShowCollapsedForm(true);
          setIsGenerating(false);
          toast.success('Objection rebuttal generated successfully!');
          // Refresh usage data after successful generation
          refreshUsage();
        },
        (toastShown: boolean) => {
          // Still pending - keep loading state and show toast only if not shown yet
          if (!isGenerating) {
            setIsGenerating(true);
          }
          if (!toastShown) {
            toast('Objection rebuttal is still generating...', { icon: '⏳' });
            markToastShown('objection');
          }
        },
        (error: string) => {
          setIsGenerating(false);
          if (error === 'PAYMENT_REQUIRED') {
            setShowUpgradeModal(true);
          } else {
            toast.error('Failed to generate objection rebuttal');
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
      'objection',
      (result: any) => {
        // Found completed request - rebuttal is directly in result from API response
        setResponses(result.rebuttal || result);
        setGeneratedObjection(objection || customObjection);
        setShowCollapsedForm(true);
        setIsGenerating(false);
        toast.success('Found recently generated objection rebuttal!');
        // Refresh usage data after successful generation
        refreshUsage();
      },
      (toastShown: boolean) => {
        // Found pending request - set state but don't show toast (polling will handle that)
        setIsGenerating(true);
      },
      (error: string) => {
        setIsGenerating(false);
        if (error === 'PAYMENT_REQUIRED') {
          setShowUpgradeModal(true);
        } else {
          toast.error('Failed to generate objection rebuttal');
        }
      }
    );

    // If no recent activity, ensure we're not in loading state
    if (status === 'none') {
      setIsGenerating(false);
    }
  }, []); // Only run on mount

  const generateRebuttal = async () => {
    if (!selectedIcp || (!objection && !customObjection)) return;

    // Check usage limits before making API request
    if (!canMakeRequest()) {
      setShowUpgradeModal(true);
      return;
    }

    const currentObjection = objection || customObjection;
    setIsGenerating(true);

    try {
      await startBackgroundRequest(
        '/api/objections/generate',
        {
          icpId: selectedIcp.id,
          objection: currentObjection,
          objectionType,
          prospectInfo,
          salesContext,
        },
        'objection'
        // No callbacks - let the background system and useEffect handle completion
      );
    } catch (error) {
      toast.error('Error starting generation');
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (response: ObjectionResponse) => {
    try {
      await navigator.clipboard.writeText(response.response);
      toast.success(`${response.variant} rebuttal copied to clipboard!`);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = response.response;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success(`${response.variant} rebuttal copied!`);
    }
  };

  const copyAllResponses = async () => {
    if (!responses.length) return;

    const allResponses = responses.map(r =>
      `${r.variant.toUpperCase()}\n${r.response}\n`
    ).join('\n---\n\n');

    const fullText = `OBJECTION: "${generatedObjection}"\n\n${allResponses}\n---\nGenerated by ICP Pilot`;

    try {
      await navigator.clipboard.writeText(fullText);
      toast.success('All responses copied to clipboard!');
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('All responses copied!');
    }
  };

  const handleUpgrade = async () => {
    const response = await fetch('/api/stripe/create-checkout', { method: 'POST' });
    if (response.ok) {
      const { url } = await response.json();
      window.location.href = url;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
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
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Ready to create world-class objection rebuttals?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              First, let's create your Ideal Customer Profile so we can generate rebuttals that are perfectly tailored to your target buyers.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" onClick={() => window.location.href = '/icp-builder'} className="bg-blue-600 hover:bg-blue-700">
                Create Your First ICP (2 minutes) →
              </Button>
              <Link href="/demo/objection-killer">
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
              🎯 Here's what you'll be able to generate:
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-700 mb-2">Executive Challenger</h4>
              <p className="text-gray-600 text-sm">Direct, insight-driven responses for senior decision makers</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-700 mb-2">Consultative Partner</h4>
              <p className="text-gray-600 text-sm">Question-based, discovery-focused approach for collaboration</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
              <h4 className="font-semibold text-purple-700 mb-2">Evidence-Driven Closer</h4>
              <p className="text-gray-600 text-sm">ROI-focused responses with specific proof points and urgency</p>
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
          💪 Expert Objection Handler
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Generate sophisticated objection responses that turn resistance into engagement and advance the sale
        </p>
      </div>

      {/* Main Input Card */}
      <Card className={`border-2 transition-all duration-500 ${showCollapsedForm ? 'shadow-sm' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Build Your Expert Objection Response</CardTitle>
              {!showCollapsedForm && (
                <p className="text-gray-600">Transform objections into opportunities with sophisticated handling strategies</p>
              )}
              {showCollapsedForm && (
                <p className="text-sm text-gray-500">
                  "{generatedObjection}"
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
          <CardContent className="space-y-6 transition-all duration-500">

          {/* Objection Type Selection */}
          <div>
            <label className="block text-lg font-semibold mb-4 text-gray-900">Objection Handling Approach</label>
            <div className="grid md:grid-cols-2 gap-6">
              {OBJECTION_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`p-5 border-2 rounded-lg text-left transition-all hover:shadow-lg ${
                    objectionType === type.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  onClick={() => setObjectionType(type.id)}
                >
                  <div className="flex items-start gap-6 mb-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm mb-1">
                        {type.id}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {type.approach}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{type.description}</p>
                  <p className="text-blue-600 text-xs font-medium mb-2">
                    <strong>Best for:</strong> {type.bestFor}
                  </p>
                  <div className="text-xs text-gray-500">
                    <strong>Examples:</strong> {type.examples.join(", ")}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Objections */}
          <div>
            <label className="block text-lg font-semibold mb-4 text-gray-900">Common Objections</label>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRESET_OBJECTIONS.map((preset) => (
                <button
                  key={preset}
                  className={`p-4 text-sm border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md ${
                    objection === preset
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white hover:bg-blue-50'
                  }`}
                  onClick={() => {
                    if (objection === preset) {
                      // Deselect if already selected
                      setObjection('');
                    } else {
                      // Select new preset
                      setObjection(preset);
                      setCustomObjection('');
                    }
                  }}
                >
                  "{preset}"
                </button>
              ))}
            </div>
          </div>

          {/* Custom Objection */}
          <div>
            <label htmlFor="custom-objection" className="block text-lg font-semibold mb-2 text-gray-900">Or Enter Custom Objection</label>
            <textarea
              id="custom-objection"
              name="custom-objection"
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Type the exact objection you're hearing..."
              rows={3}
              value={customObjection}
              onChange={(e) => {
                setCustomObjection(e.target.value);
                setObjection('');
              }}
            />
          </div>

          {/* Advanced Context Options */}
          <div>
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>{showAdvancedOptions ? '▼' : '▶'}</span>
              Advanced Sales Context
            </button>

            {showAdvancedOptions && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                {/* Sales Cycle Stage */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Sales Cycle Stage</label>
                  <div className="grid md:grid-cols-3 gap-2">
                    {SALES_CYCLE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        className={`p-3 text-sm border rounded-md text-left transition-all ${
                          salesContext.salesCycle === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white'
                        }`}
                        onClick={() => setSalesContext(prev => ({ ...prev, salesCycle: option.value }))}
                      >
                        <div className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <span className="font-medium text-xs">{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stakeholder Level */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Stakeholder Level</label>
                  <div className="grid md:grid-cols-3 gap-2">
                    {STAKEHOLDER_LEVELS.map((option) => (
                      <button
                        key={option.value}
                        className={`p-3 text-sm border rounded-md text-left transition-all ${
                          salesContext.stakeholderLevel === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white'
                        }`}
                        onClick={() => setSalesContext(prev => ({ ...prev, stakeholderLevel: option.value }))}
                      >
                        <div className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <span className="font-medium text-xs">{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Relationship Temperature */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Relationship Temperature</label>
                  <div className="grid md:grid-cols-3 gap-2">
                    {RELATIONSHIP_TEMP.map((option) => (
                      <button
                        key={option.value}
                        className={`p-3 text-sm border rounded-md text-left transition-all ${
                          salesContext.relationshipTemp === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white'
                        }`}
                        onClick={() => setSalesContext(prev => ({ ...prev, relationshipTemp: option.value }))}
                      >
                        <div className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <span className="font-medium text-xs">{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Competitive Situation */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Competitive Situation</label>
                  <div className="grid md:grid-cols-2 gap-2">
                    {COMPETITIVE_SITUATIONS.map((option) => (
                      <button
                        key={option.value}
                        className={`p-3 text-sm border rounded-md text-left transition-all ${
                          salesContext.competitiveSituation === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white'
                        }`}
                        onClick={() => setSalesContext(prev => ({ ...prev, competitiveSituation: option.value }))}
                      >
                        <div className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <span className="font-medium text-xs">{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prospect Info Toggle */}
          <div>
            <button
              onClick={() => setShowProspectInfo(!showProspectInfo)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>{showProspectInfo ? '▼' : '▶'}</span>
              Add Specific Prospect Information
            </button>

            {showProspectInfo && (
              <div className="mt-4 grid md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label htmlFor="prospect-name" className="block text-sm font-medium mb-1 text-gray-700">Prospect Name</label>
                  <input
                    id="prospect-name"
                    name="prospect-name"
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
                    name="prospect-company"
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
                    name="prospect-title"
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
                    name="prospect-context"
                    type="text"
                    className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                    placeholder="Recent funding, new initiative..."
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
              size="xl"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={generateRebuttal}
              disabled={isGenerating || (!objection && !customObjection)}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Crafting world-class responses...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>🚀</span>
                  Generate Expert Objection Responses (3 Variants)
                </div>
              )}
            </Button>
            {(objection || customObjection) && (
              <p className="text-center text-sm text-gray-500 mt-2">
                Generating rebuttal for: "{objection || customObjection}"
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
                  {objection || customObjection}
                </span>
                {salesContext.stakeholderLevel && (
                  <>
                    <span>•</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                      {STAKEHOLDER_LEVELS.find(s => s.value === salesContext.stakeholderLevel)?.label}
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
              Edit Objection Settings
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Results - 3 Sophisticated Variants */}
      {responses.length > 0 && (
        <div className="space-y-6">
          <Card className="border-2">
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
              <p className="text-center text-green-700">3 world-class response variants for different situations</p>
            </CardHeader>
          </Card>

          {responses.map((response, index) => (
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">{response.variant}</h4>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{response.approach}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded ml-2">{response.bestFor}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(response)}
                >
                  📋 Copy
                </Button>
              </div>
              <div className="border-l-4 border-gray-400 pl-4 py-2">
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {response.response}
                </p>
              </div>
            </div>
          ))}
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