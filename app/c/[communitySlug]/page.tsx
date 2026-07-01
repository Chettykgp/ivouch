import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Building2, Heart } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BusinessCard from '@/components/business/BusinessCard'
import CategoryChips from '@/components/community/CategoryChips'
import ActivityFeed from '@/components/feed/ActivityFeed'
import { resolveCommunityContext } from '@/lib/community/resolve-community-context'
import { getBusinessesForCommunity } from '@/lib/business/get-businesses-for-community'
import { getFeaturedCategories } from '@/lib/data/categories'
import { getRecentVouchesForCommunities } from '@/lib/data/activity'

interface Props {
  params: Promise<{ communitySlug: string }>
}

export const dynamic = 'force-dynamic'

export default async function CommunityPage({ params }: Props) {
  const { communitySlug } = await params
  const [ctx, categories] = await Promise.all([
    resolveCommunityContext(communitySlug),
    getFeaturedCategories(12),
  ])

  if (!ctx.community) notFound()

  const { community, children, relatedIds } = ctx

  const [businesses, feed] = await Promise.all([
    getBusinessesForCommunity(relatedIds),
    getRecentVouchesForCommunities(relatedIds, 8),
  ])

  const isWard = community.type === 'ward'
  const neighbourhoods = children.map((c) => c.name)

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="hero-navy py-14 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {isWard && (
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{ backgroundColor: 'var(--vouch-green)', color: 'white' }}
              >
                📍 Your community
              </span>
            )}

            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
              {community.display_name ?? community.name}
            </h1>

            {isWard ? (
              <p className="text-white/70 text-lg mb-6">
                One community, not separate suburbs — find people your neighbours vouch for.
              </p>
            ) : (
              <p className="text-white/80 text-lg mb-6">
                Find people your neighbours vouch for.
              </p>
            )}

            {/* Neighbourhood chips */}
            {isWard && neighbourhoods.length > 0 && (
              <div className="max-w-2xl mx-auto mb-6">
                <p className="text-white/50 text-xs uppercase tracking-wide mb-2">
                  One community · {neighbourhoods.length} neighbourhoods
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {neighbourhoods.map((n) => (
                    <span
                      key={n}
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center gap-6 text-white/70 text-sm">
              <span className="flex items-center gap-1">
                <Building2 size={14} /> {businesses.length} businesses
              </span>
              {isWard && neighbourhoods.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {neighbourhoods.length} neighbourhoods
                </span>
              )}
              <span className="flex items-center gap-1">
                <Heart size={14} style={{ color: 'var(--vouch-green)' }} /> {feed.length} recent vouches
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Category chips */}
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Browse by category
            </h2>
            <CategoryChips categories={categories} communitySlug={community.slug} />
            <Link
              href="/categories"
              className="inline-block mt-3 text-sm font-semibold"
              style={{ color: 'var(--vouch-green)' }}
            >
              See all categories →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Businesses */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--charcoal)' }}>
                {businesses.length > 0
                  ? `${businesses.length} businesses your neighbours vouch for`
                  : 'No businesses yet'}
              </h2>
              {businesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {businesses.map((business) => (
                    <BusinessCard key={business.id} business={business} />
                  ))}
                </div>
              ) : (
                <div className="card-soft text-center py-16 px-4">
                  <div className="text-4xl mb-3">🏘️</div>
                  <p className="mb-4 font-semibold" style={{ color: 'var(--charcoal)' }}>
                    Be the first to add someone great in Ward 23.
                  </p>
                  <Link href="/add-business" className="btn-vouch inline-block px-6 py-3">
                    Add a business
                  </Link>
                </div>
              )}
            </div>

            {/* Activity feed */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--charcoal)' }}>
                What&apos;s happening in Ward 23
              </h2>
              <ActivityFeed
                vouches={feed}
                emptyMessage="No vouches yet — be the first to vouch for a neighbour!"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
