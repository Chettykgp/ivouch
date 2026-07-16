import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Store, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BusinessGrid from '@/components/business/BusinessGrid'
import CategoryChips from '@/components/community/CategoryChips'
import ActivityFeed from '@/components/feed/ActivityFeed'
import { resolveCommunityContext } from '@/lib/community/resolve-community-context'
import { getBusinessesForCommunity } from '@/lib/business/get-businesses-for-community'
import { getFeaturedCategories } from '@/lib/data/categories'
import { getRecentActivityForCommunities } from '@/lib/data/activity'

interface Props {
  params: Promise<{ communitySlug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  const { communitySlug } = await params
  const title = 'JHB South Ward 23 — your community on iVouch'
  const description =
    'One community, eight neighbourhoods: Glenvista, Bassonia, Mulbarton, Glenanda, Liefde en Vrede, Mayfield Park, Rispark and South View. Find the help your neighbours vouched for.'
  return {
    title,
    description,
    alternates: { canonical: `/c/${communitySlug}` },
    openGraph: { title, description },
  }
}

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
    getRecentActivityForCommunities(relatedIds, 10),
  ])

  const isWard = community.type === 'ward'
  const neighbourhoods = children.map((c) => c.name)
  const aliasHoods = (ctx.aliases ?? [])
    .filter((a) => a.alias_type === 'suburb')
    .map((a) => a.alias_name)
  const hoods = neighbourhoods.length > 0 ? neighbourhoods : aliasHoods

  return (
    <>
      <Header />
      <main className="flex-1" style={{ backgroundColor: 'var(--mist)' }}>
        {/* Hero */}
        <section className="page-hero px-4 pt-12 pb-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-5 text-sm font-semibold"
              style={{ backgroundColor: 'var(--ivouch-blue-soft)', color: 'var(--ivouch-blue-dark)' }}>
              <MapPin size={14} /> {isWard ? 'Your community' : 'Neighbourhood'}
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-3" style={{ color: 'var(--ink)' }}>
              {community.display_name ?? community.name}
            </h1>

            <p className="text-lg mb-6 max-w-xl mx-auto" style={{ color: '#5A6B85' }}>
              {isWard
                ? 'One community, not separate suburbs — find people your neighbours vouch for.'
                : 'Find people your neighbours vouch for.'}
            </p>

            {/* Neighbourhood chips */}
            {isWard && hoods.length > 0 && (
              <div className="max-w-2xl mx-auto mb-7">
                <p className="text-xs uppercase tracking-wide mb-2.5 text-gray-400">
                  One community · {hoods.length} neighbourhoods
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {hoods.map((n) => (
                    <span key={n} className="chip chip-blue">{n}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-center flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white border px-4 py-2 text-sm font-semibold shadow-[var(--shadow-soft)]"
                style={{ borderColor: 'var(--cloud-grey)', color: 'var(--ink)' }}>
                <Store size={15} style={{ color: 'var(--ivouch-blue)' }} /> {businesses.length} businesses
              </span>
              {isWard && hoods.length > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white border px-4 py-2 text-sm font-semibold shadow-[var(--shadow-soft)]"
                  style={{ borderColor: 'var(--cloud-grey)', color: 'var(--ink)' }}>
                  <MapPin size={15} style={{ color: 'var(--ivouch-blue)' }} /> {hoods.length} neighbourhoods
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full bg-white border px-4 py-2 text-sm font-semibold shadow-[var(--shadow-soft)]"
                style={{ borderColor: 'var(--cloud-grey)', color: 'var(--ink)' }}>
                <ShieldCheck size={15} style={{ color: 'var(--ivouch-blue)' }} /> {feed.length} recent updates
              </span>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Category chips */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">
                Browse by category
              </h2>
              <Link href="/categories" className="text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all"
                style={{ color: 'var(--ivouch-blue)' }}>
                See all <ArrowRight size={14} />
              </Link>
            </div>
            <CategoryChips categories={categories} communitySlug={community.slug} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Businesses */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-extrabold mb-4" style={{ color: 'var(--ink)' }}>
                {businesses.length > 0
                  ? `${businesses.length} businesses your neighbours vouch for`
                  : 'No businesses yet'}
              </h2>
              {businesses.length > 0 ? (
                <BusinessGrid businesses={businesses} />
              ) : (
                <div className="card-soft text-center py-16 px-4">
                  <div className="text-4xl mb-3">🏘️</div>
                  <p className="mb-4 font-semibold" style={{ color: 'var(--ink)' }}>
                    Be the first to add someone great in Ward 23.
                  </p>
                  <Link href="/add-business" className="btn-blue inline-flex px-6 py-3">
                    Add a business
                  </Link>
                </div>
              )}
            </div>

            {/* Activity feed */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                <Sparkles size={18} style={{ color: 'var(--ivouch-blue)' }} />
                Happening now
              </h2>
              <ActivityFeed
                items={feed}
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
