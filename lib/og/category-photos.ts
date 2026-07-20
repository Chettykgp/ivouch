/**
 * Curated free Unsplash photos per category group, self-hosted under
 * public/og/ so the social-share (Open Graph) card never depends on a live
 * external fetch at render time. Returns a path relative to /public.
 */
export const DEFAULT_PHOTO = '/og/default.jpg' // people / community

const BY_GROUP: Record<string, string> = {
  'Home & Maintenance': '/og/home-maintenance.jpg',
  'Security & Access': '/og/security-access.jpg',
  'Appliances & Electronics': '/og/appliances-electronics.jpg',
  'Garden & Outdoor': '/og/garden-outdoor.jpg',
  'Cleaning & Domestic': '/og/cleaning-domestic.jpg',
  'Motoring & Transport': '/og/motoring-transport.jpg',
  'Health & Medical': '/og/health-medical.jpg',
  'Beauty & Wellness': '/og/beauty-wellness.jpg',
  'Food & Catering': '/og/food-catering.jpg',
  'Education & Kids': '/og/education-kids.jpg',
  'Pets & Animals': '/og/pets-animals.jpg',
  'Events & Creative': '/og/events-creative.jpg',
  'Professional & Business': '/og/professional-business.jpg',
  'Fashion & Repairs': '/og/fashion-repairs.jpg',
  'Other Services': DEFAULT_PHOTO,
}

/** Public path (relative to /public) of the share-card photo for a group. */
export function photoForGroup(group: string | null | undefined): string {
  if (!group) return DEFAULT_PHOTO
  return BY_GROUP[group] ?? DEFAULT_PHOTO
}
