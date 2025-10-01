'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useICP } from '@/contexts/icp-context';

interface ICPData {
  name: string;
  industry: string;
  companySize: string;
  role: string;
  painPoints: string;
  outcomes: string;
  triggers: string;
  companyName: string;
  productService: string;
  valueProposition: string;
  keyDifferentiators: string;
}

interface ICPTemplate {
  name: string;
  industry: string;
  role: string;
  painPoints: string;
  companySize: string;
  outcomes: string;
  triggers: string;
  companyName: string;
  productService: string;
}

const ICP_TEMPLATES = [
  {
    id: "saas-startup-ceos",
    name: "SaaS Startup CEOs",
    icon: "🚀",
    description: "High-growth founders scaling their first B2B SaaS product",
    approach: "Growth-Focused",
    bestFor: "Early-stage sales automation and productivity tools",
    industry: "B2B SaaS",
    role: "CEO, Founder, Co-founder",
    painPoints: "Scaling challenges, limited resources, need to prove ROI, fast growth pressure",
    companySize: "10-50 employees, $1M-$10M ARR",
    outcomes: "Faster growth, improved efficiency, reduced costs, better team productivity",
    triggers: "Fundraising rounds, hiring sprees, product launches, scaling pains",
    companyName: "[Your Company]",
    productService: "Sales automation software that helps startups streamline their sales process and increase conversion rates"
  },
  {
    id: "marketing-directors",
    name: "Marketing Directors",
    icon: "📊",
    description: "Growth marketing leaders driving demand generation",
    approach: "Data-Driven",
    bestFor: "Marketing analytics and attribution platforms",
    industry: "Technology, SaaS",
    role: "Marketing Director, VP Marketing, CMO",
    painPoints: "Lead quality issues, attribution problems, budget constraints, proving ROI",
    companySize: "50-500 employees, $10M-$100M revenue",
    outcomes: "Better lead quality, clear attribution, increased conversions, marketing efficiency",
    triggers: "New marketing budget, leadership changes, poor campaign performance",
    companyName: "[Your Company]",
    productService: "Marketing analytics platform that provides clear attribution and ROI tracking for marketing campaigns"
  },
  {
    id: "sales-vps",
    name: "Sales VPs",
    icon: "🎯",
    description: "Sales leaders building and scaling high-performance teams",
    approach: "Performance-Driven",
    bestFor: "Sales enablement and team productivity solutions",
    industry: "B2B Services, Technology",
    role: "VP Sales, Sales Director, Head of Sales",
    painPoints: "Team productivity, quota attainment, long sales cycles, inconsistent messaging",
    companySize: "25-200 employees",
    outcomes: "Higher close rates, shorter sales cycles, team consistency, revenue growth",
    triggers: "Missing quota, new sales leadership, team scaling, competitive pressure",
    companyName: "[Your Company]",
    productService: "Sales enablement platform that provides consistent messaging, training, and performance tracking for sales teams"
  },
  {
    id: "operations-leaders",
    name: "Operations Leaders",
    icon: "⚙️",
    description: "Operations executives optimizing business processes",
    approach: "Efficiency-Focused",
    bestFor: "Workflow automation and compliance solutions",
    industry: "Manufacturing, Healthcare, Logistics",
    role: "COO, Operations Director, VP Operations",
    painPoints: "Process inefficiencies, manual workflows, compliance issues, scaling operations",
    companySize: "100-1000 employees",
    outcomes: "Streamlined processes, automation, compliance confidence, operational efficiency",
    triggers: "Audit findings, process failures, rapid growth, regulatory changes",
    companyName: "[Your Company]",
    productService: "Operations management software that automates workflows and ensures compliance across complex business processes"
  }
];

export function ICPBuilder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setSelectedIcpId, refreshIcps } = useICP();
  const isEditing = searchParams.get('edit') === 'true';
  const editId = searchParams.get('id');

  const [step, setStep] = useState<'template' | 'core' | 'advanced'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ICPTemplate | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCreatingSample, setIsCreatingSample] = useState(false);

  const [icp, setIcp] = useState<ICPData>({
    name: searchParams.get('name') || '',
    industry: searchParams.get('industry') || '',
    companySize: searchParams.get('companySize') || '',
    role: searchParams.get('role') || '',
    painPoints: searchParams.get('painPoints') || '',
    outcomes: searchParams.get('outcomes') || '',
    triggers: searchParams.get('triggers') || '',
    companyName: searchParams.get('companyName') || '',
    productService: searchParams.get('productService') || '',
    valueProposition: searchParams.get('valueProposition') || '',
    keyDifferentiators: searchParams.get('keyDifferentiators') || '',
  });

  const [isLoading, setIsLoading] = useState(false);

  // If editing, skip template selection
  useState(() => {
    if (isEditing) {
      setStep('core');
      setShowAdvanced(true);
    }
  });

  const handleTemplateSelect = (template: ICPTemplate) => {
    setSelectedTemplate(template);
    setIcp(prev => ({
      ...prev,
      name: template.name,
      industry: template.industry,
      role: template.role,
      painPoints: template.painPoints,
      companySize: template.companySize,
      outcomes: template.outcomes,
      triggers: template.triggers,
      companyName: template.companyName,
      productService: template.productService
    }));
    setStep('core');
  };

  const handleCustomStart = () => {
    setSelectedTemplate(null);
    setStep('core');
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
        toast.success('🎯 Sample ICP imported! Perfect for learning world-class frameworks.');

        // Auto-select the newly created sample ICP
        if (data.icp && data.icp.id) {
          setSelectedIcpId(data.icp.id);
          // Refresh to ensure the ICP list is current
          await refreshIcps();
        }

        // Redirect to qualification framework to show the new ICP in action
        router.push('/qualification-framework');
      } else {
        toast.error('Failed to import sample ICP');
      }
    } catch (error) {
      toast.error('Error importing sample ICP');
    } finally {
      setIsCreatingSample(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const url = isEditing ? `/api/icps/${editId}` : '/api/icps';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(icp),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(isEditing ? 'ICP updated successfully!' : 'ICP saved! Ready to generate sales assets.');

        if (isEditing) {
          // For edits, refresh the ICPs to get updated data
          await refreshIcps();
          router.push('/dashboard');
        } else {
          // For new ICPs, auto-select the newly created ICP
          if (data.icp && data.icp.id) {
            setSelectedIcpId(data.icp.id);
            // Also refresh to ensure the ICP list is current
            await refreshIcps();
          }
          router.push(`/icp-builder/success?name=${encodeURIComponent(icp.name)}`);
        }
      } else {
        toast.error('Failed to save ICP');
      }
    } catch (error) {
      toast.error('Error saving ICP');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidCore = icp.name && icp.industry && icp.role && icp.painPoints && icp.companyName && icp.productService;

  // Template Selection Step
  if (step === 'template' && !isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Create Your Ideal Customer Profile
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose from expert-crafted templates or build from scratch to define your perfect customer
          </p>
        </div>

        {/* Educational Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              💡 Why Build ICPs First?
            </h3>
            <p className="text-blue-700 text-sm max-w-2xl mx-auto">
              Strong ICPs power everything: targeted messaging, smart objection handling, and qualification frameworks that position you as an expert. Start here to unlock world-class sales tools.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {ICP_TEMPLATES.map((template, index) => (
            <button
              key={index}
              className="p-6 border-2 rounded-lg text-left transition-all duration-500 hover:shadow-lg transform hover:-translate-y-1 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="text-3xl">{template.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {template.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {template.approach}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">{template.description}</p>
              <p className="text-blue-600 text-xs font-medium mb-4">
                <strong>Best for:</strong> {template.bestFor}
              </p>

              <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Industry:</span>
                  <span className="text-gray-800">{template.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Role:</span>
                  <span className="text-gray-800">{template.role}</span>
                </div>
                <div className="border-t pt-2">
                  <span className="font-medium text-gray-600">Company Size:</span>
                  <p className="text-gray-800 text-xs mt-1">{template.companySize}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center space-y-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleCustomStart}
            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          >
            ✨ Or start from scratch →
          </Button>
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={createSampleICP}
              disabled={isCreatingSample}
            >
              {isCreatingSample ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Creating...
                </div>
              ) : (
                <>🎯 Import Expert Template</>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Core Fields Step
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎯 {isEditing ? 'Edit Your ICP' : 'Build Your Expert ICP'}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
          Create a comprehensive customer profile that powers world-class sales tools
        </p>
        {selectedTemplate && (
          <div className="flex items-center justify-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded text-sm max-w-md mx-auto">
            <span>{selectedTemplate.icon}</span>
            <span>Using template: {selectedTemplate.name}</span>
          </div>
        )}
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <span>📋</span> Essential Information
          </CardTitle>
          <p className="text-gray-600">These 6 core fields power personalized messaging, objection handling, and expert qualification frameworks</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ICP Name */}
          <div>
            <label htmlFor="icp-name" className="block text-sm font-semibold mb-2 text-gray-900">
              ICP Name <span className="text-red-500">*</span>
            </label>
            <input
              id="icp-name"
              name="icp-name"
              type="text"
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="e.g., SaaS Startup CEOs, Marketing Directors, Sales VPs"
              value={icp.name}
              onChange={(e) => setIcp(prev => ({ ...prev, name: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">What do you call this customer segment?</p>
          </div>

          {/* Company Info Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🏢</span> Your Company & Solution
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Why this matters:</strong> Company details help generate personalized objection rebuttals, value-based messaging, and credible evidence for your sales conversations.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="company-name" className="block text-sm font-semibold mb-2 text-gray-900">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="company-name"
                  name="company-name"
                  type="text"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="e.g., Acme Solutions, YourStartup Inc."
                  value={icp.companyName}
                  onChange={(e) => setIcp(prev => ({ ...prev, companyName: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="product-service" className="block text-sm font-semibold mb-2 text-gray-900">
                  What You Offer <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="product-service"
                  name="product-service"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl h-24 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Brief description of your product or service. What does it do? What problem does it solve?"
                  value={icp.productService}
                  onChange={(e) => setIcp(prev => ({ ...prev, productService: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">Used to create relevant value propositions and objection responses</p>
              </div>
            </div>
          </div>

          {/* Target Customer Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🎯</span> Target Customer Profile
            </h3>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="industry" className="block text-sm font-semibold mb-2 text-gray-900">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="industry"
                    name="industry"
                    type="text"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g., B2B SaaS, Healthcare, E-commerce"
                    value={icp.industry}
                    onChange={(e) => setIcp(prev => ({ ...prev, industry: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-semibold mb-2 text-gray-900">
                    Decision Maker Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="role"
                    name="role"
                    type="text"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g., CEO, VP Sales, Marketing Director"
                    value={icp.role}
                    onChange={(e) => setIcp(prev => ({ ...prev, role: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pain-points" className="block text-sm font-semibold mb-2 text-gray-900">
                  Primary Pain Points <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="pain-points"
                  name="pain-points"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl h-24 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="What keeps them up at night? What problems are they struggling with?"
                  value={icp.painPoints}
                  onChange={(e) => setIcp(prev => ({ ...prev, painPoints: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple pain points with commas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional Fields Toggle */}
      {!showAdvanced && (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(true)}
            className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-6 py-3 rounded-lg"
          >
            <span className="mr-2">✨</span>
            Add Expert Details (value proposition, outcomes, triggers)
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Unlock even more sophisticated sales content
          </p>
        </div>
      )}

      {/* Optional Fields */}
      {showAdvanced && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-green-800">
              <span>✨</span> Expert Details
            </CardTitle>
            <p className="text-green-700">Additional fields that unlock sophisticated, personalized sales content and positioning</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enhanced Company Info */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>🏢</span> Enhanced Company Info
              </h3>
              <p className="text-sm text-gray-600 mb-4">Positioning and differentiation that powers credible objection responses</p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="value-proposition" className="block text-sm font-medium mb-2 text-gray-900">Value Proposition</label>
                  <textarea
                    id="value-proposition"
                    name="value-proposition"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl h-20 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Why should they buy from you? What's the key benefit or outcome?"
                    value={icp.valueProposition}
                    onChange={(e) => setIcp(prev => ({ ...prev, valueProposition: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor="key-differentiators" className="block text-sm font-medium mb-2 text-gray-900">Key Differentiators</label>
                  <textarea
                    id="key-differentiators"
                    name="key-differentiators"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl h-20 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="What makes you different from competitors? Separate with commas"
                    value={icp.keyDifferentiators}
                    onChange={(e) => setIcp(prev => ({ ...prev, keyDifferentiators: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>🎯</span> Strategic Customer Intelligence
              </h3>
              <p className="text-sm text-gray-600 mb-4">Business context that enables sophisticated discovery and timing</p>

              <div>
                <label htmlFor="company-size" className="block text-sm font-medium mb-2 text-gray-900">Company Size</label>
                <input
                  id="company-size"
                  name="company-size"
                  type="text"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="e.g., 10-50 employees, $1M-$10M ARR"
                  value={icp.companySize}
                  onChange={(e) => setIcp(prev => ({ ...prev, companySize: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="desired-outcomes" className="block text-sm font-medium mb-2 text-gray-900">Desired Outcomes</label>
                <textarea
                  id="desired-outcomes"
                  name="desired-outcomes"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl h-20 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="What success looks like for them, what goals they want to achieve"
                  value={icp.outcomes}
                  onChange={(e) => setIcp(prev => ({ ...prev, outcomes: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="trigger-events" className="block text-sm font-medium mb-2 text-gray-900">Trigger Events</label>
                <textarea
                  id="trigger-events"
                  name="trigger-events"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl h-20 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="What events make them likely to buy? (funding, hiring, growth, etc.)"
                  value={icp.triggers}
                  onChange={(e) => setIcp(prev => ({ ...prev, triggers: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="pt-4 pb-8">
        <Button
          size="lg"
          className="w-full text-lg py-4"
          onClick={handleSave}
          disabled={isLoading || !isValidCore}
        >
          {isLoading ? 'Saving...' : (
            isEditing ? 'Update ICP' :
            isValidCore ? '🚀 Save ICP & Start Generating Assets' :
            'Complete required fields to continue'
          )}
        </Button>
        {isValidCore && !isEditing && (
          <p className="text-center text-sm text-gray-500 mt-2">
            You can always add more details later
          </p>
        )}
      </div>
    </div>
  );
}