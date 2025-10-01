import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build the query conditionally without reassignment
    const baseQuery = db.select().from(blogPosts);

    const posts = await (published === 'true'
      ? baseQuery
          .where(eq(blogPosts.isPublished, true))
          .orderBy(desc(blogPosts.createdAt))
          .limit(limit)
      : published === 'false'
      ? baseQuery
          .where(eq(blogPosts.isPublished, false))
          .orderBy(desc(blogPosts.createdAt))
          .limit(limit)
      : baseQuery
          .orderBy(desc(blogPosts.createdAt))
          .limit(limit)
    );

    return NextResponse.json({
      success: true,
      posts
    });

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postData = await request.json();

    const [newPost] = await db.insert(blogPosts).values({
      ...postData,
      targetKeywords: JSON.stringify(postData.targetKeywords || []),
      tags: JSON.stringify(postData.tags || []),
    }).returning();

    return NextResponse.json({
      success: true,
      post: newPost
    });

  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}