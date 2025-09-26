'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ICP {
  id: string;
  name: string;
  industry: string;
  companySize: string;
  role: string;
  painPoints: string[];
  outcomes: string[];
  triggers: string[];
}

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
  disqualifySignals: string[];
}

const FRAMEWORK_TYPES = [
  "BANT (Budget, Authority, Need, Timeline)",
  "MEDDIC (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion)", 
  "CHAMP (Challenges, Authority, Money, Prioritization)",
  "SPICED (Situation, Pain, Impact, Critical Event, Decision)"
];

export function QualificationFramework() {
  const [icps, setIcps] = useState<ICP[]>([]);
  const [selectedIcp, setSelectedIcp] = useState<ICP | null>(null);
  const searchParams = useSearchParams();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [frameworkType, setFrameworkType] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [prospectInfo, setProspectInfo] = useState({
    name: '',
    company: '',
    title: '',
    specificContext: ''
  });
  const [framework, setFramework] = useState<QualificationFramework | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
  fetch('/api/icps')
    .then(res => res.json())
    .then(data => {
      const icpArray = data.icps || data || [];
      setIcps(icpArray);
      
      // Auto-select ICP from URL if present
      const urlIcpId = searchParams.get('icpId');
      if (urlIcpId && icpArray.length > 0) {
        const matchingIcp = icpArray.find((icp: any) => icp.id === urlIcpId);
        if (matchingIcp) {
          setSelectedIcp(matchingIcp);
        }
      }
    });
}, [searchParams]);

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
          prospectInfo
        }),
      });

      if (response.status === 402) {
        setShowUpgradeModal(true);
      } else if (response.ok) {
        const data = await response.json();
        setFramework(data.framework);
      } else {
        alert('Failed to generate framework');
      }
    } catch (error) {
      alert('Error generating framework');
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
    
    let text = `QUALIFICATION FRAMEWORK\n\n`;
    text += `DISCOVERY QUESTIONS:\n`;
    framework.discoveryQuestions.forEach((q, i) => {
      text += `\n${i + 1}. ${q.category}: ${q.question}\n`;
      text += `   Listen for: ${q.listenFor.join(', ')}\n`;
    });
    
    text += `\nSCORING SYSTEM:\n`;
    framework.scoringSystem.forEach((s, i) => {
      text += `\n${s.criteria}:\n`;
      text += `  🟢 Green: ${s.green}\n`;
      text += `  🟡 Yellow: ${s.yellow}\n`;
      text += `  🔴 Red: ${s.red}\n`;
    });
    
    text += `\nDISQUALIFY SIGNALS:\n`;
    framework.disqualifySignals.forEach((signal, i) => {
      text += `• ${signal}\n`;
    });
    
    try {
      await navigator.clipboard.writeText(text);
      alert('Framework copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
  <div>
      {/* ICP Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your ICP</CardTitle>
        </CardHeader>
        <CardContent>
          {icps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-800 mb-4">No ICPs found. Create one first.</p>
              <Button variant="outline">
                <a href="/icp-builder">Create ICP</a>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {icps.map((icp) => (
                <div
                  key={icp.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedIcp?.id === icp.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedIcp(icp)}
                >
                  <h3 className="font-medium text-gray-900">{icp.name}</h3>
                  <p className="text-sm text-gray-800">{icp.industry}</p>
                  <p className="text-xs text-gray-700">{icp.role}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedIcp && (
        <Card>
          <CardHeader>
            <CardTitle>Framework Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Framework Type */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">Qualification Framework</label>
              <div className="grid md:grid-cols-2 gap-2">
                {FRAMEWORK_TYPES.map((type) => (
                  <button
                    key={type}
                    className={`p-3 text-sm border rounded text-left transition-colors ${
                      frameworkType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-800'
                    }`}
                    onClick={() => setFrameworkType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Prospect Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Prospect Name (Optional)</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                  placeholder="John Smith"
                  value={prospectInfo.name}
                  onChange={(e) => setProspectInfo(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Company (Optional)</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                  placeholder="Acme Corp"
                  value={prospectInfo.company}
                  onChange={(e) => setProspectInfo(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Title (Optional)</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                  placeholder="VP of Sales"
                  value={prospectInfo.title}
                  onChange={(e) => setProspectInfo(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Context (Optional)</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                  placeholder="Saw their post about scaling challenges"
                  value={prospectInfo.specificContext}
                  onChange={(e) => setProspectInfo(prev => ({ ...prev, specificContext: e.target.value }))}
                />
              </div>
            </div>

            {/* Custom Context */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">Additional Context (Optional)</label>
              <textarea
                className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400 h-24"
                placeholder="Any specific qualification requirements, deal sizes, or sales process notes..."
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
              />
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={generateFramework}
              disabled={isGenerating || !frameworkType}
            >
              {isGenerating ? 'Generating Framework...' : 'Generate Qualification Framework'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Framework */}
      {framework && (
        <div className="space-y-6">
          {/* Discovery Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Discovery Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {framework.discoveryQuestions.map((q, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">{q.category}</h4>
                    <p className="text-gray-800 mt-1">{q.question}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Listen for:</span> {q.listenFor.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scoring System */}
          <Card>
            <CardHeader>
              <CardTitle>Scoring System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {framework.scoringSystem.map((score, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{score.criteria}</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">🟢 Green:</span>
                        <span className="text-gray-800">{score.green}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">🟡 Yellow:</span>
                        <span className="text-gray-800">{score.yellow}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">🔴 Red:</span>
                        <span className="text-gray-800">{score.red}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disqualify Signals */}
          <Card>
            <CardHeader>
              <CardTitle>Automatic Disqualifiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {framework.disqualifySignals.map((signal, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span className="text-gray-800">{signal}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyFramework}>
              Copy Framework
            </Button>
          </div>
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