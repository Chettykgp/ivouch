'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldAlert, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ConcernButtonProps {
  businessId: string
  businessName: string
}

const CATEGORIES = [
  { value: 'no_show', label: "Didn't show up / unreachable" },
  { value: 'poor_workmanship', label: 'Poor workmanship' },
  { value: 'overcharging', label: 'Overcharging / billing issue' },
  { value: 'unprofessional', label: 'Unprofessional behaviour' },
  { value: 'safety', label: 'Safety concern' },
  { value: 'other', label: 'Something else' },
]

/**
 * The moderated negative-signal flow. Concerns are structured, tied to a
 * signed-in neighbour (accountability), and go to admin review — never a
 * public complaint thread. Verified concerns surface as a neutral notice.
 */
export default function ConcernButton({ businessId, businessName }: ConcernButtonProps) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [category, setCategory] = useState(CATEGORIES[0].value)
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function openModal() {
    setOpen(true)
    const { data } = await supabase.auth.getUser()
    setSignedIn(Boolean(data.user))
  }

  async function submit() {
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.rpc('submit_concern', {
      p_business_id: businessId,
      p_category: category,
      p_details: details,
    })
    setLoading(false)
    if (err) setError(err.message)
    else {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'new_concern', name: businessName }),
      }).catch(() => {})
      setDone(true)
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="w-full card-soft p-4 flex items-center gap-3 text-left transition-colors hover:border-[var(--sunshine)]"
      >
        <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(255,200,87,0.18)' }}>
          <ShieldAlert size={18} style={{ color: '#B7791F' }} />
        </span>
        <span>
          <span className="block text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            Had a different experience?
          </span>
          <span className="block text-xs text-gray-400">
            Raise a private concern — reviewed by community moderators.
          </span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(11,31,78,0.45)' }} onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-extrabold" style={{ color: 'var(--ink)' }}>
                Raise a concern
              </h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {signedIn === false ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-5">
                  Concerns come from real, signed-in neighbours — that keeps them fair for
                  everyone. Sign in to continue.
                </p>
                <Link href={`/auth?redirect=/b`} className="btn-blue w-full py-3">
                  Sign in to continue
                </Link>
              </div>
            ) : done ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">🤝</div>
                <p className="font-semibold" style={{ color: 'var(--ink)' }}>
                  Thank you — your concern is with our moderators.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  We review every concern. Verified concerns are noted on the listing —
                  fairly, and without public finger-pointing.
                </p>
                <button onClick={() => setOpen(false)} className="btn-blue px-6 py-2.5 mt-5">Close</button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">
                  About <strong>{businessName}</strong>. Your concern is private — only
                  moderators see it. It is never posted as a public comment.
                </p>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>
                    What went wrong?
                  </label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus-ring"
                    style={{ borderColor: 'var(--cloud-grey)' }}>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>
                    What happened? <span className="font-normal text-gray-400">(the more detail, the fairer the review)</span>
                  </label>
                  <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4}
                    placeholder="Stick to the facts — dates, what was agreed, what happened…"
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus-ring resize-none"
                    style={{ borderColor: 'var(--cloud-grey)' }} />
                </div>
                {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">{error}</div>}
                <div className="flex gap-2">
                  <button onClick={() => setOpen(false)} className="btn-outline flex-1 py-3">Cancel</button>
                  <button onClick={submit} disabled={loading || signedIn === null}
                    className="btn-blue flex-1 py-3 disabled:opacity-60">
                    {loading ? 'Sending…' : 'Submit concern'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
