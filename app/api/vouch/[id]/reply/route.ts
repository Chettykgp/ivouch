import { NextResponse } from 'next/server'
import { authorizeBusiness } from '@/lib/business/authorize'
import { createServiceClient } from '@/lib/supabase/service'

const MAX_REPLY = 300

/** The claimed owner (or an admin) may reply to a vouch — replies speak as the
 *  business, so the mere adder of a listing is NOT allowed. */
async function authorizeReply(vouchId: string) {
  const svc = createServiceClient()
  const { data: vouch } = await svc
    .from('vouches')
    .select('id, business_id')
    .eq('id', vouchId)
    .maybeSingle()
  if (!vouch) return { ok: false as const, status: 404, msg: 'Vouch not found.' }

  const auth = await authorizeBusiness(vouch.business_id)
  if (!auth.ok) return auth

  // authorizeBusiness admits admin/owner/adder — narrow to owner-or-admin,
  // since replies speak as the business.
  const isOwner = auth.biz.claimed_status && auth.biz.owner_user_id === auth.profileId
  if (!isOwner) {
    const { data: profile } = await svc.from('profiles').select('role').eq('id', auth.profileId).maybeSingle()
    if (profile?.role !== 'admin') {
      return { ok: false as const, status: 403, msg: 'Only the claimed owner can respond to vouches.' }
    }
  }
  return { ok: true as const, svc: auth.svc }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await authorizeReply(id)
  if (!auth.ok) return NextResponse.json({ error: auth.msg }, { status: auth.status })

  const { reply } = (await request.json().catch(() => ({}))) as { reply?: string }
  const text = (reply ?? '').trim().slice(0, MAX_REPLY)
  if (!text) return NextResponse.json({ error: 'Reply cannot be empty.' }, { status: 400 })

  const { error } = await auth.svc
    .from('vouches')
    .update({ owner_reply: text, owner_reply_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, reply: text })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await authorizeReply(id)
  if (!auth.ok) return NextResponse.json({ error: auth.msg }, { status: auth.status })

  const { error } = await auth.svc
    .from('vouches')
    .update({ owner_reply: null, owner_reply_at: null })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
