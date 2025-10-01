import { NextRequest, NextResponse } from 'next/server';
import { db, outputs } from '@/db';
import { and, eq, lt } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Simple auth check - in production you'd want a proper API key
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CLEANUP_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete temporary outputs older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await db.delete(outputs)
      .where(and(
        eq(outputs.isTemporary, true),
        lt(outputs.createdAt, sevenDaysAgo)
      ));

    return NextResponse.json({
      success: true,
      message: `Cleaned up temporary outputs older than 7 days`,
      deletedCount: result.rowCount || 0
    });

  } catch (error) {
    console.error('Error in cleanup job:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}