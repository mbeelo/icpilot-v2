'use client';

import { useUser } from '@/hooks/use-user';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useICP } from '@/contexts/icp-context';

interface AppLayoutProps {
  children: React.ReactNode;
}


export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useUser();
  const { icps, selectedIcp, selectedIcpId, isLoading: isLoadingICPs, setSelectedIcpId } = useICP();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isActive = (path: string) => pathname === path;

  // All useEffect hooks must be called before any early returns
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);


  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect is in progress)
  if (!user) {
    return null;
  }

  // Show loading while ICPs are being fetched to prevent flashing
  if (isLoadingICPs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const handleIcpChange = (icpId: string) => {
    setSelectedIcpId(icpId);
    // Refresh the current page to pick up new ICP context
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Persistent Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                ICP Pilot
              </Link>

              {/* ICP Selector */}
              {icps.length > 0 && !isLoadingICPs && (
                <div className="hidden lg:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                  <span className="text-sm text-blue-700 font-medium">Active ICP:</span>
                  <select
                    value={selectedIcpId}
                    onChange={(e) => handleIcpChange(e.target.value)}
                    className="text-sm bg-transparent border-none text-blue-800 font-medium focus:outline-none cursor-pointer appearance-none pr-6"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2393c5fd' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.25rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1rem 1rem'
                    }}
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

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/icp-builder/manage"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/icp-builder' || pathname === '/icp-builder/manage'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ICP Builder
              </Link>
              <Link
                href="/objection-killer"
                className={`text-sm font-medium transition-colors ${
                  isActive('/objection-killer')
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Objections
              </Link>
              <Link
                href="/message-generator"
                className={`text-sm font-medium transition-colors ${
                  isActive('/message-generator')
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Messages
              </Link>
              <Link
                href="/qualification-framework"
                className={`text-sm font-medium transition-colors ${
                  isActive('/qualification-framework')
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Qualification
              </Link>
              <Link
                href="/library"
                className={`text-sm font-medium transition-colors ${
                  isActive('/library')
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Library
              </Link>
            </nav>


            <div className="flex items-center gap-4">
              <Link
                href="/account"
                className={`text-sm font-medium hidden lg:block transition-colors ${
                  isActive('/account') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {user?.user_metadata?.name || user?.email}
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setIsSigningOut(true);
                  try {
                    await supabase.auth.signOut();
                    window.location.href = '/login';
                  } catch (error) {
                    console.error('Sign out error:', error);
                    setIsSigningOut(false);
                  }
                }}
                disabled={isSigningOut}
                className="hidden lg:flex"
              >
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </Button>

              {/* Mobile/Tablet Menu Button - Far Right */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                  }`}></span>
                  <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}></span>
                  <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                  }`}></span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200">
            <div className="px-6 py-4 space-y-4">
              {/* Mobile ICP Selector */}
              {icps.length > 0 && !isLoadingICPs && (
                <div className="pb-4 border-b border-gray-100">
                  <span className="text-sm text-gray-600 font-medium block mb-2">Active ICP:</span>
                  <select
                    value={selectedIcpId}
                    onChange={(e) => handleIcpChange(e.target.value)}
                    className="w-full p-3 border-2 border-blue-200 rounded-xl text-sm font-medium text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-blue-300 hover:shadow-md appearance-none cursor-pointer"
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
                </div>
              )}

              {/* Mobile Navigation Links */}
              <nav className="space-y-3">
                <Link
                  href="/dashboard"
                  className={`block py-2 text-base font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/icp-builder/manage"
                  className={`block py-2 text-base font-medium transition-colors ${
                    pathname === '/icp-builder' || pathname === '/icp-builder/manage'
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🎯 ICP Builder
                </Link>
                <Link
                  href="/objection-killer"
                  className={`block py-2 text-base font-medium transition-colors ${
                    isActive('/objection-killer')
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  💪 Objections
                </Link>
                <Link
                  href="/message-generator"
                  className={`block py-2 text-base font-medium transition-colors ${
                    isActive('/message-generator')
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ✉️ Messages
                </Link>
                <Link
                  href="/qualification-framework"
                  className={`block py-2 text-base font-medium transition-colors ${
                    isActive('/qualification-framework')
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🔍 Qualification
                </Link>
                <Link
                  href="/library"
                  className={`block py-2 text-base font-medium transition-colors ${
                    isActive('/library')
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  📚 Library
                </Link>
              </nav>

              {/* Mobile User Actions */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <Link
                  href="/account"
                  className={`block py-2 text-base font-medium transition-colors ${
                    isActive('/account') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  👤 {user?.user_metadata?.name || user?.email}
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    setIsSigningOut(true);
                    try {
                      await supabase.auth.signOut();
                      window.location.href = '/login';
                    } catch (error) {
                      console.error('Sign out error:', error);
                      setIsSigningOut(false);
                    }
                  }}
                  disabled={isSigningOut}
                  className="w-full justify-start"
                >
                  🚪 {isSigningOut ? 'Signing out...' : 'Sign Out'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ICP Context Banner for Tool Pages */}
      {selectedIcp && (pathname === '/objection-killer' || pathname === '/message-generator' || pathname === '/qualification-framework') && (
        <div className="bg-blue-600 text-white py-2">
          <div className="max-w-7xl mx-auto px-6">
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