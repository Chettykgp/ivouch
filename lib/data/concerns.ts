import { createClient } from '@/lib/supabase/server'
import type { Concern } from '@/types'

/** Admin-verified concern count — the only publicly visible concern signal. */
export async function getConcernCount(businessId: string): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_concern_count', {
    p_business_id: businessId,
  })
  if (error) return 0
  return (data as number) ?? 0
}

/** All concerns, admin only (RLS enforces). */
export async function getAllConcernsAdmin(): Promise<Concern[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('concerns')
    .select('*, business:businesses(name, slug), profile:profiles(display_name, first_name, email)')
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as unknown as Concern[]
}
