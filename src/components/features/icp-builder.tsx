'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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

const ICP_TEMPLATES: ICPTemplate[] = [
  {
    name: "SaaS Startup CEOs",
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
    name: "Marketing Directors",
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
    name: "Sales VPs",
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
    name: "Operations Leaders",
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
  const isEditing = searchParams.get('edit') === 'true';
  const editId = searchParams.get('id');

  const [step, setStep] = useState<'template' | 'core' | 'advanced'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ICPTemplate | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
        toast.success(isEditing ? 'ICP updated successfully!' : 'ICP saved! Ready to generate sales assets.');
        router.push('/dashboard');
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Create Your Ideal Customer Profile
          </h1>
          <p className="text-lg text-gray-600">
            Choose a template to get started quickly, or build from scratch
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {ICP_TEMPLATES.map((template, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  {template.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Industry:</span>
                    <p className="text-gray-600">{template.industry}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Role:</span>
                    <p className="text-gray-600">{template.role}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Key Pain Points:</span>
                    <p className="text-gray-600">{template.painPoints}</p>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Use This Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleCustomStart}
            className="text-gray-600 hover:text-gray-900"
          >
            Or start from scratch →
          </Button>
        </div>
      </div>
    );
  }

  // Core Fields Step
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Edit Your ICP' : 'Build Your ICP'}
        </h1>
        {selectedTemplate && (
          <div className="flex items-center justify-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full text-sm">
            <span>🎯</span>
            <span>Using template: {selectedTemplate.name}</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Essential Information</CardTitle>
          <p className="text-gray-600">These 6 fields ensure high-quality, personalized sales assets</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ICP Name */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              ICP Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-4 border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
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
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-4 border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="e.g., Acme Solutions, YourStartup Inc."
                  value={icp.companyName}
                  onChange={(e) => setIcp(prev => ({ ...prev, companyName: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  What You Offer <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full p-4 border-2 rounded-lg h-24 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
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
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-4 border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="e.g., B2B SaaS, Healthcare, E-commerce"
                    value={icp.industry}
                    onChange={(e) => setIcp(prev => ({ ...prev, industry: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    Decision Maker Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-4 border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="e.g., CEO, VP Sales, Marketing Director"
                    value={icp.role}
                    onChange={(e) => setIcp(prev => ({ ...prev, role: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  Primary Pain Points <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full p-4 border-2 rounded-lg h-24 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
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
            className="text-blue-600 hover:text-blue-700"
          >
            + Add optional details (value proposition, outcomes, triggers)
          </Button>
        </div>
      )}

      {/* Optional Fields */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle>Optional Details</CardTitle>
            <p className="text-gray-600">Additional fields for even more targeted outputs</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enhanced Company Info */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Company Info</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Value Proposition</label>
                  <textarea
                    className="w-full p-3 border rounded-lg h-20 text-gray-900 placeholder-gray-400"
                    placeholder="Why should they buy from you? What's the key benefit or outcome?"
                    value={icp.valueProposition}
                    onChange={(e) => setIcp(prev => ({ ...prev, valueProposition: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Key Differentiators</label>
                  <textarea
                    className="w-full p-3 border rounded-lg h-20 text-gray-900 placeholder-gray-400"
                    placeholder="What makes you different from competitors? Separate with commas"
                    value={icp.keyDifferentiators}
                    onChange={(e) => setIcp(prev => ({ ...prev, keyDifferentiators: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Company Size</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg text-gray-900 placeholder-gray-400"
                  placeholder="e.g., 10-50 employees, $1M-$10M ARR"
                  value={icp.companySize}
                  onChange={(e) => setIcp(prev => ({ ...prev, companySize: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Desired Outcomes</label>
                <textarea
                  className="w-full p-3 border rounded-lg h-20 text-gray-900 placeholder-gray-400"
                  placeholder="What success looks like for them, what goals they want to achieve"
                  value={icp.outcomes}
                  onChange={(e) => setIcp(prev => ({ ...prev, outcomes: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Trigger Events</label>
                <textarea
                  className="w-full p-3 border rounded-lg h-20 text-gray-900 placeholder-gray-400"
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