import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create Supabase client for anonymous/public operations
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

// Create Supabase client with service role key for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceRoleKey || supabaseAnonKey || ''
)

/**
 * Type definitions for database tables
 */
export type Registration = {
  id: string
  full_name: string
  email: string
  phone: string
  church_name: string
  confirmation_code: string
  is_confirmed: boolean
  email_sent: boolean
  created_at: string
  waiting_list_turn?: number | null // null if not on waiting list, number if on waiting list
}