'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function AppNav() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Home */}
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
            ICP Pilot
          </Link>

          {/* Main Nav */}
          <nav className="hidden md:flex items-center gap-6">
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
              href="/icp-builder"
              className={`text-sm font-medium transition-colors ${
                isActive('/icp-builder') 
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
              Objection Killer
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

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 hidden md:block">
              {user?.user_metadata?.name || user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setIsSigningOut(true);
                try {
                  await supabase.auth.signOut();
                  router.push('/login');
                } catch (error) {
                  console.error('Sign out error:', error);
                  setIsSigningOut(false);
                }
              }}
              disabled={isSigningOut}
            >
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}