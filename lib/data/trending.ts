import { createClient } from '@/lib/supabase/server'

export interface TrendingBusiness {
  id: string
  name: string
  slug: string
  categoryName: string | null
  categoryIcon: string | null
  vouch_count: number
  recent_vouches: number
}

const RECENT_DAYS = 30
const RECENT_WEIGHT = 3

/**
 * Businesses with momentum: recent vouches (last 30 days) weighted over the
 * all-time total, so what's hot now rises but the board never sits empty —
 * with no recent activity it degrades gracefully to all-time most vouched.
 */
export async function getTrendingBusinesses(limit = 6): Promise<TrendingBusiness[]> {
  const supabase = await createClient()

  const { data: vouches, error } = await supabase
    .from('vouches')
    .select('business_id, created_at')
    .eq('status', 'active')
  if (error || !vouches || vouches.length === 0) return []

  const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000
  const stats = new Map<string, { total: number; recent: number; latest: number }>()
  for (const v of vouches) {
    const s = stats.get(v.business_id) ?? { total: 0, recent: 0, latest: 0 }
    s.total += 1
    const t = new Date(v.created_at).getTime()
    if (t > cutoff) s.recent += 1
    if (t > s.latest) s.latest = t
    stats.set(v.business_id, s)
  }

  const ranked = [...stats.entries()]
    .map(([id, s]) => ({ id, score: s.recent * RECENT_WEIGHT + s.total, ...s }))
    .sort((a, b) => b.score - a.score || b.latest - a.latest)
    .slice(0, limit * 2) // over-fetch: some may no longer be active

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug, primary_category:categories(name, icon)')
    .eq('status', 'active')
    .in('id', ranked.map((r) => r.id))
  if (!businesses) return []

  type BizRow = {
    id: string
    name: string
    slug: string
    primary_category: { name: string | null; icon: string | null } | null
  }
  const byId = new Map((businesses as unknown as BizRow[]).map((b) => [b.id, b]))

  const out: TrendingBusiness[] = []
  for (const r of ranked) {
    const b = byId.get(r.id)
    if (!b) continue
    out.push({
      id: b.id,
      name: b.name,
      slug: b.slug,
      categoryName: b.primary_category?.name ?? null,
      categoryIcon: b.primary_category?.icon ?? null,
      vouch_count: r.total,
      recent_vouches: r.recent,
    })
    if (out.length >= limit) break
  }
  return out
}
