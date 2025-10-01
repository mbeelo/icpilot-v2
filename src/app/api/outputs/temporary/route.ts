import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { getTempOutputs } from '@/lib/session-storage';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get temporary outputs for current session
    const tempOutputs = await getTempOutputs(user.id);

    return NextResponse.json({
      success: true,
      outputs: tempOutputs
    });

  } catch (error) {
    console.error('Error fetching temporary outputs:', error);
    return NextResponse.json({ error: 'Failed to fetch temporary outputs' }, { status: 500 });
  }
}