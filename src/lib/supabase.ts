import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (for use in client components only)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          subscription_status: string | null
          subscription_tier: string | null
          stripe_customer_id: string | null
          usage_count: number
          usage_reset_date: string | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          created_at?: string
          subscription_status?: string | null
          subscription_tier?: string | null
          stripe_customer_id?: string | null
          usage_count?: number
          usage_reset_date?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          subscription_status?: string | null
          subscription_tier?: string | null
          stripe_customer_id?: string | null
          usage_count?: number
          usage_reset_date?: string | null
        }
      }
      icps: {
        Row: {
          id: string
          user_id: string
          name: string
          industry: string | null
          company_size: string | null
          role: string | null
          pain_points: string[] | null
          outcomes: string[] | null
          triggers: string[] | null
          company_name: string | null
          product_service: string | null
          value_proposition: string | null
          key_differentiators: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          industry?: string | null
          company_size?: string | null
          role?: string | null
          pain_points?: string[] | null
          outcomes?: string[] | null
          triggers?: string[] | null
          company_name?: string | null
          product_service?: string | null
          value_proposition?: string | null
          key_differentiators?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          industry?: string | null
          company_size?: string | null
          role?: string | null
          pain_points?: string[] | null
          outcomes?: string[] | null
          triggers?: string[] | null
          company_name?: string | null
          product_service?: string | null
          value_proposition?: string | null
          key_differentiators?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      outputs: {
        Row: {
          id: string
          user_id: string
          icp_id: string | null
          type: string
          title: string
          content: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          icp_id?: string | null
          type: string
          title: string
          content: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          icp_id?: string | null
          type?: string
          title?: string
          content?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          feature: string
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          feature: string
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          feature?: string
          timestamp?: string
        }
      }
    }
  }
}