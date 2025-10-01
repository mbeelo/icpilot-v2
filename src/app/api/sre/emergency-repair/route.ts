import { NextRequest, NextResponse } from 'next/server';
import { runEmergencyFixes, validateSystemState } from '@/lib/sre';
import { getCurrentUser } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin privileges
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For security, only allow admin users to run emergency repairs
    if (user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { action, userId } = await request.json();

    let result;

    switch (action) {
      case 'performance_fixes':
        result = await runEmergencyFixes();
        break;

      case 'validate_state':
        result = await validateSystemState(userId);
        break;

      case 'repair_user_state':
        if (!userId) {
          return NextResponse.json({ error: 'User ID required for user state repair' }, { status: 400 });
        }
        result = await validateSystemState(userId);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString(),
      executedBy: user.email
    });

  } catch (error) {
    console.error('Emergency repair failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}