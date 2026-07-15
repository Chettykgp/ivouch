'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, X, ArrowUpDown, Check } from 'lucide-react'
import type { CategoryGroup, Category } from '@/types'

interface CategoryDirectoryProps {
  groups: CategoryGroup[]
  wardSlug: string
}

type SortMode = 'az' | 'count'
const ALL = 'All'

interface FlatCat extends Category {
  group: string
}

export default function CategoryDirectory({ groups, wardSlug }: CategoryDirectoryProps) {
  const [query, setQuery] = useState('')
  const [activeGroup, setActiveGroup] = useState<string>(ALL)
  const [sort, setSort] = useState<SortMode>('az')
  const [onlyWithVouches, setOnlyWithVouches] = useState(false)

  const groupNames = useMemo(() => groups.map((g) => g.group_name), [groups])

  // Flatten (preserving group order) once.
  const allCats: FlatCat[] = useMemo(
    () => groups.flatMap((g) => g.categories.map((c) => ({ ...c, group: g.group_name }))),
    [groups]
  )
  const totalWithVouches = useMemo(
    () => allCats.filter((c) => (c.vouch_count ?? 0) > 0).length,
    [allCats]
  )

  // Apply filters + sort.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = allCats.filter((c) => {
      if (activeGroup !== ALL && c.group !== activeGroup) return false
      if (onlyWithVouches && (c.vouch_count ?? 0) === 0) return false
      if (q && !c.name.toLowerCase().includes(q)) return false
      return true
    })
    list =
      sort === 'count'
        ? [...list].sort((a, b) => (b.vouch_count ?? 0) - (a.vouch_count ?? 0) || a.name.localeCompare(b.name))
        : [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [allCats, query, activeGroup, onlyWithVouches, sort])

  // Re-group filtered results in canonical group order (skip empty groups).
  const displayGroups = useMemo(() => {
    const byGroup = new Map<string, FlatCat[]>()
    for (const c of filtered) {
      if (!byGroup.has(c.group)) byGroup.set(c.group, [])
      byGroup.get(c.group)!.push(c)
    }
    return groupNames
      .filter((g) => byGroup.has(g))
      .map((g) => ({ group_name: g, categories: byGroup.get(g)! }))
  }, [filtered, groupNames])

  return (
    <div>
      {/* Search */}
      <div className="relative max-w-xl mx-auto mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search categories"
          placeholder="Search a service — plumber, tutor, hairdresser…"
          className="w-full pl-11 pr-10 py-3.5 rounded-2xl border bg-white text-sm shadow-[var(--shadow-soft)] focus:outline-none focus-ring"
          style={{ borderColor: 'var(--cloud-grey)' }}
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Group filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-3 scrollbar-hide">
        {[ALL, ...groupNames].map((g) => {
          const active = g === activeGroup
          return (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold border transition-colors"
              style={
                active
                  ? { backgroundColor: 'var(--ivouch-blue)', color: '#fff', borderColor: 'var(--ivouch-blue)' }
                  : { backgroundColor: '#fff', color: 'var(--ink)', borderColor: 'var(--cloud-grey)' }
              }
            >
              {g}
            </button>
          )
        })}
      </div>

      {/* Controls: result count + toggles */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <span className="text-sm text-gray-500">
          {filtered.length} {filtered.length === 1 ? 'service' : 'services'}
          {onlyWithVouches ? ' vouched for' : ''}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyWithVouches((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors"
            style={
              onlyWithVouches
                ? { backgroundColor: 'var(--vouch-green)', color: '#fff', borderColor: 'var(--vouch-green)' }
                : { backgroundColor: '#fff', color: 'var(--ink)', borderColor: 'var(--cloud-grey)' }
            }
          >
            {onlyWithVouches && <Check size={13} />} Only with vouches ({totalWithVouches})
          </button>
          <button
            onClick={() => setSort((s) => (s === 'az' ? 'count' : 'az'))}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border bg-white transition-colors hover:border-[var(--ivouch-blue)]"
            style={{ color: 'var(--ink)', borderColor: 'var(--cloud-grey)' }}
          >
            <ArrowUpDown size={13} /> {sort === 'az' ? 'A–Z' : 'Most vouched'}
          </button>
        </div>
      </div>

      {/* Results */}
      {displayGroups.length > 0 ? (
        <div className="space-y-10">
          {displayGroups.map((group) => (
            <section key={group.group_name}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-extrabold" style={{ color: 'var(--ink)' }}>{group.group_name}</h2>
                <span className="h-px flex-1" style={{ backgroundColor: 'var(--cloud-grey)' }} />
                <span className="text-xs text-gray-400">{group.categories.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {group.categories.map((cat) => {
                  const biz = cat.business_count ?? 0
                  const vch = cat.vouch_count ?? 0
                  return (
                    <Link
                      key={cat.id}
                      href={`/c/${wardSlug}/${cat.slug}`}
                      className="card-soft card-hover flex items-center gap-3 p-4"
                    >
                      <span className="icon-tile w-11 h-11 text-xl flex-shrink-0">{cat.icon ?? '📌'}</span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>
                          {cat.name}
                        </span>
                        <span className="block text-xs" style={{ color: vch > 0 ? 'var(--ivouch-blue)' : '#9aa4b2' }}>
                          {biz} {biz === 1 ? 'business' : 'businesses'}
                          {vch > 0 && <span className="font-semibold"> · {vch} vouch{vch === 1 ? '' : 'es'}</span>}
                        </span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="card-soft p-10 text-center max-w-lg mx-auto">
          <div className="text-4xl mb-3">🔎</div>
          <p className="font-semibold" style={{ color: 'var(--ink)' }}>
            No services match {query ? `“${query.trim()}”` : 'those filters'}.
          </p>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Know someone who does this in Ward 23? Add them for your neighbours.
          </p>
          <Link href="/add-business" className="btn-blue inline-flex px-6 py-3">Add a business</Link>
        </div>
      )}
    </div>
  )
}
