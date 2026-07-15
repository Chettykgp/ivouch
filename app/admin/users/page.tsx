import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import UsersTable, { type AdminUser } from '@/components/admin/UsersTable'

const WARD_SLUG = 'jhb-south-ward-23'

/** Confirm or revoke a user's residency. Confirming marks them verified and
 *  assigns them to Ward 23; revoking flips them back to unverified. */
async function setResidency(profileId: string, verified: boolean) {
  'use server'
  const svc = createServiceClient()

  const patch: Record<string, unknown> = {
    verification_status: verified ? 'verified' : 'unverified',
  }
  if (verified) {
    const { data: ward } = await svc.from('communities').select('id').eq('slug', WARD_SLUG).maybeSingle()
    if (ward?.id) patch.home_community_id = ward.id
  }

  const { error } = await svc.from('profiles').update(patch).eq('id', profileId)
  if (error) { console.error('[admin] setResidency failed:', error.message); return }
  revalidatePath('/admin/users')
  revalidatePath('/admin')
}

/** Permanently remove a user (e.g. found not to live in the ward). Deletes the
 *  auth account, which cascades to their profile, vouches, claims and reports.
 *  Businesses they added are kept (unlinked). */
async function removeUser(profileId: string) {
  'use server'
  const svc = createServiceClient()

  // Guard: never let an admin delete their own account here.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: me } = await supabase.from('profiles').select('id').eq('auth_user_id', user?.id ?? '').maybeSingle()
  if (me?.id === profileId) { console.error('[admin] removeUser: refused self-delete'); return }

  const { data: target } = await svc.from('profiles').select('auth_user_id').eq('id', profileId).maybeSingle()
  if (!target?.auth_user_id) { console.error('[admin] removeUser: no auth user for profile'); return }

  const { error } = await svc.auth.admin.deleteUser(target.auth_user_id)
  if (error) { console.error('[admin] removeUser failed:', error.message); return }
  revalidatePath('/admin/users')
  revalidatePath('/admin')
}

export default async function AdminUsersPage() {
  const svc = createServiceClient()

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  const [{ data: profiles }, { data: vouches }, { data: businesses }, { data: ward }] = await Promise.all([
    svc.from('profiles')
      .select('id, auth_user_id, first_name, last_name, display_name, email, phone, role, verification_status, home_community_id, created_at')
      .order('created_at', { ascending: false }),
    svc.from('vouches').select('user_id').eq('status', 'active'),
    svc.from('businesses').select('created_by_user_id'),
    svc.from('communities').select('id, name').eq('slug', WARD_SLUG).maybeSingle(),
  ])

  const vouchCount = new Map<string, number>()
  for (const v of vouches ?? []) {
    if (v.user_id) vouchCount.set(v.user_id, (vouchCount.get(v.user_id) ?? 0) + 1)
  }
  const bizCount = new Map<string, number>()
  for (const b of businesses ?? []) {
    if (b.created_by_user_id) bizCount.set(b.created_by_user_id, (bizCount.get(b.created_by_user_id) ?? 0) + 1)
  }

  const users: AdminUser[] = (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.display_name || [p.first_name, p.last_name].filter(Boolean).join(' ') || (p.email?.split('@')[0] ?? 'User'),
    email: p.email ?? '',
    phone: p.phone ?? '',
    role: p.role ?? 'user',
    verified: p.verification_status === 'verified',
    inWard: !!p.home_community_id && p.home_community_id === ward?.id,
    isDemo: (p.email ?? '').endsWith('demo.ivouch.local'),
    isSelf: !!authUser && p.auth_user_id === authUser.id,
    vouches: vouchCount.get(p.id) ?? 0,
    businesses: bizCount.get(p.id) ?? 0,
    createdAt: p.created_at,
  }))

  return (
    <div>
      <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--ink)' }}>Users</h1>
      <p className="text-sm text-gray-500 mb-6">
        Everyone registered on iVouch. Confirm a member as a resident of{' '}
        <span className="font-semibold" style={{ color: 'var(--ink)' }}>{ward?.name ?? 'the ward'}</span>{' '}
        to mark them verified and assign them to the ward.
      </p>
      <UsersTable users={users} setResidency={setResidency} removeUser={removeUser} />
    </div>
  )
}
