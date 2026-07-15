import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { FeedItem } from '@/types'
import { avatarColor, initials } from '@/lib/utils/avatar'

interface ActivityItemProps {
  item: FeedItem
}

export default function ActivityItem({ item }: ActivityItemProps) {
  const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true })

  // ── New business added ──
  if (item.kind === 'business') {
    const b = item.business
    return (
      <Link href={b.slug ? `/b/${b.slug}` : '#'} className="card-soft card-hover block p-4 sm:p-5 animate-fade-up">
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: 'var(--ivouch-blue-soft)' }}
          >
            {b.categoryIcon ?? '🏪'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-snug" style={{ color: 'var(--charcoal)' }}>
              <span aria-hidden className="mr-1">🎉</span>
              New business joined Ward 23:{' '}
              <span className="font-bold" style={{ color: 'var(--ivouch-blue)' }}>{b.name}</span>
              {b.categoryName && (
                <span className="text-gray-500">
                  {' '}in{' '}
                  <span className="italic">
                    {b.categoryIcon ? `${b.categoryIcon} ` : ''}{b.categoryName}
                  </span>
                </span>
              )}
            </p>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="chip chip-blue text-[0.7rem] py-1 px-2.5">New listing</span>
              <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">{timeAgo}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // ── Vouch ──
  const vouch = item.vouch
  const { business } = vouch
  const color = avatarColor(vouch.voucherName + (vouch.voucherCommunity ?? ''))
  const href = business.slug ? `/b/${business.slug}` : '#'

  return (
    <Link href={href} className="card-soft card-hover block p-4 sm:p-5 animate-fade-up">
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
          style={{ backgroundColor: color }}
        >
          {initials(vouch.voucherName)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm leading-snug" style={{ color: 'var(--charcoal)' }}>
            <span aria-hidden className="mr-1">🫶</span>
            <span className="font-bold">{vouch.voucherName}</span>
            {vouch.voucherCommunity && (
              <span className="text-gray-500"> from {vouch.voucherCommunity}</span>
            )}{' '}
            vouched for{' '}
            <span className="font-bold" style={{ color: 'var(--vouch-green)' }}>
              {business.name}
            </span>
            {business.categoryName && (
              <span className="text-gray-500">
                {' '}in{' '}
                <span className="italic">
                  {business.categoryIcon ? `${business.categoryIcon} ` : ''}
                  {business.categoryName}
                </span>
              </span>
            )}
          </p>

          {vouch.comment && (
            <p className="text-sm text-gray-600 mt-1.5">&ldquo;{vouch.comment}&rdquo;</p>
          )}

          <div className="flex items-center flex-wrap gap-1.5 mt-2.5">
            {vouch.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="chip chip-green text-[0.7rem] py-1 px-2.5">
                {tag}
              </span>
            ))}
            <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">{timeAgo}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
