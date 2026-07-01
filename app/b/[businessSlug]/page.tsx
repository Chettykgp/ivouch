import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Phone, Globe, MapPin, CheckCircle, AlertCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import VouchCount from '@/components/business/VouchCount'
import WhatsAppShare from '@/components/business/WhatsAppShare'
import VouchTags from '@/components/business/VouchTags'
import VouchCard from '@/components/vouches/VouchCard'
import { getBusinessBySlug } from '@/lib/data/businesses'
import { getVouchesByBusiness, getVouchCount } from '@/lib/data/vouches'

interface Props {
  params: Promise<{ businessSlug: string }>
}

const ALL_TAGS = ['Reliable', 'Fair price', 'Good workmanship', 'Fast response', 'Friendly', 'Professional', 'Would use again']

export default async function BusinessProfilePage({ params }: Props) {
  const { businessSlug } = await params
  const business = await getBusinessBySlug(businessSlug)
  if (!business) notFound()

  const [vouches, vouchCount] = await Promise.all([
    getVouchesByBusiness(business.id),
    getVouchCount(business.id),
  ])

  // Aggregate tags
  const tagCounts: Record<string, number> = {}
  for (const v of vouches) {
    for (const t of v.tags ?? []) {
      tagCounts[t] = (tagCounts[t] ?? 0) + 1
    }
  }
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([tag]) => tag)

  const whatsappNumber = business.whatsapp?.replace(/\D/g, '')

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Profile hero */}
        <div style={{ backgroundColor: 'var(--navy)' }} className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {business.primary_category && (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: 'var(--vouch-green)' }}
                    >
                      {business.primary_category.icon} {business.primary_category.name}
                    </span>
                  )}
                  {business.verification_status === 'verified' && (
                    <span className="flex items-center gap-1 text-xs text-white/80">
                      <CheckCircle size={14} style={{ color: 'var(--vouch-green)' }} /> Verified
                    </span>
                  )}
                  {business.claimed_status && (
                    <span className="text-xs px-2 py-0.5 rounded-full text-white/70 border border-white/20">Claimed</span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{business.name}</h1>
                {business.communities && business.communities.length > 0 && (
                  <div className="flex items-center gap-1 text-white/60 text-sm">
                    <MapPin size={14} />
                    {business.communities.map((c) => c.name).join(' · ')}
                  </div>
                )}
              </div>

              {/* Vouch count hero */}
              <div
                className="rounded-2xl px-6 py-4 text-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <div className="text-4xl font-black" style={{ color: 'var(--vouch-green)' }}>
                  {vouchCount}
                </div>
                <div className="text-white/80 text-sm font-medium">neighbours vouch</div>
                <div className="text-white/60 text-xs">for this business</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {business.description && (
              <div
                className="rounded-2xl p-5 border"
                style={{ backgroundColor: 'white', borderColor: 'var(--cloud-grey)' }}
              >
                <h2 className="font-bold mb-2" style={{ color: 'var(--charcoal)' }}>About</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{business.description}</p>
              </div>
            )}

            {topTags.length > 0 && (
              <div
                className="rounded-2xl p-5 border"
                style={{ backgroundColor: 'white', borderColor: 'var(--cloud-grey)' }}
              >
                <h2 className="font-bold mb-3" style={{ color: 'var(--charcoal)' }}>What neighbours say</h2>
                <VouchTags tags={topTags} />
              </div>
            )}

            {/* Vouches */}
            <div>
              <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--charcoal)' }}>
                Recent Vouches ({vouchCount})
              </h2>
              {vouches.length > 0 ? (
                <div className="space-y-3">
                  {vouches.map((v) => (
                    <VouchCard key={v.id} vouch={v} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No vouches yet. Be the first!</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* I Vouch CTA */}
            <Link
              href={`/vouch/${business.id}`}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--vouch-green)' }}
            >
              ❤️ I vouch for them
            </Link>

            {/* Contact */}
            <div
              className="rounded-2xl p-5 border space-y-3"
              style={{ backgroundColor: 'white', borderColor: 'var(--cloud-grey)' }}
            >
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Contact</h3>
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
                  style={{ color: 'var(--navy)' }}
                >
                  <Phone size={16} /> {business.phone}
                </a>
              )}
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-white px-3 py-2 rounded-lg"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              )}
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:opacity-80 text-blue-600"
                >
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
            <WhatsAppShare
              businessName={business.name}
              vouchCount={vouchCount}
              slug={business.slug}
            />

            {/* Links */}
            <div className="text-xs text-center space-x-3 text-gray-400">
              {!business.claimed_status && (
                <Link href={`/claim/${business.id}`} className="hover:text-gray-600">Claim this business</Link>
              )}
              <span>·</span>
              <button className="hover:text-red-500 flex items-center gap-1 mx-auto">
                <AlertCircle size={12} /> Report
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
