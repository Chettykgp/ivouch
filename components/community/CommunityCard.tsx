import Link from 'next/link'
import { MapPin, Building2, Heart } from 'lucide-react'
import type { Community } from '@/types'

interface CommunityCardProps {
  community: Community
  businessCount?: number
  vouchCount?: number
}

export default function CommunityCard({ community, businessCount = 0, vouchCount = 0 }: CommunityCardProps) {
  return (
    <Link href={`/c/${community.slug}`}>
      <div
        className="rounded-2xl p-5 border hover:shadow-md transition-shadow cursor-pointer"
        style={{ backgroundColor: 'white', borderColor: 'var(--cloud-grey)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={16} style={{ color: 'var(--navy)' }} />
          <h3 className="font-bold text-base" style={{ color: 'var(--charcoal)' }}>{community.name}</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">{community.city}, {community.province}</p>
        {community.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{community.description}</p>
        )}
        <div className="flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Building2 size={12} /> {businessCount} businesses
          </span>
          <span className="flex items-center gap-1">
            <Heart size={12} style={{ color: 'var(--vouch-green)' }} /> {vouchCount} vouches
          </span>
        </div>
      </div>
    </Link>
  )
}
