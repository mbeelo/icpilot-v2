import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts, contentCalendar } from '@/db/schema';
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

    const { scheduleForPublish } = await request.json();
    const { id: postId } = await params;

    // Get the blog post
    const [post] = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId));

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Get the related content calendar item to find the scheduled date
    const [calendarItem] = await db.select()
      .from(contentCalendar)
      .where(eq(contentCalendar.blogPostId, postId));

    const updateData: {
      approvalStatus: string;
      updatedAt: Date;
      autoPublishDate?: Date;
      isPublished?: boolean;
      publishedAt?: Date;
    } = {
      approvalStatus: 'approved',
      updatedAt: new Date()
    };

    if (scheduleForPublish && calendarItem?.scheduledDate) {
      // Schedule for auto-publish on the calendar date
      updateData.autoPublishDate = calendarItem.scheduledDate;
      updateData.isPublished = false; // Keep as draft until scheduled date
    } else {
      // Publish immediately
      updateData.isPublished = true;
      updateData.publishedAt = new Date();
    }

    // Update the blog post
    await db.update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, postId));

    // Update calendar status to published if publishing immediately
    if (!scheduleForPublish || !calendarItem?.scheduledDate) {
      await db.update(contentCalendar)
        .set({
          status: 'published',
          updatedAt: new Date()
        })
        .where(eq(contentCalendar.blogPostId, postId));
    }

    return NextResponse.json({
      success: true,
      message: scheduleForPublish && calendarItem?.scheduledDate
        ? `Post approved and scheduled for ${calendarItem.scheduledDate.toLocaleDateString()}`
        : 'Post approved and published successfully',
      publishType: scheduleForPublish && calendarItem?.scheduledDate ? 'scheduled' : 'immediate'
    });

  } catch (error) {
    console.error('Error approving blog post:', error);
    return NextResponse.json({ error: 'Failed to approve blog post' }, { status: 500 });
  }
}