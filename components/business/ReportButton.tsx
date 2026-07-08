'use client'

import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ReportButtonProps {
  targetType: 'business' | 'vouch' | 'claim'
  targetId: string
}

const REASONS = [
  'Wrong or outdated contact details',
  'Not a real business',
  'Inappropriate or offensive',
  'Duplicate listing',
  'Should be removed',
  'Other',
]

export default function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState(REASONS[0])
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.rpc('submit_report', {
      p_target_type: targetType,
      p_target_id: targetId,
      p_reason: reason,
      p_details: details,
    })
    setLoading(false)
    if (err) setError(err.message)
    else {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'new_report', reason }),
      }).catch(() => {})
      setDone(true)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hover:text-red-500 inline-flex items-center gap-1"
      >
        <AlertCircle size={12} /> Report
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(11,31,78,0.45)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold" style={{ color: 'var(--ink)' }}>
                Report this listing
              </h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {done ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🙏</div>
                <p className="font-semibold" style={{ color: 'var(--ink)' }}>Thanks — we&apos;ll review this.</p>
                <p className="text-sm text-gray-500 mt-1">Our team looks at every report.</p>
                <button onClick={() => setOpen(false)} className="btn-blue px-6 py-2.5 mt-5">Close</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus-ring"
                    style={{ borderColor: 'var(--cloud-grey)' }}
                  >
                    {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>
                    Details <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                    placeholder="Anything that helps us review…"
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus-ring resize-none"
                    style={{ borderColor: 'var(--cloud-grey)' }}
                  />
                </div>
                {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">{error}</div>}
                <div className="flex gap-2">
                  <button onClick={() => setOpen(false)} className="btn-outline flex-1 py-3">Cancel</button>
                  <button onClick={submit} disabled={loading} className="btn-blue flex-1 py-3 disabled:opacity-60">
                    {loading ? 'Sending…' : 'Submit report'}
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
