'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
  authorName: string;
  metaTitle?: string;
  metaDescription?: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      // In a real implementation, you'd have an API endpoint to get post by slug
      const response = await fetch('/api/blog/posts?published=true');
      if (response.ok) {
        const data = await response.json();
        const foundPost = data.posts?.find((p: BlogPost) => p.slug === slug);

        if (foundPost) {
          setPost(foundPost);

          // Get related posts from same category
          const related = data.posts
            ?.filter((p: BlogPost) => p.category === foundPost.category && p.slug !== slug)
            ?.slice(0, 3) || [];
          setRelatedPosts(related);

          // Update meta tags
          if (foundPost.metaTitle) {
            document.title = foundPost.metaTitle;
          }
          if (foundPost.metaDescription) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              metaDesc.setAttribute('content', foundPost.metaDescription);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
    } finally {
      setIsLoading(false);
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
            <Link href="/blog">
              <Button>← Back to Blog</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Blog
          </Link>
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
              <span>{new Date(post.publishedAt).toLocaleDateString('en-US', {
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

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <Card key={relatedPost.id} className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {relatedPost.category}
                      </span>
                    </div>
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h4>
                    </Link>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                      {relatedPost.excerpt}
                    </p>
                    <div className="text-xs text-gray-500">
                      {relatedPost.readingTime} min read
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}