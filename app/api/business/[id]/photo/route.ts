import { NextResponse } from 'next/server'
import { BUSINESS_IMAGES_BUCKET } from '@/lib/supabase/service'
import { authorizeBusiness } from '@/lib/business/authorize'

const MAX_IMAGES = 2
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await authorizeBusiness(id)
  if (!auth.ok) return NextResponse.json({ error: auth.msg }, { status: auth.status })
  const { svc, biz } = auth

  const current: string[] = biz.images ?? []
  if (current.length >= MAX_IMAGES) {
    return NextResponse.json({ error: `A business can have at most ${MAX_IMAGES} photos.` }, { status: 400 })
  }

  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Please upload a JP, PNG, WEBP or GIF image.' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Image is too large (max 5MB).' }, { status: 400 })

  const path = `${id}/${crypto.randomUUID()}.${EXT[file.type] ?? 'jpg'}`
  const bytes = new Uint8Array(await file.arrayBuffer())

  const { error: upErr } = await svc.storage
    .from(BUSINESS_IMAGES_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  const { data: pub } = svc.storage.from(BUSINESS_IMAGES_BUCKET).getPublicUrl(path)
  const images = [...current, pub.publicUrl].slice(0, MAX_IMAGES)

  const { error: updErr } = await svc.from('businesses').update({ images }).eq('id', id)
  if (updErr) {
    await svc.storage.from(BUSINESS_IMAGES_BUCKET).remove([path])
    return NextResponse.json({ error: updErr.message }, { status: 500 })
  }

  return NextResponse.json({ images })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await authorizeBusiness(id)
  if (!auth.ok) return NextResponse.json({ error: auth.msg }, { status: auth.status })
  const { svc, biz } = auth

  const { url } = (await request.json().catch(() => ({}))) as { url?: string }
  if (!url) return NextResponse.json({ error: 'No image specified.' }, { status: 400 })

  const images = (biz.images ?? []).filter((u: string) => u !== url)
  const { error: updErr } = await svc.from('businesses').update({ images }).eq('id', id)
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

  // Best-effort delete of the stored object.
  const marker = `/${BUSINESS_IMAGES_BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx !== -1) {
    const objectPath = url.slice(idx + marker.length)
    await svc.storage.from(BUSINESS_IMAGES_BUCKET).remove([objectPath])
  }

  return NextResponse.json({ images })
}
