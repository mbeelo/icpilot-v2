'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  isPublished: boolean;
  readingTime: number;
  createdAt: string;
}

interface CalendarItem {
  id: string;
  title: string;
  category: string;
  contentType: string;
  priority: string;
  status: string;
  scheduledDate: string;
}

export default function BlogAdminPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [generationStats, setGenerationStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    pendingCalendarItems: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [postsRes, calendarRes] = await Promise.all([
        fetch('/api/blog/posts'),
        fetch('/api/blog/calendar')
      ]);

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setBlogPosts(postsData.posts || []);

        const published = postsData.posts?.filter((p: BlogPost) => p.isPublished).length || 0;
        const draft = postsData.posts?.filter((p: BlogPost) => !p.isPublished).length || 0;

        setGenerationStats(prev => ({
          ...prev,
          totalPosts: postsData.posts?.length || 0,
          publishedPosts: published,
          draftPosts: draft
        }));
      }

      if (calendarRes.ok) {
        const calendarData = await calendarRes.json();
        setCalendarItems(calendarData.calendar || []);

        const pending = calendarData.calendar?.filter((c: CalendarItem) => c.status === 'planned').length || 0;
        setGenerationStats(prev => ({
          ...prev,
          pendingCalendarItems: pending
        }));
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContentCalendar = async (forceGenerate = false) => {
    if (!isAuthenticated) {
      toast.error('Please enter admin key first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/blog/generate-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ forceGenerate }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Generated ${data.calendar.length} content calendar items for ${data.calendarPeriod?.start} - ${data.calendarPeriod?.end}!`);
        loadData();
      } else if (response.status === 409) {
        const conflict = await response.json();
        toast.error(
          `Calendar conflict: ${conflict.existingCalendar.count} items already exist (${conflict.existingCalendar.dateRange.start} - ${conflict.existingCalendar.dateRange.end}). Use "Force Generate" to override.`,
          { duration: 6000 }
        );
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate content calendar');
      }
    } catch {
      toast.error('Error generating content calendar');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBlogPosts = async (batchSize: number = 3) => {
    if (!isAuthenticated) {
      toast.error('Please enter admin key first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/blog/generate-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ batchSize }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Generated ${data.postsGenerated} blog posts!`);
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate blog posts');
      }
    } catch {
      toast.error('Error generating blog posts');
    } finally {
      setIsGenerating(false);
    }
  };

  const publishPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublished: true,
          publishedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        toast.success('Post published successfully!');
        loadData();
      } else {
        toast.error('Failed to publish post');
      }
    } catch {
      toast.error('Error publishing post');
    }
  };

  // Authentication interface
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">🤖 Blog Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Enter admin key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full p-3 border-2 border-blue-200 rounded-xl text-sm font-medium text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setIsAuthenticated(true);
                    toast.success('Access granted!');
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (adminKey) {
                    setIsAuthenticated(true);
                    toast.success('Access granted!');
                  } else {
                    toast.error('Please enter admin key');
                  }
                }}
                className="w-full"
              >
                Access Blog Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog admin...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI Blog Generator</h1>
          <p className="text-gray-600">Automated SEO content generation and management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Total Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{generationStats.totalPosts}</p>
              <p className="text-xs text-gray-500">blog posts generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{generationStats.publishedPosts}</p>
              <p className="text-xs text-gray-500">live on website</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{generationStats.draftPosts}</p>
              <p className="text-xs text-gray-500">pending review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Content Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{generationStats.pendingCalendarItems}</p>
              <p className="text-xs text-gray-500">ready to generate</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">📅 Content Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Generate a strategic 30-day content calendar with SEO-optimized topics, keywords, and content briefs.
              </p>
              <Button
                onClick={() => generateContentCalendar()}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating Calendar...' : 'Generate Content Calendar'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">✍️ Blog Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Generate complete, SEO-optimized blog posts from your content calendar. Each post is 1500-2500 words.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => generateBlogPosts(1)}
                  disabled={isGenerating || generationStats.pendingCalendarItems === 0}
                  variant="outline"
                  className="w-full"
                >
                  Generate 1 Post
                </Button>
                <Button
                  onClick={() => generateBlogPosts(3)}
                  disabled={isGenerating || generationStats.pendingCalendarItems === 0}
                  className="w-full"
                >
                  {isGenerating ? 'Generating Posts...' : 'Generate 3 Posts'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Calendar Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📅 Content Calendar
              {calendarItems.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({calendarItems.length} items)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calendarItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    📝
                  </div>
                  <p className="text-gray-500 font-medium">No content calendar generated yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Generate a content calendar to see your 30-day publishing schedule
                  </p>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={() => generateContentCalendar(false)}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? 'Generating Calendar...' : 'Generate Content Calendar'}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {/* Calendar Overview */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Calendar Period</p>
                      <p className="text-lg font-bold text-blue-700">
                        {new Date(Math.min(...calendarItems.map(item => new Date(item.scheduledDate).getTime()))).toLocaleDateString()}
                        {' - '}
                        {new Date(Math.max(...calendarItems.map(item => new Date(item.scheduledDate).getTime()))).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Publishing Status</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-sm">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          {calendarItems.filter(item => item.status === 'completed').length} completed
                        </span>
                        <span className="text-sm">
                          <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                          {calendarItems.filter(item => item.status === 'planned').length} planned
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Next Generation</p>
                      <p className="text-sm text-blue-700">
                        {new Date(Math.max(...calendarItems.map(item => new Date(item.scheduledDate).getTime()))).getTime() < Date.now()
                          ? 'Ready for next calendar'
                          : `Wait until ${new Date(Math.max(...calendarItems.map(item => new Date(item.scheduledDate).getTime())) + 86400000).toLocaleDateString()}`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Calendar Timeline */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {calendarItems
                    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                    .map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border-l-4 ${
                        item.status === 'completed'
                          ? 'border-green-500 bg-green-50'
                          : item.status === 'in-progress'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex-shrink-0 w-20">
                        <p className="text-xs font-medium text-gray-500">
                          {new Date(item.scheduledDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(item.scheduledDate).toLocaleDateString('en-US', {
                            weekday: 'short'
                          })}
                        </p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {item.contentType}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : item.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          item.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'in-progress'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status === 'completed' ? '✓ Published' :
                           item.status === 'in-progress' ? '⏳ Generating' :
                           '📝 Planned'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calendar Actions */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-3 mb-4">
                    <Button
                      onClick={() => generateBlogPosts(1)}
                      disabled={isGenerating || generationStats.pendingCalendarItems === 0}
                      size="sm"
                      variant="outline"
                    >
                      Generate Next Post
                    </Button>
                    {generationStats.pendingCalendarItems === 0 && (
                      <>
                        <Button
                          onClick={() => generateContentCalendar(false)}
                          disabled={isGenerating}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Generate Next 30-Day Calendar
                        </Button>
                        <Button
                          onClick={() => generateContentCalendar(true)}
                          disabled={isGenerating}
                          size="sm"
                          variant="outline"
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          Force Generate (Override)
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">
                      <strong>Calendar Status:</strong> {generationStats.pendingCalendarItems > 0
                        ? `${generationStats.pendingCalendarItems} content ideas ready for generation`
                        : 'All calendar items have been generated - ready for next calendar period'
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Smart Scheduling:</strong> New calendars automatically start after the last scheduled post to prevent conflicts.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Blog Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {blogPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No blog posts generated yet.</p>
                <p className="text-sm text-gray-400 mt-2">Generate a content calendar first, then create your posts!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blogPosts.slice(0, 10).map((post) => (
                  <div key={post.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {post.category}
                          </span>
                          <span>{post.readingTime} min read</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded-full ${
                            post.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {post.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/admin/blog/preview/${post.slug}`, '_blank')}
                        >
                          Preview Draft
                        </Button>
                        {!post.isPublished && (
                          <Button
                            size="sm"
                            onClick={() => publishPost(post.id)}
                          >
                            Publish
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}