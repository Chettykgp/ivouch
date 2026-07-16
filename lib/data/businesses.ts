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
  const communities =
    (data.communities as { community: unknown }[])
      ?.map((bc) => bc.community)
      .filter((c): c is object => c != null) ?? []
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

/** Same-category active businesses (excluding one), ranked by vouch count. */
export async function getSimilarBusinesses(
  businessId: string,
  categoryId: string | null,
  limit = 3
): Promise<Business[]> {
  if (!categoryId) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      primary_category:categories(id, name, slug, icon),
      vouch_count:vouches(count)
    `)
    .eq('status', 'active')
    .eq('primary_category_id', categoryId)
    .neq('id', businessId)
  if (error || !data) return []
  type Row = Omit<Business, 'vouch_count'> & { vouch_count: { count: number }[] | null }
  return (data as unknown as Row[])
    .map((r) => ({ ...r, vouch_count: r.vouch_count?.[0]?.count ?? 0 }))
    .sort((a, b) => (b.vouch_count as number) - (a.vouch_count as number))
    .slice(0, limit) as Business[]
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
