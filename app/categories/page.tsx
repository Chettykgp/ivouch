import { MapPin } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CategoryDirectory from '@/components/community/CategoryDirectory'
import { getCategoriesGrouped } from '@/lib/data/categories'

export const dynamic = 'force-dynamic'

const WARD_SLUG = 'jhb-south-ward-23'

export const metadata = {
  title: 'All categories · iVouch',
  description: 'Search and browse every service category in JHB South Ward 23.',
}

export default async function CategoriesPage() {
  const groups = await getCategoriesGrouped(true)
  const total = groups.reduce((n, g) => n + g.categories.length, 0)

  return (
    <>
      <Header />
      <main className="flex-1" style={{ backgroundColor: 'var(--mist)' }}>
        <section className="page-hero px-4 pt-12 pb-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-5 text-sm font-semibold"
              style={{ backgroundColor: 'var(--ivouch-blue-soft)', color: 'var(--ivouch-blue-dark)' }}>
              <MapPin size={14} /> JHB South · Ward 23
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3" style={{ color: 'var(--ink)' }}>
              What do you need?
            </h1>
            <p className="text-lg" style={{ color: '#5A6B85' }}>
              {total} services your neighbours can vouch for — search or filter to find yours.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-10">
          <CategoryDirectory groups={groups} wardSlug={WARD_SLUG} />
        </div>
      </main>
      <Footer />
    </>
  )
}
