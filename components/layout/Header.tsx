'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ChevronDown, MapPin, Grid3x3, Store } from 'lucide-react'
import Logo from './Logo'
import AuthNav from './AuthNav'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commOpen, setCommOpen] = useState(false)

  const navItem =
    'group flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors hover:bg-[var(--ivouch-blue-soft)] hover:text-[var(--ivouch-blue)]'

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b" style={{ borderColor: 'var(--cloud-grey)' }}>
      {/* Free community service announcement bar */}
      <Link
        href="/add-business"
        className="block text-center text-xs sm:text-sm font-semibold text-white px-4 py-1.5 transition-opacity hover:opacity-95"
        style={{ backgroundColor: 'var(--ivouch-blue)' }}
      >
        💙 A <span className="font-extrabold">free</span> community service — free to find help, free to list your business.
      </Link>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--ink)' }}>
          <Link href="/categories" className={navItem}>
            <Grid3x3 size={16} className="opacity-60 group-hover:opacity-100" /> Categories
          </Link>

          {/* Communities dropdown */}
          <div className="relative" onMouseEnter={() => setCommOpen(true)} onMouseLeave={() => setCommOpen(false)}>
            <button className={`${navItem} ${commOpen ? 'bg-[var(--ivouch-blue-soft)] text-[var(--ivouch-blue)]' : ''}`}>
              <MapPin size={16} className="opacity-60 group-hover:opacity-100" /> Communities
              <ChevronDown size={14} className={`transition-transform ${commOpen ? 'rotate-180' : ''}`} />
            </button>
            {commOpen && (
              <div className="absolute left-0 top-full pt-2 w-72 animate-fade-up">
                <div className="rounded-2xl bg-white shadow-lg border overflow-hidden" style={{ borderColor: 'var(--cloud-grey)' }}>
                  <Link href="/c/jhb-south-ward-23" className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--mist)]">
                    <span className="icon-tile w-10 h-10 flex-shrink-0"><MapPin size={18} /></span>
                    <span>
                      <span className="block font-bold" style={{ color: 'var(--ink)' }}>JHB Ward 23</span>
                      <span className="block text-xs text-gray-400">Glenvista · Bassonia · Mulbarton · +5</span>
                    </span>
                  </Link>
                  <div className="px-4 py-2.5 text-xs text-gray-400 border-t" style={{ borderColor: 'var(--cloud-grey)' }}>
                    More communities coming soon 🚀
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/add-business" className={navItem}>
            <Store size={16} className="opacity-60 group-hover:opacity-100" /> For Businesses
          </Link>
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
        <div className="md:hidden bg-white border-t px-3 pb-4 pt-2 space-y-0.5" style={{ borderColor: 'var(--cloud-grey)' }}>
          <Link href="/categories" className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-[var(--mist)]" style={{ color: 'var(--ink)' }} onClick={() => setMobileOpen(false)}>
            <Grid3x3 size={17} style={{ color: 'var(--ivouch-blue)' }} /> Categories
          </Link>
          <Link href="/c/jhb-south-ward-23" className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-[var(--mist)]" style={{ color: 'var(--ink)' }} onClick={() => setMobileOpen(false)}>
            <MapPin size={17} style={{ color: 'var(--ivouch-blue)' }} /> My Community · Ward 23
          </Link>
          <Link href="/add-business" className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-[var(--mist)]" style={{ color: 'var(--ink)' }} onClick={() => setMobileOpen(false)}>
            <Store size={17} style={{ color: 'var(--ivouch-blue)' }} /> For Businesses
          </Link>
          <div className="pt-2">
            <AuthNav variant="mobile" onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </header>
  )
}
