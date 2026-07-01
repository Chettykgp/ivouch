import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { ActivityVouch } from '@/types'
import { avatarColor, initials } from '@/lib/utils/avatar'

interface ActivityItemProps {
  vouch: ActivityVouch
}

export default function ActivityItem({ vouch }: ActivityItemProps) {
  const { business } = vouch
  const color = avatarColor(vouch.voucherName + (vouch.voucherCommunity ?? ''))
  const timeAgo = formatDistanceToNow(new Date(vouch.created_at), { addSuffix: true })
  const href = business.slug ? `/b/${business.slug}` : '#'

  return (
    <Link
      href={href}
      className="card-soft card-hover block p-4 sm:p-5 animate-fade-up"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
          style={{ backgroundColor: color }}
        >
          {initials(vouch.voucherName)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Headline */}
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

          {/* Comment */}
          {vouch.comment && (
            <p className="text-sm text-gray-600 mt-1.5">&ldquo;{vouch.comment}&rdquo;</p>
          )}

          {/* Tags + time */}
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
