'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  companyName: string;
  productService: string;
  valueProposition: string;
  keyDifferentiators: string[];
  createdAt: string;
}

export function ICPManagement() {
  const [icps, setIcps] = useState<ICP[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  const fetchICPs = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await fetch('/api/icps');

      if (!response.ok) {
        throw new Error(`Failed to load ICPs: ${response.status}`);
      }

      const data = await response.json();
      const icpArray = data.icps || data || [];
      setIcps(icpArray);
    } catch (error) {
      console.error('Error fetching ICPs:', error);
      setError(error instanceof Error ? error.message : 'Failed to load ICPs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchICPs();
  }, [fetchICPs]);

  const handleDelete = useCallback(async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      const response = await fetch(`/api/icps/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIcps(icps.filter(icp => icp.id !== id));
        setDeleteConfirm(null);
        toast.success('ICP deleted successfully');
      } else {
        toast.error('Failed to delete ICP');
      }
    } catch (error) {
      toast.error('Error deleting ICP');
    }
  }, [deleteConfirm, fetchICPs]);

  const handleEdit = useCallback((icp: ICP) => {
    // Navigate to ICP builder with the ICP data as query params
    const params = new URLSearchParams({
      edit: 'true',
      id: icp.id,
      name: icp.name,
      industry: icp.industry || '',
      companySize: icp.companySize || '',
      role: icp.role || '',
      painPoints: icp.painPoints?.join(', ') || '',
      outcomes: icp.outcomes?.join(', ') || '',
      triggers: icp.triggers?.join(', ') || '',
      companyName: icp.companyName || '',
      productService: icp.productService || '',
      valueProposition: icp.valueProposition || '',
      keyDifferentiators: icp.keyDifferentiators?.join(', ') || '',
    });
    router.push(`/icp-builder?${params.toString()}`);
  }, [router]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 ICP Management Hub
          </h1>
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        <div className="border-b pb-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-2">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-72" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 ICP Management Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Your command center for building and managing world-class customer profiles
          </p>
        </div>

        <Card className="border-red-200 bg-red-50 max-w-2xl mx-auto">
          <CardContent className="py-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Unable to load ICPs</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={fetchICPs} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Try Again
              </Button>
              <Link href="/icp-builder">
                <Button className="bg-red-600 hover:bg-red-700">
                  Create New ICP
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (icps.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 ICP Management Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your command center for building and managing world-class customer profiles
          </p>
        </div>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Ready to build your first ICP?</h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Create detailed customer profiles that power sophisticated sales tools, expert objection handling, and qualification frameworks.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/icp-builder">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  🎯 Create Your First ICP
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/icps/sample', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                    });
                    if (response.ok) {
                      toast.success('🎯 Sample ICP imported! Perfect for learning.');
                      fetchICPs();
                    }
                  } catch (error) {
                    toast.error('Error importing sample ICP');
                  }
                }}
              >
                ⭐ Import Expert Template
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎯 ICP Management Hub
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your expert customer profiles powering world-class sales tools
        </p>
      </div>

      {/* Stats and Action Bar */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{icps.length}</div>
              <div className="text-sm text-gray-600">Expert ICPs</div>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Ready for Advanced Sales Tools</h3>
              <p className="text-sm text-gray-600">Generate objection rebuttals, messaging, and qualification frameworks</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const response = await fetch('/api/icps/sample', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                  });
                  if (response.ok) {
                    toast.success('🎯 Sample ICP imported! Perfect for learning.');
                    fetchICPs();
                  }
                } catch (error) {
                  toast.error('Error importing sample ICP');
                }
              }}
            >
              ⭐ Import Template
            </Button>
            <Link href="/icp-builder">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <span className="mr-2">➕</span>
                Create New ICP
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {icps.map((icp) => (
        <Card key={icp.id} className="border-2 transition-all duration-500 hover:shadow-lg transform hover:-translate-y-1 hover:border-blue-300">
          <CardHeader className="cursor-pointer pb-3" onClick={() => setExpandedId(expandedId === icp.id ? null : icp.id)}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl text-blue-600 mb-2">{icp.name}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {icp.industry}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        {icp.role}
                      </span>
                      {icp.companySize && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                          {icp.companySize}
                        </span>
                      )}
                    </div>
                    {icp.companyName && (
                      <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm">
                        <span className="text-gray-600">Company:</span>
                        <span className="font-medium text-gray-900 ml-2">{icp.companyName}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(icp);
                  }}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(icp.id);
                  }}
                  className={deleteConfirm === icp.id ? 'bg-red-50 border-red-300 text-red-700' : 'text-red-600 border-red-200 hover:bg-red-50'}
                >
                  {deleteConfirm === icp.id ? '⚠️ Confirm?' : '🗑️ Delete'}
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedId === icp.id && (
            <CardContent className="border-t pt-6 bg-gray-50">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Company Info */}
                {icp.companyName && (
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                      <span>🏢</span> Your Offering
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <span className="text-blue-600 font-medium">Company:</span>
                        <p className="text-gray-900 font-medium">{icp.companyName}</p>
                      </div>
                      {icp.productService && (
                        <div>
                          <span className="text-gray-600 font-medium">Product/Service:</span>
                          <p className="text-gray-900 mt-1">{icp.productService}</p>
                        </div>
                      )}
                      {icp.valueProposition && (
                        <div>
                          <span className="text-gray-600 font-medium">Value Proposition:</span>
                          <p className="text-gray-900 mt-1">{icp.valueProposition}</p>
                        </div>
                      )}
                      {icp.keyDifferentiators && icp.keyDifferentiators.length > 0 && (
                        <div>
                          <span className="text-gray-600 font-medium">Key Differentiators:</span>
                          <ul className="mt-1 space-y-1">
                            {icp.keyDifferentiators.map((diff, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span className="text-gray-900">{diff}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pain Points */}
                <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <span>😤</span> Pain Points
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {icp.painPoints?.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outcomes */}
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <span>🎯</span> Desired Outcomes
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {icp.outcomes?.map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span className="text-gray-700">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Triggers */}
                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                    <span>⚡</span> Trigger Events
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {icp.triggers?.map((trigger, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span className="text-gray-700">{trigger}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Cards */}
              <div className="mt-6 pt-4 border-t">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-3">🚀 Generate Expert Sales Content</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Link href={`/objection-killer?icp=${icp.id}`}>
                      <div className="bg-white p-3 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
                        <div className="text-blue-600 font-medium text-sm">Smart Objection Rebuttals</div>
                        <div className="text-xs text-gray-600 mt-1">Framework-specific responses</div>
                      </div>
                    </Link>
                    <Link href={`/message-generator?icp=${icp.id}`}>
                      <div className="bg-white p-3 rounded-lg border border-green-200 hover:border-green-400 transition-colors cursor-pointer">
                        <div className="text-green-600 font-medium text-sm">Personalized Messaging</div>
                        <div className="text-xs text-gray-600 mt-1">Targeted outreach content</div>
                      </div>
                    </Link>
                    <Link href={`/qualification-framework?icp=${icp.id}`}>
                      <div className="bg-white p-3 rounded-lg border border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
                        <div className="text-purple-600 font-medium text-sm">Expert Qualification</div>
                        <div className="text-xs text-gray-600 mt-1">MEDDIC & advanced frameworks</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <span>Created: {new Date(icp.createdAt).toLocaleDateString()}</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Expert Tools Ready</span>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}