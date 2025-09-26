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

interface MessageOutput {
  subject: string;
  message: string;
  variant: string;
}

const PRESET_TRIGGERS = [
  "Just received funding",
  "New leadership hired",
  "Recently posted job openings",
  "Mentioned growth challenges",
  "Posted about scaling issues",
  "Shared industry article",
  "Company milestone/anniversary",
  "Product launch announcement",
  "Hiring sales team"
];

const MESSAGE_TYPES = [
  { id: "Cold LinkedIn Message", icon: "💼", description: "Professional LinkedIn outreach" },
  { id: "Cold Email", icon: "📧", description: "Direct email approach" },
  { id: "Follow-up Email", icon: "🔄", description: "After initial contact" },
  { id: "LinkedIn Connection Request", icon: "🤝", description: "Connection with note" }
];

export function MessageGenerator() {
  const [icps, setIcps] = useState<ICP[]>([]);
  const [selectedIcp, setSelectedIcp] = useState<ICP | null>(null);
  const searchParams = useSearchParams();
  const [messageType, setMessageType] = useState('');
  const [trigger, setTrigger] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [customTrigger, setCustomTrigger] = useState('');
  const [showProspectInfo, setShowProspectInfo] = useState(false);
  const [prospectInfo, setProspectInfo] = useState({
    name: '',
    company: '',
    title: '',
    specificContext: ''
  });
  const [messages, setMessages] = useState<MessageOutput[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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
          const matchingIcp = icpArray.find((icp: any) => icp.id === urlIcpId);
          if (matchingIcp) {
            setSelectedIcp(matchingIcp);
          }
        } else if (savedIcpId && icpArray.length > 0) {
          const matchingIcp = icpArray.find((icp: any) => icp.id === savedIcpId);
          if (matchingIcp) {
            setSelectedIcp(matchingIcp);
          }
        } else if (icpArray.length > 0) {
          setSelectedIcp(icpArray[0]);
        }
      });
  }, [searchParams]);

  const generateMessages = async () => {
    if (!selectedIcp || !messageType || (!trigger && !customTrigger)) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/messages/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          icpId: selectedIcp.id,
          messageType,
          trigger: trigger || customTrigger,
          prospectInfo
        }),
      });

      if (response.status === 402) {
        setShowUpgradeModal(true);
      } else if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      } else {
        toast.error('Failed to generate messages');
      }
    } catch (error) {
      toast.error('Error generating messages');
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

  const copyMessage = async (message: MessageOutput) => {
    const fullMessage = `Subject: ${message.subject}\n\n${message.message}`;

    try {
      await navigator.clipboard.writeText(fullMessage);
      toast.success('Message copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
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
              You need an Ideal Customer Profile before generating messages
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">✉️ Message Generator</h1>
        <p className="text-xl text-gray-600">
          Create personalized outreach that gets responses and opens doors
        </p>
      </div>

      {/* Main Input Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">What type of message do you need?</CardTitle>
          <p className="text-gray-600">Choose your outreach format and trigger event</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message Type Selection */}
          <div>
            <label className="block text-lg font-semibold mb-4 text-gray-900">Message Type</label>
            <div className="grid md:grid-cols-2 gap-4">
              {MESSAGE_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                    messageType === type.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setMessageType(type.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{type.icon}</span>
                    <span className={`font-semibold ${messageType === type.id ? 'text-blue-700' : 'text-gray-900'}`}>
                      {type.id}
                    </span>
                  </div>
                  <p className={`text-sm ${messageType === type.id ? 'text-blue-600' : 'text-gray-600'}`}>
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Events */}
          <div>
            <label className="block text-lg font-semibold mb-4 text-gray-900">Trigger Event</label>
            <p className="text-sm text-gray-600 mb-3">What prompted you to reach out?</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {PRESET_TRIGGERS.map((preset) => (
                <button
                  key={preset}
                  className={`p-3 text-sm border-2 rounded-lg text-left transition-all hover:shadow-md ${
                    trigger === preset
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 text-gray-800'
                  }`}
                  onClick={() => {
                    setTrigger(preset);
                    setCustomTrigger('');
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Or Enter Custom Trigger</label>
              <textarea
                className="w-full p-3 border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Describe the specific trigger event..."
                rows={2}
                value={customTrigger}
                onChange={(e) => {
                  setCustomTrigger(e.target.value);
                  setTrigger('');
                }}
              />
            </div>
          </div>

          {/* Prospect Info Toggle */}
          <div>
            <button
              onClick={() => setShowProspectInfo(!showProspectInfo)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2 mb-4"
            >
              {showProspectInfo ? '− Hide' : '+ Add'} prospect details for personalization
            </button>

            {showProspectInfo && (
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
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
                  <label className="block text-sm font-medium mb-1 text-gray-700">Additional Context</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                    placeholder="Recent LinkedIn activity, news..."
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
              onClick={generateMessages}
              disabled={isGenerating || !messageType || (!trigger && !customTrigger)}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Crafting your messages...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>🚀</span>
                  Generate 3 Message Variants
                </div>
              )}
            </Button>
            {(messageType && (trigger || customTrigger)) && (
              <p className="text-center text-sm text-gray-500 mt-2">
                Creating {messageType.toLowerCase()} for: "{trigger || customTrigger}"
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Messages */}
      {messages.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">📬 Your Message Variants</h2>
            <p className="text-gray-600">Three different approaches to test what resonates</p>
          </div>

          {messages.map((message, index) => {
            const variantColors = ['border-blue-200 bg-blue-50', 'border-green-200 bg-green-50', 'border-purple-200 bg-purple-50'];
            const variantTextColors = ['text-blue-800', 'text-green-800', 'text-purple-800'];
            const buttonColors = ['bg-blue-600 hover:bg-blue-700', 'bg-green-600 hover:bg-green-700', 'bg-purple-600 hover:bg-purple-700'];

            return (
              <Card key={index} className={`${variantColors[index]} border-2`}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className={`text-xl ${variantTextColors[index]}`}>
                        📝 Variant {index + 1}: {message.variant}
                      </CardTitle>
                    </div>
                    <Button
                      onClick={() => copyMessage(message)}
                      className={`${buttonColors[index]} text-white`}
                    >
                      📋 Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-gray-400">
                    <h4 className="font-semibold text-gray-700 mb-2">Subject Line:</h4>
                    <p className="text-gray-800 font-medium">{message.subject}</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-700 mb-3">Message:</h4>
                    <div className="prose prose-sm max-w-none">
                      <pre className="text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                        {message.message}
                      </pre>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-dashed">
                    <h4 className="font-semibold text-gray-700 mb-2">📋 Complete Copy:</h4>
                    <p className="text-sm text-gray-600">
                      Subject: {message.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (Message body included when copied)
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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