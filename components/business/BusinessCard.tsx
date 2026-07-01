import Link from 'next/link'
import { MapPin, CheckCircle, Heart } from 'lucide-react'
import type { Business } from '@/types'
import { avatarColor, initials } from '@/lib/utils/avatar'

interface BusinessCardProps {
  business: Business & { vouch_count?: number; top_tags?: string[] }
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const vouchCount = business.vouch_count ?? 0
  const color = avatarColor(business.name)
  const verified =
    business.verification_status === 'verified' ||
    business.verification_status === 'phone_verified'
  const areas = business.communities?.slice(0, 3).map((c) => c.name) ?? []
  const topTags = business.top_tags?.slice(0, 3) ?? []
  const whatsapp = business.whatsapp?.replace(/\D/g, '')

  return (
    <div className="card-soft card-hover p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-sm"
          style={{ backgroundColor: color }}
        >
          {business.primary_category?.icon ? (
            <span className="text-xl">{business.primary_category.icon}</span>
          ) : (
            initials(business.name)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/b/${business.slug}`}
              className="font-bold text-lg leading-tight hover:underline truncate"
              style={{ color: 'var(--charcoal)' }}
            >
              {business.name}
            </Link>
            {verified && (
              <CheckCircle size={16} style={{ color: 'var(--vouch-green)' }} className="flex-shrink-0" />
            )}
          </div>
          {business.primary_category && (
            <span className="chip mt-1.5">
              {business.primary_category.icon} {business.primary_category.name}
            </span>
          )}
        </div>
      </div>

      {/* Vouch count — hero trust signal */}
      <div
        className="flex items-center gap-1.5 text-base font-extrabold"
        style={{ color: 'var(--vouch-green)' }}
      >
        <Heart size={18} fill="currentColor" />
        <span>{vouchCount}</span>
        <span className="font-semibold">
          {vouchCount === 1 ? 'neighbour vouches' : 'neighbours vouch'}
        </span>
      </div>

      {/* Top tags */}
      {topTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topTags.map((t) => (
            <span key={t} className="chip chip-green">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Areas */}
      {areas.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} /> {areas.join(' · ')}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-auto pt-1">
        <Link href={`/vouch/${business.id}`} className="btn-vouch px-3.5 py-2 text-xs">
          <Heart size={13} fill="currentColor" /> I vouch
        </Link>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--cloud-grey)', color: '#128C4A' }}
          >
            WhatsApp
          </a>
        )}
        <Link
          href={`/b/${business.slug}`}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors hover:bg-gray-50 ml-auto"
          style={{ borderColor: 'var(--cloud-grey)', color: 'var(--navy)' }}
        >
          View
        </Link>
      </div>
    </div>
  )
}
