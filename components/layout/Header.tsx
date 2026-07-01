'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ChevronDown, MapPin } from 'lucide-react'
import Logo from './Logo'
import AuthNav from './AuthNav'

const NAV_LINKS = [
  { label: 'Categories', href: '/categories' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'About', href: '/#about' },
  { label: 'For Businesses', href: '/add-business' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commOpen, setCommOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b" style={{ borderColor: 'var(--cloud-grey)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium" style={{ color: 'var(--ink)' }}>
          <Link href="/categories" className="hover:text-[var(--ivouch-blue)] transition-colors">Categories</Link>

          {/* Communities dropdown */}
          <div className="relative" onMouseEnter={() => setCommOpen(true)} onMouseLeave={() => setCommOpen(false)}>
            <button className="flex items-center gap-1 hover:text-[var(--ivouch-blue)] transition-colors">
              Communities <ChevronDown size={15} />
            </button>
            {commOpen && (
              <div className="absolute left-0 top-full pt-2 w-64 animate-fade-up">
                <div className="rounded-2xl bg-white shadow-lg border overflow-hidden" style={{ borderColor: 'var(--cloud-grey)' }}>
                  <Link href="/c/jhb-south-ward-23" className="flex items-center gap-2 px-4 py-3 hover:bg-[var(--mist)]">
                    <MapPin size={16} style={{ color: 'var(--ivouch-blue)' }} />
                    <span>
                      <span className="block font-semibold" style={{ color: 'var(--ink)' }}>JHB Ward 23</span>
                      <span className="block text-xs text-gray-400">Glenvista · Bassonia · Mulbarton</span>
                    </span>
                  </Link>
                  <div className="px-4 py-2.5 text-xs text-gray-400 border-t" style={{ borderColor: 'var(--cloud-grey)' }}>
                    More communities coming soon 🚀
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/#how-it-works" className="hover:text-[var(--ivouch-blue)] transition-colors">How it works</Link>
          <Link href="/#about" className="hover:text-[var(--ivouch-blue)] transition-colors">About</Link>
          <Link href="/add-business" className="hover:text-[var(--ivouch-blue)] transition-colors">For Businesses</Link>
        </nav>

        <div className="hidden md:block">
          <AuthNav />
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          style={{ color: 'var(--ink)' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t px-4 pb-4 space-y-1" style={{ borderColor: 'var(--cloud-grey)' }}>
          <Link href="/categories" className="block py-2.5" style={{ color: 'var(--ink)' }} onClick={() => setMobileOpen(false)}>Categories</Link>
          <Link href="/c/jhb-south-ward-23" className="block py-2.5" style={{ color: 'var(--ink)' }} onClick={() => setMobileOpen(false)}>My Community · Ward 23</Link>
          {NAV_LINKS.slice(1).map((l) => (
            <Link key={l.href} href={l.href} className="block py-2.5" style={{ color: 'var(--ink)' }} onClick={() => setMobileOpen(false)}>{l.label}</Link>
          ))}
          <AuthNav variant="mobile" onNavigate={() => setMobileOpen(false)} />
        </div>
      )}
    </header>
  )
}
