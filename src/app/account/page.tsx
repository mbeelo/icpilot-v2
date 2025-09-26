'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/app-layout';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isManagingBilling, setIsManagingBilling] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/usage');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

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

  const handleManageBilling = async () => {
    setIsManagingBilling(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        toast.error('Failed to open billing portal');
      }
    } catch (error) {
      toast.error('Error opening billing portal');
    } finally {
      setIsManagingBilling(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-8">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (!session || !userData) {
    return null;
  }

  const isPro = userData.subscriptionTier === 'pro';

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your account and subscription</p>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900">{session.user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{session.user?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Current Plan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isPro ? 'Pro' : 'Free'}
                </p>
                {isPro && (
                  <p className="text-sm text-gray-600">$49/month</p>
                )}
              </div>
              <div>
                {isPro ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    Free Tier
                  </span>
                )}
              </div>
            </div>

            {isPro ? (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleManageBilling}
                  disabled={isManagingBilling}
                >
                  {isManagingBilling ? 'Loading...' : 'Manage Billing'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Update payment method, view invoices, or cancel subscription
                </p>
              </div>
            ) : (
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? 'Loading...' : 'Upgrade to Pro - $49/mo'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Get unlimited outputs and priority support
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage This Month */}
        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {isPro ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Outputs</span>
                  <span className="font-semibold text-gray-900">{userData.usageCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Objections</span>
                  <span className="text-gray-800">{userData.objectionsGenerated || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Messages</span>
                  <span className="text-gray-800">{userData.messagesGenerated || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Frameworks</span>
                  <span className="text-gray-800">{userData.frameworksGenerated || 0}</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Outputs Used</span>
                  <span className="font-semibold text-gray-900">
                    {userData.usageCount} / 5
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(userData.usageCount / 5) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {5 - userData.usageCount} outputs remaining this month
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}