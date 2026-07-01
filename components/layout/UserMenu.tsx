'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { avatarColor, initials } from '@/lib/utils/avatar'
import type { User } from '@supabase/supabase-js'

interface UserMenuProps {
  /** When true, render as a stacked block for the mobile menu. */
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

function displayNameFor(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined
  return (
    (meta?.display_name as string) ||
    (meta?.full_name as string) ||
    (meta?.name as string) ||
    user.email?.split('@')[0] ||
    'You'
  )
}

export default function UserMenu({ variant = 'desktop', onNavigate }: UserMenuProps) {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user ?? null)
        setReady(true)
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setReady(true)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setOpen(false)
    onNavigate?.()
    router.push('/')
    router.refresh()
  }

  // Avoid layout flash before we know auth state.
  if (!ready) {
    return <div className="w-20 h-8 skeleton rounded-lg" aria-hidden />
  }

  // --- Signed out ---
  if (!user) {
    if (variant === 'mobile') {
      return (
        <Link
          href="/auth"
          onClick={onNavigate}
          className="block py-2 text-white/80 hover:text-white"
        >
          Sign In
        </Link>
      )
    }
    return (
      <Link href="/auth" className="hover:text-white transition-colors">
        Sign In
      </Link>
    )
  }

  const name = displayNameFor(user)
  const color = avatarColor(name)

  const menuLinks = (
    <>
      <Link
        href="/profile"
        onClick={() => {
          setOpen(false)
          onNavigate?.()
        }}
        className="block px-4 py-2.5 text-sm hover:bg-gray-50"
        style={{ color: 'var(--charcoal)' }}
      >
        My Profile
      </Link>
      <Link
        href="/profile#vouches"
        onClick={() => {
          setOpen(false)
          onNavigate?.()
        }}
        className="block px-4 py-2.5 text-sm hover:bg-gray-50"
        style={{ color: 'var(--charcoal)' }}
      >
        My Vouches
      </Link>
      <button
        onClick={signOut}
        className="block w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600"
      >
        Sign Out
      </button>
    </>
  )

  // --- Signed in, mobile ---
  if (variant === 'mobile') {
    return (
      <div className="border-t border-white/10 pt-3 mt-2">
        <div className="flex items-center gap-2 py-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: color }}
          >
            {initials(name)}
          </div>
          <span className="text-white font-semibold text-sm">{name}</span>
        </div>
        <Link
          href="/profile"
          onClick={onNavigate}
          className="block py-2 text-white/80 hover:text-white text-sm"
        >
          My Profile
        </Link>
        <Link
          href="/profile#vouches"
          onClick={onNavigate}
          className="block py-2 text-white/80 hover:text-white text-sm"
        >
          My Vouches
        </Link>
        <button
          onClick={signOut}
          className="block py-2 text-left text-red-300 hover:text-red-200 text-sm"
        >
          Sign Out
        </button>
      </div>
    )
  }

  // --- Signed in, desktop ---
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 group"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/20"
          style={{ backgroundColor: color }}
        >
          {initials(name)}
        </div>
        <span className="hidden lg:inline text-sm text-white/90 group-hover:text-white max-w-[8rem] truncate">
          {name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border overflow-hidden z-50 animate-fade-up">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--charcoal)' }}>
              {name}
            </p>
            {user.email && <p className="text-xs text-gray-400 truncate">{user.email}</p>}
          </div>
          {menuLinks}
        </div>
      )}
    </div>
  )
}
