'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface ICP {
  id: string;
  name: string;
  industry: string;
}

interface RecentOutput {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  icpName: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userUsage, setUserUsage] = useState(0);
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [icps, setIcps] = useState<ICP[]>([]);
  const [recentOutputs, setRecentOutputs] = useState<RecentOutput[]>([]);
  const [outputStats, setOutputStats] = useState({ objections: 0, messages: 0, frameworks: 0 });
  const [isLoadingICPs, setIsLoadingICPs] = useState(true);
  const [selectedIcpId, setSelectedIcpId] = useState<string>('');

// Load saved ICP selection from localStorage on mount
useEffect(() => {
  const savedIcpId = localStorage.getItem('selectedIcpId');
  if (savedIcpId) {
    setSelectedIcpId(savedIcpId);
  }
}, []);

// Detect successful upgrade from URL params
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('upgrade') === 'success') {
    // Force refresh data after upgrade
    window.location.reload();
  }
}, []);

// Save ICP selection to localStorage whenever it changes
useEffect(() => {
  if (selectedIcpId) {
    localStorage.setItem('selectedIcpId', selectedIcpId);
  }
}, [selectedIcpId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = () => {
      if (session) {
        // Fetch usage data
        fetch('/api/user/usage')
          .then(res => res.json())
          .then(data => {
            setUserUsage(data.usageCount || 0);
            setSubscriptionTier(data.subscriptionTier || 'free');
            setOutputStats({
              objections: data.objectionsGenerated || 0,
              messages: data.messagesGenerated || 0,
              frameworks: data.frameworksGenerated || 0
            });
          })
          .catch(console.error);

        // Fetch ICPs
        fetch('/api/icps')
          .then(res => res.json())
          .then(data => {
            const icpArray = data.icps || data || [];
            setIcps(icpArray);
            if (icpArray.length > 0 && !selectedIcpId) {
            // Try to load saved ICP first
            const savedIcpId = localStorage.getItem('selectedIcpId');
            const savedIcpExists = icpArray.some((icp: ICP) => icp.id === savedIcpId);
            
            if (savedIcpId && savedIcpExists) {
              setSelectedIcpId(savedIcpId);
            } else {
              setSelectedIcpId(icpArray[0].id);
            }
          }
            setIsLoadingICPs(false);
          })
          .catch(() => setIsLoadingICPs(false));

        // Fetch recent outputs for activity feed only
      fetch('/api/outputs')
        .then(res => res.json())
        .then(data => {
          const outputs = data.outputs || [];
          setRecentOutputs(outputs.slice(0, 5));
        })
        .catch(console.error);
            }
          };

    fetchData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchData);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchData);
    };
  }, [session, selectedIcpId]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        toast.error('Failed to start checkout');
      }
    } catch (error) {
      toast.error('Error starting checkout');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleQuickAction = (tool: string) => {
    if (!selectedIcpId) {
      router.push('/icp-builder');
      return;
    }
    router.push(`/${tool}?icpId=${selectedIcpId}`);
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const hasICP = icps.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">ICPPilot</h1>
          <div className="flex items-center gap-4">
            <Link href="/account" className="text-gray-700 hover:text-gray-900">
              Welcome, {session.user?.name}
            </Link>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Start Banner - Only show for new users without ICP */}
        {!hasICP && !isLoadingICPs && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🚀</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">
                    Get Started in 2 Minutes
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Create your first ICP to unlock all sales tools and start generating assets
                  </p>
                  <Link href="/icp-builder">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Create Your First ICP →
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ICP Selector & Quick Stats */}
        {hasICP && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Active ICP</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={selectedIcpId}
                  onChange={(e) => setSelectedIcpId(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  {icps.map(icp => (
                    <option key={icp.id} value={icp.id}>
                      {icp.name}
                    </option>
                  ))}
                </select>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      if (icps.length === 0) {
                        router.push('/icp-builder');
                      } else {
                        router.push('/icp-builder/manage');
                      }
                    }}
                  >
                    {icps.length > 0 ? 'Manage ICPs' : 'Create First ICP →'}
                  </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Objections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{outputStats.objections}</p>
                <p className="text-xs text-gray-500">rebuttals created</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{outputStats.messages}</p>
                <p className="text-xs text-gray-500">outreach generated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Frameworks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{outputStats.frameworks}</p>
                <p className="text-xs text-gray-500">discovery systems</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Tools */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sales Toolkit</h2>
              <p className="text-gray-600 mb-6">Generate assets for your active ICP</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* ICP Builder - Always enabled */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-blue-600">🎯 ICP Builder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">Create and manage your Ideal Customer Profiles</p>
                  {!isLoadingICPs && (
                    <p className="text-sm font-medium text-blue-600 mb-3">
                      {icps.length > 0 ? `✓ ${icps.length} ICP${icps.length > 1 ? 's' : ''} created` : 'Get started here'}
                    </p>
                  )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        if (icps.length === 0) {
                          router.push('/icp-builder');
                        } else {
                          router.push('/icp-builder/manage');
                        }
                      }}
                      >
                        {icps.length > 0 ? 'Manage ICPs' : 'Create First ICP →'}
                      </Button>
                </CardContent>
              </Card>

              {/* Objection Killer */}
              <Card className={`hover:shadow-lg transition-shadow ${!hasICP ? 'opacity-50' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-blue-600">💪 Objection Killer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">Generate bulletproof rebuttals for any objection</p>
                  {!hasICP && !isLoadingICPs ? (
                    <p className="text-sm text-gray-500 mb-3">Create an ICP first</p>
                  ) : (
                    <p className="text-sm font-medium text-green-600 mb-3">Ready to use</p>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleQuickAction('objection-killer')}
                    disabled={!hasICP}
                  >
                    Generate Rebuttal
                  </Button>
                </CardContent>
              </Card>

              {/* Message Generator */}
              <Card className={`hover:shadow-lg transition-shadow ${!hasICP ? 'opacity-50' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-blue-600">✉️ Message Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">Create personalized outreach that gets responses</p>
                  {!hasICP && !isLoadingICPs ? (
                    <p className="text-sm text-gray-500 mb-3">Create an ICP first</p>
                  ) : (
                    <p className="text-sm font-medium text-green-600 mb-3">Ready to use</p>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleQuickAction('message-generator')}
                    disabled={!hasICP}
                  >
                    Generate Message
                  </Button>
                </CardContent>
              </Card>

              {/* Qualification Framework */}
              <Card className={`hover:shadow-lg transition-shadow ${!hasICP ? 'opacity-50' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-blue-600">🔍 Qualification Framework</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">Build discovery systems that identify ideal prospects</p>
                  {!hasICP && !isLoadingICPs ? (
                    <p className="text-sm text-gray-500 mb-3">Create an ICP first</p>
                  ) : (
                    <p className="text-sm font-medium text-green-600 mb-3">Ready to use</p>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleQuickAction('qualification-framework')}
                    disabled={!hasICP}
                  >
                    Generate Framework
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sales Library */}
            <Link href="/library">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-blue-600">📚 Sales Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Access all your saved objection rebuttals, messages, and frameworks</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Right Column - Recent Activity & Account */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentOutputs.length > 0 ? (
                  <div className="space-y-3">
                    {recentOutputs.map(output => (
                      <div key={output.id} className="border-l-2 border-blue-500 pl-3">
                        <p className="text-sm font-medium text-gray-900">{output.title}</p>
                        <p className="text-xs text-gray-500">
                          {output.type === 'objection' && '💪 Objection'}
                          {output.type === 'message' && '✉️ Message'}
                          {output.type === 'framework' && '🔍 Framework'}
                          {' • '}
                          {output.icpName}
                        </p>
                      </div>
                    ))}
                    <Link href="/library">
                      <Button variant="link" size="sm" className="w-full text-blue-600">
                        View All in Library →
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No activity yet. Start generating assets!</p>
                )}
              </CardContent>
            </Card>

            {/* Account Status */}
            {subscriptionTier === 'free' ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Free Tier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.max(0, 5 - userUsage)} / 5
                    </p>
                    <p className="text-gray-600">outputs remaining</p>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Upgrade to Pro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-800 mb-4">
                      ∞ Unlimited outputs<br/>
                      Priority support<br/>
                      Advanced features
                    </p>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleUpgrade}
                      disabled={isUpgrading}
                    >
                      {isUpgrading ? 'Loading...' : 'Upgrade - $49/mo'}
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Pro Member</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-900">∞ Unlimited</p>
                  <p className="text-green-700 mb-2">outputs available</p>
                  <p className="text-sm text-green-600">{userUsage} generated this month</p>
                </CardContent>
              </Card>
            )}

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">Need help getting started?</p>
                <Button variant="outline" className="w-full">Contact Support</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}