import Link from 'next/link'
import { Building2, Heart, AlertTriangle, FileQuestion, Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

async function getStats() {
  const supabase = await createClient()
  const [businesses, vouches, pendingBusinesses, pendingClaims, openReports] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('vouches').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
  ])
  return {
    businesses: businesses.count ?? 0,
    vouches: vouches.count ?? 0,
    pendingBusinesses: pendingBusinesses.count ?? 0,
    pendingClaims: pendingClaims.count ?? 0,
    openReports: openReports.count ?? 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const cards = [
    { label: 'Total Businesses', value: stats.businesses, icon: <Building2 size={24} />, href: '/admin/businesses', color: 'var(--navy)' },
    { label: 'Total Vouches', value: stats.vouches, icon: <Heart size={24} />, href: '/admin/vouches', color: 'var(--vouch-green)' },
    { label: 'Pending Businesses', value: stats.pendingBusinesses, icon: <AlertTriangle size={24} />, href: '/admin/businesses?status=pending', color: 'var(--sunshine)' },
    { label: 'Pending Claims', value: stats.pendingClaims, icon: <FileQuestion size={24} />, href: '/admin/claims', color: 'var(--coral)' },
    { label: 'Open Reports', value: stats.openReports, icon: <Flag size={24} />, href: '/admin/vouches', color: 'var(--coral)' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--charcoal)' }}>Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="bg-white rounded-2xl p-5 border hover:shadow-md transition-shadow" style={{ borderColor: 'var(--cloud-grey)' }}>
              <div style={{ color: card.color }} className="mb-2">{card.icon}</div>
              <div className="text-3xl font-black" style={{ color: 'var(--charcoal)' }}>{card.value}</div>
              <div className="text-xs text-gray-500 mt-1">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--cloud-grey)' }}>
          <h2 className="font-bold mb-3" style={{ color: 'var(--charcoal)' }}>Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/admin/businesses?status=pending" className="block text-sm py-2 px-3 rounded-lg hover:bg-gray-50 text-blue-600">
              → Review {stats.pendingBusinesses} pending businesses
            </Link>
            <Link href="/admin/claims" className="block text-sm py-2 px-3 rounded-lg hover:bg-gray-50 text-blue-600">
              → Review {stats.pendingClaims} pending claims
            </Link>
            <Link href="/admin/communities" className="block text-sm py-2 px-3 rounded-lg hover:bg-gray-50 text-blue-600">
              → Manage communities
            </Link>
            <Link href="/admin/categories" className="block text-sm py-2 px-3 rounded-lg hover:bg-gray-50 text-blue-600">
              → Manage categories
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
