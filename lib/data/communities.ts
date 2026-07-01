import { createClient } from '@/lib/supabase/server'
import type { Community, CommunityAlias } from '@/types'

export async function getCommunities(): Promise<Community[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('status', 'active')
    .order('type')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getWards(): Promise<Community[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('status', 'active')
    .eq('type', 'ward')
    .order('ward_number')
  if (error) throw error
  return data ?? []
}

export async function getCommunityBySlug(slug: string): Promise<Community | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('communities')
    .select('*, parent_community:parent_community_id(*)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()
  if (error) return null
  return data as Community
}

export async function getCommunityWithContext(slug: string): Promise<{
  community: Community | null
  parent: Community | null
  children: Community[]
  aliases: CommunityAlias[]
  relatedIds: string[]
}> {
  const supabase = await createClient()

  const community = await getCommunityBySlug(slug)
  if (!community) return { community: null, parent: null, children: [], aliases: [], relatedIds: [] }

  const [childrenRes, aliasesRes, parentRes] = await Promise.all([
    supabase.from('communities').select('*').eq('parent_community_id', community.id).eq('status', 'active'),
    supabase.from('community_aliases').select('*').eq('community_id', community.id),
    community.parent_community_id
      ? supabase.from('communities').select('*').eq('id', community.parent_community_id).single()
      : Promise.resolve({ data: null, error: null }),
  ])

  const children = (childrenRes.data ?? []) as Community[]
  const aliases = (aliasesRes.data ?? []) as CommunityAlias[]
  const parent = (parentRes.data ?? null) as Community | null

  // Related IDs: this community + children + parent
  const relatedIds = [
    community.id,
    ...children.map((c) => c.id),
    ...(parent ? [parent.id] : []),
  ]

  return { community, parent, children, aliases, relatedIds }
}

export async function searchCommunities(query: string): Promise<Community[]> {
  const supabase = await createClient()

  // Search communities by name/slug/display_name
  const { data: communities } = await supabase
    .from('communities')
    .select('*')
    .eq('status', 'active')
    .or(`name.ilike.%${query}%,slug.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(10)

  // Also search aliases
  const { data: aliasMatches } = await supabase
    .from('community_aliases')
    .select('community_id')
    .ilike('alias_name', `%${query}%`)
    .limit(10)

  const aliasIds = (aliasMatches ?? []).map((a) => a.community_id)

  if (aliasIds.length > 0) {
    const { data: aliasComms } = await supabase
      .from('communities')
      .select('*')
      .eq('status', 'active')
      .in('id', aliasIds)

    const existing = new Set((communities ?? []).map((c) => c.id))
    const extras = (aliasComms ?? []).filter((c) => !existing.has(c.id))
    return [...(communities ?? []), ...extras] as Community[]
  }

  return (communities ?? []) as Community[]
}

export async function getUserCommunities(userId: string): Promise<Community[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_communities')
    .select('community:community_id(*)')
    .eq('user_id', userId)
  if (error) return []
  return (data ?? []).map((d) => ((d as unknown as { community: Community }).community)).filter(Boolean)
}
