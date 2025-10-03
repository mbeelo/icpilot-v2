import { createServerSupabaseClient } from './supabase-server'
import { User } from '@supabase/supabase-js'

export interface ExtendedUser extends User {
  subscription_status?: string
  subscription_tier?: string
  usage_count?: number
  usage_reset_date?: string
}

export async function getUser(): Promise<ExtendedUser | null> {
  const supabase = createServerSupabaseClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Get extended user data from our users table
  const { data: userData } = await supabase
    .from('users')
    .select('subscription_status, subscription_tier, usage_count, usage_reset_date')
    .eq('id', user.id)
    .single()

  return {
    ...user,
    ...userData
  }
}

export async function requireAuth(): Promise<ExtendedUser> {
  const user = await getUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}

export async function updateUserUsage(userId: string, feature: string) {
  const supabase = createServerSupabaseClient()

  // Log the usage
  await supabase
    .from('usage_logs')
    .insert({
      user_id: userId,
      feature
    })

  // Increment usage count
  await supabase.rpc('increment_usage', { user_id: userId })
}

export async function checkUsageLimit(userId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()

  const { data: user } = await supabase
    .from('users')
    .select('subscription_tier, usage_count, usage_reset_date')
    .eq('id', userId)
    .single()

  if (!user) return false

  // Pro/Team users have unlimited usage
  if (user.subscription_tier === 'pro' || user.subscription_tier === 'team') {
    return true
  }

  // Free users have 5 outputs per month
  const resetDate = new Date(user.usage_reset_date || '')
  const now = new Date()

  // Reset usage if it's a new month
  if (resetDate < now) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    await supabase
      .from('users')
      .update({
        usage_count: 0,
        usage_reset_date: nextMonth.toISOString()
      })
      .eq('id', userId)

    return true
  }

  return (user.usage_count || 0) < 5
}