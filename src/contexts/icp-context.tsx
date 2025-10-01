'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();
  const [icps, setIcps] = useState<ICP[]>([]);
  const [selectedIcpId, setSelectedIcpId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const selectedIcp = icps.find(icp => icp.id === selectedIcpId) || null;

  const refreshIcps = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      // Immediately try to load saved ICP from localStorage to prevent flashing
      const savedIcpId = localStorage.getItem('selectedIcpId');
      if (savedIcpId) {
        setSelectedIcpId(savedIcpId);
      }

      const response = await fetch('/api/icps');
      const data = await response.json();
      const icpArray = data.icps || data || [];
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
    if (session) {
      refreshIcps();
    }
  }, [session]);

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