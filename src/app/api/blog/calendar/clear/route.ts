import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contentCalendar, blogPosts } from '@/db/schema';

export async function DELETE(request: NextRequest) {
  try {
    // Check for admin key (set in environment for security)
    const adminKey = process.env.BLOG_ADMIN_KEY || 'dev-admin-key';
    const providedKey = request.headers.get('x-admin-key');

    if (providedKey !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all calendar entries and blog posts
    await db.delete(blogPosts);
    await db.delete(contentCalendar);

    return NextResponse.json({
      success: true,
      message: 'Calendar and blog posts cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing calendar:', error);
    return NextResponse.json({ error: 'Failed to clear calendar' }, { status: 500 });
  }
}