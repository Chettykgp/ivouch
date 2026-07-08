import Link from 'next/link'
import { Store, ShieldCheck, ShieldAlert, Clock, FileCheck2, Flag, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

async function getStats() {
  const supabase = await createClient()
  const [businesses, vouches, pendingBusinesses, pendingClaims, openReports, openConcerns] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('vouches').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('concerns').select('*', { count: 'exact', head: true }).eq('status', 'open'),
  ])
  return {
    businesses: businesses.count ?? 0,
    vouches: vouches.count ?? 0,
    pendingBusinesses: pendingBusinesses.count ?? 0,
    pendingClaims: pendingClaims.count ?? 0,
    openReports: openReports.count ?? 0,
    openConcerns: openConcerns.count ?? 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const cards = [
    { label: 'Total businesses', value: stats.businesses, icon: Store, href: '/admin/businesses', accent: false },
    { label: 'Total vouches', value: stats.vouches, icon: ShieldCheck, href: '/admin/vouches', accent: false },
    { label: 'Pending businesses', value: stats.pendingBusinesses, icon: Clock, href: '/admin/businesses?status=pending', accent: stats.pendingBusinesses > 0 },
    { label: 'Pending claims', value: stats.pendingClaims, icon: FileCheck2, href: '/admin/claims', accent: stats.pendingClaims > 0 },
    { label: 'Open reports', value: stats.openReports, icon: Flag, href: '/admin/vouches', accent: stats.openReports > 0 },
    { label: 'Open concerns', value: stats.openConcerns, icon: ShieldAlert, href: '/admin/concerns', accent: stats.openConcerns > 0 },
  ]

  const actions = [
    { label: `Review ${stats.pendingBusinesses} pending businesses`, href: '/admin/businesses?status=pending', show: stats.pendingBusinesses > 0 },
    { label: `Review ${stats.pendingClaims} pending claims`, href: '/admin/claims', show: stats.pendingClaims > 0 },
    { label: `Look at ${stats.openReports} open reports`, href: '/admin/vouches', show: stats.openReports > 0 },
    { label: `Review ${stats.openConcerns} open concerns`, href: '/admin/concerns', show: stats.openConcerns > 0 },
    { label: 'Manage communities', href: '/admin/communities', show: true },
    { label: 'Manage categories', href: '/admin/categories', show: true },
  ].filter((a) => a.show)

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--ink)' }}>Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Moderate and manage JHB Ward 23.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="card-soft card-hover p-5">
            <span className="icon-tile w-10 h-10 mb-3 flex"
              style={card.accent ? { backgroundColor: 'rgba(242,95,92,0.12)', color: 'var(--coral)' } : undefined}>
              <card.icon size={18} />
            </span>
            <div className="text-3xl font-black" style={{ color: card.accent && card.value > 0 ? 'var(--coral)' : 'var(--ink)' }}>
              {card.value}
            </div>
            <div className="text-xs text-gray-400 mt-1">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card-soft p-6 max-w-xl">
        <h2 className="font-extrabold mb-4" style={{ color: 'var(--ink)' }}>Quick actions</h2>
        <div className="space-y-1.5">
          {actions.map((a) => (
            <Link key={a.href + a.label} href={a.href}
              className="group flex items-center justify-between gap-2 py-2.5 px-3 rounded-xl hover:bg-[var(--mist)] transition-colors">
              <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{a.label}</span>
              <ArrowRight size={15} className="text-gray-300 group-hover:translate-x-0.5 transition-transform"
                style={{ color: 'var(--ivouch-blue)' }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
