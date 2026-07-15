import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface BusinessAuthRow {
  id: string
  images: string[] | null
  owner_user_id: string | null
  created_by_user_id: string | null
  claimed_status: boolean
}

export type AuthorizeResult =
  | { ok: false; status: number; msg: string }
  | { ok: true; svc: SupabaseClient; biz: BusinessAuthRow; profileId: string }

/**
 * Verify the current user may manage a business's content (photos, details).
 * Allowed for: an admin, the claimed owner, or the person who added it
 * (created_by_user_id). Returns a service client + the business row on success.
 */
export async function authorizeBusiness(businessId: string): Promise<AuthorizeResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, status: 401, msg: 'Sign in to manage this business.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!profile) return { ok: false, status: 403, msg: 'No profile.' }

  const svc = createServiceClient()
  const { data: biz } = await svc
    .from('businesses')
    .select('id, images, owner_user_id, created_by_user_id, claimed_status')
    .eq('id', businessId)
    .maybeSingle()
  if (!biz) return { ok: false, status: 404, msg: 'Business not found.' }

  const isAdmin = profile.role === 'admin'
  const isOwner = biz.claimed_status && biz.owner_user_id === profile.id
  const isAdder = biz.created_by_user_id === profile.id
  if (!isAdmin && !isOwner && !isAdder) {
    return { ok: false, status: 403, msg: 'You can only manage your own business.' }
  }
  return { ok: true, svc, biz: biz as BusinessAuthRow, profileId: profile.id }
}
