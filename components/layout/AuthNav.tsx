'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { avatarColor, initials } from '@/lib/utils/avatar'
import type { User } from '@supabase/supabase-js'

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

interface AuthNavProps {
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

/**
 * Light-header auth control:
 *  - signed out → "Log in" (outline) + "Sign up" (solid blue)
 *  - signed in  → avatar + dropdown (Profile / My Vouches / Sign out)
 */
export default function AuthNav({ variant = 'desktop', onNavigate }: AuthNavProps) {
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
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
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

  if (!ready) {
    return <div className="w-24 h-9 skeleton rounded-full" aria-hidden />
  }

  // ---- Signed out ----
  if (!user) {
    if (variant === 'mobile') {
      return (
        <div className="flex flex-col gap-2 pt-2">
          <Link
            href="/auth"
            onClick={onNavigate}
            className="w-full text-center py-2.5 rounded-full font-semibold border"
            style={{ borderColor: 'var(--cloud-grey)', color: 'var(--ink)' }}
          >
            Log in
          </Link>
          <Link
            href="/auth?mode=signup"
            onClick={onNavigate}
            className="w-full text-center py-2.5 rounded-full font-semibold text-white"
            style={{ backgroundColor: 'var(--ivouch-blue)' }}
          >
            Sign up
          </Link>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth"
          className="px-4 py-2 rounded-full text-sm font-semibold border transition-colors hover:bg-[var(--mist)]"
          style={{ borderColor: 'var(--cloud-grey)', color: 'var(--ink)' }}
        >
          Log in
        </Link>
        <Link
          href="/auth?mode=signup"
          className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--ivouch-blue)' }}
        >
          Sign up
        </Link>
      </div>
    )
  }

  const name = displayNameFor(user)
  const color = avatarColor(name)

  // ---- Signed in, mobile ----
  if (variant === 'mobile') {
    return (
      <div className="border-t pt-3 mt-1" style={{ borderColor: 'var(--cloud-grey)' }}>
        <div className="flex items-center gap-2 py-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: color }}
          >
            {initials(name)}
          </div>
          <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{name}</span>
        </div>
        <Link href="/profile" onClick={onNavigate} className="block py-2 text-sm" style={{ color: 'var(--charcoal)' }}>My Profile</Link>
        <Link href="/profile#vouches" onClick={onNavigate} className="block py-2 text-sm" style={{ color: 'var(--charcoal)' }}>My Vouches</Link>
        <button onClick={signOut} className="block py-2 text-left text-sm text-red-600">Sign Out</button>
      </div>
    )
  }

  // ---- Signed in, desktop ----
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 group"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-[var(--cloud-grey)]"
          style={{ backgroundColor: color }}
        >
          {initials(name)}
        </div>
        <span className="hidden lg:inline text-sm font-medium max-w-[8rem] truncate" style={{ color: 'var(--ink)' }}>
          {name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white shadow-lg border overflow-hidden z-50 animate-fade-up" style={{ borderColor: 'var(--cloud-grey)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--cloud-grey)' }}>
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{name}</p>
            {user.email && <p className="text-xs text-gray-400 truncate">{user.email}</p>}
          </div>
          <Link href="/profile" onClick={() => { setOpen(false); onNavigate?.() }} className="block px-4 py-2.5 text-sm hover:bg-[var(--mist)]" style={{ color: 'var(--charcoal)' }}>My Profile</Link>
          <Link href="/profile#vouches" onClick={() => { setOpen(false); onNavigate?.() }} className="block px-4 py-2.5 text-sm hover:bg-[var(--mist)]" style={{ color: 'var(--charcoal)' }}>My Vouches</Link>
          <Link href="/add-business" onClick={() => { setOpen(false); onNavigate?.() }} className="block px-4 py-2.5 text-sm hover:bg-[var(--mist)]" style={{ color: 'var(--charcoal)' }}>Add a Business</Link>
          <button onClick={signOut} className="block w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600">Sign Out</button>
        </div>
      )}
    </div>
  )
}
