import { createClient } from '@/lib/supabase/server'
import type { Category, CategoryGroup } from '@/types'
import { GROUP_ORDER, groupForSlug, featuredForSlug } from './category-groups'

/**
 * Select the base category columns. `group_name`, `sort_order` and `is_featured`
 * may not exist yet in the DB; if the select fails we retry without them and
 * fill values from the fallback map keyed by slug.
 */
async function fetchCategories(): Promise<Category[]> {
  const supabase = await createClient()

  const withCols = await supabase
    .from('categories')
    .select('id,name,slug,description,icon,status,group_name,sort_order,is_featured')
    .eq('status', 'active')

  if (!withCols.error && withCols.data) {
    return withCols.data as Category[]
  }

  // Columns not present yet — fall back and synthesize the grouping fields.
  const base = await supabase
    .from('categories')
    .select('id,name,slug,description,icon,status')
    .eq('status', 'active')
  if (base.error) throw base.error

  return (base.data ?? []).map((c) => ({
    ...(c as Omit<Category, 'group_name' | 'sort_order' | 'is_featured'>),
    group_name: groupForSlug(c.slug),
    sort_order: null,
    is_featured: featuredForSlug(c.slug),
  }))
}

/** Ensure grouping fields are populated even when DB columns are null. */
function normalise(cats: Category[]): Category[] {
  return cats.map((c) => ({
    ...c,
    group_name: c.group_name ?? groupForSlug(c.slug),
    is_featured: c.is_featured ?? featuredForSlug(c.slug),
  }))
}

export async function getCategories(): Promise<Category[]> {
  const cats = normalise(await fetchCategories())
  return cats.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const withCols = await supabase
    .from('categories')
    .select('id,name,slug,description,icon,status,group_name,sort_order,is_featured')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()
  if (!withCols.error && withCols.data) {
    return normalise([withCols.data as Category])[0]
  }
  const base = await supabase
    .from('categories')
    .select('id,name,slug,description,icon,status')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()
  if (base.error || !base.data) return null
  return normalise([
    {
      ...(base.data as Omit<Category, 'group_name' | 'sort_order' | 'is_featured'>),
      group_name: null,
      sort_order: null,
      is_featured: null,
    },
  ])[0]
}

/** Featured categories for the homepage quick-browse strip. */
export async function getFeaturedCategories(limit = 10): Promise<Category[]> {
  const cats = await getCategories()
  const featured = cats.filter((c) => c.is_featured)
  const chosen = featured.length > 0 ? featured : cats
  return chosen
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999) || a.name.localeCompare(b.name))
    .slice(0, limit)
}

/** Count of active businesses per category (primary_category_id). */
export async function getCategoryBusinessCounts(): Promise<Record<string, number>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('primary_category_id')
    .eq('status', 'active')
  if (error || !data) return {}
  const counts: Record<string, number> = {}
  for (const row of data) {
    const id = (row as { primary_category_id: string | null }).primary_category_id
    if (id) counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
}

/** All categories grouped by group_name, in the canonical group order. */
export async function getCategoriesGrouped(withCounts = false): Promise<CategoryGroup[]> {
  const cats = await getCategories()
  const counts = withCounts ? await getCategoryBusinessCounts() : {}

  const byGroup = new Map<string, Category[]>()
  for (const cat of cats) {
    const group = cat.group_name ?? 'Other Services'
    const enriched: Category = withCounts
      ? { ...cat, business_count: counts[cat.id] ?? 0 }
      : cat
    if (!byGroup.has(group)) byGroup.set(group, [])
    byGroup.get(group)!.push(enriched)
  }

  const orderedNames = [
    ...GROUP_ORDER.filter((g) => byGroup.has(g)),
    ...[...byGroup.keys()].filter((g) => !GROUP_ORDER.includes(g as never)),
  ]

  return orderedNames.map((group_name) => ({
    group_name,
    categories: byGroup
      .get(group_name)!
      .sort(
        (a, b) =>
          (a.sort_order ?? 999) - (b.sort_order ?? 999) || a.name.localeCompare(b.name)
      ),
  }))
}
