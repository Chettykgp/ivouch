'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils/slugify'
import { GROUP_ORDER } from '@/lib/data/category-groups'
import BusinessPhotoManager from '@/components/business/BusinessPhotoManager'

const WARD_SLUG = 'jhb-south-ward-23'

const FALLBACK_NEIGHBOURHOODS = [
  'Glenvista', 'Bassonia', 'Mulbarton', 'Glenanda',
  'Liefde en Vrede', 'Mayfield Park', 'Rispark', 'South View',
]

interface CatRow {
  id: string
  name: string
  slug: string
  group_name: string | null
  sort_order: number | null
}

export default function AddBusinessPage() {
  const supabase = useMemo(() => createClient(), [])

  const [categories, setCategories] = useState<CatRow[]>([])
  const [neighbourhoods, setNeighbourhoods] = useState<string[]>(FALLBACK_NEIGHBOURHOODS)

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    description: '',
    phone: '',
    whatsapp: '',
    website: '',
    address_text: '',
    isOwner: false,
  })
  const [inWard, setInWard] = useState<boolean | null>(true)
  const [serves, setServes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load live categories + Ward 23 context.
  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: ward }] = await Promise.all([
        supabase
          .from('categories')
          .select('id,name,slug,group_name,sort_order')
          .eq('status', 'active'),
        supabase.from('communities').select('id').eq('slug', WARD_SLUG).maybeSingle(),
      ])
      if (cats) setCategories(cats as CatRow[])
      if (ward?.id) {
        const { data: aliases } = await supabase
          .from('community_aliases')
          .select('alias_name, alias_type')
          .eq('community_id', ward.id)
          .eq('alias_type', 'suburb')
        if (aliases && aliases.length > 0) {
          setNeighbourhoods(aliases.map((a) => a.alias_name as string))
        }
      }
    }
    load()
  }, [supabase])

  // Group categories for the <select> optgroups.
  const grouped = useMemo(() => {
    const byGroup = new Map<string, CatRow[]>()
    for (const c of categories) {
      const g = c.group_name ?? 'Other Services'
      if (!byGroup.has(g)) byGroup.set(g, [])
      byGroup.get(g)!.push(c)
    }
    const order = [
      ...GROUP_ORDER.filter((g) => byGroup.has(g)),
      ...[...byGroup.keys()].filter((g) => !GROUP_ORDER.includes(g as never)),
    ]
    return order.map((name) => ({
      name,
      items: byGroup
        .get(name)!
        .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999) || a.name.localeCompare(b.name)),
    }))
  }, [categories])

  function toggleServe(name: string) {
    setServes((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const slug = slugify(form.name) + '-' + Math.random().toString(36).slice(2, 6)

    // Fold "serves" neighbourhoods into the address line so the info is kept.
    let address = form.address_text.trim()
    if (serves.length > 0) {
      const servesNote = `Serves: ${serves.join(', ')}`
      address = address ? `${address} · ${servesNote}` : servesNote
    }

    // Submit via SECURITY DEFINER RPC (creates pending listing + links Ward 23).
    const { data: newId, error: rpcErr } = await supabase.rpc('submit_business', {
      p_name: form.name,
      p_slug: slug,
      p_description: form.description,
      p_category_id: form.categoryId || null,
      p_phone: form.phone,
      p_whatsapp: form.whatsapp,
      p_website: form.website,
      p_address: address,
      p_in_ward: inWard,
    })

    if (rpcErr) {
      setError(rpcErr.message)
      setLoading(false)
      return
    }
    const businessId = typeof newId === 'string' ? newId : null
    setCreatedId(businessId)

    // Ticking "I'm the owner" starts an ownership claim admins can approve.
    if (businessId && form.isOwner) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, first_name, last_name, email')
          .eq('auth_user_id', user.id)
          .maybeSingle()
        const fullName = profile?.display_name
          || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
          || user.email || ''
        await supabase.rpc('submit_claim', {
          p_business_id: businessId,
          p_name: fullName,
          p_email: profile?.email ?? user.email ?? '',
          p_phone: form.phone ?? '',
          p_evidence: 'Claimed at submission via Add Business (self-declared owner).',
        })
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'new_claim', name: form.name }),
        }).catch(() => {})
      }
    }

    // Fire-and-forget admin notification
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'new_business', name: form.name }),
    }).catch(() => {})

    setSubmitted(true)
    setLoading(false)
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus-ring'
  const inputStyle = { borderColor: 'var(--cloud-grey)' as const }
  const labelClass = 'block text-sm font-semibold mb-1.5'
  const labelStyle = { color: 'var(--ink)' as const }

  if (submitted) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16" style={{ backgroundColor: 'var(--mist)' }}>
          <div className="max-w-md w-full card-soft p-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h1 className="text-2xl font-extrabold mb-3" style={{ color: 'var(--ink)' }}>
                Business submitted!
              </h1>
              <p className="text-gray-500 mb-6">
                Thanks for growing Ward 23. Your listing is pending review and will be published
                once approved.
              </p>
            </div>

            {createdId && (
              <div className="border-t pt-6 mb-6 text-left" style={{ borderColor: 'var(--cloud-grey)' }}>
                <h2 className="font-bold mb-1" style={{ color: 'var(--ink)' }}>Add photos <span className="font-normal text-gray-400">(optional)</span></h2>
                <p className="text-sm text-gray-500 mb-4">A cover or menu photo helps neighbours choose. You can add up to 2.</p>
                <BusinessPhotoManager businessId={createdId} initialImages={[]} />
              </div>
            )}

            <div className="text-center">
              <Link href="/" className="btn-blue inline-flex px-6 py-3">
                {createdId ? 'Done' : 'Back to Home'}
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-10" style={{ backgroundColor: 'var(--mist)' }}>
        <div className="max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-4 text-sm font-semibold"
            style={{ backgroundColor: 'var(--ivouch-blue-soft)', color: 'var(--ivouch-blue-dark)' }}>
            <MapPin size={14} /> JHB Ward 23
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--ink)' }}>
            Add a Business
          </h1>
          <p className="text-gray-500 mb-8">
            List a local business for free. Every submission is reviewed before it goes live —
            and businesses don&apos;t buy trust here, they earn it.
          </p>

          <form onSubmit={handleSubmit} className="card-soft p-6 space-y-5">
            <div>
              <label className={labelClass} style={labelStyle}>Business Name *</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mike's Plumbing" className={inputClass} style={inputStyle} />
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Category *</label>
              <select required value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className={inputClass} style={inputStyle}>
                <option value="">
                  {categories.length ? 'Select a category…' : 'Loading categories…'}
                </option>
                {grouped.map((g) => (
                  <optgroup key={g.name} label={g.name}>
                    {g.items.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Description</label>
              <textarea value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3} placeholder="Brief description of services offered…"
                className={`${inputClass} resize-none`} style={inputStyle} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>Phone</label>
                <input type="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="011 xxx xxxx" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>WhatsApp</label>
                <input type="tel" value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="082 xxx xxxx" className={inputClass} style={inputStyle} />
              </div>
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Website (optional)</label>
              <input type="url" value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://…" className={inputClass} style={inputStyle} />
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Is this business based in Ward 23? *</label>
              <p className="text-xs text-gray-400 mb-2">
                Businesses from outside the ward are welcome — we just show neighbours where they&apos;re based.
              </p>
              <div className="flex gap-2">
                {[
                  { v: true, label: '✓ Yes — based in Ward 23' },
                  { v: false, label: 'No — based outside the ward' },
                ].map((o) => (
                  <button key={String(o.v)} type="button" onClick={() => setInWard(o.v)}
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
                    style={
                      inWard === o.v
                        ? { backgroundColor: 'var(--ivouch-blue)', color: 'white', borderColor: 'var(--ivouch-blue)' }
                        : { backgroundColor: 'white', color: 'var(--ink)', borderColor: 'var(--cloud-grey)' }
                    }>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>
                Neighbourhoods served <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {neighbourhoods.map((n) => (
                  <button key={n} type="button" onClick={() => toggleServe(n)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
                    style={
                      serves.includes(n)
                        ? { backgroundColor: 'var(--ivouch-blue)', color: 'white', borderColor: 'var(--ivouch-blue)' }
                        : { backgroundColor: 'white', color: 'var(--ink)', borderColor: 'var(--cloud-grey)' }
                    }>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Address (optional)</label>
              <input type="text" value={form.address_text}
                onChange={(e) => setForm({ ...form, address_text: e.target.value })}
                placeholder="Street address or area" className={inputClass} style={inputStyle} />
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="isOwner" checked={form.isOwner}
                onChange={(e) => setForm({ ...form, isOwner: e.target.checked })} className="mt-1" />
              <label htmlFor="isOwner" className="text-sm text-gray-600">
                I am the owner or representative of this business and want to claim it
              </label>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-blue w-full py-3.5 disabled:opacity-60">
              {loading ? 'Submitting…' : 'Submit Business'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
