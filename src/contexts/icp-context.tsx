'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

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

interface ICPContextType {
  icps: ICP[];
  selectedIcp: ICP | null;
  selectedIcpId: string;
  isLoading: boolean;
  setSelectedIcpId: (id: string) => void;
  refreshIcps: () => Promise<void>;
}

const ICPContext = createContext<ICPContextType | undefined>(undefined);

export function ICPProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [icps, setIcps] = useState<ICP[]>([]);
  const [selectedIcpId, setSelectedIcpId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const selectedIcp = icps.find(icp => icp.id === selectedIcpId) || null;

  // Set up Supabase auth listener
  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshIcps = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Immediately try to load saved ICP from localStorage to prevent flashing
      const savedIcpId = localStorage.getItem('selectedIcpId');
      if (savedIcpId) {
        setSelectedIcpId(savedIcpId);
      }

      const response = await fetch('/api/icps');

      if (!response.ok) {
        // Handle error responses (401, 500, etc)
        setIcps([]);
        return;
      }

      const data = await response.json();
      const icpArray = Array.isArray(data.icps) ? data.icps :
                       Array.isArray(data) ? data : [];
      setIcps(icpArray);

      // Validate saved ICP selection
      const savedIcpExists = icpArray.some((icp: ICP) => icp.id === savedIcpId);

      if (savedIcpId && savedIcpExists) {
        // Already set above, just validate it's still valid
        setSelectedIcpId(savedIcpId);
      } else if (icpArray.length > 0) {
        // Use first available ICP if saved one doesn't exist
        setSelectedIcpId(icpArray[0].id);
        localStorage.setItem('selectedIcpId', icpArray[0].id);
      }
    } catch (error) {
      console.error('Failed to load ICPs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetSelectedIcpId = (id: string) => {
    setSelectedIcpId(id);
    localStorage.setItem('selectedIcpId', id);
  };

  useEffect(() => {
    if (user) {
      refreshIcps();
    }
  }, [user]);

  const contextValue: ICPContextType = {
    icps,
    selectedIcp,
    selectedIcpId,
    isLoading,
    setSelectedIcpId: handleSetSelectedIcpId,
    refreshIcps,
  };

  return (
    <ICPContext.Provider value={contextValue}>
      {children}
    </ICPContext.Provider>
  );
}

export function useICP() {
  const context = useContext(ICPContext);
  if (context === undefined) {
    throw new Error('useICP must be used within an ICPProvider');
  }
  return context;
}