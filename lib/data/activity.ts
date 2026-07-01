import { createClient } from '@/lib/supabase/server'
import type { ActivityVouch } from '@/types'

interface RawVouchRow {
  id: string
  created_at: string
  comment: string | null
  tags: string[] | null
  business: {
    id: string
    name: string
    slug: string
    primary_category: { name: string | null; icon: string | null } | null
  } | null
  community: { name: string | null } | null
  profile: { first_name: string | null; display_name: string | null } | null
}

function firstName(row: RawVouchRow): string {
  const p = row.profile
  if (p?.first_name) return p.first_name
  if (p?.display_name) return p.display_name.split(/\s+/)[0]
  return 'A neighbour'
}

function mapRow(row: RawVouchRow): ActivityVouch {
  return {
    id: row.id,
    created_at: row.created_at,
    comment: row.comment,
    tags: row.tags ?? [],
    voucherName: firstName(row),
    voucherCommunity: row.community?.name ?? null,
    business: {
      id: row.business?.id ?? '',
      name: row.business?.name ?? 'A local business',
      slug: row.business?.slug ?? '',
      categoryName: row.business?.primary_category?.name ?? null,
      categoryIcon: row.business?.primary_category?.icon ?? null,
    },
  }
}

const SELECT = `
  id,
  created_at,
  comment,
  tags,
  business:businesses!inner(
    id, name, slug,
    primary_category:categories(name, icon)
  ),
  community:communities(name),
  profile:profiles(first_name, display_name)
`

/** Recent active vouches across the whole platform, newest first. */
export async function getRecentVouches(limit = 6): Promise<ActivityVouch[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vouches')
    .select(SELECT)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return (data as unknown as RawVouchRow[]).map(mapRow)
}

/** Recent active vouches for businesses tied to a set of communities. */
export async function getRecentVouchesForCommunities(
  communityIds: string[],
  limit = 12
): Promise<ActivityVouch[]> {
  if (communityIds.length === 0) return getRecentVouches(limit)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vouches')
    .select(SELECT)
    .eq('status', 'active')
    .in('community_id', communityIds)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return (data as unknown as RawVouchRow[]).map(mapRow)
}
