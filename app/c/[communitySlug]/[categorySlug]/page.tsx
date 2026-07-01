import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BusinessCard from '@/components/business/BusinessCard'
import { resolveCommunityContext } from '@/lib/community/resolve-community-context'
import { getBusinessesForCommunity } from '@/lib/business/get-businesses-for-community'
import { getCategoryBySlug } from '@/lib/data/categories'

interface Props {
  params: Promise<{ communitySlug: string; categorySlug: string }>
}

export default async function CategoryPage({ params }: Props) {
  const { communitySlug, categorySlug } = await params
  const [ctx, category] = await Promise.all([
    resolveCommunityContext(communitySlug),
    getCategoryBySlug(categorySlug),
  ])

  if (!ctx.community || !category) notFound()

  const businesses = await getBusinessesForCommunity(ctx.relatedIds, { categorySlug })
  const { community, parent } = ctx

  return (
    <>
      <Header />
      <main className="flex-1">
        <div style={{ backgroundColor: 'var(--navy)' }} className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-white/60 text-sm mb-3 flex-wrap">
              {parent && (
                <>
                  <Link href={`/c/${parent.slug}`} className="hover:text-white transition-colors">
                    {parent.display_name ?? parent.name}
                  </Link>
                  <ChevronRight size={12} className="text-white/40" />
                </>
              )}
              <Link href={`/c/${communitySlug}`} className="hover:text-white transition-colors">
                {community.name}
              </Link>
              <ChevronRight size={12} className="text-white/40" />
              <span className="text-white/80">{category.name}</span>
            </div>

            <h1 className="text-3xl font-black text-white">
              {category.icon} {category.name}s vouched for in {community.name}
            </h1>
            <p className="text-white/70 mt-2">{businesses.length} businesses found</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {businesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium">No {category.name}s listed in {community.name} yet.</p>
              <p className="text-sm mt-2 mb-6">Know a good one? Add them!</p>
              <Link
                href="/add-business"
                className="px-6 py-3 rounded-xl font-bold text-white"
                style={{ backgroundColor: 'var(--vouch-green)' }}
              >
                Add a {category.name}
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
