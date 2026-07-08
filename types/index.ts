export type UserRole = 'user' | 'admin' | 'business_owner' | 'community_champion'
export type BusinessStatus = 'pending' | 'active' | 'hidden' | 'rejected'
export type ClaimStatus = 'pending' | 'approved' | 'rejected'
export type VouchStatus = 'active' | 'pending' | 'hidden' | 'flagged'
export type ReportStatus = 'open' | 'reviewed' | 'resolved' | 'dismissed'
export type CommunityType = 'ward' | 'suburb' | 'region' | 'city' | 'custom'
export type MembershipType = 'lives_here' | 'works_here' | 'serves_here' | 'follows' | 'owns_business_here'
export type ServiceAreaRelationship = 'based_in' | 'serves' | 'delivers_to' | 'available_in'
export type AliasType = 'suburb' | 'township' | 'estate' | 'neighbourhood' | 'common_name' | 'ward_label' | 'region_label'
export type AliasConfidence = 'official' | 'imported' | 'manual' | 'inferred'

export interface Community {
  id: string
  name: string
  slug: string
  display_name: string | null
  type: CommunityType
  city: string
  province: string
  country: string
  description: string | null
  municipality: string | null
  municipality_code: string | null
  ward_number: number | null
  region_code: string | null
  parent_community_id: string | null
  boundary_version: string | null
  source_name: string | null
  source_url: string | null
  source_date: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  // joined
  parent_community?: Community
  child_communities?: Community[]
  aliases?: CommunityAlias[]
}

export interface CommunityAlias {
  id: string
  community_id: string
  alias_name: string
  alias_slug: string
  alias_type: AliasType
  confidence: AliasConfidence
  source_name: string | null
  source_url: string | null
  created_at: string
}

export interface CommunityBoundary {
  id: string
  community_id: string
  boundary_type: string
  source_name: string | null
  source_url: string | null
  source_date: string | null
  boundary_version: string | null
  geojson: Record<string, unknown> | null
  bbox: Record<string, unknown> | null
  imported_at: string
}

export interface UserCommunity {
  id: string
  user_id: string
  community_id: string
  membership_type: MembershipType
  is_primary: boolean
  verification_status: string
  created_at: string
  community?: Community
}

export interface BusinessServiceArea {
  id: string
  business_id: string
  community_id: string
  relationship: ServiceAreaRelationship
  created_at: string
  community?: Community
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  status: 'active' | 'inactive'
  group_name: string | null
  sort_order: number | null
  is_featured: boolean | null
  business_count?: number
}

export interface CategoryGroup {
  group_name: string
  categories: Category[]
}

export interface Business {
  id: string
  name: string
  slug: string
  description: string | null
  primary_category_id: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  website: string | null
  address_text: string | null
  owner_user_id: string | null
  claimed_status: boolean
  verification_status: 'unverified' | 'phone_verified' | 'verified'
  status: BusinessStatus
  created_by_user_id: string | null
  is_community_sourced: boolean
  in_ward: boolean | null
  created_at: string
  updated_at: string
  primary_category?: Category
  vouch_count?: number
  communities?: Community[]
}

export interface Profile {
  id: string
  auth_user_id: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  email: string | null
  phone: string | null
  home_community_id: string | null
  role: UserRole
  verification_status: 'unverified' | 'verified'
  created_at: string
  updated_at: string
  home_community?: Community
}

export interface Vouch {
  id: string
  business_id: string
  user_id: string
  community_id: string
  service_category_id: string | null
  comment: string | null
  tags: string[]
  status: VouchStatus
  created_at: string
  updated_at: string
  business?: Business
  community?: Community
  profile?: Pick<Profile, 'display_name' | 'first_name'>
}

export interface Claim {
  id: string
  business_id: string
  claimant_user_id: string | null
  claimant_name: string
  claimant_email: string
  claimant_phone: string
  evidence_text: string | null
  status: ClaimStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  business?: Business
}

export interface Report {
  id: string
  target_type: 'business' | 'vouch' | 'claim'
  target_id: string
  reported_by_user_id: string | null
  reason: string
  details: string | null
  status: ReportStatus
  created_at: string
}

/** A vouch shaped for the social activity feed. */
export interface ActivityVouch {
  id: string
  created_at: string
  comment: string | null
  tags: string[]
  voucherName: string
  voucherCommunity: string | null
  business: {
    id: string
    name: string
    slug: string
    categoryName: string | null
    categoryIcon: string | null
  }
}

export type ConcernStatus = 'open' | 'reviewed' | 'resolved' | 'dismissed'
export type ConcernCategory = 'no_show' | 'poor_workmanship' | 'overcharging' | 'unprofessional' | 'safety' | 'other'

export interface Concern {
  id: string
  business_id: string
  user_id: string
  category: ConcernCategory
  details: string | null
  status: ConcernStatus
  created_at: string
  business?: Pick<Business, 'name' | 'slug'>
  profile?: Pick<Profile, 'display_name' | 'first_name' | 'email'>
}
