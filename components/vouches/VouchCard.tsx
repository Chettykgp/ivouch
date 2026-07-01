import { formatDistanceToNow } from 'date-fns'
import type { Vouch } from '@/types'
import VouchTags from '@/components/business/VouchTags'

interface VouchCardProps {
  vouch: Vouch
}

export default function VouchCard({ vouch }: VouchCardProps) {
  const displayName = vouch.profile?.display_name || vouch.profile?.first_name || 'A neighbour'
  const community = (vouch.community as { name?: string } | undefined)?.name

  return (
    <div
      className="rounded-xl p-4 border"
      style={{ backgroundColor: 'white', borderColor: 'var(--cloud-grey)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: 'var(--vouch-green)' }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm" style={{ color: 'var(--charcoal)' }}>
              {displayName}
            </span>
            {community && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--cloud-grey)', color: 'var(--navy)' }}>
                {community}
              </span>
            )}
            <span className="text-xs text-gray-400 ml-auto">
              {formatDistanceToNow(new Date(vouch.created_at), { addSuffix: true })}
            </span>
          </div>
          {vouch.comment && (
            <p className="text-sm text-gray-600 mt-1">&quot;{vouch.comment}&quot;</p>
          )}
          {vouch.tags && vouch.tags.length > 0 && (
            <div className="mt-2">
              <VouchTags tags={vouch.tags} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
