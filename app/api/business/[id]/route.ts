import { NextResponse } from 'next/server'
import { authorizeBusiness } from '@/lib/business/authorize'

const clean = (v: unknown) => {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t.length ? t : null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await authorizeBusiness(id)
  if (!auth.ok) return NextResponse.json({ error: auth.msg }, { status: auth.status })
  const { svc } = auth

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>

  const name = clean(body.name)
  if (!name) return NextResponse.json({ error: 'Business name is required.' }, { status: 400 })

  // Only these fields are editable — never status/owner/claimed/slug.
  const update: Record<string, unknown> = {
    name,
    description: clean(body.description),
    phone: clean(body.phone),
    whatsapp: clean(body.whatsapp),
    website: clean(body.website),
    address_text: clean(body.address_text),
    primary_category_id: clean(body.primary_category_id),
    in_ward: typeof body.in_ward === 'boolean' ? body.in_ward : null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await svc.from('businesses').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
