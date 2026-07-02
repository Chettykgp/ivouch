'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'

export interface ExplorerCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  group_name: string | null
  business_count?: number
}

interface CategoryExplorerProps {
  categories: ExplorerCategory[]
  groups: string[]
  wardSlug: string
}

const ALL = 'All'

export default function CategoryExplorer({ categories, groups, wardSlug }: CategoryExplorerProps) {
  const [activeGroup, setActiveGroup] = useState<string>(ALL)
  const [query, setQuery] = useState('')

  const filters = useMemo(() => [ALL, ...groups], [groups])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return categories
      .filter((c) => (activeGroup === ALL ? true : c.group_name === activeGroup))
      .filter((c) => (q ? c.name.toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [categories, activeGroup, query])

  return (
    <div>
      {/* Controls: search + quick group filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a service…"
            className="w-full pl-10 pr-4 py-2.5 rounded-full border bg-white text-sm focus:outline-none focus-ring"
            style={{ borderColor: 'var(--cloud-grey)' }}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {filters.map((g) => {
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
      </div>

      {/* Minimal list */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-0">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/c/${wardSlug}/${c.slug}`}
              className="group flex items-center gap-3 py-2.5 border-b transition-colors"
              style={{ borderColor: 'var(--cloud-grey)' }}
            >
              <span className="text-base w-6 text-center flex-shrink-0">{c.icon ?? '•'}</span>
              <span
                className="flex-1 text-sm font-medium truncate transition-colors group-hover:text-[var(--ivouch-blue)]"
                style={{ color: 'var(--ink)' }}
              >
                {c.name}
              </span>
              {typeof c.business_count === 'number' && c.business_count > 0 && (
                <span className="text-xs text-gray-400 tabular-nums">{c.business_count}</span>
              )}
              <ArrowRight
                size={14}
                className="text-gray-300 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                style={{ color: 'var(--ivouch-blue)' }}
              />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 py-8 text-center">
          No services match “{query}”. Try another search.
        </p>
      )}
    </div>
  )
}
