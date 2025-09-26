'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UpgradeModal } from '@/components/ui/upgrade-modal';

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

interface ObjectionRebuttal {
  objection: string;
  reframe: string;
  evidence: string;
  bridge: string;
  microAsk: string;
}

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

export function ObjectionKiller() {
  const [icps, setIcps] = useState<ICP[]>([]);
  const searchParams = useSearchParams();
  const [selectedIcp, setSelectedIcp] = useState<ICP | null>(null);
  const [objection, setObjection] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [customObjection, setCustomObjection] = useState('');
  const [rebuttal, setRebuttal] = useState<ObjectionRebuttal | null>(null);
  const [generatedObjection, setGeneratedObjection] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prospectInfo, setProspectInfo] = useState({
  name: '',
  company: '',
  title: '',
  specificContext: ''
});

  useEffect(() => {
  fetch('/api/icps')
    .then(res => res.json())
    .then(data => {
      const icpArray = data.icps || data || [];
      setIcps(icpArray);
      
      // Auto-select ICP from URL if present
      const urlIcpId = searchParams.get('icpId');
      if (urlIcpId && icpArray.length > 0) {
        const matchingIcp = icpArray.find((icp: ICP) => icp.id === urlIcpId);
        if (matchingIcp) {
          setSelectedIcp(matchingIcp);
        }
      }
    });
}, [searchParams]);

  const generateRebuttal = async () => {
  if (!selectedIcp || (!objection && !customObjection)) return;

  const currentObjection = objection || customObjection;
  setIsGenerating(true);
  
  try {
    const response = await fetch('/api/objections/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        icpId: selectedIcp.id,
        objection: currentObjection,
        prospectInfo,
      }),
    });

    if (response.status === 402) {
      setShowUpgradeModal(true);
    } else if (response.ok) {
      const data = await response.json();
      setRebuttal(data.rebuttal);
      setGeneratedObjection(currentObjection);
    } else {
      alert('Failed to generate rebuttal');
    }
  } catch (error) {
    alert('Error generating rebuttal');
  } finally {
    setIsGenerating(false);
  }
};

  const copyToClipboard = async () => {
    if (!rebuttal || !generatedObjection) return;
    
    const cleanText = `${rebuttal.reframe} ${rebuttal.evidence} ${rebuttal.bridge} ${rebuttal.microAsk}`;
    
    try {
      await navigator.clipboard.writeText(cleanText);
      alert('Rebuttal copied to clipboard!');
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = cleanText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Rebuttal copied to clipboard!');
    }
  };
    const handleUpgrade = async () => {
      const response = await fetch('/api/stripe/create-checkout', { method: 'POST' });
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    };

  return (
  <div className="space-y-6">
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
            <CardTitle>Choose or Enter Objection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">Common Objections</label>
              <div className="grid md:grid-cols-3 gap-2">
                {PRESET_OBJECTIONS.map((preset) => (
                  <button
                    key={preset}
                    className={`p-2 text-sm border rounded text-left transition-colors ${
                      objection === preset
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-800'
                    }`}
                    onClick={() => {
                      setObjection(preset);
                      setCustomObjection('');
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">Or Enter Custom Objection</label>
              <input
                type="text"
                className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                placeholder="We're locked into a contract"
                value={customObjection}
                onChange={(e) => {
                  setCustomObjection(e.target.value);
                  setObjection('');
                }}
              />
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

            <Button
              size="lg"
              className="w-full"
              onClick={generateRebuttal}
              disabled={isGenerating || (!objection && !customObjection)}
            >
              {isGenerating ? 'Generating Rebuttal...' : 'Generate Objection Killer'}
            </Button>
          </CardContent>
        </Card>
      )}

      {rebuttal && (
        <Card>
          <CardHeader>
            <CardTitle>Your Objection Killer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Objection:</h4>
              <p className="text-gray-800">"{generatedObjection}"</p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-600 mb-2">Reframe:</h4>
                <p className="text-gray-800">{rebuttal.reframe}</p>
              </div>

              <div>
                <h4 className="font-medium text-blue-600 mb-2">Evidence:</h4>
                <p className="text-gray-800">{rebuttal.evidence}</p>
              </div>

              <div>
                <h4 className="font-medium text-blue-600 mb-2">Bridge:</h4>
                <p className="text-gray-800">{rebuttal.bridge}</p>
              </div>

              <div>
                <h4 className="font-medium text-blue-600 mb-2">Micro-ask:</h4>
                <p className="text-gray-800">{rebuttal.microAsk}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={copyToClipboard}>
                Copy to Clipboard
              </Button>
            </div>
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