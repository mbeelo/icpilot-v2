'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Persistent Navigation */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
              ICPPilot
            </Link>

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
                  className={pathname === '/icp-builder' || pathname === '/icp-builder/manage' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}
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

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}