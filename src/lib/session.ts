import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { withDatabaseMonitoring } from './sre/performance-monitor';
import { stateReliabilityAgent } from './sre/state-reliability';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // Get full user data from database with performance monitoring
  const user = await withDatabaseMonitoring(
    'select',
    'getCurrentUser - fetch user by session ID'
  )(() => db.select().from(users).where(eq(users.id, session.user.id)).limit(1));

  if (!user.length) {
    return null;
  }

  // Verify session consistency for state reliability
  const userData = user[0];
  const validation = await stateReliabilityAgent.verifySessionConsistency(userData.id);

  if (!validation.isConsistent && validation.correctedState) {
    // Use corrected state if available
    return validation.correctedState;
  }

  return userData;
}