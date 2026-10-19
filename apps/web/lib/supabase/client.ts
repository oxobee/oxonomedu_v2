'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Checks whether Supabase URL and anon key are properly configured in environment variables.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return false
  if (url === 'https://your-project.supabase.co' || url.includes('placeholder')) return false
  return true
}

let cachedBrowserClient: ReturnType<typeof createBrowserClient> | null = null

/**
 * Returns a singleton browser client for Supabase.
 * If credentials are not yet configured, returns a safe mock/fallback client to avoid runtime crashes.
 */
export function getSupabaseBrowserClient() {
  if (cachedBrowserClient) return cachedBrowserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  cachedBrowserClient = createBrowserClient(url, anonKey)
  return cachedBrowserClient
}

export const supabase = typeof window !== 'undefined' ? getSupabaseBrowserClient() : null
