import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contentCalendar } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build the query conditionally without reassignment
    const baseQuery = db.select().from(contentCalendar);

    const calendar = await (status
      ? baseQuery
          .where(eq(contentCalendar.status, status))
          .orderBy(desc(contentCalendar.scheduledDate))
          .limit(limit)
      : baseQuery
          .orderBy(desc(contentCalendar.scheduledDate))
          .limit(limit)
    );

    return NextResponse.json({
      success: true,
      calendar
    });

  } catch (error) {
    console.error('Error fetching content calendar:', error);
    return NextResponse.json({ error: 'Failed to fetch content calendar' }, { status: 500 });
  }
}