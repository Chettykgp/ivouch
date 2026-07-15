import { createClient } from '@/lib/supabase/server'
import type { ActivityVouch, NewBusinessActivity, FeedItem } from '@/types'

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

/* ─────────────────────────── New businesses ─────────────────────────── */

interface RawBizRow {
  id: string
  created_at: string
  name: string
  slug: string
  primary_category: { name: string | null; icon: string | null } | null
}

function mapBiz(row: RawBizRow): NewBusinessActivity {
  return {
    id: row.id,
    created_at: row.created_at,
    name: row.name,
    slug: row.slug,
    categoryName: row.primary_category?.name ?? null,
    categoryIcon: row.primary_category?.icon ?? null,
  }
}

const BIZ_SELECT = `id, created_at, name, slug, primary_category:categories(name, icon)`

/** Recently added (active) businesses, newest first. */
export async function getRecentBusinesses(limit = 6): Promise<NewBusinessActivity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select(BIZ_SELECT)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return (data as unknown as RawBizRow[]).map(mapBiz)
}

/** Recently added (active) businesses tied to a set of communities. */
export async function getRecentBusinessesForCommunities(
  communityIds: string[],
  limit = 6
): Promise<NewBusinessActivity[]> {
  if (communityIds.length === 0) return getRecentBusinesses(limit)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select(`${BIZ_SELECT}, bc:business_communities!inner(community_id)`)
    .eq('status', 'active')
    .in('bc.community_id', communityIds)
    .order('created_at', { ascending: false })
    .limit(limit * 3) // over-fetch: inner join can duplicate across communities
  if (error || !data) return []
  const seen = new Set<string>()
  const rows: NewBusinessActivity[] = []
  for (const r of data as unknown as RawBizRow[]) {
    if (seen.has(r.id)) continue
    seen.add(r.id)
    rows.push(mapBiz(r))
    if (rows.length >= limit) break
  }
  return rows
}

/* ──────────────────────── Merged activity feed ──────────────────────── */

function merge(vouches: ActivityVouch[], businesses: NewBusinessActivity[], limit: number): FeedItem[] {
  const items: FeedItem[] = [
    ...vouches.map((v): FeedItem => ({ kind: 'vouch', created_at: v.created_at, vouch: v })),
    ...businesses.map((b): FeedItem => ({ kind: 'business', created_at: b.created_at, business: b })),
  ]
  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return items.slice(0, limit)
}

/** Merged feed of recent vouches + newly-added businesses across the platform. */
export async function getRecentActivity(limit = 8): Promise<FeedItem[]> {
  const [vouches, businesses] = await Promise.all([
    getRecentVouches(limit),
    getRecentBusinesses(limit),
  ])
  return merge(vouches, businesses, limit)
}

/** Merged feed scoped to a set of communities. */
export async function getRecentActivityForCommunities(
  communityIds: string[],
  limit = 10
): Promise<FeedItem[]> {
  const [vouches, businesses] = await Promise.all([
    getRecentVouchesForCommunities(communityIds, limit),
    getRecentBusinessesForCommunities(communityIds, limit),
  ])
  return merge(vouches, businesses, limit)
}
