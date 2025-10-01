import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts, contentCalendar } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { analyzeICPPilotMarket, generateICPPilotBlogPost } from '@/lib/blog-ai-demo';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check for admin key
    const adminKey = process.env.BLOG_ADMIN_KEY || 'dev-admin-key';
    const providedKey = request.headers.get('x-admin-key');

    if (providedKey !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: postId } = await params;

    // Get the current blog post and its rejection feedback
    const [post] = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId));

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Get the related content calendar item
    const [calendarItem] = await db.select()
      .from(contentCalendar)
      .where(eq(contentCalendar.blogPostId, postId));

    if (!calendarItem) {
      return NextResponse.json({ error: 'Related content calendar item not found' }, { status: 404 });
    }

    console.log(`Regenerating post with feedback: ${post.rejectionFeedback}`);

    // Get fresh market analysis
    const analysis = await analyzeICPPilotMarket();

    // Regenerate the blog post with feedback incorporated
    const blogContent = await generateICPPilotBlogPost(
      {
        title: calendarItem.title,
        category: calendarItem.category,
        targetKeywords: typeof calendarItem.targetKeywords === 'string'
          ? JSON.parse(calendarItem.targetKeywords)
          : calendarItem.targetKeywords || [],
        contentBrief: calendarItem.contentBrief +
          (post.rejectionFeedback ? `\n\nPREVIOUS FEEDBACK TO ADDRESS: ${post.rejectionFeedback}` : ''),
        targetAudience: calendarItem.targetAudience || '',
        contentType: calendarItem.contentType,
        priority: calendarItem.priority as 'high' | 'medium' | 'low',
        scheduledDate: calendarItem.scheduledDate?.toISOString() || new Date().toISOString()
      },
      analysis
    );

    // Parse reading time to ensure it's a number
    let readingTime = 5; // default
    if (blogContent.readingTime !== undefined && blogContent.readingTime !== null) {
      if (typeof blogContent.readingTime === 'number') {
        readingTime = blogContent.readingTime;
      } else {
        // Handle string reading time - extract number from strings like "10 minutes", "5 min", etc.
        const readingTimeStr = String(blogContent.readingTime);
        const match = readingTimeStr.match(/\d+/);
        readingTime = match ? parseInt(match[0]) : 5;
      }
    }

    // Validate and truncate field lengths
    const validateAndTruncate = (str: string | undefined, maxLength: number) => {
      if (!str) return '';
      return str.length > maxLength ? str.substring(0, maxLength) : str;
    };

    // Update the existing blog post with new content
    await db.update(blogPosts)
      .set({
        title: validateAndTruncate(blogContent.title, 255),
        excerpt: validateAndTruncate(blogContent.excerpt, 500),
        content: blogContent.content || '',
        metaTitle: validateAndTruncate(blogContent.metaTitle, 60),
        metaDescription: validateAndTruncate(blogContent.metaDescription, 160),
        targetKeywords: JSON.stringify(blogContent.targetKeywords || []),
        category: validateAndTruncate(blogContent.category || calendarItem.category, 100),
        tags: JSON.stringify(blogContent.tags || []),
        readingTime,
        approvalStatus: 'pending', // Reset approval status
        rejectionFeedback: null, // Clear previous feedback
        updatedAt: new Date()
      })
      .where(eq(blogPosts.id, postId));

    return NextResponse.json({
      success: true,
      message: 'Post regenerated successfully with feedback incorporated',
      wordCount: blogContent.content?.length || 0
    });

  } catch (error) {
    console.error('Error regenerating blog post:', error);
    return NextResponse.json({ error: 'Failed to regenerate blog post' }, { status: 500 });
  }
}