import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    const { feedback } = await request.json();
    const { id: postId } = await params;

    // Get the blog post
    const [post] = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId));

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Update the blog post with rejection status and feedback
    await db.update(blogPosts)
      .set({
        approvalStatus: 'rejected',
        rejectionFeedback: feedback,
        updatedAt: new Date()
      })
      .where(eq(blogPosts.id, postId));

    return NextResponse.json({
      success: true,
      message: 'Post rejected. Feedback saved for regeneration.'
    });

  } catch (error) {
    console.error('Error rejecting blog post:', error);
    return NextResponse.json({ error: 'Failed to reject blog post' }, { status: 500 });
  }
}