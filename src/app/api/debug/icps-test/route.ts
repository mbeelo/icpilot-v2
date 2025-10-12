import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { db, icps } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('=== ICP Debug Test Started ===');

    // Test 1: Check if getCurrentUser works
    let user;
    try {
      user = await getCurrentUser();
      console.log('User fetch result:', { hasUser: !!user, userId: user?.id, email: user?.email });
    } catch (error) {
      console.error('getCurrentUser failed:', error);
      return NextResponse.json({
        error: 'getCurrentUser failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 401 });
    }

    // Test 2: Try a simple database query
    try {
      console.log('Attempting database query for user:', user.id);
      const userIcps = await db.select().from(icps).where(eq(icps.userId, user.id));
      console.log('Query successful, ICPs found:', userIcps.length);

      return NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email },
        icpCount: userIcps.length,
        icps: userIcps
      });
    } catch (dbError) {
      console.error('Database query failed:', dbError);
      return NextResponse.json({
        error: 'Database query failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        user: { id: user.id, email: user.email }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Unexpected error in debug endpoint:', error);
    return NextResponse.json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}