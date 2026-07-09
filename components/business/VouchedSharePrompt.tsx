'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import ShareVouchButton from './ShareVouchButton'

interface VouchedSharePromptProps {
  businessName: string
  slug: string
}

/**
 * Shown right after a neighbour vouches (?vouched=1) — the highest-intent
 * moment to nudge them to share so others vouch too.
 */
export default function VouchedSharePrompt({ businessName, slug }: VouchedSharePromptProps) {
  const params = useSearchParams()
  const [dismissed, setDismissed] = useState(false)

  if (params.get('vouched') !== '1' || dismissed) return null

  return (
    <div
      className="relative rounded-2xl border p-5 animate-fade-up"
      style={{ backgroundColor: 'var(--ivouch-blue-soft)', borderColor: 'rgba(47,107,255,0.2)' }}
    >
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        <X size={16} />
      </button>
      <div className="flex items-start gap-2 mb-3">
        <span className="text-xl" aria-hidden>🎉</span>
        <div>
          <p className="font-extrabold" style={{ color: 'var(--ink)' }}>Thanks for vouching!</p>
          <p className="text-sm text-gray-600">
            Help more neighbours find {businessName} — share so they can vouch too.
          </p>
        </div>
      </div>
      <ShareVouchButton businessName={businessName} slug={slug} label="Share with neighbours" />
    </div>
  )
}
