'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Store, FileCheck2, ShieldCheck, MapPin, Tags } from 'lucide-react'

const LINKS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/businesses', label: 'Businesses', icon: Store },
  { href: '/admin/claims', label: 'Claims', icon: FileCheck2 },
  { href: '/admin/vouches', label: 'Vouches', icon: ShieldCheck },
  { href: '/admin/communities', label: 'Communities', icon: MapPin },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
        return (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors"
            style={
              active
                ? { backgroundColor: 'var(--ivouch-blue)', color: '#fff' }
                : { color: 'var(--ink)' }
            }
          >
            <l.icon size={15} className={active ? '' : 'opacity-60'} />
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
