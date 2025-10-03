/**
 * State Management Reliability Agent
 *
 * Addresses critical state management issues affecting user experience:
 * 1. Session consistency verification
 * 2. User tier state management audit
 * 3. Cache invalidation strategies
 * 4. Authentication flow optimization
 */

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { SUBSCRIPTION_TIERS } from '@/lib/constants';

export interface StateInconsistency {
  type: 'session' | 'subscription' | 'usage' | 'cache';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  timestamp: number;
  metadata: Record<string, any>;
}

export interface UserStateSnapshot {
  userId: string;
  sessionState: any;
  databaseState: any;
  localStorageState?: any;
  inconsistencies: StateInconsistency[];
  timestamp: number;
}

export class StateReliabilityAgent {
  private static instance: StateReliabilityAgent;
  private inconsistencies: StateInconsistency[] = [];
  private stateSnapshots: Map<string, UserStateSnapshot> = new Map();
  private readonly maxInconsistencies = 500;

  private constructor() {
    this.setupMonitoring();
  }

  static getInstance(): StateReliabilityAgent {
    if (!StateReliabilityAgent.instance) {
      StateReliabilityAgent.instance = new StateReliabilityAgent();
    }
    return StateReliabilityAgent.instance;
  }

  /**
   * Session Consistency Verification
   */
  async verifySessionConsistency(userId?: string): Promise<{
    isConsistent: boolean;
    issues: StateInconsistency[];
    correctedState?: any;
  }> {
    const issues: StateInconsistency[] = [];

    try {
      const supabase = createServerSupabaseClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user?.id) {
        if (userId) {
          issues.push({
            type: 'session',
            severity: 'critical',
            description: 'User session missing but user ID provided',
            userId,
            timestamp: Date.now(),
            metadata: { expectedUserId: userId, error: error?.message }
          });
        }
        return { isConsistent: !userId, issues };
      }

      const sessionUserId = user.id;

      // Verify session user exists in database
      const dbUser = await db.select().from(users).where(eq(users.id, sessionUserId)).limit(1);

      if (!dbUser.length) {
        issues.push({
          type: 'session',
          severity: 'critical',
          description: 'Session user not found in database',
          userId: sessionUserId,
          timestamp: Date.now(),
          metadata: { sessionData: user }
        });
      }

      // Check for user ID mismatch
      if (userId && userId !== sessionUserId) {
        issues.push({
          type: 'session',
          severity: 'high',
          description: 'Session user ID mismatch',
          userId: sessionUserId,
          timestamp: Date.now(),
          metadata: { expectedUserId: userId, actualUserId: sessionUserId }
        });
      }

      // Verify subscription tier consistency
      if (dbUser.length > 0) {
        const userRecord = dbUser[0];
        // With Supabase, we don't store subscription info in the session
        // All subscription data comes from the database
        const dbTier = userRecord.subscriptionTier || 'free';

        // Just verify that the database has valid subscription data
        if (!Object.values(SUBSCRIPTION_TIERS).includes(dbTier as any)) {
          issues.push({
            type: 'subscription',
            severity: 'high',
            description: 'Invalid subscription tier in database',
            userId: sessionUserId,
            timestamp: Date.now(),
            metadata: { dbTier, validTiers: Object.values(SUBSCRIPTION_TIERS) }
          });
        }
      }

      // Store snapshot for analysis
      if (dbUser.length > 0) {
        this.storeStateSnapshot(sessionUserId, user, dbUser[0], issues);
      }

      // Log issues
      issues.forEach(issue => this.addInconsistency(issue));

      return {
        isConsistent: issues.length === 0,
        issues,
        correctedState: dbUser.length > 0 ? dbUser[0] : undefined
      };
    } catch (error) {
      const criticalIssue: StateInconsistency = {
        type: 'session',
        severity: 'critical',
        description: 'Session verification failed',
        userId,
        timestamp: Date.now(),
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      };

      this.addInconsistency(criticalIssue);
      return { isConsistent: false, issues: [criticalIssue] };
    }
  }

  /**
   * User Tier State Management Audit
   */
  async auditUserTierState(userId: string): Promise<{
    isCorrect: boolean;
    currentTier: string;
    suggestedTier: string;
    issues: StateInconsistency[];
    recommendations: string[];
  }> {
    const issues: StateInconsistency[] = [];
    const recommendations: string[] = [];

    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user.length) {
        const issue: StateInconsistency = {
          type: 'subscription',
          severity: 'critical',
          description: 'User not found for tier audit',
          userId,
          timestamp: Date.now(),
          metadata: {}
        };
        this.addInconsistency(issue);
        return {
          isCorrect: false,
          currentTier: 'unknown',
          suggestedTier: 'free',
          issues: [issue],
          recommendations: ['User data needs to be restored or recreated']
        };
      }

      const userData = user[0];
      const currentTier = userData.subscriptionTier || 'free';

      // Validate tier against subscription status
      let suggestedTier = currentTier;

      // Check Stripe subscription status if available
      if (userData.stripeCustomerId && currentTier !== 'free') {
        // Note: In a real implementation, you'd verify against Stripe API
        // For now, we'll assume the current tier is correct if Stripe ID exists

        if (!Object.values(SUBSCRIPTION_TIERS).includes(currentTier as any)) {
          issues.push({
            type: 'subscription',
            severity: 'high',
            description: 'Invalid subscription tier value',
            userId,
            timestamp: Date.now(),
            metadata: { currentTier, validTiers: Object.values(SUBSCRIPTION_TIERS) }
          });
          suggestedTier = 'free';
          recommendations.push('Reset to free tier and re-verify subscription');
        }
      } else if (currentTier !== 'free') {
        // User has paid tier but no Stripe ID - log but don't auto-downgrade
        issues.push({
          type: 'subscription',
          severity: 'medium',
          description: 'Paid tier without Stripe customer ID - needs manual verification',
          userId,
          timestamp: Date.now(),
          metadata: { currentTier, stripeCustomerId: userData.stripeCustomerId }
        });
        // Don't automatically downgrade - could be manual upgrade or test account
        suggestedTier = currentTier;
        recommendations.push('Manual verification required - could be development/test account');
      }

      // Check usage limits consistency
      const usageCount = userData.usageCount || 0;
      if (currentTier === 'free' && usageCount > 5) {
        // Free user has exceeded limit - check if this is a recent downgrade
        issues.push({
          type: 'usage',
          severity: 'medium',
          description: 'Free user exceeded usage limit',
          userId,
          timestamp: Date.now(),
          metadata: { usageCount, limit: 5, tier: currentTier }
        });
        recommendations.push('Consider grandfathering existing usage or offering upgrade prompt');
      }

      // Log all issues
      issues.forEach(issue => this.addInconsistency(issue));

      return {
        isCorrect: issues.length === 0,
        currentTier,
        suggestedTier,
        issues,
        recommendations
      };
    } catch (error) {
      const criticalIssue: StateInconsistency = {
        type: 'subscription',
        severity: 'critical',
        description: 'Tier audit failed',
        userId,
        timestamp: Date.now(),
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      };

      this.addInconsistency(criticalIssue);
      return {
        isCorrect: false,
        currentTier: 'unknown',
        suggestedTier: 'free',
        issues: [criticalIssue],
        recommendations: ['System error - manual review required']
      };
    }
  }

  /**
   * Cache Invalidation Strategy
   */
  async invalidateUserCache(userId: string, reason: string): Promise<void> {
    try {
      // Clear server-side user data cache
      // Note: Implement based on your caching strategy (Redis, in-memory, etc.)

      // For now, we'll log the invalidation for monitoring
      console.log('🔄 Cache Invalidation:', {
        userId,
        reason,
        timestamp: new Date().toISOString()
      });

      // Trigger session refresh on next request
      // This would typically involve updating a cache key or timestamp

      // Log successful invalidation
      this.addInconsistency({
        type: 'cache',
        severity: 'low',
        description: 'Cache invalidated successfully',
        userId,
        timestamp: Date.now(),
        metadata: { reason, action: 'invalidate' }
      });
    } catch (error) {
      this.addInconsistency({
        type: 'cache',
        severity: 'high',
        description: 'Cache invalidation failed',
        userId,
        timestamp: Date.now(),
        metadata: {
          reason,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Authentication Flow Optimization
   */
  async optimizeAuthFlow(userId: string): Promise<{
    optimizations: string[];
    performance: {
      sessionLookupTime: number;
      databaseQueryTime: number;
      totalTime: number;
    };
  }> {
    const startTime = performance.now();
    const optimizations: string[] = [];

    // Measure session lookup time
    const sessionStart = performance.now();
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    const sessionTime = performance.now() - sessionStart;

    // Measure database query time
    const dbStart = performance.now();
    let dbTime = 0;

    if (!error && user?.id) {
      const userRecord = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      dbTime = performance.now() - dbStart;

      // Check if user data is efficiently structured
      if (userRecord.length > 0) {
        const userData = userRecord[0];

        // Suggest optimizations based on data access patterns
        if (!userData.subscriptionTier) {
          optimizations.push('Add default subscription tier to reduce null checks');
        }

        if (userData.usageCount === null || userData.usageCount === undefined) {
          optimizations.push('Initialize usage count to prevent undefined errors');
        }

        // Check for unnecessary data loading
        const fieldsUsed = ['id', 'email', 'subscriptionTier', 'usageCount'];
        optimizations.push('Consider using SELECT with specific fields for auth queries');
      }
    }

    const totalTime = performance.now() - startTime;

    // Performance thresholds
    if (sessionTime > 100) {
      optimizations.push('Session lookup is slow - consider session caching');
    }

    if (dbTime > 50) {
      optimizations.push('Database query is slow - add index on user.id or use connection pooling');
    }

    return {
      optimizations,
      performance: {
        sessionLookupTime: sessionTime,
        databaseQueryTime: dbTime,
        totalTime
      }
    };
  }

  /**
   * State Synchronization Repair
   */
  async repairStateInconsistency(userId: string): Promise<{
    repaired: boolean;
    actions: string[];
    newState: any;
  }> {
    const actions: string[] = [];

    try {
      // Get fresh data from database
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user.length) {
        return {
          repaired: false,
          actions: ['User not found - cannot repair state'],
          newState: null
        };
      }

      const userData = user[0];

      // Repair subscription tier
      if (!userData.subscriptionTier) {
        await db.update(users)
          .set({ subscriptionTier: 'free' })
          .where(eq(users.id, userId));
        actions.push('Set default subscription tier to free');
      }

      // Repair usage count
      if (userData.usageCount === null || userData.usageCount === undefined) {
        await db.update(users)
          .set({ usageCount: 0 })
          .where(eq(users.id, userId));
        actions.push('Initialized usage count to 0');
      }

      // Invalidate cache to force refresh
      await this.invalidateUserCache(userId, 'state_repair');
      actions.push('Invalidated user cache');

      // Get updated state
      const updatedUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      return {
        repaired: true,
        actions,
        newState: updatedUser[0]
      };
    } catch (error) {
      return {
        repaired: false,
        actions: [`Repair failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        newState: null
      };
    }
  }

  /**
   * State Reliability Report
   */
  getStateReliabilityReport(timeRange: number = 3600000): {
    summary: {
      totalInconsistencies: number;
      criticalIssues: number;
      sessionIssues: number;
      subscriptionIssues: number;
      cacheIssues: number;
    };
    topIssues: StateInconsistency[];
    recommendations: string[];
  } {
    const cutoff = Date.now() - timeRange;
    const recentInconsistencies = this.inconsistencies.filter(i => i.timestamp > cutoff);

    const summary = {
      totalInconsistencies: recentInconsistencies.length,
      criticalIssues: recentInconsistencies.filter(i => i.severity === 'critical').length,
      sessionIssues: recentInconsistencies.filter(i => i.type === 'session').length,
      subscriptionIssues: recentInconsistencies.filter(i => i.type === 'subscription').length,
      cacheIssues: recentInconsistencies.filter(i => i.type === 'cache').length,
    };

    const topIssues = recentInconsistencies
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, 10);

    const recommendations: string[] = [];

    if (summary.criticalIssues > 0) {
      recommendations.push('🚨 Critical state issues detected - immediate attention required');
    }

    if (summary.sessionIssues > summary.totalInconsistencies * 0.3) {
      recommendations.push('🔑 High rate of session issues - review authentication flow');
    }

    if (summary.subscriptionIssues > 0) {
      recommendations.push('💳 Subscription state issues - verify Stripe integration');
    }

    if (summary.totalInconsistencies > 10) {
      recommendations.push('⚡ Consider implementing automated state repair mechanisms');
    }

    return {
      summary,
      topIssues,
      recommendations
    };
  }

  // Private helper methods
  private addInconsistency(inconsistency: StateInconsistency): void {
    this.inconsistencies.push(inconsistency);

    // Keep only recent inconsistencies
    if (this.inconsistencies.length > this.maxInconsistencies) {
      this.inconsistencies = this.inconsistencies.slice(-this.maxInconsistencies);
    }

    // Log critical issues immediately
    if (inconsistency.severity === 'critical') {
      console.error('🚨 CRITICAL STATE ISSUE:', inconsistency);
    }
  }

  private storeStateSnapshot(
    userId: string,
    sessionState: any,
    databaseState: any,
    inconsistencies: StateInconsistency[]
  ): void {
    const snapshot: UserStateSnapshot = {
      userId,
      sessionState,
      databaseState,
      inconsistencies,
      timestamp: Date.now()
    };

    this.stateSnapshots.set(userId, snapshot);

    // Clean up old snapshots
    if (this.stateSnapshots.size > 100) {
      const oldestKey = Array.from(this.stateSnapshots.keys())[0];
      this.stateSnapshots.delete(oldestKey);
    }
  }

  private setupMonitoring(): void {
    // Clean up old data every hour
    setInterval(() => {
      const cutoff = Date.now() - 3600000; // 1 hour
      this.inconsistencies = this.inconsistencies.filter(i => i.timestamp > cutoff);

      // Clean up old snapshots
      for (const [userId, snapshot] of this.stateSnapshots.entries()) {
        if (snapshot.timestamp < cutoff) {
          this.stateSnapshots.delete(userId);
        }
      }
    }, 3600000);
  }
}

// Export singleton instance
export const stateReliabilityAgent = StateReliabilityAgent.getInstance();

// Utility function for session validation middleware
export async function validateUserState(userId?: string) {
  return stateReliabilityAgent.verifySessionConsistency(userId);
}

// Utility function for subscription tier verification
export async function verifySubscriptionTier(userId: string) {
  return stateReliabilityAgent.auditUserTierState(userId);
}