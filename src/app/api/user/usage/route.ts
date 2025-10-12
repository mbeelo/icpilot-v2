import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { SUBSCRIPTION_LIMITS, SUBSCRIPTION_TIERS } from '@/lib/constants';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionTier = user.subscriptionTier || SUBSCRIPTION_TIERS.FREE;
    const usageCount = user.usageCount || 0;
    const limit = SUBSCRIPTION_LIMITS[subscriptionTier as keyof typeof SUBSCRIPTION_LIMITS].outputs;

    // Check if user has reached their limit
    const hasReachedLimit = subscriptionTier === SUBSCRIPTION_TIERS.FREE && usageCount >= limit;

    return NextResponse.json({
      usageCount,
      subscriptionTier,
      limit: limit === -1 ? null : limit, // null means unlimited
      hasReachedLimit,
      remainingOutputs: limit === -1 ? null : Math.max(0, limit - usageCount),
      objectionsGenerated: user.objectionsGenerated || 0,
      messagesGenerated: user.messagesGenerated || 0,
      frameworksGenerated: user.frameworksGenerated || 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}