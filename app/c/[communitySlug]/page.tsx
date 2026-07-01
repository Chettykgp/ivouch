import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Building2, Heart, ChevronRight } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BusinessCard from '@/components/business/BusinessCard'
import CategoryChips from '@/components/community/CategoryChips'
import { resolveCommunityContext } from '@/lib/community/resolve-community-context'
import { getBusinessesForCommunity } from '@/lib/business/get-businesses-for-community'
import { getCategories } from '@/lib/data/categories'

interface Props {
  params: Promise<{ communitySlug: string }>
}

export default async function CommunityPage({ params }: Props) {
  const { communitySlug } = await params
  const [ctx, categories] = await Promise.all([
    resolveCommunityContext(communitySlug),
    getCategories(),
  ])

  if (!ctx.community) notFound()

  const businesses = await getBusinessesForCommunity(ctx.relatedIds)
  const { community, parent, children, subLabel } = ctx

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div style={{ backgroundColor: 'var(--navy)' }} className="py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumb for suburb pages */}
            {parent && (
              <div className="flex items-center justify-center gap-1 text-white/50 text-xs mb-3">
                <Link href={`/c/${parent.slug}`} className="hover:text-white/80 transition-colors">
                  {parent.display_name ?? parent.name}
                </Link>
                <ChevronRight size={12} />
                <span className="text-white/80">{community.name}</span>
              </div>
            )}

            {/* Ward badge */}
            {community.type === 'ward' && (
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{ backgroundColor: 'var(--vouch-green)', color: 'white' }}
              >
                Municipal Ward {community.ward_number}
              </span>
            )}

            {/* Location badge for non-ward types */}
            {community.type !== 'ward' && (
              <div className="flex items-center justify-center gap-2 mb-2 text-white/60 text-sm">
                <MapPin size={14} />
                {community.city ?? community.municipality ?? community.province}
                {community.province ? `, ${community.province}` : ''}
              </div>
            )}

            <h1 className="text-4xl font-black text-white mb-2">{community.name}</h1>

            {subLabel && (
              <p className="text-white/60 text-sm mb-4">{subLabel}</p>
            )}

            <p className="text-white/80 text-lg mb-6">Find people your neighbours vouch for.</p>

            <div className="flex justify-center gap-6 text-white/70 text-sm">
              <span className="flex items-center gap-1">
                <Building2 size={14} /> {businesses.length} businesses
              </span>
              {community.type === 'ward' && children.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {children.length} neighbourhoods
                </span>
              )}
              <span className="flex items-center gap-1">
                <Heart size={14} style={{ color: 'var(--vouch-green)' }} /> Community vouches
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Child suburbs for ward pages */}
          {community.type === 'ward' && children.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Neighbourhoods in this ward
              </h2>
              <div className="flex flex-wrap gap-2">
                {children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/c/${child.slug}`}
                    className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors hover:border-gray-400"
                    style={{ borderColor: 'var(--cloud-grey)', backgroundColor: 'white' }}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category chips */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Browse by category
            </h2>
            <CategoryChips categories={categories} communitySlug={communitySlug} />
          </div>

          {/* Businesses */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {businesses.length > 0
                ? `${businesses.length} businesses your neighbours vouch for`
                : 'No businesses yet in this area'}
            </h2>
            {businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <Building2 size={48} className="mx-auto mb-4 opacity-30" />
                <p className="mb-4">Be the first to add a business to this community.</p>
                <Link
                  href="/add-business"
                  className="inline-block px-6 py-3 rounded-full font-semibold text-white"
                  style={{ backgroundColor: 'var(--vouch-green)' }}
                >
                  Add a business
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
