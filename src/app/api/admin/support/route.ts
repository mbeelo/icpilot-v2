import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { supportRequests } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Check for admin key (simple auth for now)
    const adminKey = process.env.BLOG_ADMIN_KEY || 'dev-admin-key';
    const providedKey = request.headers.get('x-admin-key');

    if (providedKey !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all support requests
    const requests = await db.select()
      .from(supportRequests)
      .orderBy(desc(supportRequests.createdAt));

    return NextResponse.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error('Error fetching support requests:', error);
    return NextResponse.json({ error: 'Failed to fetch support requests' }, { status: 500 });
  }
}