import { getCommunityWithContext } from '@/lib/data/communities'
import type { Community, CommunityAlias } from '@/types'

export interface CommunityContext {
  community: Community | null
  parent: Community | null
  children: Community[]
  aliases: CommunityAlias[]
  relatedIds: string[]
  displayLabel: string
  subLabel: string | null
}

export async function resolveCommunityContext(slug: string): Promise<CommunityContext> {
  const { community, parent, children, aliases, relatedIds } = await getCommunityWithContext(slug)

  if (!community) {
    return {
      community: null,
      parent: null,
      children: [],
      aliases: [],
      relatedIds: [],
      displayLabel: '',
      subLabel: null,
    }
  }

  // Build friendly display label
  const displayLabel = community.display_name ?? community.name
  let subLabel: string | null = null

  if (community.type === 'ward') {
    // Show suburb names as a dot-separated list
    const suburbNames =
      children.length > 0
        ? children
            .slice(0, 4)
            .map((c) => c.name)
            .join(' · ')
        : aliases
            .filter((a) => a.alias_type === 'suburb')
            .slice(0, 4)
            .map((a) => a.alias_name)
            .join(' · ')
    if (suburbNames) subLabel = suburbNames
  } else if (community.type === 'suburb' && parent) {
    subLabel = `Part of ${parent.display_name ?? parent.name}`
  }

  return { community, parent, children, aliases, relatedIds, displayLabel, subLabel }
}
