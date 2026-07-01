import type { ActivityVouch } from '@/types'
import ActivityItem from './ActivityItem'

interface ActivityFeedProps {
  vouches: ActivityVouch[]
  emptyMessage?: string
}

export default function ActivityFeed({ vouches, emptyMessage }: ActivityFeedProps) {
  if (vouches.length === 0) {
    return (
      <div className="card-soft p-8 text-center">
        <div className="text-4xl mb-3">🌱</div>
        <p className="font-semibold" style={{ color: 'var(--charcoal)' }}>
          {emptyMessage ?? 'No vouches yet — be the first to vouch for a neighbour!'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Every great community starts with one recommendation.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {vouches.map((v) => (
        <ActivityItem key={v.id} vouch={v} />
      ))}
    </div>
  )
}
