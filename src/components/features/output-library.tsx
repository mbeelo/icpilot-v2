'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

interface ICP {
  id: string;
  name: string;
  industry: string;
  role: string;
}

interface Output {
  id: string;
  icpId: string;
  type: string;
  title: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  createdAt: string;
  isSaved?: boolean;
  isTemporary?: boolean;
}

interface MessageOutput {
  subject: string;
  message: string;
  variant: string;
}

// Helper function to search within output content
function searchInOutputContent(output: Output, searchTerm: string): boolean {
  try {
    // Search in input fields (objection text, message triggers, framework types, etc.)
    const inputText = JSON.stringify(output.input).toLowerCase();
    if (inputText.includes(searchTerm)) return true;

    // Search in output content based on type
    if (output.type === 'objection' && Array.isArray(output.output)) {
      // Objection rebuttals are arrays of response objects
      return output.output.some((rebuttal: any) =>
        rebuttal.response?.toLowerCase().includes(searchTerm) ||
        rebuttal.variant?.toLowerCase().includes(searchTerm) ||
        rebuttal.approach?.toLowerCase().includes(searchTerm)
      );
    } else if (output.type === 'message') {
      // Messages can be array or object
      const messages = output.output.messages || output.output;
      if (Array.isArray(messages)) {
        return messages.some((msg: any) =>
          msg.message?.toLowerCase().includes(searchTerm) ||
          msg.subject?.toLowerCase().includes(searchTerm) ||
          msg.variant?.toLowerCase().includes(searchTerm)
        );
      }
    } else if (output.type === 'framework') {
      // Qualification frameworks have specific structure
      const framework = output.output;
      if (framework.discoveryQuestions && Array.isArray(framework.discoveryQuestions)) {
        const questionMatch = framework.discoveryQuestions.some((q: any) =>
          q.question?.toLowerCase().includes(searchTerm) ||
          q.category?.toLowerCase().includes(searchTerm)
        );
        if (questionMatch) return true;
      }
      if (framework.disqualifySignals && Array.isArray(framework.disqualifySignals)) {
        const signalMatch = framework.disqualifySignals.some((signal: string) =>
          signal.toLowerCase().includes(searchTerm)
        );
        if (signalMatch) return true;
      }
    }

    // Fallback: search in stringified output
    const outputText = JSON.stringify(output.output).toLowerCase();
    return outputText.includes(searchTerm);
  } catch (error) {
    // If there's any error parsing content, fall back to basic search
    return false;
  }
}

export function OutputLibrary() {
  const searchParams = useSearchParams();
  const [savedOutputs, setSavedOutputs] = useState<Output[]>([]);
  const [tempOutputs, setTempOutputs] = useState<Output[]>([]);
  const [icps, setIcps] = useState<ICP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOutput, setSelectedOutput] = useState<Output | null>(null);

  // Filters
  const [selectedIcpId, setSelectedIcpId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSection, setShowSection] = useState<'all' | 'saved' | 'recent'>('all');

  useEffect(() => {
    loadData();
  }, []);

  // Combine outputs and mark their source
  const allOutputs = [
    ...savedOutputs.map(o => ({...o, isSaved: true, isTemporary: false})),
    ...tempOutputs.map(o => ({...o, isSaved: false, isTemporary: true}))
  ];

  // Handle direct navigation to specific output
  useEffect(() => {
    const outputId = searchParams.get('outputId');
    if (outputId && allOutputs.length > 0) {
      const targetOutput = allOutputs.find(output => output.id === outputId);
      if (targetOutput) {
        setSelectedOutput(targetOutput);
      }
    }
  }, [searchParams, savedOutputs, tempOutputs]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [savedRes, tempRes, icpsRes] = await Promise.all([
        fetch('/api/outputs'),
        fetch('/api/outputs/temporary'),
        fetch('/api/icps')
      ]);

      if (savedRes.ok && tempRes.ok && icpsRes.ok) {
        const savedData = await savedRes.json();
        const tempData = await tempRes.json();
        const icpsData = await icpsRes.json();

        setSavedOutputs(savedData.outputs || []);
        setTempOutputs(tempData.outputs || []);
        setIcps(icpsData.icps || []);
      }
    } catch (error) {
      console.error('Failed to load library data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get ICP name (must be defined before filtering)
  const getIcpName = (icpId: string) => {
    const icp = icps.find(i => i.id === icpId);
    return icp ? icp.name : 'Unknown ICP';
  };

  // Filter and sort outputs
  const filteredOutputs = allOutputs.filter(output => {
    const matchesIcp = selectedIcpId === 'all' || output.icpId === selectedIcpId;
    const matchesType = selectedType === 'all' || output.type === selectedType;
    const matchesSearch = searchQuery === '' ||
      output.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getIcpName(output.icpId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      // Search within the actual content
      searchInOutputContent(output, searchQuery.toLowerCase());
    const matchesSection = showSection === 'all' ||
      (showSection === 'saved' && output.isSaved) ||
      (showSection === 'recent' && output.isTemporary);

    return matchesIcp && matchesType && matchesSearch && matchesSection;
  }).sort((a, b) => {
    // Primary sort by type for grouping
    if (a.type !== b.type) {
      const typeOrder = { 'message': 1, 'objection': 2, 'framework': 3 };
      return (typeOrder[a.type as keyof typeof typeOrder] || 4) - (typeOrder[b.type as keyof typeof typeOrder] || 4);
    }
    // Secondary sort by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'objection': return '💪';
      case 'message': return '✉️';
      case 'framework': return '🔍';
      default: return '📄';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'objection': return 'Objection Rebuttal';
      case 'message': return 'Outreach Message';
      case 'framework': return 'Qualification Framework';
      default: return type;
    }
  };

  const copyOutput = async (output: Output) => {
    let textToCopy = '';

    if (output.type === 'objection') {
      const rebuttal = output.output;
      if (Array.isArray(rebuttal)) {
        // New format with multiple variants
        textToCopy = `OBJECTION REBUTTALS\n\nObjection: ${output.input.objection}\n\n${rebuttal.map((variant: any, i: number) =>
          `VARIANT ${i + 1}: ${variant.variant}\nApproach: ${variant.approach}\nBest For: ${variant.bestFor}\n\n${variant.response}\n\n---\n`
        ).join('\n')}\n\nGenerated by ICP Pilot`;
      } else {
        // Old format with structured response
        textToCopy = `OBJECTION REBUTTAL\n\nObjection: ${output.input.objection}\n\nReframe: ${rebuttal.reframe}\n\nEvidence: ${rebuttal.evidence}\n\nBridge: ${rebuttal.bridge}\n\nMicro-ask: ${rebuttal.microAsk}`;
      }
    } else if (output.type === 'message') {
      const outputData = output.output;
      if (outputData.messages && Array.isArray(outputData.messages)) {
        // New format with multiple messages
        textToCopy = `OUTREACH MESSAGES\n\n${outputData.messages.map((msg: MessageOutput, i: number) =>
          `VARIANT ${i + 1}: ${msg.variant}\nSubject: ${msg.subject}\n\n${msg.message}\n\n---\n`
        ).join('\n')}\n\nGenerated by ICP Pilot`;
      } else if (outputData.subject && outputData.message) {
        // Old format with single message
        textToCopy = `OUTREACH MESSAGE\n\nSubject: ${outputData.subject}\n\n${outputData.message}`;
      } else {
        textToCopy = 'Message data format not recognized';
      }
    } else if (output.type === 'framework') {
      const framework = output.output as { discoveryQuestions?: unknown; scoringSystem?: unknown; disqualifySignals?: unknown };
      textToCopy = `QUALIFICATION FRAMEWORK\n\nDISCOVERY QUESTIONS:\n`;
      if (framework?.discoveryQuestions && Array.isArray(framework.discoveryQuestions)) {
        framework.discoveryQuestions.forEach((q: { category: string; question: string; listenFor?: string[] }, i: number) => {
          textToCopy += `\n${i + 1}. ${q.category}: ${q.question}\n   Listen for: ${q.listenFor?.join(', ') || 'N/A'}\n`;
        });
      }
      textToCopy += `\nSCORING SYSTEM:\n`;
      if (framework?.scoringSystem && Array.isArray(framework.scoringSystem)) {
        framework.scoringSystem.forEach((s: { criteria: string; green: string; yellow: string; red: string }) => {
          textToCopy += `\n${s.criteria}:\n  🟢 Green: ${s.green}\n  🟡 Yellow: ${s.yellow}\n  🔴 Red: ${s.red}\n`;
        });
      }
      textToCopy += `\nDISQUALIFY SIGNALS:\n${framework?.disqualifySignals && Array.isArray(framework.disqualifySignals) ? framework.disqualifySignals.map((signal: string) => `• ${signal}`).join('\n') : 'N/A'}`;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const saveToLibrary = async (output: Output) => {
    try {
      const response = await fetch('/api/outputs/save-to-library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outputId: output.id }),
      });

      if (response.ok) {
        toast.success('Saved to library!');
        loadData(); // Refresh to show updated state
      } else {
        toast.error('Failed to save to library');
      }
    } catch (error) {
      toast.error('Error saving to library');
    }
  };

  const deleteOutput = async (outputId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this output?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/outputs/${outputId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadData();
        setSelectedOutput(null);
        toast.success('Output deleted successfully');
      } else {
        toast.error('Failed to delete output');
      }
    } catch (error) {
      toast.error('Error deleting output');
    }
  };

  const getContentPreview = (output: Output) => {
    if (output.type === 'message') {
      const outputData = output.output as { messages?: { subject?: string; message?: string }[]; subject?: string; message?: string };
      if (outputData.messages && Array.isArray(outputData.messages)) {
        const firstMessage = outputData.messages[0];
        return {
          headline: firstMessage?.subject || 'No subject line',
          content: firstMessage?.message ?
            firstMessage.message.split('\n')[0].slice(0, 80) + (firstMessage.message.length > 80 ? '...' : '')
            : 'No message content',
          metadata: `${outputData.messages.length} variant${outputData.messages.length > 1 ? 's' : ''}`,
          prospect: output.input?.prospectName || output.input?.companyName || null
        };
      } else if (outputData.subject) {
        return {
          headline: outputData.subject,
          content: outputData.message && typeof outputData.message === 'string' ?
            outputData.message.split('\n')[0].slice(0, 80) + (outputData.message.length > 80 ? '...' : '')
            : 'No message content',
          metadata: '1 variant',
          prospect: output.input?.prospectName || output.input?.companyName || null
        };
      }
    } else if (output.type === 'objection') {
      return {
        headline: output.input?.objection && typeof output.input.objection === 'string'
          ? `"${output.input.objection.slice(0, 60)}${output.input.objection.length > 60 ? '...' : ''}"`
          : 'Objection rebuttal',
        content: Array.isArray(output.output)
          ? `${output.output.length} expert rebuttal variants • ${output.output[0]?.variant || 'Professional response'}`
          : output.output?.reframe && typeof output.output.reframe === 'string' ?
            output.output.reframe.slice(0, 80) + (output.output.reframe.length > 80 ? '...' : '')
            : 'No rebuttal content',
        metadata: Array.isArray(output.output)
          ? `${output.output.map((v: any) => v.variant).join(' • ')}`
          : 'Reframe • Evidence • Bridge • Micro-ask',
        prospect: output.input?.prospectName || output.input?.companyName || null
      };
    } else if (output.type === 'framework') {
      const frameworkData = output.output as { discoveryQuestions?: unknown; scoringSystem?: unknown };
      const questionCount = Array.isArray(frameworkData?.discoveryQuestions) ? frameworkData.discoveryQuestions.length : 0;
      const scoreCount = Array.isArray(frameworkData?.scoringSystem) ? frameworkData.scoringSystem.length : 0;
      return {
        headline: output.input?.frameworkType || 'Qualification Framework',
        content: `${questionCount} discovery questions with scoring criteria`,
        metadata: `${questionCount} questions • ${scoreCount} scoring criteria`,
        prospect: null
      };
    }

    return {
      headline: 'Content not available',
      content: 'No preview available',
      metadata: '',
      prospect: null
    };
  };

  const renderDetailedView = (output: Output) => {
    if (output.type === 'message') {
      const outputData = output.output as { messages?: { subject?: string; message?: string; variant?: string }[]; subject?: string; message?: string };
      if (outputData.messages && Array.isArray(outputData.messages)) {
        return (
          <div className="space-y-6">
            {outputData.messages.map((msg: { subject?: string; message?: string; variant?: string }, index: number) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <h4 className="font-semibold text-blue-700 mb-4">Variant {index + 1}: {msg.variant}</h4>
                <div className="space-y-6">
                  <div className="border-l-4 border-gray-400 pl-4 py-2">
                    <h4 className="font-semibold text-blue-700 mb-2">Subject:</h4>
                    <p className="text-gray-800">{msg.subject}</p>
                  </div>
                  <div className="border-l-4 border-gray-400 pl-4 py-2">
                    <h4 className="font-semibold text-blue-700 mb-2">Message:</h4>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">{msg.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      } else if (outputData.subject) {
        return (
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Subject:</span>
              <p className="text-gray-900 mt-1">{outputData.subject}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Message:</span>
              <pre className="text-gray-900 mt-1 whitespace-pre-wrap font-sans text-sm leading-relaxed">{outputData.message}</pre>
            </div>
          </div>
        );
      }
    } else if (output.type === 'objection') {
      return (
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Objection:</span>
            <p className="text-gray-900 mt-1 italic">&quot;{(output.input?.objection && typeof output.input.objection === 'string') ? output.input.objection : 'No objection provided'}&quot;</p>
          </div>
          {Array.isArray(output.output) ? (
            // New format with multiple variants
            <div className="space-y-6">
              {output.output.map((variant: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="font-semibold text-blue-700">{variant.variant}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {variant.approach}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      {variant.bestFor}
                    </span>
                  </div>
                  <div className="border-l-4 border-gray-400 pl-4 py-2">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {variant.response}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Old format with structured response
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-blue-600">Reframe:</span>
                <p className="text-gray-900 mt-1">{output.output?.reframe}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-600">Evidence:</span>
                <p className="text-gray-900 mt-1">{output.output?.evidence}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-600">Bridge:</span>
                <p className="text-gray-900 mt-1">{output.output?.bridge}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-600">Micro-ask:</span>
                <p className="text-gray-900 mt-1">{output.output?.microAsk}</p>
              </div>
            </div>
          )}
        </div>
      );
    } else if (output.type === 'framework') {
      return (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-blue-600 mb-3">Discovery Questions</h4>
            <div className="space-y-6">
              {output.output?.discoveryQuestions?.map((q: { category: string; question: string; listenFor?: string[] }, i: number) => (
                <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-semibold text-blue-700 mb-2">{q.category}</h4>
                  <p className="text-gray-800 mb-4">{q.question}</p>
                  <div className="border-l-4 border-gray-400 pl-4 py-2">
                    <h4 className="font-semibold text-blue-700 mb-2">Listen for:</h4>
                    <p className="text-gray-800">{q.listenFor?.join(', ') || 'N/A'}</p>
                  </div>
                </div>
              )) || <p className="text-gray-500">No discovery questions</p>}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-blue-600 mb-3">Scoring System</h4>
            <div className="space-y-6">
              {output.output?.scoringSystem?.map((s: { criteria: string; green: string; yellow: string; red: string }, i: number) => (
                <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-semibold text-blue-700 mb-4">{s.criteria}</h4>
                  <div className="space-y-6">
                    <div className="border-l-4 border-gray-400 pl-4 py-2">
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">🟢</span>
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2">Green:</h4>
                          <p className="text-gray-800">{s.green}</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-l-4 border-gray-400 pl-4 py-2">
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-500 font-bold">🟡</span>
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2">Yellow:</h4>
                          <p className="text-gray-800">{s.yellow}</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-l-4 border-gray-400 pl-4 py-2">
                      <div className="flex items-start gap-3">
                        <span className="text-red-500 font-bold">🔴</span>
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2">Red:</h4>
                          <p className="text-gray-800">{s.red}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )) || <p className="text-gray-500">No scoring criteria</p>}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-blue-600 mb-3">Disqualify Signals</h4>
            <ul className="space-y-1">
              {output.output?.disqualifySignals?.map((signal: string, i: number) => (
                <li key={i} className="text-gray-900 text-sm flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {signal}
                </li>
              )) || <p className="text-gray-500">No disqualify signals</p>}
            </ul>
          </div>
        </div>
      );
    }

    return <p className="text-gray-500">No content available</p>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your library...</p>
        </div>
      </div>
    );
  }

  const totalOutputs = allOutputs.length;
  const savedCount = savedOutputs.length;
  const tempCount = tempOutputs.length;

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        {/* Library Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Sales Library</h1>
              <p className="text-gray-600">Your collection of sales assets and recent work</p>
            </div>
            <div className="flex gap-1 border border-gray-200 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="text-xs"
              >
                ⊞ Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="text-xs"
              >
                ☰ List
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalOutputs}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{savedCount}</div>
                <div className="text-sm text-gray-600">Saved</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{tempCount}</div>
                <div className="text-sm text-gray-600">Recent</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{icps.length}</div>
                <div className="text-sm text-gray-600">ICPs</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label htmlFor="search-library" className="sr-only">Search your library</label>
                  <input
                    id="search-library"
                    name="search-library"
                    type="text"
                    placeholder="Search titles, content, objections, messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 border-2 border-blue-200 rounded-xl text-sm font-medium text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-blue-300 hover:shadow-md placeholder-gray-500"
                  />
                </div>
                <label htmlFor="filter-icp" className="sr-only">Filter by ICP</label>
                <select
                  id="filter-icp"
                  name="filter-icp"
                  value={selectedIcpId}
                  onChange={(e) => setSelectedIcpId(e.target.value)}
                  className="p-3 pr-8 border-2 border-blue-200 rounded-xl text-sm font-medium text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-blue-300 hover:shadow-md appearance-none cursor-pointer min-w-fit"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="all">All ICPs</option>
                  {icps.map(icp => (
                    <option key={icp.id} value={icp.id}>{icp.name}</option>
                  ))}
                </select>
                <label htmlFor="filter-type" className="sr-only">Filter by type</label>
                <select
                  id="filter-type"
                  name="filter-type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="p-3 pr-8 border-2 border-blue-200 rounded-xl text-sm font-medium text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-blue-300 hover:shadow-md appearance-none cursor-pointer min-w-fit"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="message">Messages</option>
                  <option value="objection">Objections</option>
                  <option value="framework">Frameworks</option>
                </select>
                <label htmlFor="filter-section" className="sr-only">Filter by section</label>
                <select
                  id="filter-section"
                  name="filter-section"
                  value={showSection}
                  onChange={(e) => setShowSection(e.target.value as 'all' | 'saved' | 'recent')}
                  className="p-3 pr-8 border-2 border-blue-200 rounded-xl text-sm font-medium text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-blue-300 hover:shadow-md appearance-none cursor-pointer min-w-fit"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="all">All Items ({totalOutputs})</option>
                  <option value="saved">Saved ({savedCount})</option>
                  <option value="recent">Recent ({tempCount})</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:flex md:gap-6">
          {/* Library Grid/List */}
          <div className={`${selectedOutput ? 'hidden md:block md:w-1/2' : 'w-full'} transition-all duration-300`}>
            {filteredOutputs.length === 0 ? (
              <Card className="border-blue-200 bg-blue-50 border-2">
                <CardContent className="text-center py-12">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {totalOutputs === 0 ? 'No outputs yet' : 'No matches found'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {totalOutputs === 0
                      ? 'Start generating sales assets to build your library'
                      : 'Try adjusting your search or filters'}
                  </p>
                  {totalOutputs === 0 && (
                    <Button onClick={() => window.location.href = '/message-generator'}>
                      Create Your First Asset →
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Group outputs by type */}
                {['message', 'objection', 'framework'].map(type => {
                  const typeOutputs = filteredOutputs.filter(output => output.type === type);
                  if (typeOutputs.length === 0) return null;

                  return (
                    <div key={type} className="space-y-4">
                      {/* Type Section Header */}
                      <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                        <span className="text-2xl">{getTypeIcon(type)}</span>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            {getTypeLabel(type)}s
                          </h2>
                          <p className="text-sm text-gray-500">
                            {typeOutputs.length} item{typeOutputs.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Type Outputs Grid */}
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-3'}>
                        {typeOutputs.map((output) => {
                          const preview = getContentPreview(output);
                          return (
                    <Card
                      key={output.id}
                      className={`cursor-pointer transition-all duration-500 hover:shadow-lg transform hover:-translate-y-1 border-2 border-l-4 ${
                        output.type === 'message' ? 'border-l-blue-500' :
                        output.type === 'objection' ? 'border-l-purple-500' :
                        'border-l-green-500'
                      } ${selectedOutput?.id === output.id ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
                      onClick={() => setSelectedOutput(output)}
                    >
                      <CardContent className="p-4">
                        {/* Header with type, status badges, and ICP */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-xl flex-shrink-0">{getTypeIcon(output.type)}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                  {getTypeLabel(output.type)}
                                </span>
                                {output.isSaved && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                    💾 Saved
                                  </span>
                                )}
                                {output.isTemporary && (
                                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                                    🕒 Recent
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="truncate font-medium">{getIcpName(output.icpId)}</span>
                                <span>•</span>
                                <span className="flex-shrink-0">{new Date(output.createdAt).toLocaleDateString()}</span>
                                {preview.prospect && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate text-blue-600 font-medium">{preview.prospect}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Content Preview */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2">
                            {preview.headline}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                            {preview.content}
                          </p>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-gray-500 font-medium">
                              {preview.metadata}
                            </span>
                            <div className="text-xs text-gray-400">
                              Click to expand →
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Detail View - Full Screen */}
          {selectedOutput && (
            <div className="md:w-1/2">
              {/* Mobile: Full screen overlay */}
              <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
                {/* Mobile Header - Fixed */}
                <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOutput(null)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      ← Back to Library
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyOutput(selectedOutput)}
                        className="w-full"
                      >
                        📋
                      </Button>
                      {selectedOutput.isTemporary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => saveToLibrary(selectedOutput)}
                          className="w-full"
                        >
                          💾
                        </Button>
                      )}
                      {selectedOutput.isSaved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteOutput(selectedOutput.id)}
                          className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        >
                          🗑️
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-6">
                    {/* Title Section */}
                    <div className="text-center pb-4 border-b border-gray-100">
                      <div className="text-4xl mb-3">{getTypeIcon(selectedOutput.type)}</div>
                      <h1 className="text-xl font-semibold text-gray-900 mb-2">{selectedOutput.title}</h1>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <span>{getTypeLabel(selectedOutput.type)}</span>
                        <span>•</span>
                        <span>{getIcpName(selectedOutput.icpId)}</span>
                        <span>•</span>
                        <span>{new Date(selectedOutput.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                      {renderDetailedView(selectedOutput)}
                    </div>
                  </div>
                </div>

                {/* Mobile Footer - Fixed */}
                <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyOutput(selectedOutput)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      📋 Copy All
                    </Button>
                    {selectedOutput.isTemporary ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => saveToLibrary(selectedOutput)}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        💾 Save to Library
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteOutput(selectedOutput.id)}
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 flex items-center justify-center gap-2"
                      >
                        🗑️ Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Desktop: Side panel */}
              <Card className="hidden md:block sticky top-6">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-xl">{getTypeIcon(selectedOutput.type)}</span>
                        {selectedOutput.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span>{getTypeLabel(selectedOutput.type)}</span>
                        <span>•</span>
                        <span>{getIcpName(selectedOutput.icpId)}</span>
                        <span>•</span>
                        <span>{new Date(selectedOutput.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOutput(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderDetailedView(selectedOutput)}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyOutput(selectedOutput)}
                      className="flex-1"
                    >
                      📋 Copy
                    </Button>
                    {selectedOutput.isTemporary && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveToLibrary(selectedOutput)}
                        className="flex-1"
                      >
                        💾 Save
                      </Button>
                    )}
                    {selectedOutput.isSaved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteOutput(selectedOutput.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        🗑️
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}