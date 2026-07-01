import Link from 'next/link'
import { MapPin } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getCategoriesGrouped } from '@/lib/data/categories'

export const dynamic = 'force-dynamic'

const WARD_SLUG = 'jhb-south-ward-23'

export const metadata = {
  title: 'All categories · iVouch',
  description: 'Browse every service category in JHB South Ward 23.',
}

export default async function CategoriesPage() {
  const groups = await getCategoriesGrouped(true)
  const total = groups.reduce((n, g) => n + g.categories.length, 0)

  return (
    <>
      <Header />
      <main className="flex-1" style={{ backgroundColor: 'var(--mist)' }}>
        <section className="page-hero px-4 pt-12 pb-10 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-5 text-sm font-semibold"
              style={{ backgroundColor: 'var(--ivouch-blue-soft)', color: 'var(--ivouch-blue-dark)' }}>
              <MapPin size={14} /> JHB South · Ward 23
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3" style={{ color: 'var(--ink)' }}>
              Browse by category
            </h1>
            <p className="text-lg" style={{ color: '#5A6B85' }}>
              {total} services your neighbours can vouch for — all in one community.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
          {groups.map((group) => (
            <section key={group.group_name}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-extrabold" style={{ color: 'var(--ink)' }}>
                  {group.group_name}
                </h2>
                <span className="h-px flex-1" style={{ backgroundColor: 'var(--cloud-grey)' }} />
                <span className="text-xs text-gray-400">{group.categories.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {group.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    id={cat.slug}
                    href={`/c/${WARD_SLUG}/${cat.slug}`}
                    className="card-soft card-hover flex items-center gap-3 p-4"
                  >
                    <span className="icon-tile w-11 h-11 text-xl flex-shrink-0">
                      {cat.icon ?? '📌'}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>
                        {cat.name}
                      </span>
                      <span className="block text-xs text-gray-400">
                        {cat.business_count ?? 0}{' '}
                        {(cat.business_count ?? 0) === 1 ? 'business' : 'businesses'}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
