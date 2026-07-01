import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, ArrowRight, ShieldCheck, Users, Store, HeartHandshake,
  Search, BadgeCheck, Star, Sparkles,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ActivityFeed from '@/components/feed/ActivityFeed'
import { getCommunityWithContext, getCommunityStats } from '@/lib/data/communities'
import { getFeaturedCategories } from '@/lib/data/categories'
import { getRecentVouches } from '@/lib/data/activity'
import type { Category, CommunityAlias } from '@/types'

export const revalidate = 120

const WARD_SLUG = 'jhb-south-ward-23'

const FALLBACK_NEIGHBOURHOODS = [
  'Glenvista', 'Bassonia', 'Mulbarton', 'Glenanda',
  'Liefde en Vrede', 'Mayfield Park', 'Rispark', 'South View',
]

function nf(n: number): string {
  return new Intl.NumberFormat('en-ZA').format(n)
}

export default async function HomePage() {
  // Fetch community context, stats, featured categories and the live feed.
  let neighbourhoods: string[] = FALLBACK_NEIGHBOURHOODS
  let businessCount = 0
  let vouchCount = 0
  let featured: Category[] = []
  let recentVouches: Awaited<ReturnType<typeof getRecentVouches>> = []

  try {
    const ctx = await getCommunityWithContext(WARD_SLUG)
    const suburbAliases = (ctx.aliases ?? []).filter(
      (a: CommunityAlias) => a.alias_type === 'suburb'
    )
    if (suburbAliases.length > 0) {
      neighbourhoods = suburbAliases.map((a) => a.alias_name)
    }
    if (ctx.relatedIds.length > 0) {
      const stats = await getCommunityStats(ctx.relatedIds)
      businessCount = stats.businessCount
      vouchCount = stats.vouchCount
    }
  } catch {
    /* fall back to constants */
  }

  try {
    featured = await getFeaturedCategories(6)
  } catch { /* noop */ }

  try {
    recentVouches = await getRecentVouches(6)
  } catch { /* noop */ }

  const tileNeighbourhoods = neighbourhoods.slice(0, 3)

  return (
    <>
      <Header />
      <main className="flex-1" style={{ backgroundColor: 'var(--mist)' }}>

        {/* ───────────────────────── HERO ───────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-4 lg:pt-16 lg:pb-10 grid lg:grid-cols-2 gap-10 items-center">

            {/* Left column */}
            <div>
              {/* Location pill */}
              <div className="inline-flex items-center gap-2 rounded-full pl-2 pr-4 py-1.5 mb-6 text-sm"
                style={{ backgroundColor: 'var(--ivouch-blue-soft)' }}>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold text-white text-xs"
                  style={{ backgroundColor: 'var(--ivouch-blue)' }}>
                  <MapPin size={13} /> JHB Ward 23
                </span>
                <span className="font-medium" style={{ color: 'var(--ink)' }}>
                  Your community. Real vouchers. Trusted people.
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-extrabold tracking-tight leading-[1.02] text-5xl sm:text-6xl lg:text-7xl"
                style={{ color: 'var(--ink)' }}>
                Find people<br />your neighbours<br />
                <span style={{ color: 'var(--ivouch-blue)' }}>vouch</span> for.
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
                <Image
                  src="/hero-family.jpg"
                  alt="A happy local family in their neighbourhood"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>

              {/* Floating testimonial card */}
              <div className="absolute left-3 sm:-left-4 bottom-6 w-[16rem] sm:w-[19rem] rounded-2xl bg-white p-4 shadow-[var(--shadow-lift)] border animate-fade-up"
                style={{ borderColor: 'var(--cloud-grey)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: '#E8618C' }}>NM</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Naledi M.</div>
                    <div className="text-[11px] text-gray-400">JHB Ward 23, Johannesburg</div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill="var(--ivouch-blue)" style={{ color: 'var(--ivouch-blue)' }} />
                    ))}
                  </div>
                </div>
                <p className="text-sm mt-2.5 leading-snug" style={{ color: 'var(--charcoal)' }}>
                  Thabo fixed our geyser same day. Honest, professional and reasonably priced. Highly recommend!
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-sm font-semibold"
                  style={{ color: 'var(--ivouch-blue)' }}>
                  <BadgeCheck size={16} /> Vouched by 12 neighbours
                </div>
              </div>

              {/* Dark "no paid reviews" pill */}
              <div className="absolute right-3 sm:-right-3 bottom-24 sm:bottom-28 max-w-[13rem] rounded-2xl px-4 py-3 text-white shadow-[var(--shadow-lift)]"
                style={{ backgroundColor: 'var(--ink)' }}>
                <div className="flex items-start gap-2">
                  <ShieldCheck size={18} style={{ color: 'var(--ivouch-blue)' }} className="mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-semibold leading-snug">
                    Real people. Real experiences. No paid reviews. Ever.
                  </p>
                </div>
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

        {/* ─────────────── YOUR COMMUNITY MATTERS ─────────────── */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
          <div className="rounded-3xl bg-white border p-6 sm:p-8 shadow-[var(--shadow-soft)]"
            style={{ borderColor: 'var(--cloud-grey)' }}>
            <div className="grid lg:grid-cols-[1fr_2fr] gap-6 items-center">
              {/* Intro */}
              <div className="flex items-start gap-4">
                <span className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--ink)' }}>
                  <MapPin size={22} style={{ color: '#fff' }} />
                </span>
                <div>
                  <h2 className="text-xl font-extrabold" style={{ color: 'var(--ink)' }}>Your community matters</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Join your neighbours and see what they&apos;re vouching for in{' '}
                    <span style={{ color: 'var(--ivouch-blue)' }} className="font-semibold">JHB Ward 23</span>.
                  </p>
                </div>
              </div>

              {/* Tiles */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {tileNeighbourhoods.map((name) => (
                  <Link key={name} href={`/c/${WARD_SLUG}`}
                    className="rounded-2xl border p-4 transition-transform hover:-translate-y-0.5 bg-white"
                    style={{ borderColor: 'var(--cloud-grey)' }}>
                    <Store size={22} style={{ color: 'var(--ink)' }} strokeWidth={1.5} />
                    <div className="font-bold mt-3" style={{ color: 'var(--ink)' }}>{name}</div>
                    <div className="text-xs text-gray-400">Ward 23 neighbourhood</div>
                  </Link>
                ))}
                {/* Selected ward tile */}
                <Link href={`/c/${WARD_SLUG}`}
                  className="rounded-2xl p-4 text-white transition-transform hover:-translate-y-0.5 flex flex-col"
                  style={{ backgroundColor: 'var(--ink)' }}>
                  <div className="flex items-center justify-between">
                    <Store size={22} strokeWidth={1.5} />
                    <ArrowRight size={16} className="opacity-70" />
                  </div>
                  <div className="font-bold mt-3">JHB Ward 23</div>
                  <div className="text-xs text-white/60">
                    {businessCount > 0 ? `${nf(businessCount)} local businesses` : 'Your selected community'}
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────── ACTIVITY FEED (social) ─────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-extrabold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
              <Sparkles size={20} style={{ color: 'var(--ivouch-blue)' }} />
              What&apos;s happening in Ward 23
            </h2>
            {vouchCount > 0 && (
              <span className="text-sm text-gray-400">{nf(vouchCount)} vouches</span>
            )}
          </div>
          <ActivityFeed
            vouches={recentVouches}
            emptyMessage="No vouches yet — be the first to vouch for a neighbour in Ward 23!"
          />
        </section>

        {/* ─────────────── FEATURED CATEGORIES ─────────────── */}
        {featured.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-extrabold" style={{ color: 'var(--ink)' }}>Browse by category</h2>
              <Link href="/categories" className="text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all"
                style={{ color: 'var(--ivouch-blue)' }}>
                See all categories <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {featured.map((c) => (
                <Link key={c.id} href={`/c/${WARD_SLUG}/${c.slug}`}
                  className="rounded-2xl bg-white border p-5 text-center transition-transform hover:-translate-y-1 shadow-[var(--shadow-soft)]"
                  style={{ borderColor: 'var(--cloud-grey)' }}>
                  <div className="text-3xl mb-2">{c.icon ?? '📍'}</div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{c.name}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─────────────── HOW IT WORKS ─────────────── */}
        <section id="how-it-works" className="bg-white border-y" style={{ borderColor: 'var(--cloud-grey)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
            <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--ink)' }}>How iVouch works</h2>
            <p className="text-gray-500 mb-12">Three simple steps to find someone you can trust.</p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Search, title: 'Find your service', desc: 'Search or browse categories in JHB Ward 23 to see who your neighbours use.' },
                { icon: HeartHandshake, title: 'Check the vouches', desc: 'A vouch means a real neighbour personally recommends them. Stronger than a star.' },
                { icon: ShieldCheck, title: 'Hire with confidence', desc: 'Contact directly on WhatsApp. Then vouch for them too — help the next neighbour.' },
              ].map((s, i) => (
                <div key={s.title} className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--ivouch-blue-soft)' }}>
                    <s.icon size={28} style={{ color: 'var(--ivouch-blue)' }} />
                  </div>
                  <div className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white" style={{ backgroundColor: 'var(--ink)' }}>
                    Step {i + 1}
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>{s.title}</h3>
                  <p className="text-sm text-gray-500 max-w-xs">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
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
