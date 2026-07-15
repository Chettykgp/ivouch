'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { GROUP_ORDER } from '@/lib/data/category-groups'

interface CatRow { id: string; name: string; group_name: string | null; sort_order: number | null }

export interface EditableBusiness {
  id: string
  name: string
  description: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  website: string | null
  address_text: string | null
  primary_category_id: string | null
  in_ward: boolean | null
}

export default function BusinessEditForm({ business }: { business: EditableBusiness }) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<CatRow[]>([])
  const [form, setForm] = useState({
    name: business.name ?? '',
    description: business.description ?? '',
    phone: business.phone ?? '',
    whatsapp: business.whatsapp ?? '',
    email: business.email ?? '',
    website: business.website ?? '',
    address_text: business.address_text ?? '',
    primary_category_id: business.primary_category_id ?? '',
    in_ward: business.in_ward ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || categories.length) return
    supabase.from('categories').select('id,name,group_name,sort_order').eq('status', 'active')
      .then(({ data }) => data && setCategories(data as CatRow[]))
  }, [open, supabase, categories.length])

  const grouped = useMemo(() => {
    const byGroup = new Map<string, CatRow[]>()
    for (const c of categories) {
      const g = c.group_name ?? 'Other Services'
      if (!byGroup.has(g)) byGroup.set(g, [])
      byGroup.get(g)!.push(c)
    }
    const order = [...GROUP_ORDER.filter((g) => byGroup.has(g)), ...[...byGroup.keys()].filter((g) => !GROUP_ORDER.includes(g as never))]
    return order.map((name) => ({ name, items: byGroup.get(name)!.sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999) || a.name.localeCompare(b.name)) }))
  }, [categories])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/business/${business.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, primary_category_id: form.primary_category_id || null }),
    })
    const json = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) { setError(json.error ?? 'Could not save'); return }
    setOpen(false)
    router.refresh()
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus-ring'
  const inputStyle = { borderColor: 'var(--cloud-grey)' as const }
  const labelClass = 'block text-sm font-semibold mb-1.5'

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-outline px-3 py-2 text-xs">
        <Pencil size={13} /> Edit details
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(11,31,78,0.45)' }} onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold" style={{ color: 'var(--ink)' }}>Edit business</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <form onSubmit={save} className="space-y-4">
              <div>
                <label className={labelClass} style={{ color: 'var(--ink)' }}>Business name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass} style={{ color: 'var(--ink)' }}>Category</label>
                <select value={form.primary_category_id} onChange={(e) => setForm({ ...form, primary_category_id: e.target.value })} className={inputClass} style={inputStyle}>
                  <option value="">{categories.length ? 'Select a category…' : 'Loading…'}</option>
                  {grouped.map((g) => (
                    <optgroup key={g.name} label={g.name}>
                      {g.items.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} style={{ color: 'var(--ink)' }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputClass} resize-none`} style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ color: 'var(--ink)' }}>Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className={labelClass} style={{ color: 'var(--ink)' }}>WhatsApp</label>
                  <input type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={inputClass} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className={labelClass} style={{ color: 'var(--ink)' }}>Email <span className="font-normal text-gray-400">(not shown publicly)</span></label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="hello@business.co.za" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass} style={{ color: 'var(--ink)' }}>Website</label>
                <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://…" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass} style={{ color: 'var(--ink)' }}>Address</label>
                <input value={form.address_text} onChange={(e) => setForm({ ...form, address_text: e.target.value })} className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass} style={{ color: 'var(--ink)' }}>Based in Ward 23?</label>
                <div className="flex gap-2">
                  {[{ v: true, label: '✓ Yes' }, { v: false, label: 'No — outside' }].map((o) => (
                    <button key={String(o.v)} type="button" onClick={() => setForm({ ...form, in_ward: o.v })}
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
                      style={form.in_ward === o.v
                        ? { backgroundColor: 'var(--ivouch-blue)', color: '#fff', borderColor: 'var(--ivouch-blue)' }
                        : { backgroundColor: '#fff', color: 'var(--ink)', borderColor: 'var(--cloud-grey)' }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">{error}</div>}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn-outline flex-1 py-3">Cancel</button>
                <button type="submit" disabled={loading} className="btn-blue flex-1 py-3 disabled:opacity-60">{loading ? 'Saving…' : 'Save changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
