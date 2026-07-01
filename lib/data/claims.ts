import { createClient } from '@/lib/supabase/server'
import type { Claim } from '@/types'

export async function getAllClaimsAdmin(): Promise<Claim[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('claims')
    .select(`*, business:businesses(name, slug)`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Claim[]
}

export async function getPendingClaimsCount(): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('claims')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
  return count ?? 0
}
