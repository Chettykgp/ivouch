/** Deterministic warm avatar colors derived from a name/string. */
const AVATAR_COLORS = [
  '#20B26B', // vouch green
  '#F25F5C', // coral
  '#3B82C4', // blue
  '#F0A202', // amber
  '#8B5CF6', // violet
  '#0EA5A5', // teal
  '#E8618C', // pink
  '#5A6ACF', // periwinkle
]

export function avatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/** Up to two initials from a name. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
