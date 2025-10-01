import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UsageData {
  usageCount: number;
  subscriptionTier: string;
  limit: number | null;
  hasReachedLimit: boolean;
  remainingOutputs: number | null;
  objectionsGenerated: number;
  messagesGenerated: number;
  frameworksGenerated: number;
}

export function useUsage() {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/user/usage');

      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }

      const data = await response.json();
      setUsage(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [session?.user?.id]);

  // Function to check if user can make a request before calling API
  const canMakeRequest = (): boolean => {
    if (!usage) return false; // Loading or error state
    return !usage.hasReachedLimit;
  };

  // Function to refresh usage data after a successful request
  const refreshUsage = () => {
    fetchUsage();
  };

  return {
    usage,
    loading,
    error,
    canMakeRequest,
    refreshUsage,
    hasReachedLimit: usage?.hasReachedLimit || false
  };
}