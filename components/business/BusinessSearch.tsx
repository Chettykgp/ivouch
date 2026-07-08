'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, BadgeCheck, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Result {
  id: string
  name: string
  slug: string
  category: { name: string | null; icon: string | null } | null
}

interface BusinessSearchProps {
  /** Where the primary action links: 'vouch' → /vouch/[id], 'view' → /b/[slug] */
  action?: 'vouch' | 'view'
  placeholder?: string
}

export default function BusinessSearch({
  action = 'vouch',
  placeholder = 'Search a business to vouch for…',
}: BusinessSearchProps) {
  const supabase = useMemo(() => createClient(), [])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    timer.current = setTimeout(async () => {
      const { data } = await supabase
        .from('businesses')
        .select('id, name, slug, category:categories(name, icon)')
        .eq('status', 'active')
        .ilike('name', `%${q}%`)
        .order('name')
        .limit(8)
      setResults((data as unknown as Result[]) ?? [])
      setLoading(false)
      setTouched(true)
    }, 250)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [query, supabase])

  return (
    <div>
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
            aria-label="Search a business"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 rounded-xl border bg-white text-sm focus:outline-none focus-ring"
          style={{ borderColor: 'var(--cloud-grey)' }}
        />
        {loading && (
          <Loader2 size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-3 space-y-2">
          {results.map((b) => (
            <div key={b.id} className="card-soft flex items-center gap-3 p-3">
              <span className="icon-tile w-10 h-10 text-lg flex-shrink-0">{b.category?.icon ?? '🏪'}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>{b.name}</div>
                {b.category?.name && <div className="text-xs text-gray-400 truncate">{b.category.name}</div>}
              </div>
              <Link href={`/b/${b.slug}`} className="btn-outline px-3 py-2 text-xs">View</Link>
              {action === 'vouch' && (
                <Link href={`/vouch/${b.id}`} className="btn-blue px-3.5 py-2 text-xs">
                  <BadgeCheck size={14} /> Vouch
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {touched && !loading && query.trim().length >= 2 && results.length === 0 && (
        <div className="mt-3 card-soft p-4 text-sm text-gray-500 flex items-center justify-between gap-3">
          <span>No business found for “{query.trim()}”.</span>
          <Link href="/add-business" className="font-semibold inline-flex items-center gap-1 whitespace-nowrap" style={{ color: 'var(--ivouch-blue)' }}>
            Add it <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}
