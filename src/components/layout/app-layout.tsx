'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
}

interface ICP {
  id: string;
  name: string;
  industry: string;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [icps, setIcps] = useState<ICP[]>([]);
  const [selectedIcpId, setSelectedIcpId] = useState<string>('');
  const [isLoadingICPs, setIsLoadingICPs] = useState(true);

  const isActive = (path: string) => pathname === path;

  // Load ICPs and selected ICP
  useEffect(() => {
    if (session) {
      fetch('/api/icps')
        .then(res => res.json())
        .then(data => {
          const icpArray = data.icps || data || [];
          setIcps(icpArray);

          // Load saved ICP selection
          const savedIcpId = localStorage.getItem('selectedIcpId');
          const savedIcpExists = icpArray.some((icp: ICP) => icp.id === savedIcpId);

          if (savedIcpId && savedIcpExists) {
            setSelectedIcpId(savedIcpId);
          } else if (icpArray.length > 0) {
            setSelectedIcpId(icpArray[0].id);
            localStorage.setItem('selectedIcpId', icpArray[0].id);
          }

          setIsLoadingICPs(false);
        })
        .catch(() => setIsLoadingICPs(false));
    }
  }, [session]);

  // Save ICP selection to localStorage
  useEffect(() => {
    if (selectedIcpId) {
      localStorage.setItem('selectedIcpId', selectedIcpId);
    }
  }, [selectedIcpId]);

  const handleIcpChange = (icpId: string) => {
    setSelectedIcpId(icpId);
    // Refresh the current page to pick up new ICP context
    window.location.reload();
  };

  const selectedIcp = icps.find(icp => icp.id === selectedIcpId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Persistent Navigation */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                ICPPilot
              </Link>

              {/* ICP Selector */}
              {icps.length > 0 && !isLoadingICPs && (
                <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                  <span className="text-sm text-blue-600 font-medium">Active ICP:</span>
                  <select
                    value={selectedIcpId}
                    onChange={(e) => handleIcpChange(e.target.value)}
                    className="text-sm bg-transparent border-none text-blue-700 font-medium focus:outline-none cursor-pointer"
                  >
                    {icps.map(icp => (
                      <option key={icp.id} value={icp.id}>
                        {icp.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/icp-builder/manage"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/icp-builder' || pathname === '/icp-builder/manage' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ICP Builder
              </Link>
              <Link
                href="/objection-killer"
                className={`text-sm font-medium transition-colors ${
                  isActive('/objection-killer') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Objections
              </Link>
              <Link
                href="/message-generator"
                className={`text-sm font-medium transition-colors ${
                  isActive('/message-generator') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Messages
              </Link>
              <Link
                href="/qualification-framework"
                className={`text-sm font-medium transition-colors ${
                  isActive('/qualification-framework') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Qualification
              </Link>
              <Link
                href="/library"
                className={`text-sm font-medium transition-colors ${
                  isActive('/library') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Library
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link
                href="/account"
                className={`text-sm font-medium hidden md:block transition-colors ${
                  isActive('/account') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {session?.user?.name}
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ICP Context Banner for Tool Pages */}
      {selectedIcp && (pathname === '/objection-killer' || pathname === '/message-generator' || pathname === '/qualification-framework') && (
        <div className="bg-blue-600 text-white py-2">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-blue-100">Generating for:</span>
              <span className="font-semibold">{selectedIcp.name}</span>
              <span className="text-blue-200">•</span>
              <span className="text-blue-200">{selectedIcp.industry}</span>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}