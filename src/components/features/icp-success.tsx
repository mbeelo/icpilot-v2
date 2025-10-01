'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

interface NextStepOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  approach: string;
  bestFor: string;
  color: string;
}

export function ICPSuccess() {
  const [icpName, setIcpName] = useState('your ICP');
  const searchParams = useSearchParams();

  useEffect(() => {
    const name = searchParams.get('name');
    if (name) {
      setIcpName(name);
    }
  }, [searchParams]);

  const nextSteps = useMemo((): NextStepOption[] => [
    {
      id: 'objections',
      title: 'Objection Killer',
      description: 'Generate AI-powered rebuttals for common objections',
      icon: '🛡️',
      href: '/objection-killer',
      approach: 'Evidence-Based',
      bestFor: 'Handling price, timing, and competitor objections',
      color: 'border-red-200 bg-red-50'
    },
    {
      id: 'messages',
      title: 'Message Generator',
      description: 'Create personalized outreach messages that resonate',
      icon: '✉️',
      href: '/message-generator',
      approach: 'Personalized',
      bestFor: 'Cold emails, LinkedIn messages, and follow-ups',
      color: 'border-blue-200 bg-blue-50'
    },
    {
      id: 'qualification',
      title: 'Qualification Framework',
      description: 'Build discovery questions and scoring criteria',
      icon: '🎯',
      href: '/qualification-framework',
      approach: 'Systematic',
      bestFor: 'Discovery calls and lead qualification',
      color: 'border-green-200 bg-green-50'
    }
  ], []);

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900">
          Great job! {icpName} is ready to go.
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Now let&apos;s put this ICP to work. Choose your next step to start generating powerful sales content.
        </p>
      </div>

      {/* Next Steps Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {nextSteps.map((step) => (
          <Card key={step.id} className={`${step.color} border-2 hover:shadow-lg transition-all duration-200 group`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="text-3xl">{step.icon}</div>
                <span className="px-2 py-1 bg-white/80 text-gray-700 text-xs font-medium rounded">
                  {step.approach}
                </span>
              </div>
              <CardTitle className="text-xl group-hover:text-gray-800 transition-colors">
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                {step.description}
              </p>

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Best for:
                </p>
                <p className="text-sm text-gray-700">
                  {step.bestFor}
                </p>
              </div>

              <Link href={step.href} className="block">
                <Button className="w-full group-hover:bg-gray-800 transition-colors">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alternative Actions */}
      <div className="border-t pt-8 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 text-center">
          Or explore other options
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/icp-builder/manage">
            <Button variant="outline" size="lg">
              📋 Manage Your ICPs
            </Button>
          </Link>
          <Link href="/library">
            <Button variant="outline" size="lg">
              📚 View Output Library
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              🏠 Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}