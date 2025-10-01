import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { saveToLibrary } from '@/lib/session-storage';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { outputId } = await request.json();

    if (!outputId) {
      return NextResponse.json({ error: 'Output ID is required' }, { status: 400 });
    }

    const savedOutput = await saveToLibrary(outputId, user.id);

    if (!savedOutput) {
      return NextResponse.json({ error: 'Output not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Saved to library successfully',
      output: savedOutput
    });

  } catch (error) {
    console.error('Error saving to library:', error);
    return NextResponse.json({ error: 'Failed to save to library' }, { status: 500 });
  }
}