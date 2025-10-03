import { createServerSupabaseClient } from './supabase-server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { withDatabaseMonitoring } from './sre/performance-monitor';
import { stateReliabilityAgent } from './sre/state-reliability';

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  console.log('getCurrentUser:', {
    hasUser: !!user,
    userId: user?.id,
    error: error?.message
  });

  if (error || !user?.id) {
    console.log('No user found in getCurrentUser');
    return null;
  }

  // Get full user data from database with performance monitoring
  const userData = await withDatabaseMonitoring(
    'select',
    'getCurrentUser - fetch user by session ID'
  )(() => db.select().from(users).where(eq(users.id, user.id)).limit(1));

  if (!userData.length) {
    // User exists in Supabase Auth but not in our database
    // Create the user record
    console.log('Creating user record for Supabase auth user:', user.id);

    const newUser = await withDatabaseMonitoring(
      'insert',
      'getCurrentUser - create user record'
    )(() => db.insert(users).values({
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || user.user_metadata?.full_name || null,
      subscriptionStatus: 'active',
      subscriptionTier: 'free',
      stripeCustomerId: null,
      usageCount: 0,
      objectionsGenerated: 0,
      messagesGenerated: 0,
      frameworksGenerated: 0,
    }).returning());

    console.log('Created user record:', newUser[0]);
    return newUser[0];
  }

  return userData[0];
}