import { createClient } from '@/lib/supabase/server'
import type { Business } from '@/types'

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      primary_category:categories(*),
      communities:business_communities(community:communities(*))
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single()
  if (error) return null
  const communities = (data.communities as { community: unknown }[])?.map((bc) => bc.community) ?? []
  return { ...data, communities } as Business
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select(`*, primary_category:categories(*)`)
    .eq('id', id)
    .single()
  if (error) return null
  return data as Business
}

export async function getBusinessesByCommunityAndCategory(
  communityId: string,
  categoryId?: string
): Promise<Business[]> {
  const supabase = await createClient()
  let query = supabase
    .from('businesses')
    .select(`
      *,
      primary_category:categories(*),
      vouch_counts:vouches(count),
      business_communities!inner(community_id)
    `)
    .eq('status', 'active')
    .eq('business_communities.community_id', communityId)

  if (categoryId) {
    query = query.eq('primary_category_id', categoryId)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Business[]
}

export async function getMostVouchedBusinesses(limit = 6): Promise<Business[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('business_vouch_counts')
    .select('*')
    .order('total_vouches', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as unknown as Business[]
}

export async function getAllBusinessesAdmin(): Promise<Business[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select(`*, primary_category:categories(*)`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Business[]
}
