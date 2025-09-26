'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams, useRouter } from 'next/navigation';

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

export function ICPBuilder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isEditing = searchParams.get('edit') === 'true';
  const editId = searchParams.get('id');

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
        alert(isEditing ? 'ICP updated successfully!' : 'ICP saved successfully!');
        router.push('/icp-builder/manage');
      } else {
        alert('Failed to save ICP');
      }
    } catch (error) {
      alert('Error saving ICP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div>
      <Card>
        <CardHeader>
          <CardTitle>Build Your Ideal Customer Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ICP Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">ICP Name</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
              placeholder="e.g., SaaS Startup Founders"
              value={icp.name}
              onChange={(e) => setIcp(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* Company/Value Prop Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Company & Offering</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Company Name</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                  placeholder="e.g., Acme Solutions"
                  value={icp.companyName}
                  onChange={(e) => setIcp(prev => ({ ...prev, companyName: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">What You Offer</label>
                <textarea
                  className="w-full p-3 border rounded-md h-24 text-gray-900 placeholder-gray-400"
                  placeholder="Describe your product or service. What does it do? What problem does it solve?"
                  value={icp.productService}
                  onChange={(e) => setIcp(prev => ({ ...prev, productService: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Value Proposition</label>
                <textarea
                  className="w-full p-3 border rounded-md h-24 text-gray-900 placeholder-gray-400"
                  placeholder="Why should they buy from you? What's the key benefit or outcome you deliver?"
                  value={icp.valueProposition}
                  onChange={(e) => setIcp(prev => ({ ...prev, valueProposition: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Key Differentiators</label>
                <textarea
                  className="w-full p-3 border rounded-md h-20 text-gray-900 placeholder-gray-400"
                  placeholder="What makes you different from competitors? Separate with commas"
                  value={icp.keyDifferentiators}
                  onChange={(e) => setIcp(prev => ({ ...prev, keyDifferentiators: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">e.g., 10x faster implementation, AI-powered, no coding required</p>
              </div>
            </div>
          </div>

          {/* Target Customer Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Customer Profile</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Industry</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                  placeholder="e.g., SaaS, Healthcare, E-commerce"
                  value={icp.industry}
                  onChange={(e) => setIcp(prev => ({ ...prev, industry: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Company Size</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                  placeholder="e.g., 10-50 employees, $1M-$10M ARR"
                  value={icp.companySize}
                  onChange={(e) => setIcp(prev => ({ ...prev, companySize: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 text-gray-900">Decision Maker Role</label>
              <input
                type="text"
                className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                placeholder="e.g., CEO, VP Sales, Marketing Director"
                value={icp.role}
                onChange={(e) => setIcp(prev => ({ ...prev, role: e.target.value }))}
              />
            </div>
          </div>

          {/* Pain Points */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">Primary Pain Points</label>
            <textarea
              className="w-full p-3 border rounded-md h-24 text-gray-900 placeholder-gray-400"
              placeholder="What problems keep them up at night? What challenges are they facing?"
              value={icp.painPoints}
              onChange={(e) => setIcp(prev => ({ ...prev, painPoints: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple pain points with commas</p>
          </div>

          {/* Desired Outcomes */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">Desired Outcomes</label>
            <textarea
              className="w-full p-3 border rounded-md h-24 text-gray-900 placeholder-gray-400"
              placeholder="What success looks like for them? What goals are they trying to achieve?"
              value={icp.outcomes}
              onChange={(e) => setIcp(prev => ({ ...prev, outcomes: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple outcomes with commas</p>
          </div>

          {/* Trigger Events */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">Trigger Events</label>
            <textarea
              className="w-full p-3 border rounded-md h-24 text-gray-900 placeholder-gray-400"
              placeholder="What events make them likely to buy? (New funding, leadership changes, growth spurts, etc.)"
              value={icp.triggers}
              onChange={(e) => setIcp(prev => ({ ...prev, triggers: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">When are they most likely to need your solution?</p>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button 
              size="lg" 
              className="w-full" 
              onClick={handleSave}
              disabled={isLoading || !icp.name || !icp.industry || !icp.companyName || !icp.productService}
            >
              {isLoading ? 'Saving...' : (isEditing ? 'Update ICP' : 'Save ICP & Start Generating Assets')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}