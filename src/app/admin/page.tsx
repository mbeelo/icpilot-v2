'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminLink {
  title: string;
  description: string;
  href: string;
  icon: string;
  status?: 'live' | 'dev' | 'beta';
  external?: boolean;
}

export default function AdminHubPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple client-side check (in production, you'd want server-side validation)
    if (password === 'dev-admin-key') {
      setIsAuthenticated(true);
      localStorage.setItem('admin-authenticated', 'true');
    } else {
      setError('Invalid admin password');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Check if already authenticated
    const isAuth = localStorage.getItem('admin-authenticated');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const adminLinks: AdminLink[] = [
    // Content Management
    {
      title: 'Blog Admin',
      description: 'Manage blog posts, content calendar, and AI-generated content',
      href: '/admin/blog',
      icon: '📝',
      status: 'live'
    },
    {
      title: 'Support Dashboard',
      description: 'View and manage customer support requests and bug reports',
      href: '/admin/support',
      icon: '💬',
      status: 'live'
    },

    // Database & Development
    {
      title: 'Database Studio',
      description: 'Browse and edit database records directly',
      href: 'http://localhost:4983',
      icon: '🗄️',
      status: 'dev',
      external: true
    },
    {
      title: 'User Management',
      description: 'View user accounts, subscription status, and usage analytics',
      href: '/admin/users',
      icon: '👥',
      status: 'dev'
    },

    // Analytics & Monitoring
    {
      title: 'Usage Analytics',
      description: 'Monitor feature usage, performance metrics, and user behavior',
      href: '/admin/analytics',
      icon: '📊',
      status: 'dev'
    },
    {
      title: 'API Health Check',
      description: 'Monitor API endpoints, response times, and system health',
      href: '/admin/health',
      icon: '🏥',
      status: 'dev'
    },

    // Content & AI
    {
      title: 'AI Model Testing',
      description: 'Test and debug AI prompts, model responses, and content generation',
      href: '/admin/ai-testing',
      icon: '🤖',
      status: 'dev'
    },
    {
      title: 'Output Quality Review',
      description: 'Review and rate AI-generated outputs for quality assurance',
      href: '/admin/output-review',
      icon: '⭐',
      status: 'dev'
    },

    // System Administration
    {
      title: 'Feature Flags',
      description: 'Toggle features on/off for testing and gradual rollouts',
      href: '/admin/feature-flags',
      icon: '🚩',
      status: 'dev'
    },
    {
      title: 'System Logs',
      description: 'View application logs, errors, and debugging information',
      href: '/admin/logs',
      icon: '📋',
      status: 'dev'
    },
    {
      title: 'Email Templates',
      description: 'Manage and preview email templates for notifications',
      href: '/admin/email-templates',
      icon: '📧',
      status: 'dev'
    },
    {
      title: 'Backup & Recovery',
      description: 'Database backups, data export, and system recovery tools',
      href: '/admin/backup',
      icon: '💾',
      status: 'dev'
    }
  ];

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'live':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Live</span>;
      case 'beta':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Beta</span>;
      case 'dev':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Dev</span>;
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-center">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Authenticating...' : 'Access Admin Hub'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
                ← Back to Dashboard
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const liveLinks = adminLinks.filter(link => link.status === 'live');
  const devLinks = adminLinks.filter(link => link.status === 'dev' || !link.status);
  const betaLinks = adminLinks.filter(link => link.status === 'beta');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Hub</h1>
              <p className="text-gray-600">Central dashboard for all administrative and development tools</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAuthenticated(false);
                  localStorage.removeItem('admin-authenticated');
                }}
              >
                Sign Out
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">← Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{liveLinks.length}</div>
              <div className="text-sm text-gray-600">Live Tools</div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{devLinks.length}</div>
              <div className="text-sm text-gray-600">Dev Tools</div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{betaLinks.length}</div>
              <div className="text-sm text-gray-600">Beta Tools</div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{adminLinks.length}</div>
              <div className="text-sm text-gray-600">Total Tools</div>
            </CardContent>
          </Card>
        </div>

        {/* Live Tools */}
        {liveLinks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🟢 Live Production Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveLinks.map((link, index) => (
                <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl">{link.icon}</div>
                      {getStatusBadge(link.status)}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{link.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{link.description}</p>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button variant="outline" className="w-full">
                          Open Tool ↗
                        </Button>
                      </a>
                    ) : (
                      <Link href={link.href}>
                        <Button variant="outline" className="w-full">Open Tool</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Beta Tools */}
        {betaLinks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🔵 Beta Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {betaLinks.map((link, index) => (
                <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl">{link.icon}</div>
                      {getStatusBadge(link.status)}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{link.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{link.description}</p>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button variant="outline" className="w-full">
                          Open Tool ↗
                        </Button>
                      </a>
                    ) : (
                      <Link href={link.href}>
                        <Button variant="outline" className="w-full">Open Tool</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Dev Tools */}
        {devLinks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🟡 Development Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devLinks.map((link, index) => (
                <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl">{link.icon}</div>
                      {getStatusBadge(link.status)}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{link.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{link.description}</p>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button variant="outline" className="w-full">
                          Open Tool ↗
                        </Button>
                      </a>
                    ) : (
                      <Link href={link.href}>
                        <Button variant="outline" className="w-full text-yellow-700">Open Tool</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2">
              <CardContent className="p-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open('http://localhost:3001', '_blank')}
                >
                  🚀 Main App
                </Button>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open('http://localhost:4983', '_blank')}
                >
                  🗄️ Database
                </Button>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-4">
                <Link href="/admin/blog">
                  <Button variant="outline" className="w-full">📝 Blog</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-4">
                <Link href="/admin/support">
                  <Button variant="outline" className="w-full">💬 Support</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>ICP Pilot Admin Hub • Environment: Development • Build: v2.0.0</p>
        </div>
      </div>
    </div>
  );
}