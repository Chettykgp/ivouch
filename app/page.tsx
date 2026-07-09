import Link from 'next/link'
import {
  MapPin, ArrowRight, ShieldCheck, Users, Store, HeartHandshake,
  Sparkles,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ActivityFeed from '@/components/feed/ActivityFeed'
import CategoryExplorer, { type ExplorerCategory } from '@/components/community/CategoryExplorer'
import { getCommunityWithContext, getCommunityStats } from '@/lib/data/communities'
import { getFeaturedCategories, getCategoriesGrouped } from '@/lib/data/categories'
import { getRecentVouches } from '@/lib/data/activity'
import type { Category } from '@/types'

export const revalidate = 120

const WARD_SLUG = 'jhb-south-ward-23'

function nf(n: number): string {
  return new Intl.NumberFormat('en-ZA').format(n)
}

export default async function HomePage() {
  let vouchCount = 0
  let featured: Category[] = []
  let recentVouches: Awaited<ReturnType<typeof getRecentVouches>> = []
  let categoryList: ExplorerCategory[] = []
  let groupNames: string[] = []

  try {
    const ctx = await getCommunityWithContext(WARD_SLUG)
    if (ctx.relatedIds.length > 0) {
      const stats = await getCommunityStats(ctx.relatedIds)
      vouchCount = stats.vouchCount
    }
  } catch { /* noop */ }

  try {
    featured = await getFeaturedCategories(6)
  } catch { /* noop */ }

  try {
    recentVouches = await getRecentVouches(6)
  } catch { /* noop */ }

  try {
    const grouped = await getCategoriesGrouped(true)
    groupNames = grouped.map((g) => g.group_name)
    categoryList = grouped.flatMap((g) =>
      g.categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        group_name: c.group_name,
        business_count: c.business_count,
      }))
    )
  } catch { /* noop */ }

  return (
    <>
      <Header />
      <main className="flex-1" style={{ backgroundColor: 'var(--mist)' }}>

        {/* ───────────────────────── HERO ───────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-4 lg:pt-16 lg:pb-10 grid lg:grid-cols-2 gap-10 items-center">

            {/* Left column */}
            <div>
              {/* Location pill + free badge */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <div className="inline-flex items-center gap-2 rounded-full pl-2 pr-4 py-1.5 text-sm"
                  style={{ backgroundColor: 'var(--ivouch-blue-soft)' }}>
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold text-white text-xs"
                    style={{ backgroundColor: 'var(--ivouch-blue)' }}>
                    <MapPin size={13} /> JHB Ward 23
                  </span>
                  <span className="font-medium" style={{ color: 'var(--ink)' }}>
                    Your community. Real vouchers. Trusted people.
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold border"
                  style={{ borderColor: 'var(--vouch-green)', color: 'var(--vouch-green-dark)', backgroundColor: 'rgba(32,178,107,0.08)' }}>
                  ✓ 100% free community service
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-extrabold tracking-tight leading-[1.02] text-5xl sm:text-6xl lg:text-7xl"
                style={{ color: 'var(--ink)' }}>
                Find the help<br />your neighbours<br />
                <span style={{ color: 'var(--ivouch-blue)' }}>vouched</span> for.
              </h1>

              <p className="mt-6 text-lg max-w-md" style={{ color: '#5A6B85' }}>
                iVouch connects you with trusted local businesses and service providers
                recommended by real people in your community.
              </p>

              {/* Community selector card */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch gap-3 rounded-2xl bg-white p-3 shadow-[var(--shadow-soft)] border max-w-xl"
                style={{ borderColor: 'var(--cloud-grey)' }}>
                <div className="flex items-center gap-3 flex-1 px-2">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--ivouch-blue-soft)' }}>
                    <MapPin size={18} style={{ color: 'var(--ivouch-blue)' }} />
                  </span>
                  <div className="leading-tight">
                    <div className="font-bold" style={{ color: 'var(--ink)' }}>JHB Ward 23</div>
                    <div className="text-xs text-gray-400">Johannesburg, Gauteng</div>
                  </div>
                </div>
                <Link href={`/c/${WARD_SLUG}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5"
                  style={{ backgroundColor: 'var(--ivouch-blue)', boxShadow: 'var(--shadow-blue)' }}>
                  Explore my community <ArrowRight size={17} />
                </Link>
              </div>

              {/* Popular chips */}
              {featured.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold mr-1" style={{ color: 'var(--ink)' }}>
                    Popular right now:
                  </span>
                  {featured.map((c) => (
                    <Link key={c.id} href={`/c/${WARD_SLUG}/${c.slug}`}
                      className="rounded-full px-3.5 py-1.5 text-sm font-medium bg-white border transition-colors hover:border-[var(--ivouch-blue)] hover:text-[var(--ivouch-blue)]"
                      style={{ borderColor: 'var(--cloud-grey)', color: 'var(--charcoal)' }}>
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right column — hero image + floating cards */}
            <div className="relative">
              <div className="relative rounded-[2rem] overflow-hidden shadow-[var(--shadow-lift)] aspect-[4/3] lg:aspect-[5/4]">
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  preload="metadata"
                  poster="/hero-poster.jpg"
                  aria-label="Local Ward 23 service providers — a plumber, electrician, gardener, baker and handyman at work"
                >
                  <source src="/hero.mp4" type="video/mp4" />
                </video>
              </div>

              {/* Trusted stamp */}
              <div className="hidden sm:flex absolute -top-3 -right-3 w-24 h-24 rounded-full items-center justify-center text-center text-white shadow-lg"
                style={{ backgroundColor: 'var(--ivouch-blue)' }}>
                <div className="text-[9px] font-bold leading-tight tracking-wide">
                  COMMUNITY<br /><span className="text-sm">JHB<br />WARD 23</span><br />TRUSTED
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────── TRUST BAR ───────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
          <div className="rounded-3xl bg-white border p-6 sm:p-8 shadow-[var(--shadow-soft)]"
            style={{ borderColor: 'var(--cloud-grey)' }}>
            <div className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-center">
              <h2 className="text-xl font-extrabold leading-tight max-w-[10rem]" style={{ color: 'var(--ink)' }}>
                Trusted by neighbours like you
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Users, title: 'Real people', desc: 'Verified community members' },
                  { icon: ShieldCheck, title: 'Real vouches', desc: 'From people you can trust' },
                  { icon: Store, title: 'Local businesses', desc: 'In your community, not far away' },
                  { icon: HeartHandshake, title: 'Better together', desc: 'Stronger communities start here' },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <span className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--ink)' }}>
                      <f.icon size={19} style={{ color: '#fff' }} />
                    </span>
                    <div>
                      <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{f.title}</div>
                      <div className="text-xs text-gray-400 leading-snug">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────── WELCOME + ACTIVITY FEED (social) ─────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-7">
            <span className="inline-flex items-center gap-1.5 chip chip-blue mb-3">
              <Sparkles size={14} /> Welcome, neighbour
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: 'var(--ink)' }}>
              Welcome to Ward 23 <span style={{ color: 'var(--ivouch-blue)' }}>· JHB South</span>
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              Here are the people and services your neighbours vouch for.
              {vouchCount > 0 && <> {nf(vouchCount)} vouches and counting.</>}
            </p>
          </div>
          <ActivityFeed
            vouches={recentVouches}
            emptyMessage="No vouches yet — be the first to vouch for a neighbour in Ward 23!"
          />
        </section>

        {/* ─────────────── CATEGORIES — minimal, filterable list ─────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
            <div>
              <h2 className="text-2xl font-extrabold" style={{ color: 'var(--ink)' }}>
                Every service in Ward 23
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Filter by type or search to jump straight to what you need
                {categoryList.length > 0 && <> — {categoryList.length} services</>}.
              </p>
            </div>
            <Link href="/categories"
              className="text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color: 'var(--ivouch-blue)' }}>
              Full directory <ArrowRight size={15} />
            </Link>
          </div>

          {categoryList.length > 0 && (
            <CategoryExplorer categories={categoryList} groups={groupNames} wardSlug={WARD_SLUG} />
          )}
        </section>

        {/* ─────────────── CTA BANNER ─────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="rounded-[2rem] p-10 sm:p-14 text-center relative overflow-hidden"
            style={{ backgroundColor: 'var(--ivouch-blue)' }}>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
                Run a local business in Ward 23?
              </h2>
              <p className="text-white/85 mb-8 max-w-xl mx-auto">
                List for free and let your happy customers vouch for you.
                Businesses don&apos;t buy trust here — they earn it.
              </p>
              <Link href="/add-business"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-lg transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: 'white', color: 'var(--ivouch-blue)' }}>
                List my business free <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
