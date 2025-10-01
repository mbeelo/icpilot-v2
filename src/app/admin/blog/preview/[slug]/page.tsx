'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string;
  readingTime: number;
  publishedAt: string;
  createdAt: string;
  authorName: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  approvalStatus?: string;
  rejectionFeedback?: string;
  autoPublishDate?: string;
}

export default function BlogPreviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionFeedback, setRejectionFeedback] = useState('');

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      // Get all posts (including drafts) for admin preview
      const response = await fetch('/api/blog/posts');
      if (response.ok) {
        const data = await response.json();
        const foundPost = data.posts?.find((p: BlogPost) => p.slug === slug);

        if (foundPost) {
          setPost(foundPost);

          // Update meta tags
          if (foundPost.metaTitle) {
            document.title = `[PREVIEW] ${foundPost.metaTitle}`;
          }
        }
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const publishPost = async () => {
    if (!post) return;

    try {
      const response = await fetch(`/api/blog/posts/${post.id}`, {
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
        alert('Post published successfully!');
        // Reload post to get updated status
        loadPost();
      } else {
        alert('Failed to publish post');
      }
    } catch (error) {
      alert('Error publishing post');
    }
  };

  const approvePost = async (scheduleForPublish: boolean = false) => {
    if (!post) return;

    setIsApproving(true);
    try {
      const response = await fetch(`/api/blog/posts/${post.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'dev-admin-key'
        },
        body: JSON.stringify({ scheduleForPublish }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        loadPost();
      } else {
        alert('Failed to approve post');
      }
    } catch (error) {
      alert('Error approving post');
    } finally {
      setIsApproving(false);
    }
  };

  const rejectPost = async () => {
    if (!post || !rejectionFeedback.trim()) return;

    setIsRejecting(true);
    try {
      const response = await fetch(`/api/blog/posts/${post.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'dev-admin-key'
        },
        body: JSON.stringify({ feedback: rejectionFeedback }),
      });

      if (response.ok) {
        alert('Post rejected. Feedback saved for regeneration.');
        setShowRejectionModal(false);
        setRejectionFeedback('');
        loadPost();
      } else {
        alert('Failed to reject post');
      }
    } catch (error) {
      alert('Error rejecting post');
    } finally {
      setIsRejecting(false);
    }
  };

  const regeneratePost = async () => {
    if (!post) return;

    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/blog/posts/${post.id}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'dev-admin-key'
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Post regenerated successfully! Word count: ${result.wordCount}`);
        loadPost();
      } else {
        alert('Failed to regenerate post');
      }
    } catch (error) {
      alert('Error regenerating post');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-6">The blog post you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/admin/blog">
              <Button>← Back to Admin</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-orange-100 border-b border-orange-200">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/blog" className="text-orange-700 hover:text-orange-800 font-medium">
                ← Back to Admin
              </Link>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  post.isPublished
                    ? 'bg-green-200 text-green-800'
                    : post.approvalStatus === 'approved'
                    ? 'bg-blue-200 text-blue-800'
                    : post.approvalStatus === 'rejected'
                    ? 'bg-red-200 text-red-800'
                    : 'bg-orange-200 text-orange-800'
                }`}>
                  {post.isPublished
                    ? '✓ PUBLISHED'
                    : post.approvalStatus === 'approved'
                    ? '✓ APPROVED'
                    : post.approvalStatus === 'rejected'
                    ? '✗ REJECTED'
                    : '📝 PENDING REVIEW'}
                </span>
                {!post.isPublished && (
                  <span className="text-xs text-orange-700">
                    {post.approvalStatus === 'approved' && post.autoPublishDate
                      ? `Scheduled for ${new Date(post.autoPublishDate).toLocaleDateString()}`
                      : 'This is a preview - not visible to public'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {post.approvalStatus === 'pending' && (
                <>
                  <Button
                    onClick={() => approvePost(false)}
                    disabled={isApproving}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    {isApproving ? 'Approving...' : 'Approve & Publish Now'}
                  </Button>
                  <Button
                    onClick={() => approvePost(true)}
                    disabled={isApproving}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                    size="sm"
                  >
                    {isApproving ? 'Approving...' : 'Approve & Schedule'}
                  </Button>
                  <Button
                    onClick={() => setShowRejectionModal(true)}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                    size="sm"
                  >
                    Reject & Give Feedback
                  </Button>
                </>
              )}

              {post.approvalStatus === 'rejected' && (
                <Button
                  onClick={regeneratePost}
                  disabled={isRegenerating}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  {isRegenerating ? 'Regenerating...' : 'Regenerate with Feedback'}
                </Button>
              )}

              {post.approvalStatus === 'approved' && !post.isPublished && (
                <Button
                  onClick={publishPost}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  Publish Now
                </Button>
              )}

              {post.isPublished && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                  size="sm"
                >
                  View Live Post
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-4">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                {post.category}
              </span>
              <span>{post.readingTime} min read</span>
              <span>{new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-6">
            {post.title}
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div className="text-sm text-gray-600">
              By <span className="font-medium">{post.authorName}</span>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 5).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg prose-blue max-w-none prose-p:mb-6 prose-headings:mb-6 prose-headings:mt-8">
          <div
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="text-gray-800 leading-relaxed [&>p]:mb-6 [&>h1]:mb-6 [&>h1]:mt-8 [&>h2]:mb-6 [&>h2]:mt-8 [&>h3]:mb-4 [&>h3]:mt-6 [&>h4]:mb-4 [&>h4]:mt-6 [&>ul]:mb-6 [&>ol]:mb-6 [&>blockquote]:mb-6"
          />
        </div>

        {/* SEO Preview */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Preview</h3>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="text-blue-600 text-lg font-medium mb-1">
              {post.metaTitle || post.title}
            </div>
            <div className="text-green-700 text-sm mb-2">
              https://icpilot.com/blog/{post.slug}
            </div>
            <div className="text-gray-600 text-sm">
              {post.metaDescription || post.excerpt}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Sales Process?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of sales professionals using ICP Pilot to generate world-class objection rebuttals, personalized messages, and qualification frameworks in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </article>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Post</h3>
            <p className="text-sm text-gray-600 mb-4">
              Provide specific feedback for regeneration. Be clear about what needs to be improved.
            </p>
            <textarea
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              placeholder="e.g., 'The intro is too generic. Need more specific ICP Pilot examples. The conclusion should include a stronger call-to-action about our methodology expertise.'"
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={rejectPost}
                disabled={isRejecting || !rejectionFeedback.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isRejecting ? 'Submitting...' : 'Reject & Save Feedback'}
              </Button>
              <Button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionFeedback('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}