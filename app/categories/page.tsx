import Link from 'next/link'
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
      <main className="flex-1">
        <div className="hero-navy py-12 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Browse by category</h1>
            <p className="text-white/70">
              {total} services your neighbours in{' '}
              <span style={{ color: 'var(--sunshine)' }}>JHB South Ward 23</span> can vouch for.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
          {groups.map((group) => (
            <section key={group.group_name}>
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--charcoal)' }}>
                {group.group_name}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {group.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    id={cat.slug}
                    href={`/c/${WARD_SLUG}/${cat.slug}`}
                    className="card-soft card-hover flex items-center gap-3 p-4"
                  >
                    <span className="text-2xl flex-shrink-0">{cat.icon ?? '📌'}</span>
                    <span className="min-w-0">
                      <span
                        className="block font-semibold text-sm truncate"
                        style={{ color: 'var(--charcoal)' }}
                      >
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
