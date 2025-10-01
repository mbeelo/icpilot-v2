'use client';

import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SupportPage() {
  const [activeForm, setActiveForm] = useState<'suggest' | 'bug' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form states
  const [suggestForm, setSuggestForm] = useState({
    toolName: '',
    description: '',
    useCase: '',
    priority: 'medium',
    email: ''
  });

  const [bugForm, setBugForm] = useState({
    title: '',
    description: '',
    steps: '',
    expected: '',
    actual: '',
    severity: 'medium',
    email: '',
    browser: '',
    device: ''
  });

  const resetForms = () => {
    setSuggestForm({
      toolName: '',
      description: '',
      useCase: '',
      priority: 'medium',
      email: ''
    });
    setBugForm({
      title: '',
      description: '',
      steps: '',
      expected: '',
      actual: '',
      severity: 'medium',
      email: '',
      browser: '',
      device: ''
    });
    setActiveForm(null);
    setSubmitted(false);
  };

  const handleSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support/suggest-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestForm)
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(resetForms, 3000);
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support/report-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bugForm)
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(resetForms, 3000);
      }
    } catch (error) {
      console.error('Error submitting bug report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center">
            <div className="bg-green-100 border border-green-200 rounded-lg p-8">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h2>
              <p className="text-green-700 mb-4">
                Your {activeForm === 'suggest' ? 'tool suggestion' : 'bug report'} has been submitted successfully.
              </p>
              <p className="text-sm text-green-600">
                We&apos;ll review your submission and get back to you if we need more information.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Contact Support | ICP Pilot</title>
        <meta name="description" content="Get help with ICP Pilot. Suggest new sales tools or report bugs to improve your B2B sales enablement experience." />
        <meta name="robots" content="index, follow" />
      </Head>
      <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Support</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us make ICP Pilot better! Suggest new tools or report bugs to improve your experience.
          </p>
        </div>

        {!activeForm && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Suggest a Tool */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveForm('suggest')}>
              <CardContent className="p-8 text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Suggest a Tool</h3>
                <p className="text-gray-600 mb-4">
                  Have an idea for a new sales tool that would help your workflow? We&apos;d love to hear it!
                </p>
                <Button className="w-full">Suggest Tool</Button>
              </CardContent>
            </Card>

            {/* Report a Bug */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveForm('bug')}>
              <CardContent className="p-8 text-center">
                <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🐛</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Report a Bug</h3>
                <p className="text-gray-600 mb-4">
                  Found something that&apos;s not working right? Help us fix it by reporting the issue.
                </p>
                <Button variant="outline" className="w-full">Report Bug</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact Info */}
        {!activeForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:support@icpilot.com"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                <span>📧</span>
                support@icpilot.com
              </a>
              <span className="hidden sm:block text-gray-300">|</span>
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                <span>📊</span>
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Suggest Tool Form */}
        {activeForm === 'suggest' && (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Suggest a New Tool</h2>
                <Button variant="outline" onClick={resetForms}>← Back</Button>
              </div>

              <form onSubmit={handleSuggestSubmit} className="space-y-6">
                <div>
                  <label htmlFor="suggest-tool-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Tool Name *
                  </label>
                  <input
                    id="suggest-tool-name"
                    type="text"
                    required
                    autoComplete="off"
                    value={suggestForm.toolName}
                    onChange={(e) => setSuggestForm({...suggestForm, toolName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Competitor Analysis Tool, ROI Calculator"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={suggestForm.description}
                    onChange={(e) => setSuggestForm({...suggestForm, description: e.target.value})}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what this tool would do and how it would work..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Use Case *
                  </label>
                  <textarea
                    required
                    value={suggestForm.useCase}
                    onChange={(e) => setSuggestForm({...suggestForm, useCase: e.target.value})}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="When and why would you use this tool? What problem does it solve?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={suggestForm.priority}
                    onChange={(e) => setSuggestForm({...suggestForm, priority: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Nice to have</option>
                    <option value="medium">Would be helpful</option>
                    <option value="high">Really need this!</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email (optional)
                  </label>
                  <input
                    type="email"
                    value={suggestForm.email}
                    onChange={(e) => setSuggestForm({...suggestForm, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="We'll reach out if we have questions about your suggestion"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Bug Report Form */}
        {activeForm === 'bug' && (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Report a Bug</h2>
                <Button variant="outline" onClick={resetForms}>← Back</Button>
              </div>

              <form onSubmit={handleBugSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bug Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={bugForm.title}
                    onChange={(e) => setBugForm({...bugForm, title: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={bugForm.description}
                    onChange={(e) => setBugForm({...bugForm, description: e.target.value})}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What happened? Where did you encounter this issue?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Steps to Reproduce *
                  </label>
                  <textarea
                    required
                    value={bugForm.steps}
                    onChange={(e) => setBugForm({...bugForm, steps: e.target.value})}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1. Go to... 2. Click on... 3. Then..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Result *
                    </label>
                    <textarea
                      required
                      value={bugForm.expected}
                      onChange={(e) => setBugForm({...bugForm, expected: e.target.value})}
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What should have happened?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Result *
                    </label>
                    <textarea
                      required
                      value={bugForm.actual}
                      onChange={(e) => setBugForm({...bugForm, actual: e.target.value})}
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What actually happened?"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select
                    value={bugForm.severity}
                    onChange={(e) => setBugForm({...bugForm, severity: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low - Minor inconvenience</option>
                    <option value="medium">Medium - Affects my workflow</option>
                    <option value="high">High - Prevents me from using the feature</option>
                    <option value="critical">Critical - App is unusable</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Browser
                    </label>
                    <input
                      type="text"
                      value={bugForm.browser}
                      onChange={(e) => setBugForm({...bugForm, browser: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Chrome, Safari, Firefox"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Device
                    </label>
                    <input
                      type="text"
                      value={bugForm.device}
                      onChange={(e) => setBugForm({...bugForm, device: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Desktop, Mobile, Tablet"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Email
                    </label>
                    <input
                      type="email"
                      value={bugForm.email}
                      onChange={(e) => setBugForm({...bugForm, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="For follow-up questions"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </>
  );
}