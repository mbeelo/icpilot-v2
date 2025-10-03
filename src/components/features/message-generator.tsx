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

interface MessageOutput {
  variant: string;
  approach: string;
  bestFor: string;
  subject: string;
  message: string;
}

const PRESET_TRIGGERS = [
  "Just announced Series B funding of $25M",
  "Recently hired new VP of Sales or CRO",
  "Posted multiple job openings for sales roles",
  "Mentioned scaling challenges in recent content",
  "Launched new product line or market expansion",
  "Hit major company milestone or customer win",
  "Spoke at industry conference or webinar",
  "Published thought leadership about growth",
  "Announced partnership or acquisition"
];

const MESSAGE_TYPES = [
  {
    id: "Cold LinkedIn Message",
    icon: "💼",
    description: "Professional outreach through LinkedIn messaging",
    approach: "Social Selling",
    bestFor: "Building relationships with warm introductions and social proof"
  },
  {
    id: "Cold Email",
    icon: "📧",
    description: "Direct email approach with compelling subject lines",
    approach: "Direct Outreach",
    bestFor: "High-volume prospecting with measurable engagement metrics"
  },
  {
    id: "Follow-up Email",
    icon: "🔄",
    description: "Strategic follow-up after initial engagement",
    approach: "Nurture Sequence",
    bestFor: "Converting warm prospects and advancing conversations"
  },
  {
    id: "LinkedIn Connection Request",
    icon: "🤝",
    description: "Connection request with personalized note",
    approach: "Network Building",
    bestFor: "Long-term relationship building and social selling"
  },
  {
    id: "InMail Message",
    icon: "⭐",
    description: "Premium LinkedIn messaging for key prospects",
    approach: "Premium Touch",
    bestFor: "Executive outreach and high-value target accounts"
  },
  {
    id: "Video Prospecting Message",
    icon: "🎥",
    description: "Personalized video message with written follow-up",
    approach: "Multi-Media",
    bestFor: "Standing out in crowded inboxes and building trust"
  }
];

const URGENCY_LEVELS = [
  { value: "low", label: "Standard timing", icon: "📅" },
  { value: "medium", label: "Quarterly urgency", icon: "⏰" },
  { value: "high", label: "Time-sensitive opportunity", icon: "🚨" }
];

const COMPETITIVE_INTEL = [
  { value: "none", label: "No competitive intelligence", icon: "🎯" },
  { value: "evaluating", label: "Evaluating multiple solutions", icon: "⚖️" },
  { value: "competitor", label: "Specific competitor mentioned", icon: "⚔️" },
  { value: "incumbent", label: "Existing solution in place", icon: "🏰" }
];

const INDUSTRY_EVENTS = [
  { value: "none", label: "No industry context", icon: "📋" },
  { value: "conference", label: "Major industry conference", icon: "🎤" },
  { value: "earnings", label: "Earnings/funding season", icon: "💰" },
  { value: "regulation", label: "Regulatory changes", icon: "⚖️" }
];

export function MessageGenerator() {
  const { icps, selectedIcp, isLoading } = useICP();
  const { canMakeRequest, hasReachedLimit, refreshUsage } = useUsage();
  const searchParams = useSearchParams();
  const [messageType, setMessageType] = useState('');
  const [trigger, setTrigger] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [customTrigger, setCustomTrigger] = useState('');
  const [messages, setMessages] = useState<MessageOutput[]>([]);
  const [generatedTrigger, setGeneratedTrigger] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCollapsedForm, setShowCollapsedForm] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showProspectInfo, setShowProspectInfo] = useState(false);

  // Enhanced outreach context
  const [outreachContext, setOutreachContext] = useState({
    urgency: 'moderate',
    relationshipLevel: 'cold',
    competitiveIntel: 'unknown',
    industryEvent: 'none'
  });

  const [prospectInfo, setProspectInfo] = useState({
    name: '',
    company: '',
    title: '',
    specificContext: ''
  });

  // Auto-save all state to localStorage
  useEffect(() => {
    const savedProspectInfo = localStorage.getItem('prospectInfo');
    const savedMessageType = localStorage.getItem('lastMessageType');
    const savedTrigger = localStorage.getItem('lastTrigger');
    const savedCustomTrigger = localStorage.getItem('lastCustomTrigger');
    const savedOutreachContext = localStorage.getItem('outreachContext');

    if (savedProspectInfo) {
      try {
        setProspectInfo(JSON.parse(savedProspectInfo));
        setShowProspectInfo(true);
      } catch (error) {
        console.error('Error loading prospect info:', error);
      }
    }

    if (savedOutreachContext) {
      try {
        setOutreachContext(JSON.parse(savedOutreachContext));
      } catch (error) {
        console.error('Error loading outreach context:', error);
      }
    }

    if (savedMessageType && MESSAGE_TYPES.find(t => t.id === savedMessageType)) {
      setMessageType(savedMessageType);
    }

    if (savedTrigger && PRESET_TRIGGERS.includes(savedTrigger)) {
      setTrigger(savedTrigger);
    } else if (savedCustomTrigger) {
      setCustomTrigger(savedCustomTrigger);
    }
  }, []);

  // Save state when it changes
  useEffect(() => {
    if (prospectInfo.name || prospectInfo.company || prospectInfo.title || prospectInfo.specificContext) {
      localStorage.setItem('prospectInfo', JSON.stringify(prospectInfo));
    }
  }, [prospectInfo]);

  useEffect(() => {
    if (Object.values(outreachContext).some(value => value)) {
      localStorage.setItem('outreachContext', JSON.stringify(outreachContext));
    }
  }, [outreachContext]);

  useEffect(() => {
    if (messageType) {
      localStorage.setItem('lastMessageType', messageType);
    }
  }, [messageType]);

  useEffect(() => {
    if (trigger) {
      localStorage.setItem('lastTrigger', trigger);
      localStorage.removeItem('lastCustomTrigger');
    }
  }, [trigger]);

  useEffect(() => {
    if (customTrigger) {
      localStorage.setItem('lastCustomTrigger', customTrigger);
      localStorage.removeItem('lastTrigger');
    }
  }, [customTrigger]);

  // Handle background request completion (polling every 3 seconds)
  useEffect(() => {
    const pollForCompletion = () => {
      const status = checkForRecentRequests(
        'message',
        (result: { messages: MessageOutput[] }) => {
          // Found completed request
          setMessages(result.messages);
          setGeneratedTrigger(trigger || customTrigger);
          setShowCollapsedForm(true);
          setIsGenerating(false);
          toast.success('Messages generated successfully!');
          // Refresh usage data after successful generation
          refreshUsage();
        },
        (toastShown: boolean) => {
          // Still pending - keep loading state and show toast only if not shown yet
          if (!isGenerating) {
            setIsGenerating(true);
          }
          if (!toastShown) {
            toast('Messages are still generating...', { icon: '⏳' });
            markToastShown('message');
          }
        },
        (error: string) => {
          setIsGenerating(false);
          if (error === 'PAYMENT_REQUIRED') {
            setShowUpgradeModal(true);
          } else {
            toast.error('Failed to generate messages');
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
      'message',
      (result: { messages: MessageOutput[] }) => {
        // Found completed request
        setMessages(result.messages);
        setGeneratedTrigger(trigger || customTrigger);
        setShowCollapsedForm(true);
        setIsGenerating(false);
        toast.success('Found recently generated messages!');
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
          toast.error('Failed to generate messages');
        }
      }
    );

    // If no recent activity, ensure we're not in loading state
    if (status === 'none') {
      setIsGenerating(false);
    }
  }, []); // Only run on mount

  const generateMessages = async () => {
    if (!selectedIcp || (!trigger && !customTrigger) || !messageType) return;

    // Check usage limits before making API request
    if (!canMakeRequest()) {
      setShowUpgradeModal(true);
      return;
    }

    const currentTrigger = trigger || customTrigger;
    setIsGenerating(true);

    try {
      await startBackgroundRequest(
        '/api/messages/generate',
        {
          icpId: selectedIcp.id,
          messageType,
          trigger: currentTrigger,
          prospectInfo,
          outreachContext,
        },
        'message'
        // No callbacks - let the background system and useEffect handle completion
      );
    } catch (error) {
      toast.error('Error starting generation');
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (message: MessageOutput) => {
    const textToCopy = `Subject: ${message.subject}\n\n${message.message}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success(`${message.variant} message copied to clipboard!`);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success(`${message.variant} message copied!`);
    }
  };

  const copyAllMessages = async () => {
    if (!messages.length) return;

    const allMessages = messages.map(m =>
      `${m.variant.toUpperCase()}\nSubject: ${m.subject}\n\n${m.message}\n`
    ).join('\n---\n\n');

    const fullText = `TRIGGER: "${generatedTrigger}"\n\n${allMessages}\n---\nGenerated by ICP Pilot`;

    try {
      await navigator.clipboard.writeText(fullText);
      toast.success('All messages copied to clipboard!');
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('All messages copied!');
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
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Ready to create world-class outreach messages?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              First, let&apos;s create your Ideal Customer Profile so we can generate messages that demonstrate true sales expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" onClick={() => window.location.href = '/icp-builder'} className="bg-blue-600 hover:bg-blue-700">
                Create Your First ICP (2 minutes) →
              </Button>
              <Link href="/demo/message-generator">
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
              🎯 Here&apos;s what you&apos;ll be able to generate:
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-700 mb-2">Market Intelligence Leader</h4>
              <p className="text-gray-600 text-sm">Lead with exclusive market insights for senior executives</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-700 mb-2">Peer Advisor Approach</h4>
              <p className="text-gray-600 text-sm">Share proven results and credible case studies</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
              <h4 className="font-semibold text-purple-700 mb-2">Urgency Catalyst</h4>
              <p className="text-gray-600 text-sm">Create genuine urgency through competitive timing</p>
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
          ✉️ Expert Outreach Message Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Generate personalized messages that demonstrate sales expertise and get responses from busy executives
        </p>
      </div>

      {/* Main Input Card */}
      <Card className={`border-2 transition-all duration-500 ${showCollapsedForm ? 'shadow-sm' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Build Your Expert Outreach Message</CardTitle>
              {!showCollapsedForm && (
                <p className="text-gray-600">Create personalized outreach that positions you as a strategic advisor and gets executive attention</p>
              )}
              {showCollapsedForm && (
                <p className="text-sm text-gray-500">
                  {messageType} • &quot;{generatedTrigger}&quot;
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
          {/* Message Type */}
          <div>
            <label className="block text-lg font-semibold mb-4 text-gray-900">Outreach Channel & Approach</label>
            <div className="grid md:grid-cols-2 gap-6">
              {MESSAGE_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`p-5 border-2 rounded-lg text-left transition-all hover:shadow-lg ${
                    messageType === type.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  onClick={() => setMessageType(type.id)}
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
                  <p className="text-blue-600 text-xs font-medium">
                    <strong>Best for:</strong> {type.bestFor}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Triggers */}
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
                  onClick={() => {
                    if (trigger === preset) {
                      // Deselect if already selected
                      setTrigger('');
                    } else {
                      // Select new preset
                      setTrigger(preset);
                      setCustomTrigger('');
                    }
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Trigger */}
          <div>
            <label htmlFor="custom-trigger" className="block text-lg font-semibold mb-2 text-gray-900">Or Enter Custom Trigger</label>
            <textarea
              id="custom-trigger"
              name="custom-trigger"
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Describe the specific trigger for this outreach..."
              rows={3}
              value={customTrigger}
              onChange={(e) => {
                setCustomTrigger(e.target.value);
                setTrigger('');
              }}
            />
          </div>

          {/* Advanced Outreach Options */}
          <div>
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>{showAdvancedOptions ? '▼' : '▶'}</span>
              Advanced Market Context
            </button>

            {showAdvancedOptions && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                {/* Urgency Level */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Urgency Level</label>
                  <div className="grid md:grid-cols-3 gap-2">
                    {URGENCY_LEVELS.map((option) => (
                      <button
                        key={option.value}
                        className={`p-3 text-sm border rounded-md text-left transition-all ${
                          outreachContext.urgency === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white'
                        }`}
                        onClick={() => setOutreachContext(prev => ({ ...prev, urgency: option.value }))}
                      >
                        <div className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <span className="font-medium text-xs">{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Competitive Intelligence */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Competitive Intelligence</label>
                  <div className="grid md:grid-cols-2 gap-2">
                    {COMPETITIVE_INTEL.map((option) => (
                      <button
                        key={option.value}
                        className={`p-3 text-sm border rounded-md text-left transition-all ${
                          outreachContext.competitiveIntel === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white'
                        }`}
                        onClick={() => setOutreachContext(prev => ({ ...prev, competitiveIntel: option.value }))}
                      >
                        <div className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <span className="font-medium text-xs">{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Industry Events */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Industry Context</label>
                  <div className="grid md:grid-cols-2 gap-2">
                    {INDUSTRY_EVENTS.map((option) => (
                      <button
                        key={option.value}
                        className={`p-3 text-sm border rounded-md text-left transition-all ${
                          outreachContext.industryEvent === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white'
                        }`}
                        onClick={() => setOutreachContext(prev => ({ ...prev, industryEvent: option.value }))}
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
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="prospect-name" className="block text-sm font-medium mb-1 text-gray-700">Prospect Name</label>
                  <input
                    id="prospect-name"
                    name="prospect-name"
                    type="text"
                    className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                    placeholder="Sarah Chen"
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
                    placeholder="TechFlow Solutions"
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
                    placeholder="Recent podcast mention..."
                    value={prospectInfo.specificContext}
                    onChange={(e) => setProspectInfo(prev => ({ ...prev, specificContext: e.target.value }))}
                  />
                </div>
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="pt-4">
            <Button
              size="xl"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={generateMessages}
              disabled={isGenerating || (!trigger && !customTrigger) || !messageType}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Crafting world-class messages...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>🚀</span>
                  Generate Expert Messages (3 Variants)
                </div>
              )}
            </Button>
            {(trigger || customTrigger) && messageType && (
              <p className="text-center text-sm text-gray-500 mt-2">
                Generating {messageType.toLowerCase()} for: &quot;{trigger || customTrigger}&quot;
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
                  {messageType}
                </span>
                <span>•</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                  {trigger || customTrigger}
                </span>
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
              Edit Message Settings
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Results - 3 World-Class Message Variants */}
      {messages.length > 0 && (
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-green-800">
                ✉️ Your Expert Message Variants
              </CardTitle>
              <Button
                variant="secondary"
                size="sm"
                onClick={copyAllMessages}
              >
                📋 Copy All
              </Button>
            </div>
            <p className="text-green-700">3 world-class message variants demonstrating sales expertise</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {messages.map((message, index) => {
              // Get colors based on variant name to match home screen
              const getVariantColors = (variant: string) => {
                if (variant.includes('Peer Advisor')) {
                  return {
                    border: 'border-green-500',
                    text: 'text-green-700',
                    bg: 'bg-green-100'
                  };
                } else if (variant.includes('Urgency Catalyst')) {
                  return {
                    border: 'border-purple-500',
                    text: 'text-purple-700',
                    bg: 'bg-purple-100'
                  };
                } else {
                  // Market Intelligence Leader (default)
                  return {
                    border: 'border-blue-500',
                    text: 'text-blue-700',
                    bg: 'bg-blue-100'
                  };
                }
              };

              const colors = getVariantColors(message.variant);

              return (
              <div key={index} className={`border-l-4 ${colors.border} pl-4 py-2`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className={`font-semibold ${colors.text} mb-2`}>{message.variant}</h4>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 ${colors.bg} ${colors.text} text-xs font-medium rounded`}>{message.approach}</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">{message.bestFor}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(message)}
                  >
                    📋 Copy
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-gray-400 pl-4 py-2">
                    <h4 className={`font-semibold ${colors.text} mb-2`}>Subject Line:</h4>
                    <p className="text-gray-800">{message.subject}</p>
                  </div>
                  <div className="border-l-4 border-gray-400 pl-4 py-2">
                    <h4 className={`font-semibold ${colors.text} mb-2`}>Message:</h4>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">{message.message}</p>
                  </div>
                </div>
              </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}