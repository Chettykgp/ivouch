'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface WithdrawVouchButtonProps {
  vouchId: string
  businessName: string
}

/**
 * Trust can go down: a neighbour may withdraw their vouch at any time.
 * Two-tap confirm, then the vouch is deleted and counts drop.
 */
export default function WithdrawVouchButton({ vouchId, businessName }: WithdrawVouchButtonProps) {
  const supabase = createClient()
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function withdraw() {
    setLoading(true)
    await supabase.from('vouches').delete().eq('id', vouchId)
    router.refresh()
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 text-xs">
        <span className="text-gray-500">Withdraw your vouch for {businessName}?</span>
        <button onClick={withdraw} disabled={loading}
          className="font-bold text-red-600 hover:underline disabled:opacity-50">
          {loading ? 'Removing…' : 'Yes, withdraw'}
        </button>
        <button onClick={() => setConfirming(false)} className="text-gray-400 hover:underline">
          Keep it
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); setConfirming(true) }}
      className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
      aria-label={`Withdraw vouch for ${businessName}`}
    >
      <Trash2 size={12} /> Withdraw
    </button>
  )
}
