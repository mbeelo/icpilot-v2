'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  input: any;
  output: any;
  createdAt: string;
}

export function OutputLibrary() {
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [icps, setIcps] = useState<ICP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOutputs, setExpandedOutputs] = useState<Set<string>>(new Set());
  
  // Filters
  const [selectedIcpId, setSelectedIcpId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [outputsRes, icpsRes] = await Promise.all([
        fetch('/api/outputs'),
        fetch('/api/icps')
      ]);

      if (outputsRes.ok && icpsRes.ok) {
        const outputsData = await outputsRes.json();
        const icpsData = await icpsRes.json();
        
        setOutputs(outputsData.outputs || []);
        setIcps(icpsData.icps || []);
      }
    } catch (error) {
      console.error('Failed to load library data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (outputId: string) => {
    setExpandedOutputs(prev => {
      const next = new Set(prev);
      if (next.has(outputId)) {
        next.delete(outputId);
      } else {
        next.add(outputId);
      }
      return next;
    });
  };

  const filteredOutputs = outputs.filter(output => {
    const matchesIcp = selectedIcpId === 'all' || output.icpId === selectedIcpId;
    const matchesType = selectedType === 'all' || output.type === selectedType;
    return matchesIcp && matchesType;
  });

  const copyOutput = async (output: Output) => {
    let textToCopy = '';
    
    if (output.type === 'objection') {
      const rebuttal = output.output;
      textToCopy = `${rebuttal.reframe} ${rebuttal.evidence} ${rebuttal.bridge} ${rebuttal.microAsk}`;
    } else if (output.type === 'message') {
      const message = output.output;
      textToCopy = `Subject: ${message.subject}\n\n${message.message}`;
    } else if (output.type === 'framework') {
      const framework = output.output;
      textToCopy = `QUALIFICATION FRAMEWORK\n\nDISCOVERY QUESTIONS:\n`;
      framework.discoveryQuestions.forEach((q: any, i: number) => {
        textToCopy += `\n${i + 1}. ${q.category}: ${q.question}\n   Listen for: ${q.listenFor.join(', ')}\n`;
      });
      textToCopy += `\nSCORING SYSTEM:\n`;
      framework.scoringSystem.forEach((s: any) => {
        textToCopy += `\n${s.criteria}:\n  Green: ${s.green}\n  Yellow: ${s.yellow}\n  Red: ${s.red}\n`;
      });
      textToCopy += `\nDISQUALIFY SIGNALS:\n${framework.disqualifySignals.map((signal: string) => `• ${signal}`).join('\n')}`;
    }
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const deleteOutput = async (outputId: string) => {
    if (!confirm('Delete this output?')) return;
    
    try {
      const response = await fetch(`/api/outputs/${outputId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        loadData();
      } else {
        alert('Failed to delete output');
      }
    } catch (error) {
      alert('Error deleting output');
    }
  };

  const getIcpName = (icpId: string) => {
    const icp = icps.find(i => i.id === icpId);
    return icp ? icp.name : 'Unknown ICP';
  };

  const getTypeIcon = (type: string) => {
    if (type === 'objection') return '💪';
    if (type === 'message') return '✉️';
    if (type === 'framework') return '🔍';
    return '📄';
  };

  const getTypeLabel = (type: string) => {
    if (type === 'objection') return 'Objection';
    if (type === 'message') return 'Message';
    if (type === 'framework') return 'Framework';
    return type;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading your library...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            {filteredOutputs.length} of {outputs.length} outputs
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* ICP Filter */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">Filter by ICP</label>
              <select
                value={selectedIcpId}
                onChange={(e) => setSelectedIcpId(e.target.value)}
                className="w-full p-2 border rounded-md text-gray-900"
              >
                <option value="all">All ICPs ({outputs.length})</option>
                {icps.map(icp => {
                  const count = outputs.filter(o => o.icpId === icp.id).length;
                  return (
                    <option key={icp.id} value={icp.id}>
                      {icp.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">Filter by Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border rounded-md text-gray-900"
              >
                <option value="all">All Types ({outputs.length})</option>
                <option value="objection">
                  💪 Objections ({outputs.filter(o => o.type === 'objection').length})
                </option>
                <option value="message">
                  ✉️ Messages ({outputs.filter(o => o.type === 'message').length})
                </option>
                <option value="framework">
                  🔍 Frameworks ({outputs.filter(o => o.type === 'framework').length})
                </option>
              </select>
            </div>
          </div>

          {/* Clear filters */}
          {(selectedIcpId !== 'all' || selectedType !== 'all') && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedIcpId('all');
                  setSelectedType('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outputs List */}
      {filteredOutputs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {outputs.length === 0 
              ? 'No saved outputs yet.' 
              : 'No outputs match your filters.'}
          </p>
          {outputs.length === 0 && (
            <Button variant="outline">
              <a href="/objection-killer">Start Creating Content</a>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOutputs.map((output) => {
            const isExpanded = expandedOutputs.has(output.id);
            
            return (
              <Card key={output.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getTypeIcon(output.type)}</span>
                        <h3 className="font-medium text-gray-900">{output.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="capitalize">{getTypeLabel(output.type)}</span>
                        <span>•</span>
                        <span>{getIcpName(output.icpId)}</span>
                        <span>•</span>
                        <span>{new Date(output.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => copyOutput(output)}
                      >
                        Copy
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deleteOutput(output.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Expandable content */}
                  <div 
                    className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleExpand(output.id)}
                  >
                    {output.type === 'objection' && (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-gray-700">Objection:</span> {output.input.objection}</p>
                        {isExpanded ? (
                          <div className="space-y-3 mt-3 pt-3 border-t">
                            <div>
                              <span className="font-medium text-blue-600">Reframe:</span>
                              <p className="text-gray-800 mt-1">{output.output.reframe}</p>
                            </div>
                            <div>
                              <span className="font-medium text-blue-600">Evidence:</span>
                              <p className="text-gray-800 mt-1">{output.output.evidence}</p>
                            </div>
                            <div>
                              <span className="font-medium text-blue-600">Bridge:</span>
                              <p className="text-gray-800 mt-1">{output.output.bridge}</p>
                            </div>
                            <div>
                              <span className="font-medium text-blue-600">Micro-ask:</span>
                              <p className="text-gray-800 mt-1">{output.output.microAsk}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-600">{output.output.reframe}</p>
                        )}
                      </div>
                    )}

                    {output.type === 'message' && (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-gray-700">Subject:</span> {output.output.subject}</p>
                        {isExpanded ? (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-gray-800 whitespace-pre-wrap">{output.output.message}</p>
                            <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                              <p>Type: {output.input.messageType}</p>
                              <p>Trigger: {output.input.trigger}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-600 line-clamp-2">{output.output.message}</p>
                        )}
                      </div>
                    )}

                    {output.type === 'framework' && (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-gray-700">Framework:</span> {output.input.frameworkType}</p>
                        {isExpanded ? (
                          <div className="space-y-4 mt-3 pt-3 border-t">
                            <div>
                              <h4 className="font-medium text-blue-600 mb-2">Discovery Questions</h4>
                              {output.output.discoveryQuestions?.map((q: any, i: number) => (
                                <div key={i} className="mb-3">
                                  <p className="font-medium text-gray-800">{q.category}: {q.question}</p>
                                  <p className="text-xs text-gray-600 mt-1">Listen for: {q.listenFor.join(', ')}</p>
                                </div>
                              ))}
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-600 mb-2">Scoring System</h4>
                              {output.output.scoringSystem?.map((s: any, i: number) => (
                                <div key={i} className="mb-2 text-xs">
                                  <p className="font-medium text-gray-800">{s.criteria}</p>
                                  <p className="text-green-600">🟢 {s.green}</p>
                                  <p className="text-yellow-600">🟡 {s.yellow}</p>
                                  <p className="text-red-600">🔴 {s.red}</p>
                                </div>
                                ))}
                              <div>
                            <h4 className="font-medium text-blue-600 mb-2">Disqualify Signals</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {output.output.disqualifySignals?.map((signal: string, i: number) => (
                                <li key={i} className="text-gray-800 text-xs">{signal}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                          </div>
                        ) : (
                          <p className="text-gray-600">
                            {output.output.discoveryQuestions?.length || 0} questions • 
                            {' '}{output.output.scoringSystem?.length || 0} scoring criteria
                          </p>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {isExpanded ? 'Click to collapse' : 'Click to expand'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}