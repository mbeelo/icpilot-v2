'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchICPs();
  }, []);

  const fetchICPs = async () => {
    try {
      const response = await fetch('/api/icps');
      const data = await response.json();
      const icpArray = data.icps || data || [];
      setIcps(icpArray);
    } catch (error) {
      console.error('Error fetching ICPs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
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
  };

  const handleEdit = (icp: ICP) => {
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
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading ICPs...</div>;
  }

  if (icps.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600 mb-4">No ICPs created yet</p>
          <Link href="/icp-builder">
            <Button>Create Your First ICP</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your ICPs</h2>
          <p className="text-gray-600">Manage your Ideal Customer Profiles</p>
        </div>
        <Link href="/icp-builder">
          <Button>+ Create New ICP</Button>
        </Link>
      </div>

      {icps.map((icp) => (
        <Card key={icp.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="cursor-pointer" onClick={() => setExpandedId(expandedId === icp.id ? null : icp.id)}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-xl text-blue-600">{icp.name}</CardTitle>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span>🏢 {icp.industry}</span>
                  <span>👤 {icp.role}</span>
                  <span>📊 {icp.companySize}</span>
                </div>
                {icp.companyName && (
                  <div className="mt-2 text-sm text-gray-500">
                    Selling: <span className="font-medium">{icp.companyName}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(icp);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(icp.id);
                  }}
                  className={deleteConfirm === icp.id ? 'bg-red-50 border-red-300 text-red-700' : ''}
                >
                  {deleteConfirm === icp.id ? 'Confirm Delete?' : 'Delete'}
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedId === icp.id && (
            <CardContent className="border-t pt-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Company Info */}
                {icp.companyName && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Your Offering</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Company:</span>
                        <p className="text-gray-900">{icp.companyName}</p>
                      </div>
                      {icp.productService && (
                        <div>
                          <span className="text-gray-600">Product/Service:</span>
                          <p className="text-gray-900">{icp.productService}</p>
                        </div>
                      )}
                      {icp.valueProposition && (
                        <div>
                          <span className="text-gray-600">Value Proposition:</span>
                          <p className="text-gray-900">{icp.valueProposition}</p>
                        </div>
                      )}
                      {icp.keyDifferentiators && icp.keyDifferentiators.length > 0 && (
                        <div>
                          <span className="text-gray-600">Differentiators:</span>
                          <ul className="list-disc list-inside text-gray-900">
                            {icp.keyDifferentiators.map((diff, idx) => (
                              <li key={idx}>{diff}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pain Points */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Pain Points</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {icp.painPoints?.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>

                {/* Outcomes */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Desired Outcomes</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {icp.outcomes?.map((outcome, idx) => (
                      <li key={idx}>{outcome}</li>
                    ))}
                  </ul>
                </div>

                {/* Triggers */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Trigger Events</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {icp.triggers?.map((trigger, idx) => (
                      <li key={idx}>{trigger}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Created: {new Date(icp.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}