import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Phone, Globe, MapPin, BadgeCheck, AlertCircle, ShieldCheck } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppShare from '@/components/business/WhatsAppShare'
import VouchButton from '@/components/business/VouchButton'
import VouchSuccessToast from '@/components/business/VouchSuccessToast'
import { getBusinessBySlug } from '@/lib/data/businesses'
import { getVouchesByBusiness, getVouchCount } from '@/lib/data/vouches'
import { avatarColor, initials } from '@/lib/utils/avatar'

interface Props {
  params: Promise<{ businessSlug: string }>
}

export default async function BusinessProfilePage({ params }: Props) {
  const { businessSlug } = await params
  const business = await getBusinessBySlug(businessSlug)
  if (!business) notFound()

  const [vouches, vouchCount] = await Promise.all([
    getVouchesByBusiness(business.id, 20),
    getVouchCount(business.id),
  ])

  // Aggregate tags -> "Known for" strip.
  const tagCounts: Record<string, number> = {}
  for (const v of vouches) {
    for (const t of v.tags ?? []) tagCounts[t] = (tagCounts[t] ?? 0) + 1
  }
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([tag]) => tag)

  const whatsappNumber = business.whatsapp?.replace(/\D/g, '')
  const monogramColor = avatarColor(business.name)
  const hasIcon = Boolean(business.primary_category?.icon)
  const verified =
    business.verification_status === 'verified' ||
    business.verification_status === 'phone_verified'
  const areas = (business.communities ?? []).map((c) => c?.name).filter(Boolean) as string[]

  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <VouchSuccessToast />
      </Suspense>
      <main className="flex-1" style={{ backgroundColor: 'var(--mist)' }}>
        {/* Profile hero */}
        <section className="page-hero px-4 pt-10 pb-9">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={
                  hasIcon
                    ? { backgroundColor: 'var(--ivouch-blue-soft)' }
                    : { backgroundColor: monogramColor, color: '#fff' }
                }
              >
                {hasIcon ? (
                  <span className="text-3xl">{business.primary_category!.icon}</span>
                ) : (
                  <span className="font-black text-2xl">{initials(business.name)}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {business.primary_category && (
                    <span className="chip chip-blue">{business.primary_category.name}</span>
                  )}
                  {verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--ivouch-blue)' }}>
                      <BadgeCheck size={14} /> Verified
                    </span>
                  )}
                  {business.claimed_status && (
                    <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--cloud-grey)', color: '#5A6B85' }}>
                      Claimed
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: 'var(--ink)' }}>
                  {business.name}
                </h1>
                {areas.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <MapPin size={14} /> {areas.join(' · ')}
                  </div>
                )}
              </div>
            </div>

            {/* Vouch count — emotional centerpiece */}
            <div className="rounded-2xl px-6 py-5 text-center flex-shrink-0 border"
              style={{ backgroundColor: 'var(--ivouch-blue-soft)', borderColor: 'rgba(47,107,255,0.15)' }}>
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck size={26} style={{ color: 'var(--ivouch-blue)' }} />
                <span className="text-4xl font-black" style={{ color: 'var(--ivouch-blue)' }}>
                  {vouchCount}
                </span>
              </div>
              <div className="text-sm font-medium mt-1" style={{ color: 'var(--ink)' }}>
                neighbours vouch for this business
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {business.description && (
              <div className="card-soft p-5">
                <h2 className="font-extrabold mb-2" style={{ color: 'var(--ink)' }}>About</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{business.description}</p>
              </div>
            )}

            {topTags.length > 0 && (
              <div className="card-soft p-5">
                <h2 className="font-extrabold mb-3" style={{ color: 'var(--ink)' }}>Known for</h2>
                <div className="flex flex-wrap gap-2">
                  {topTags.map((t) => (
                    <span key={t} className="chip chip-blue">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Vouches */}
            <div>
              <h2 className="font-extrabold text-lg mb-4" style={{ color: 'var(--ink)' }}>
                Vouched for by your neighbours ({vouchCount})
              </h2>
              {vouches.length > 0 ? (
                <div className="space-y-3">
                  {vouches.map((v) => {
                    const name = v.profile?.first_name || v.profile?.display_name || 'A neighbour'
                    const community = (v.community as { name?: string } | undefined)?.name
                    const color = avatarColor(name + (community ?? ''))
                    return (
                      <div key={v.id} className="card-soft p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ backgroundColor: color }}>
                            {initials(name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
                                🫶 {name}
                              </span>
                              {community && <span className="chip">{community}</span>}
                              <span className="text-xs text-gray-400 ml-auto">
                                {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            {v.comment && (
                              <p className="text-sm text-gray-600 mt-1.5">&ldquo;{v.comment}&rdquo;</p>
                            )}
                            {v.tags && v.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {v.tags.map((t) => (
                                  <span key={t} className="chip chip-blue">{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="card-soft p-8 text-center">
                  <div className="text-4xl mb-3">🫶</div>
                  <p className="font-semibold" style={{ color: 'var(--ink)' }}>
                    No vouches yet — be the first!
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    If you&apos;ve used {business.name.split(' ')[0]}, let your neighbours know.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <VouchButton businessId={business.id} className="w-full py-4 text-lg" />

            {/* Contact */}
            <div className="card-soft p-5 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Contact</h3>
              {business.phone && (
                <a href={`tel:${business.phone}`}
                  className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
                  style={{ color: 'var(--ink)' }}>
                  <Phone size={16} style={{ color: 'var(--ivouch-blue)' }} /> {business.phone}
                </a>
              )}
              {whatsappNumber && (
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold text-white px-3 py-2.5 rounded-xl transition-transform hover:-translate-y-0.5"
                  style={{ backgroundColor: '#25D366' }}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                  </svg>
                  WhatsApp
                </a>
              )}
              {business.website && (
                <a href={business.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:opacity-80" style={{ color: 'var(--ivouch-blue)' }}>
                  <Globe size={16} /> Website
                </a>
              )}
              {business.address_text && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0" /> {business.address_text}
                </div>
              )}
            </div>

            {/* Share */}
            <WhatsAppShare businessName={business.name} vouchCount={vouchCount} slug={business.slug} />

            {/* Secondary links */}
            <div className="text-xs text-center space-x-3 text-gray-400">
              {!business.claimed_status && (
                <Link href={`/claim/${business.id}`} className="hover:text-gray-600">Claim this business</Link>
              )}
              <span>·</span>
              <Link href="/guidelines" className="hover:text-red-500 inline-flex items-center gap-1">
                <AlertCircle size={12} /> Report
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
