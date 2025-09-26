'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import toast from 'react-hot-toast';

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
  const [showProspectInfo, setShowProspectInfo] = useState(false);
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

        // Auto-select from URL or localStorage
        const urlIcpId = searchParams.get('icpId');
        const savedIcpId = localStorage.getItem('selectedIcpId');

        if (urlIcpId && icpArray.length > 0) {
          const matchingIcp = icpArray.find((icp: ICP) => icp.id === urlIcpId);
          if (matchingIcp) {
            setSelectedIcp(matchingIcp);
          }
        } else if (savedIcpId && icpArray.length > 0) {
          const matchingIcp = icpArray.find((icp: ICP) => icp.id === savedIcpId);
          if (matchingIcp) {
            setSelectedIcp(matchingIcp);
          }
        } else if (icpArray.length > 0) {
          setSelectedIcp(icpArray[0]);
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
        toast.error('Failed to generate rebuttal');
      }
    } catch (error) {
      toast.error('Error generating rebuttal');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!rebuttal || !generatedObjection) return;

    const cleanText = `${rebuttal.reframe} ${rebuttal.evidence} ${rebuttal.bridge} ${rebuttal.microAsk}`;

    try {
      await navigator.clipboard.writeText(cleanText);
      toast.success('Rebuttal copied to clipboard!');
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = cleanText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Rebuttal copied to clipboard!');
    }
  };

  const handleUpgrade = async () => {
    const response = await fetch('/api/stripe/create-checkout', { method: 'POST' });
    if (response.ok) {
      const { url } = await response.json();
      window.location.href = url;
    }
  };

  if (icps.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your First ICP</h3>
            <p className="text-gray-600 mb-6">
              You need an Ideal Customer Profile before generating objection rebuttals
            </p>
            <Button size="lg" onClick={() => window.location.href = '/icp-builder'}>
              Create ICP →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">💪 Objection Killer</h1>
        <p className="text-xl text-gray-600">
          Generate bulletproof rebuttals that turn objections into opportunities
        </p>
      </div>

      {/* Main Input Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">What objection are you facing?</CardTitle>
          <p className="text-gray-600">Choose a common objection or enter your own</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preset Objections */}
          <div>
            <label className="block text-lg font-semibold mb-4 text-gray-900">Common Objections</label>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRESET_OBJECTIONS.map((preset) => (
                <button
                  key={preset}
                  className={`p-4 text-sm border-2 rounded-lg text-left transition-all hover:shadow-md ${
                    objection === preset
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 text-gray-800'
                  }`}
                  onClick={() => {
                    setObjection(preset);
                    setCustomObjection('');
                  }}
                >
                  "{preset}"
                </button>
              ))}
            </div>
          </div>

          {/* Custom Objection */}
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-900">Or Enter Custom Objection</label>
            <textarea
              className="w-full p-4 border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Type the exact objection you're hearing..."
              rows={3}
              value={customObjection}
              onChange={(e) => {
                setCustomObjection(e.target.value);
                setObjection('');
              }}
            />
          </div>

          {/* Prospect Info Toggle */}
          <div>
            <button
              onClick={() => setShowProspectInfo(!showProspectInfo)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2"
            >
              {showProspectInfo ? '− Hide' : '+ Add'} prospect details for personalization
            </button>

            {showProspectInfo && (
              <div className="mt-4 grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Prospect Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                    placeholder="John Smith"
                    value={prospectInfo.name}
                    onChange={(e) => setProspectInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Company</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                    placeholder="Acme Corp"
                    value={prospectInfo.company}
                    onChange={(e) => setProspectInfo(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Title</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                    placeholder="VP of Sales"
                    value={prospectInfo.title}
                    onChange={(e) => setProspectInfo(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Context</label>
                  <input
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
              size="lg"
              className="w-full text-lg py-4 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              onClick={generateRebuttal}
              disabled={isGenerating || (!objection && !customObjection)}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Crafting your rebuttal...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>🚀</span>
                  Generate Objection Killer
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
      </Card>

      {/* Results */}
      {rebuttal && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-green-800">🎯 Your Objection Killer</CardTitle>
              <Button
                size="lg"
                onClick={copyToClipboard}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                📋 Copy All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-gray-400">
              <h4 className="font-semibold text-gray-700 mb-2">Objection:</h4>
              <p className="text-gray-800 italic">"{generatedObjection}"</p>
            </div>

            <div className="grid gap-6">
              <div className="bg-white p-5 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  <span>🔄</span> 1. Reframe
                </h4>
                <p className="text-gray-800 leading-relaxed">{rebuttal.reframe}</p>
              </div>

              <div className="bg-white p-5 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <span>📊</span> 2. Evidence
                </h4>
                <p className="text-gray-800 leading-relaxed">{rebuttal.evidence}</p>
              </div>

              <div className="bg-white p-5 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                  <span>🌉</span> 3. Bridge
                </h4>
                <p className="text-gray-800 leading-relaxed">{rebuttal.bridge}</p>
              </div>

              <div className="bg-white p-5 rounded-lg border-l-4 border-orange-500">
                <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                  <span>➡️</span> 4. Next Step
                </h4>
                <p className="text-gray-800 leading-relaxed">{rebuttal.microAsk}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2">📝 Complete Response:</h4>
              <p className="text-gray-700 leading-relaxed">
                {rebuttal.reframe} {rebuttal.evidence} {rebuttal.bridge} {rebuttal.microAsk}
              </p>
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