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
  "Cold LinkedIn Message",
  "Cold Email", 
  "Follow-up Email",
  "LinkedIn Connection Request"
];

export function MessageGenerator() {
  const [icps, setIcps] = useState<ICP[]>([]);
  const [selectedIcp, setSelectedIcp] = useState<ICP | null>(null);
  const searchParams = useSearchParams();
  const [messageType, setMessageType] = useState('');
  const [trigger, setTrigger] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [customTrigger, setCustomTrigger] = useState('');
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
        // Hit usage limit - show upgrade modal
        setShowUpgradeModal(true);
      } else if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      } else {
        alert('Failed to generate messages');
      }
    } catch (error) {
      alert('Error generating messages');
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
      alert('Message copied to clipboard!');
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
        <>
          {/* Message Setup */}
          <Card>
            <CardHeader>
              <CardTitle>Message Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message Type */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Message Type</label>
                <div className="grid md:grid-cols-2 gap-2">
                  {MESSAGE_TYPES.map((type) => (
                    <button
                      key={type}
                      className={`p-2 text-sm border rounded text-left transition-colors ${
                        messageType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-800'
                      }`}
                      onClick={() => setMessageType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prospect Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Prospect Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                    placeholder="John Smith"
                    value={prospectInfo.name}
                    onChange={(e) => setProspectInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Company</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                    placeholder="Acme Corp"
                    value={prospectInfo.company}
                    onChange={(e) => setProspectInfo(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Title</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                    placeholder="VP of Sales"
                    value={prospectInfo.title}
                    onChange={(e) => setProspectInfo(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Specific Context</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                    placeholder="Saw their LinkedIn post about scaling"
                    value={prospectInfo.specificContext}
                    onChange={(e) => setProspectInfo(prev => ({ ...prev, specificContext: e.target.value }))}
                  />
                </div>
              </div>

              {/* Triggers */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Trigger Event</label>
                <div className="grid md:grid-cols-3 gap-2 mb-3">
                  {PRESET_TRIGGERS.map((preset) => (
                    <button
                      key={preset}
                      className={`p-2 text-sm border rounded text-left transition-colors ${
                        trigger === preset
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-800'
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
                
                <input
                  type="text"
                  className="w-full p-3 border rounded-md text-gray-900 placeholder-gray-400"
                  placeholder="Or enter custom trigger event..."
                  value={customTrigger}
                  onChange={(e) => {
                    setCustomTrigger(e.target.value);
                    setTrigger('');
                  }}
                />
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={generateMessages}
                disabled={isGenerating || !messageType || (!trigger && !customTrigger)}
              >
                {isGenerating ? 'Generating Messages...' : 'Generate Messages'}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Messages */}
          {messages.length > 0 && (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Message Variant {index + 1}</span>
                      <span className="text-sm font-normal text-gray-600">{message.variant}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-blue-600 mb-2">Subject:</h4>
                      <p className="text-gray-800">{message.subject}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-blue-600 mb-2">Message:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-gray-800 whitespace-pre-wrap font-sans">{message.message}</pre>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" onClick={() => copyMessage(message)}>
                        Copy Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}