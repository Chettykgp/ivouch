import Link from 'next/link'
import { MapPin, BadgeCheck, ShieldCheck, ArrowRight } from 'lucide-react'
import type { Business } from '@/types'
import { avatarColor, initials } from '@/lib/utils/avatar'
import { toWhatsAppNumber } from '@/lib/utils/phone'
import ShareVouchButton from './ShareVouchButton'

interface BusinessCardProps {
  business: Business & { vouch_count?: number; top_tags?: string[] }
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const vouchCount = business.vouch_count ?? 0
  const color = avatarColor(business.name)
  const verified =
    business.verification_status === 'verified' ||
    business.verification_status === 'phone_verified'
  const areas = (business.communities ?? []).map((c) => c?.name).filter(Boolean).slice(0, 3) as string[]
  const topTags = business.top_tags?.slice(0, 3) ?? []
  const whatsapp = toWhatsAppNumber(business.whatsapp)
  const hasIcon = Boolean(business.primary_category?.icon)

  return (
    <div className="group card-soft card-hover p-5 flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={
            hasIcon
              ? { backgroundColor: 'var(--ivouch-blue-soft)' }
              : { backgroundColor: color, color: '#fff' }
          }
        >
          {hasIcon ? (
            <span className="text-2xl">{business.primary_category!.icon}</span>
          ) : (
            <span className="font-black text-lg">{initials(business.name)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/b/${business.slug}`}
            className="flex items-center gap-1.5 font-extrabold text-lg leading-tight transition-colors group-hover:text-[var(--ivouch-blue)]"
            style={{ color: 'var(--ink)' }}
          >
            <span className="truncate">{business.name}</span>
            {verified && (
              <BadgeCheck size={17} className="flex-shrink-0" style={{ color: 'var(--ivouch-blue)' }} />
            )}
          </Link>
          <span className="flex items-center gap-1.5 flex-wrap mt-1.5">
            {business.primary_category && (
              <span className="chip chip-blue">{business.primary_category.name}</span>
            )}
            {business.in_ward === false && (
              <span className="chip" title="Based outside Ward 23">Outside Ward 23</span>
            )}
          </span>
        </div>
      </div>

      {/* Vouch count — hero trust signal (blue, matches homepage) */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{ backgroundColor: 'var(--ivouch-blue-soft)' }}
      >
        <ShieldCheck size={18} style={{ color: 'var(--ivouch-blue)' }} />
        <span className="text-sm" style={{ color: 'var(--ink)' }}>
          <span className="font-extrabold" style={{ color: 'var(--ivouch-blue)' }}>
            {vouchCount}
          </span>{' '}
          {vouchCount === 1 ? 'neighbour vouches' : 'neighbours vouch'}
        </span>
      </div>

      {/* Top tags */}
      {topTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topTags.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
      )}

      {/* Areas */}
      {areas.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MapPin size={12} /> {areas.join(' · ')}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-1">
        <Link href={`/vouch/${business.id}`} className="btn-blue px-4 py-2.5 text-sm flex-1">
          <BadgeCheck size={15} /> I vouch
        </Link>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message on WhatsApp"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: '#25D366' }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
            </svg>
          </a>
        )}
        <ShareVouchButton businessName={business.name} slug={business.slug} variant="icon" />
        <Link
          href={`/b/${business.slug}`}
          aria-label="View profile"
          className="btn-outline w-10 h-10 flex-shrink-0"
        >
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
