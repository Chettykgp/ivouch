'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Heart } from 'lucide-react'

interface VouchButtonProps {
  businessId: string
  className?: string
  label?: string
}

/**
 * Navigates to the full vouch flow, but plays a rewarding heart-pop first so
 * the interaction feels alive. Rendering as a client component keeps the
 * animation snappy without blocking navigation.
 */
export default function VouchButton({ businessId, className = '', label = 'I vouch for them' }: VouchButtonProps) {
  const [popping, setPopping] = useState(false)

  return (
    <Link
      href={`/vouch/${businessId}`}
      onClick={() => setPopping(true)}
      className={`btn-vouch ${className}`}
    >
      <Heart
        size={20}
        fill="currentColor"
        className={popping ? 'animate-heart-pop' : ''}
      />
      {label}
    </Link>
  )
}
