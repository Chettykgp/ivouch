import Link from 'next/link'
import { ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react'
import type { TrendingBusiness } from '@/lib/data/trending'
import { avatarColor, initials } from '@/lib/utils/avatar'

const RANK_STYLE = [
  { backgroundColor: 'var(--ivouch-blue)', color: '#fff' },        // #1
  { backgroundColor: 'var(--ivouch-blue-soft)', color: 'var(--ivouch-blue-dark)' }, // #2
  { backgroundColor: 'var(--ivouch-blue-soft)', color: 'var(--ivouch-blue-dark)' }, // #3
]

export default function TrendingBoard({
  businesses,
  compact = false,
}: {
  businesses: TrendingBusiness[]
  compact?: boolean
}) {
  if (businesses.length === 0) return null

  return (
    <div className="card-soft overflow-hidden">
      {businesses.map((b, i) => (
        <Link
          key={b.id}
          href={`/b/${b.slug}`}
          className={`group flex items-center transition-colors hover:bg-[var(--mist)] ${
            compact ? 'gap-2.5 px-3 py-2.5' : 'gap-3.5 px-4 sm:px-5 py-4'
          }`}
          style={i > 0 ? { borderTop: '1px solid var(--cloud-grey)' } : undefined}
        >
          {/* Rank */}
          <span
            className={`rounded-full flex items-center justify-center font-black flex-shrink-0 ${
              compact ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
            }`}
            style={RANK_STYLE[i] ?? { backgroundColor: 'var(--mist)', color: '#5A6B85' }}
          >
            {i + 1}
          </span>

          {/* Icon / monogram */}
          <span
            className={`rounded-xl flex items-center justify-center flex-shrink-0 ${
              compact ? 'w-9 h-9' : 'w-11 h-11'
            }`}
            style={
              b.categoryIcon
                ? { backgroundColor: 'var(--ivouch-blue-soft)' }
                : { backgroundColor: avatarColor(b.name), color: '#fff' }
            }
          >
            {b.categoryIcon
              ? <span className={compact ? 'text-base' : 'text-xl'}>{b.categoryIcon}</span>
              : <span className="font-black text-sm">{initials(b.name)}</span>}
          </span>

          {/* Name + category */}
          <span className="min-w-0 flex-1">
            <span className={`block font-bold truncate transition-colors group-hover:text-[var(--ivouch-blue)] ${compact ? 'text-sm' : ''}`}
              style={{ color: 'var(--ink)' }}>
              {b.name}
            </span>
            {compact ? (
              b.recent_vouches > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold"
                  style={{ color: 'var(--vouch-green-dark)' }}>
                  <TrendingUp size={10} /> +{b.recent_vouches} this month
                </span>
              )
            ) : (
              b.categoryName && (
                <span className="block text-xs text-gray-400 truncate">{b.categoryName}</span>
              )
            )}
          </span>

          {/* Momentum */}
          <span className="flex items-center gap-2 flex-shrink-0">
            {!compact && b.recent_vouches > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold"
                style={{ backgroundColor: 'rgba(32,178,107,0.1)', color: 'var(--vouch-green-dark)' }}>
                <TrendingUp size={11} /> +{b.recent_vouches} this month
              </span>
            )}
            <span className={`inline-flex items-center gap-1 font-extrabold ${compact ? 'text-sm' : 'text-sm'}`}
              style={{ color: 'var(--ivouch-blue)' }}>
              <ShieldCheck size={compact ? 14 : 15} /> {b.vouch_count}
            </span>
            {!compact && <ArrowRight size={15} className="text-gray-300 transition-transform group-hover:translate-x-0.5" />}
          </span>
        </Link>
      ))}
    </div>
  )
}
