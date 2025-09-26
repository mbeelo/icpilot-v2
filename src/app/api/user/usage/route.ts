import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ 
      usageCount: user.usageCount,
      subscriptionTier: user.subscriptionTier,
      objectionsGenerated: user.objectionsGenerated || 0,
      messagesGenerated: user.messagesGenerated || 0,
      frameworksGenerated: user.frameworksGenerated || 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}