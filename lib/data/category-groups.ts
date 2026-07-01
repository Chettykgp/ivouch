/**
 * Fallback mapping of category slug -> { group, featured, sortOrder }.
 *
 * The database is intended to have `group_name`, `sort_order` and `is_featured`
 * columns on `categories` (see supabase/migrations/003_category_groups.sql).
 * Until that migration is applied, this map lets the grouped category UI work.
 * When the columns exist and are populated, DB values take precedence.
 */

export const GROUP_ORDER = [
  'Home & Maintenance',
  'Security & Access',
  'Appliances & Electronics',
  'Garden & Outdoor',
  'Cleaning & Domestic',
  'Motoring & Transport',
  'Health & Medical',
  'Beauty & Wellness',
  'Food & Catering',
  'Education & Kids',
  'Pets & Animals',
  'Events & Creative',
  'Professional & Business',
  'Fashion & Repairs',
  'Other Services',
] as const

export type GroupName = (typeof GROUP_ORDER)[number]

interface GroupMeta {
  group: GroupName
  featured?: boolean
}

/** slug -> group. Slugs not listed fall back to "Other Services". */
export const CATEGORY_GROUP_MAP: Record<string, GroupMeta> = {
  // Home & Maintenance
  plumber: { group: 'Home & Maintenance', featured: true },
  electrician: { group: 'Home & Maintenance', featured: true },
  handyman: { group: 'Home & Maintenance', featured: true },
  painter: { group: 'Home & Maintenance' },
  carpentry: { group: 'Home & Maintenance' },
  bricklaying: { group: 'Home & Maintenance' },
  construction: { group: 'Home & Maintenance' },
  tiler: { group: 'Home & Maintenance' },
  ceilings: { group: 'Home & Maintenance' },
  'roof-repair': { group: 'Home & Maintenance' },
  waterproofing: { group: 'Home & Maintenance' },
  gutters: { group: 'Home & Maintenance' },
  'kitchens-and-cupboards': { group: 'Home & Maintenance' },
  'aluminium-and-glass': { group: 'Home & Maintenance' },
  'gas-installation': { group: 'Home & Maintenance' },
  'solar-and-gas': { group: 'Home & Maintenance' },

  // Security & Access
  security: { group: 'Security & Access', featured: true },
  locksmith: { group: 'Security & Access' },
  'electric-fencing': { group: 'Security & Access' },
  'gate-and-garage-motors': { group: 'Security & Access' },

  // Appliances & Electronics
  'appliance-repairs': { group: 'Appliances & Electronics' },
  'dstv-installation': { group: 'Appliances & Electronics' },
  'dish-tech-and-satellites': { group: 'Appliances & Electronics' },
  '3d-printing': { group: 'Appliances & Electronics' },

  // Garden & Outdoor
  gardener: { group: 'Garden & Outdoor', featured: true },
  'tree-felling': { group: 'Garden & Outdoor' },
  'pool-service': { group: 'Garden & Outdoor' },
  'pest-control': { group: 'Garden & Outdoor' },
  'lapa-and-outdoor': { group: 'Garden & Outdoor' },
  'composting-and-hardware': { group: 'Garden & Outdoor' },

  // Cleaning & Domestic
  'domestic-worker': { group: 'Cleaning & Domestic', featured: true },
  'mattress-cleaning': { group: 'Cleaning & Domestic' },

  // Motoring & Transport
  mechanic: { group: 'Motoring & Transport', featured: true },
  'transport-and-lifts': { group: 'Motoring & Transport' },
  'license-and-registration': { group: 'Motoring & Transport' },
  'driving-instructor': { group: 'Motoring & Transport' },
  'driving-school': { group: 'Motoring & Transport' },

  // Health & Medical
  medical: { group: 'Health & Medical' },
  dentist: { group: 'Health & Medical' },
  orthodontist: { group: 'Health & Medical' },
  'eye-specialist': { group: 'Health & Medical' },
  'first-aid': { group: 'Health & Medical' },
  'doula-and-post-natal': { group: 'Health & Medical' },

  // Beauty & Wellness
  hair: { group: 'Beauty & Wellness' },
  'nails-and-beauty': { group: 'Beauty & Wellness' },
  'massage-and-laser': { group: 'Beauty & Wellness' },
  wellness: { group: 'Beauty & Wellness' },
  'yoga-and-fitness': { group: 'Beauty & Wellness' },

  // Food & Catering
  catering: { group: 'Food & Catering' },
  'catering-and-baking': { group: 'Food & Catering' },
  butcher: { group: 'Food & Catering' },
  'coffee-shop': { group: 'Food & Catering' },
  'restaurants-and-eateries': { group: 'Food & Catering' },

  // Education & Kids
  tutor: { group: 'Education & Kids', featured: true },
  tutoring: { group: 'Education & Kids' },
  'swimming-lessons': { group: 'Education & Kids' },
  'baby-and-mommy-classes': { group: 'Education & Kids' },

  // Pets & Animals
  vet: { group: 'Pets & Animals' },
  'dog-training': { group: 'Pets & Animals' },
  'snake-catching': { group: 'Pets & Animals' },
  'bird-specialist': { group: 'Pets & Animals' },

  // Events & Creative
  dj: { group: 'Events & Creative' },
  photographer: { group: 'Events & Creative' },
  photography: { group: 'Events & Creative' },
  'jumping-castles': { group: 'Events & Creative' },
  'chair-hire': { group: 'Events & Creative' },
  'printing-and-signage': { group: 'Events & Creative' },
  'gifting-and-embroidery': { group: 'Events & Creative' },

  // Professional & Business
  'labour-law': { group: 'Professional & Business' },

  // Fashion & Repairs
  'alterations-and-tailoring': { group: 'Fashion & Repairs' },
  'tailoring-and-alterations': { group: 'Fashion & Repairs' },
  'shoe-repairs': { group: 'Fashion & Repairs' },
}

export function groupForSlug(slug: string): GroupName {
  return CATEGORY_GROUP_MAP[slug]?.group ?? 'Other Services'
}

export function featuredForSlug(slug: string): boolean {
  return CATEGORY_GROUP_MAP[slug]?.featured ?? false
}
