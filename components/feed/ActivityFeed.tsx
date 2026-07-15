import type { FeedItem } from '@/types'
import ActivityItem from './ActivityItem'

interface ActivityFeedProps {
  items: FeedItem[]
  emptyMessage?: string
}

function keyOf(item: FeedItem): string {
  return item.kind === 'vouch' ? `v-${item.vouch.id}` : `b-${item.business.id}`
}

export default function ActivityFeed({ items, emptyMessage }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="card-soft p-8 text-center">
        <div className="text-4xl mb-3">🌱</div>
        <p className="font-semibold" style={{ color: 'var(--charcoal)' }}>
          {emptyMessage ?? 'Nothing here yet — be the first to vouch for a neighbour!'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Every great community starts with one recommendation.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ActivityItem key={keyOf(item)} item={item} />
      ))}
    </div>
  )
}
