'use client';

import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/app-layout';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useICP } from '@/contexts/icp-context';


interface RecentOutput {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  icpName: string;
  isSaved?: boolean;
  isTemporary?: boolean;
}

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { icps, selectedIcp, selectedIcpId, setSelectedIcpId, isLoading: isLoadingICPs } = useICP();
  const [userUsage, setUserUsage] = useState(0);
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [recentOutputs, setRecentOutputs] = useState<RecentOutput[]>([]);
  const [outputStats, setOutputStats] = useState({ objections: 0, messages: 0, frameworks: 0 });
  const [isMilestoneBannerDismissed, setIsMilestoneBannerDismissed] = useState(false);

// Detect successful upgrade from URL params
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('upgrade') === 'success') {
    // Show success toast and clean up URL
    toast.success('🎉 Welcome to Pro! Enjoy unlimited access to all tools.');
    // Clean up the URL without reloading
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }

  // Check if milestone banner was previously dismissed
  const dismissed = localStorage.getItem('milestoneBannerDismissed');
  if (dismissed === 'true') {
    setIsMilestoneBannerDismissed(true);
  }
}, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchData = () => {
      if (user) {
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


        // Fetch both saved and temporary outputs for activity feed
        Promise.all([
          fetch('/api/outputs'),
          fetch('/api/outputs/temporary')
        ])
        .then(([savedRes, tempRes]) => Promise.all([savedRes.json(), tempRes.json()]))
        .then(([savedData, tempData]) => {
          const savedOutputs = (savedData.outputs || []).map((o: RecentOutput) => ({...o, isSaved: true}));
          const tempOutputs = (tempData.outputs || []).map((o: RecentOutput) => ({...o, isTemporary: true}));
          const allOutputs = [...savedOutputs, ...tempOutputs]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 8); // Show more recent items
          setRecentOutputs(allOutputs);
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
  }, [user]);

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
    } catch {
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

  const dismissMilestoneBanner = () => {
    setIsMilestoneBannerDismissed(true);
    localStorage.setItem('milestoneBannerDismissed', 'true');
  };

  const saveToLibrary = async (output: RecentOutput) => {
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
        // Refresh the recent outputs data
        if (user) {
          Promise.all([
            fetch('/api/outputs'),
            fetch('/api/outputs/temporary')
          ])
          .then(([savedRes, tempRes]) => Promise.all([savedRes.json(), tempRes.json()]))
          .then(([savedData, tempData]) => {
            const savedOutputs = (savedData.outputs || []).map((o: RecentOutput) => ({...o, isSaved: true}));
            const tempOutputs = (tempData.outputs || []).map((o: RecentOutput) => ({...o, isTemporary: true}));
            const allOutputs = [...savedOutputs, ...tempOutputs]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 8);
            setRecentOutputs(allOutputs);
          })
          .catch(console.error);
        }
      } else {
        toast.error('Failed to save to library');
      }
    } catch {
      toast.error('Error saving to library');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  // Show loading state while ICPs are being fetched to prevent flash
  if (isLoadingICPs) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const hasICP = icps.length > 0;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
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

        {/* Weekly Progress & Stats */}
        {hasICP && (
          <>
            {/* Progress Summary */}
            {(outputStats.objections > 0 || outputStats.messages > 0 || outputStats.frameworks > 0) && !isMilestoneBannerDismissed && (
              <Card className="mb-6 border-green-200 bg-green-50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">🎉</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-1">
                        Your team is getting stronger!
                      </h3>
                      <p className="text-green-700 text-sm">
                        You&apos;ve built {outputStats.objections + outputStats.messages + outputStats.frameworks} assets using proven industry methodologies.
                        {outputStats.objections > 0 && ` ${outputStats.objections} world-class rebuttals`}
                        {outputStats.messages > 0 && ` • ${outputStats.messages} high-converting messages`}
                        {outputStats.frameworks > 0 && ` • ${outputStats.frameworks} strategic frameworks`}
                        . Your competitive advantage is growing! 🚀
                      </p>
                    </div>
                    <button
                      onClick={dismissMilestoneBanner}
                      className="text-green-600 hover:text-green-800 transition-colors p-1"
                      aria-label="Dismiss milestone banner"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="md:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Active ICP</CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    value={selectedIcpId}
                    onChange={(e) => setSelectedIcpId(e.target.value)}
                    className="w-full p-3 border-2 border-blue-200 rounded-xl text-sm font-medium text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-blue-300 hover:shadow-md transform hover:-translate-y-0.5 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em'
                    }}
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
                      className="w-full mt-3"
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

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Objections Handled</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{outputStats.objections}</p>
                  <p className="text-xs text-gray-500">rebuttals ready to use</p>
                  {outputStats.objections > 0 && (
                    <p className="text-xs text-green-600 mt-1">💪 {outputStats.objections * 15} minutes saved</p>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Outreach Generated</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{outputStats.messages}</p>
                  <p className="text-xs text-gray-500">personalized messages</p>
                  {outputStats.messages > 0 && (
                    <p className="text-xs text-green-600 mt-1">⚡ {outputStats.messages * 20} minutes saved</p>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Discovery Systems</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-600">{outputStats.frameworks}</p>
                  <p className="text-xs text-gray-500">qualification frameworks</p>
                  {outputStats.frameworks > 0 && (
                    <p className="text-xs text-green-600 mt-1">🎯 {outputStats.frameworks * 45} minutes saved</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Tools */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Multipliers</h2>
              <p className="text-gray-600 mb-6">Leverage industry-proven sales methodologies powered by AI</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* ICP Builder - Always enabled */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-blue-600">🎯 ICP Builder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">Define your ideal prospects to fuel world-class sales assets</p>
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
                  <p className="text-gray-600 text-sm mb-3">Handle objections using world-class industry frameworks</p>
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
                  <p className="text-gray-600 text-sm mb-3">Send outreach using proven high-converting frameworks</p>
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
                  <p className="text-gray-600 text-sm mb-3">Qualify prospects using industry-proven discovery frameworks</p>
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
                      <div
                        key={output.id}
                        className="group border-l-2 border-blue-500 pl-3 py-2 cursor-pointer hover:bg-gray-50 rounded-r-lg transition-colors"
                        onClick={() => router.push(`/library?outputId=${output.id}`)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">{output.title}</p>
                              {output.isSaved && (
                                <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                                  💾
                                </span>
                              )}
                              {output.isTemporary && (
                                <span className="bg-orange-100 text-orange-800 text-xs px-1.5 py-0.5 rounded-full">
                                  🕒
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {output.type === 'objection' && '💪 Objection'}
                              {output.type === 'message' && '✉️ Message'}
                              {output.type === 'framework' && '🔍 Framework'}
                              {' • '}
                              {output.icpName}
                              {' • '}
                              {new Date(output.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to view in library →
                            </p>
                          </div>
                          {output.isTemporary && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent navigation when clicking save button
                                saveToLibrary(output);
                              }}
                              className="ml-2 text-xs px-2 py-1 h-auto bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                            >
                              💾 Save
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Link href="/library">
                      <Button variant="outline" size="sm" className="w-full">
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
                <Link href="/support">
                  <Button variant="outline" className="w-full">Contact Support</Button>
                </Link>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}