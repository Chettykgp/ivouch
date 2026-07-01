import { createClient } from '@/lib/supabase/server'
import type { Business } from '@/types'

interface VouchCountRow {
  count: number
}

interface BusinessWithVouchCount extends Omit<Business, 'vouch_count'> {
  vouch_count: VouchCountRow[] | null
}

export async function getBusinessesForCommunity(
  relatedIds: string[],
  options: { categorySlug?: string; limit?: number } = {}
): Promise<Business[]> {
  if (relatedIds.length === 0) return []

  const supabase = await createClient()
  const { categorySlug, limit = 50 } = options

  // Get business IDs from business_communities (legacy) + business_service_areas (new)
  const [legacyRes, serviceAreaRes] = await Promise.all([
    supabase
      .from('business_communities')
      .select('business_id')
      .in('community_id', relatedIds),
    supabase
      .from('business_service_areas')
      .select('business_id')
      .in('community_id', relatedIds),
  ])

  const legacyIds = (legacyRes.data ?? []).map((r) => r.business_id as string)
  const serviceAreaIds = (serviceAreaRes.data ?? []).map((r) => r.business_id as string)

  const businessIds = [...new Set([...legacyIds, ...serviceAreaIds])]

  if (businessIds.length === 0) return []

  let query = supabase
    .from('businesses')
    .select(`
      *,
      primary_category:primary_category_id(id, name, slug, icon),
      vouch_count:vouches(count)
    `)
    .eq('status', 'active')
    .in('id', businessIds)

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    if (cat) query = query.eq('primary_category_id', cat.id)
  }

  const { data, error } = await query.limit(limit)
  if (error) return []

  // Sort by vouch_count desc
  const rows = (data ?? []) as BusinessWithVouchCount[]
  return rows
    .sort((a, b) => {
      const aCount = a.vouch_count?.[0]?.count ?? 0
      const bCount = b.vouch_count?.[0]?.count ?? 0
      return bCount - aCount
    })
    .map((row) => ({
      ...row,
      vouch_count: row.vouch_count?.[0]?.count ?? 0,
    })) as Business[]
}
