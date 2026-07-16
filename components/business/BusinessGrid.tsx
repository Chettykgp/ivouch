'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { Business } from '@/types'
import BusinessCard from './BusinessCard'

type Sort = 'vouched' | 'newest' | 'verified'

const SORTS: { key: Sort; label: string }[] = [
  { key: 'vouched', label: 'Most vouched' },
  { key: 'newest', label: 'Newest' },
  { key: 'verified', label: 'Verified first' },
]

/** Client-side sort/filter/search over an already-fetched business list. */
export default function BusinessGrid({ businesses }: { businesses: Business[] }) {
  const [sort, setSort] = useState<Sort>('vouched')
  const [inWardOnly, setInWardOnly] = useState(false)
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let list = businesses.filter((b) => {
      if (inWardOnly && b.in_ward !== true) return false
      if (needle) {
        const hay = `${b.name} ${b.primary_category?.name ?? ''} ${b.description ?? ''}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })
    list = [...list]
    if (sort === 'vouched') {
      list.sort((a, b) => (b.vouch_count ?? 0) - (a.vouch_count ?? 0))
    } else if (sort === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else {
      const rank = (b: Business) =>
        b.verification_status === 'verified' ? 2 : b.verification_status === 'phone_verified' ? 1 : 0
      list.sort((a, b) => rank(b) - rank(a) || (b.vouch_count ?? 0) - (a.vouch_count ?? 0))
    }
    return list
  }, [businesses, sort, inWardOnly, q])

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search these businesses…"
            aria-label="Search businesses on this page"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus-ring bg-white"
            style={{ borderColor: 'var(--cloud-grey)' }}
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium whitespace-nowrap cursor-pointer"
          style={{ color: 'var(--ink)' }}>
          <input type="checkbox" checked={inWardOnly} onChange={(e) => setInWardOnly(e.target.checked)} />
          In Ward 23 only
        </label>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className="px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors"
            style={
              sort === s.key
                ? { backgroundColor: 'var(--ivouch-blue)', color: '#fff', borderColor: 'var(--ivouch-blue)' }
                : { backgroundColor: '#fff', color: 'var(--ink)', borderColor: 'var(--cloud-grey)' }
            }
          >
            {s.label}
          </button>
        ))}
        {(q || inWardOnly) && (
          <span className="self-center text-xs text-gray-400">{rows.length} shown</span>
        )}
      </div>

      {/* Grid */}
      {rows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="card-soft text-center py-12 px-4 text-sm text-gray-500">
          No businesses match — try clearing the search or filters.
        </div>
      )}
    </div>
  )
}
