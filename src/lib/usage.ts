import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { SUBSCRIPTION_LIMITS, SUBSCRIPTION_TIERS } from '@/lib/constants';

export async function checkAndIncrementUsage(userId: string, subscriptionTier: string, currentUsageCount: number) {
  // Check limits for free users
  if (subscriptionTier === SUBSCRIPTION_TIERS.FREE) {
    const limit = SUBSCRIPTION_LIMITS[SUBSCRIPTION_TIERS.FREE].outputs;
    if (currentUsageCount >= limit) {
      return { 
        allowed: false, 
        error: 'Usage limit reached. Upgrade to Pro for unlimited outputs.' 
      };
    }
  }

  // Increment usage count for ALL users (for stats tracking)
  await db.update(users)
    .set({ usageCount: currentUsageCount + 1 })
    .where(eq(users.id, userId));

  return { allowed: true };
}