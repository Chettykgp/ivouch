import { createClient } from '@/lib/supabase/server'
import type { Vouch } from '@/types'

export async function getVouchesByBusiness(businessId: string, limit = 10): Promise<Vouch[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vouches')
    .select(`
      *,
      community:communities(name, slug),
      profile:profiles(display_name, first_name)
    `)
    .eq('business_id', businessId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as Vouch[]
}

export async function getVouchCount(businessId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('vouches')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('status', 'active')
  return count ?? 0
}

export async function getAllVouchesAdmin(): Promise<Vouch[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vouches')
    .select(`*, business:businesses(name), profile:profiles(display_name)`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Vouch[]
}
