import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ArrowRight } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BusinessGrid from '@/components/business/BusinessGrid'
import { resolveCommunityContext } from '@/lib/community/resolve-community-context'
import { getBusinessesForCommunity } from '@/lib/business/get-businesses-for-community'
import { getCategoryBySlug } from '@/lib/data/categories'

interface Props {
  params: Promise<{ communitySlug: string; categorySlug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { communitySlug, categorySlug } = await params
  const category = await getCategoryBySlug(categorySlug)
  if (!category) return { title: 'Category not found' }
  const title = `${category.name} in JHB Ward 23 — vouched for by neighbours`
  const description = `Find trusted ${category.name.toLowerCase()} services in Glenvista, Bassonia, Mulbarton and JHB South Ward 23 — personally vouched for by your neighbours. No paid reviews.`
  return {
    title,
    description,
    alternates: { canonical: `/c/${communitySlug}/${categorySlug}` },
    openGraph: { title, description },
  }
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
      <main className="flex-1" style={{ backgroundColor: 'var(--mist)' }}>
        <section className="page-hero px-4 pt-10 pb-9">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-sm mb-4 flex-wrap text-gray-400">
              {parent && (
                <>
                  <Link href={`/c/${parent.slug}`} className="hover:text-[var(--ivouch-blue)] transition-colors">
                    {parent.display_name ?? parent.name}
                  </Link>
                  <ChevronRight size={13} />
                </>
              )}
              <Link href={`/c/${communitySlug}`} className="hover:text-[var(--ivouch-blue)] transition-colors">
                {community.name}
              </Link>
              <ChevronRight size={13} />
              <span style={{ color: 'var(--ink)' }} className="font-semibold">{category.name}</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="icon-tile w-14 h-14 text-3xl flex-shrink-0">
                {category.icon ?? '📍'}
              </span>
              <div>
                <h1 className="text-3xl font-extrabold" style={{ color: 'var(--ink)' }}>
                  {category.name} in {community.name}
                </h1>
                <p className="mt-1 text-sm" style={{ color: '#5A6B85' }}>
                  {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} your
                  neighbours vouch for
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-10">
          {businesses.length > 0 ? (
            <BusinessGrid businesses={businesses} />
          ) : (
            <div className="card-soft text-center py-16 px-4 max-w-lg mx-auto">
              <div className="text-4xl mb-3">🔎</div>
              <p className="text-lg font-bold" style={{ color: 'var(--ink)' }}>
                No {category.name} listed in {community.name} yet.
              </p>
              <p className="text-sm mt-2 mb-6 text-gray-500">Know a good one? Add them for your neighbours.</p>
              <Link href="/add-business" className="btn-blue inline-flex px-6 py-3">
                Add a business <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
