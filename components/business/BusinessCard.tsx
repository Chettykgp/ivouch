import Link from 'next/link'
import { MapPin, Phone, CheckCircle } from 'lucide-react'
import type { Business } from '@/types'

interface BusinessCardProps {
  business: Business & { vouch_count?: number }
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const vouchCount = business.vouch_count ?? 0

  return (
    <div
      className="rounded-2xl shadow-sm border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
      style={{ backgroundColor: 'white', borderColor: 'var(--cloud-grey)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-lg" style={{ color: 'var(--charcoal)' }}>
            {business.name}
          </h3>
          {business.primary_category && (
            <span
              className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: 'var(--navy)' }}
            >
              {business.primary_category.icon} {business.primary_category.name}
            </span>
          )}
        </div>
        {business.verification_status === 'verified' && (
          <CheckCircle size={20} style={{ color: 'var(--vouch-green)' }} className="flex-shrink-0 mt-1" />
        )}
      </div>

      {/* Description */}
      {business.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{business.description}</p>
      )}

      {/* Areas */}
      {business.communities && business.communities.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} />
          {business.communities.slice(0, 3).map((c) => c.name).join(', ')}
        </div>
      )}

      {/* Vouch count — the main trust signal */}
      <div
        className="text-sm font-bold"
        style={{ color: 'var(--vouch-green)' }}
      >
        ❤️ {vouchCount} {vouchCount === 1 ? 'neighbour vouches' : 'neighbours vouch'} for {business.name.split(' ')[0]}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-1">
        <Link
          href={`/b/${business.slug}`}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--navy)' }}
        >
          View Profile
        </Link>
        {business.whatsapp && (
          <a
            href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}
          >
            WhatsApp
          </a>
        )}
        <Link
          href={`/vouch/${business.id}`}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--vouch-green)' }}
        >
          I Vouch ❤️
        </Link>
      </div>
    </div>
  )
}
