'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header style={{ backgroundColor: 'var(--navy)' }} className="sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-white">
            i<span style={{ color: 'var(--vouch-green)' }}>Vouch</span>
          </span>
          <span className="hidden sm:inline text-xs text-white/60 font-medium">.co.za</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/add-business" className="hover:text-white transition-colors">Add Business</Link>
          <Link href="/auth" className="hover:text-white transition-colors">Sign In</Link>
          <Link
            href="/add-business"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--vouch-green)' }}
          >
            List Free
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ backgroundColor: 'var(--navy)' }} className="md:hidden border-t border-white/10 px-4 pb-4 space-y-2">
          <Link href="/" className="block py-2 text-white/80 hover:text-white" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href="/add-business" className="block py-2 text-white/80 hover:text-white" onClick={() => setMobileOpen(false)}>Add Business</Link>
          <Link href="/auth" className="block py-2 text-white/80 hover:text-white" onClick={() => setMobileOpen(false)}>Sign In</Link>
          <Link
            href="/add-business"
            onClick={() => setMobileOpen(false)}
            className="block w-full text-center py-3 rounded-lg font-semibold text-white mt-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--vouch-green)' }}
          >
            List Your Business Free
          </Link>
        </div>
      )}
    </header>
  )
}
