import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { SUBSCRIPTION_LIMITS, SUBSCRIPTION_TIERS } from '@/lib/constants';
import { withDatabaseMonitoring } from './sre/performance-monitor';
import { stateReliabilityAgent } from './sre/state-reliability';

export async function checkAndIncrementUsage(userId: string, subscriptionTier: string, currentUsageCount: number) {
  // Verify user tier consistency before proceeding
  const tierAudit = await stateReliabilityAgent.auditUserTierState(userId);
  const verifiedTier = tierAudit.isCorrect ? subscriptionTier : tierAudit.suggestedTier;

  // Check limits for free users
  if (verifiedTier === SUBSCRIPTION_TIERS.FREE) {
    const limit = SUBSCRIPTION_LIMITS[SUBSCRIPTION_TIERS.FREE].outputs;
    if (currentUsageCount >= limit) {
      return {
        allowed: false,
        error: 'Usage limit reached. Upgrade to Pro for unlimited outputs.'
      };
    }
  }

  // Increment usage count for ALL users (for stats tracking) with monitoring
  await withDatabaseMonitoring(
    'update',
    'checkAndIncrementUsage - increment user usage count'
  )(() => db.update(users)
    .set({ usageCount: currentUsageCount + 1 })
    .where(eq(users.id, userId)));

  return { allowed: true };
}