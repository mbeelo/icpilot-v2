'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SupportRequest {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  toolName?: string;
  useCase?: string;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  severity?: string;
  browser?: string;
  device?: string;
  assignedTo?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSupportPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/admin/support', {
        headers: {
          'x-admin-key': 'dev-admin-key'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error loading support requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/support/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'dev-admin-key'
        },
        body: JSON.stringify({
          status,
          adminNotes,
          assignedTo: assignedTo || undefined,
          resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined
        })
      });

      if (response.ok) {
        loadRequests();
        setSelectedRequest(null);
        setAdminNotes('');
        setAssignedTo('');
      }
    } catch (error) {
      console.error('Error updating request:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    if (filter === 'open') return request.status === 'open';
    if (filter === 'in_progress') return request.status === 'in_progress';
    if (filter === 'resolved') return request.status === 'resolved';
    if (filter === 'tool_suggestions') return request.type === 'tool_suggestion';
    if (filter === 'bug_reports') return request.type === 'bug_report';
    return true;
  });

  const stats = {
    total: requests.length,
    open: requests.filter(r => r.status === 'open').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    resolved: requests.filter(r => r.status === 'resolved').length,
    toolSuggestions: requests.filter(r => r.type === 'tool_suggestion').length,
    bugReports: requests.filter(r => r.type === 'bug_report').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Dashboard</h1>
          <p className="text-gray-600">Manage customer support requests and feature suggestions</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.open}</div>
              <div className="text-sm text-gray-600">Open</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.toolSuggestions}</div>
              <div className="text-sm text-gray-600">Tool Ideas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.bugReports}</div>
              <div className="text-sm text-gray-600">Bug Reports</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'open', label: 'Open' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'resolved', label: 'Resolved' },
              { key: 'tool_suggestions', label: 'Tool Suggestions' },
              { key: 'bug_reports', label: 'Bug Reports' }
            ].map(filterOption => (
              <Button
                key={filterOption.key}
                variant={filter === filterOption.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterOption.key)}
              >
                {filterOption.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No support requests found for the selected filter.
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map(request => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{request.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.type === 'tool_suggestion' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {request.type === 'tool_suggestion' ? '💡 Tool Idea' : '🐛 Bug Report'}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-2">{request.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>👤 {request.userName || 'Anonymous'}</span>
                        <span>📧 {request.userEmail || 'No email'}</span>
                        <span>📅 {new Date(request.createdAt).toLocaleDateString()}</span>
                        {request.assignedTo && <span>👨‍💼 Assigned to {request.assignedTo}</span>}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setAdminNotes(request.adminNotes || '');
                          setAssignedTo(request.assignedTo || '');
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Request Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedRequest.title}</h2>
                  <Button variant="outline" onClick={() => setSelectedRequest(null)}>✕</Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Request Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Request Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Type:</strong> {selectedRequest.type === 'tool_suggestion' ? 'Tool Suggestion' : 'Bug Report'}</div>
                        <div><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedRequest.status)}`}>{selectedRequest.status}</span></div>
                        <div><strong>Priority:</strong> <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(selectedRequest.priority)}`}>{selectedRequest.priority}</span></div>
                        <div><strong>Created:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</div>
                        <div><strong>User:</strong> {selectedRequest.userName || 'Anonymous'} ({selectedRequest.userEmail || 'No email'})</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{selectedRequest.description}</p>
                    </div>

                    {/* Tool Suggestion Fields */}
                    {selectedRequest.type === 'tool_suggestion' && (
                      <>
                        {selectedRequest.toolName && (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Tool Name</h3>
                            <p className="text-gray-700 text-sm">{selectedRequest.toolName}</p>
                          </div>
                        )}
                        {selectedRequest.useCase && (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Use Case</h3>
                            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{selectedRequest.useCase}</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Bug Report Fields */}
                    {selectedRequest.type === 'bug_report' && (
                      <>
                        {selectedRequest.stepsToReproduce && (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Steps to Reproduce</h3>
                            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">{selectedRequest.stepsToReproduce}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          {selectedRequest.expectedResult && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">Expected Result</h3>
                              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{selectedRequest.expectedResult}</p>
                            </div>
                          )}
                          {selectedRequest.actualResult && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">Actual Result</h3>
                              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{selectedRequest.actualResult}</p>
                            </div>
                          )}
                        </div>

                        {(selectedRequest.browser || selectedRequest.device) && (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Environment</h3>
                            <div className="text-sm text-gray-700">
                              {selectedRequest.browser && <div><strong>Browser:</strong> {selectedRequest.browser}</div>}
                              {selectedRequest.device && <div><strong>Device:</strong> {selectedRequest.device}</div>}
                              {selectedRequest.severity && <div><strong>Severity:</strong> {selectedRequest.severity}</div>}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Admin Actions */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Admin Actions</h3>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                          <input
                            type="text"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Team member name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                          <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={4}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Internal notes about this request..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Button
                            onClick={() => updateRequestStatus(selectedRequest.id, 'in_progress')}
                            disabled={isUpdating}
                            className="w-full bg-yellow-600 hover:bg-yellow-700"
                            size="sm"
                          >
                            {isUpdating ? 'Updating...' : 'Mark In Progress'}
                          </Button>

                          <Button
                            onClick={() => updateRequestStatus(selectedRequest.id, 'resolved')}
                            disabled={isUpdating}
                            className="w-full bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            {isUpdating ? 'Updating...' : 'Mark Resolved'}
                          </Button>

                          <Button
                            onClick={() => updateRequestStatus(selectedRequest.id, 'closed')}
                            disabled={isUpdating}
                            variant="outline"
                            className="w-full"
                            size="sm"
                          >
                            {isUpdating ? 'Updating...' : 'Close Request'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {selectedRequest.adminNotes && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Previous Admin Notes</h3>
                        <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded">{selectedRequest.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}