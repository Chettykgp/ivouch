'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, Store, Grid3x3, ShieldCheck, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const WARD_SLUG = 'jhb-south-ward-23'

interface BizHit {
  id: string
  name: string
  slug: string
  primary_category: { name: string | null; icon: string | null } | null
  vouch_count: { count: number }[] | null
}

interface CatHit {
  id: string
  name: string
  slug: string
  icon: string | null
}

export default function HeaderSearch({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const supabase = useMemo(() => createClient(), [])
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [bizHits, setBizHits] = useState<BizHit[]>([])
  const [catHits, setCatHits] = useState<CatHit[]>([])
  const boxRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const needle = q.trim()
    if (needle.length < 2) {
      setBizHits([])
      setCatHits([])
      setBusy(false)
      return
    }
    setBusy(true)
    const t = setTimeout(async () => {
      const like = `%${needle}%`
      const [biz, cats] = await Promise.all([
        supabase
          .from('businesses')
          .select('id, name, slug, primary_category:categories(name, icon), vouch_count:vouches(count)')
          .eq('status', 'active')
          .or(`name.ilike.${like},description.ilike.${like}`)
          .limit(6),
        supabase
          .from('categories')
          .select('id, name, slug, icon')
          .eq('status', 'active')
          .ilike('name', like)
          .limit(4),
      ])
      setBizHits((biz.data as unknown as BizHit[]) ?? [])
      setCatHits((cats.data as CatHit[]) ?? [])
      setBusy(false)
    }, 250)
    return () => clearTimeout(t)
  }, [q, supabase])

  // Close on click-outside / Escape
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const showPanel = open && q.trim().length >= 2
  const noHits = !busy && bizHits.length === 0 && catHits.length === 0

  function close() {
    setOpen(false)
    setQ('')
  }

  return (
    <div ref={boxRef} className={variant === 'desktop' ? 'relative w-56 lg:w-72' : 'relative w-full'}>
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search plumbers, bakers…"
          aria-label="Search businesses and categories"
          className="w-full pl-9 pr-3 py-2 rounded-full border text-sm focus:outline-none focus-ring bg-white"
          style={{ borderColor: 'var(--cloud-grey)' }}
        />
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white shadow-lg border overflow-hidden animate-fade-up z-50"
          style={{ borderColor: 'var(--cloud-grey)', minWidth: variant === 'desktop' ? '20rem' : undefined }}>
          {busy && (
            <div className="px-4 py-3 text-sm text-gray-400">Searching…</div>
          )}

          {!busy && catHits.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">Categories</div>
              {catHits.map((c) => (
                <Link key={c.id} href={`/c/${WARD_SLUG}/${c.slug}`} onClick={close}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--mist)]">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--ivouch-blue-soft)' }}>
                    {c.icon ? <span className="text-base">{c.icon}</span> : <Grid3x3 size={15} style={{ color: 'var(--ivouch-blue)' }} />}
                  </span>
                  <span className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{c.name}</span>
                  <ArrowRight size={14} className="ml-auto text-gray-300 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}

          {!busy && bizHits.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">Businesses</div>
              {bizHits.map((b) => {
                const count = b.vouch_count?.[0]?.count ?? 0
                return (
                  <Link key={b.id} href={`/b/${b.slug}`} onClick={close}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--mist)]">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--ivouch-blue-soft)' }}>
                      {b.primary_category?.icon
                        ? <span className="text-base">{b.primary_category.icon}</span>
                        : <Store size={15} style={{ color: 'var(--ivouch-blue)' }} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{b.name}</span>
                      {b.primary_category?.name && (
                        <span className="block text-xs text-gray-400 truncate">{b.primary_category.name}</span>
                      )}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold flex-shrink-0"
                      style={{ color: 'var(--ivouch-blue)' }}>
                      <ShieldCheck size={13} /> {count}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}

          {noHits && (
            <div className="px-4 py-4 text-sm text-gray-500">
              Nothing found for “{q.trim()}”.{' '}
              <Link href="/add-business" onClick={close} className="font-semibold" style={{ color: 'var(--ivouch-blue)' }}>
                Add it to Ward 23 →
              </Link>
            </div>
          )}

          {!busy && !noHits && <div className="h-2" />}
        </div>
      )}
    </div>
  )
}
