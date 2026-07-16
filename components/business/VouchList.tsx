'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ChevronDown, MessageCircleHeart, X } from 'lucide-react'
import { avatarColor, initials } from '@/lib/utils/avatar'

export interface VouchListItem {
  id: string
  created_at: string
  comment: string | null
  tags: string[] | null
  neighbourhood: string | null
  owner_reply: string | null
  voucherName: string
}

const INITIAL_SHOWN = 8

export default function VouchList({
  vouches,
  businessName,
  canReply,
}: {
  vouches: VouchListItem[]
  businessName: string
  canReply: boolean
}) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? vouches : vouches.slice(0, INITIAL_SHOWN)
  const hidden = vouches.length - INITIAL_SHOWN

  return (
    <div className="space-y-3">
      {visible.map((v) => (
        <VouchCard key={v.id} vouch={v} businessName={businessName} canReply={canReply} />
      ))}
      {!showAll && hidden > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full card-soft p-3.5 flex items-center justify-center gap-2 text-sm font-semibold transition-colors hover:border-[var(--ivouch-blue)]"
          style={{ color: 'var(--ivouch-blue)' }}
        >
          Show all {vouches.length} vouches <ChevronDown size={16} />
        </button>
      )}
    </div>
  )
}

function VouchCard({
  vouch: v,
  businessName,
  canReply,
}: {
  vouch: VouchListItem
  businessName: string
  canReply: boolean
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(v.owner_reply ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const color = avatarColor(v.voucherName + (v.neighbourhood ?? ''))

  async function saveReply() {
    setBusy(true)
    setError(null)
    const res = await fetch(`/api/vouch/${v.id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: draft }),
    })
    const json = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) { setError(json.error ?? 'Could not save reply'); return }
    setEditing(false)
    router.refresh()
  }

  async function removeReply() {
    setBusy(true)
    const res = await fetch(`/api/vouch/${v.id}/reply`, { method: 'DELETE' })
    setBusy(false)
    if (res.ok) { setDraft(''); setEditing(false); router.refresh() }
  }

  return (
    <div className="card-soft p-4">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {initials(v.voucherName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
              🫶 {v.voucherName}
            </span>
            {v.neighbourhood && <span className="chip">{v.neighbourhood}</span>}
            <span className="text-xs text-gray-400 ml-auto">
              {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
            </span>
          </div>
          {v.comment && <p className="text-sm text-gray-600 mt-1.5">&ldquo;{v.comment}&rdquo;</p>}
          {v.tags && v.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {v.tags.map((t) => (
                <span key={t} className="chip chip-blue">{t}</span>
              ))}
            </div>
          )}

          {/* Owner response */}
          {v.owner_reply && !editing && (
            <div className="mt-3 rounded-xl px-3.5 py-2.5 text-sm"
              style={{ backgroundColor: 'var(--mist)' }}>
              <div className="flex items-center gap-1.5 text-xs font-semibold mb-0.5" style={{ color: 'var(--ivouch-blue)' }}>
                <MessageCircleHeart size={13} /> Response from {businessName}
                {canReply && (
                  <span className="ml-auto flex gap-2">
                    <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-[var(--ivouch-blue)]">Edit</button>
                    <button onClick={removeReply} disabled={busy} className="text-gray-400 hover:text-[var(--coral)]" aria-label="Remove response"><X size={13} /></button>
                  </span>
                )}
              </div>
              <p className="text-gray-600">{v.owner_reply}</p>
            </div>
          )}

          {/* Owner reply affordance */}
          {canReply && !v.owner_reply && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:opacity-80"
              style={{ color: 'var(--ivouch-blue)' }}
            >
              <MessageCircleHeart size={14} /> Say thanks
            </button>
          )}
          {canReply && editing && (
            <div className="mt-3 space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 300))}
                rows={2}
                autoFocus
                placeholder={`Thank ${v.voucherName} for the vouch…`}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus-ring resize-none"
                style={{ borderColor: 'var(--cloud-grey)' }}
              />
              {error && <div className="text-xs text-red-600">{error}</div>}
              <div className="flex items-center gap-2">
                <button onClick={saveReply} disabled={busy || !draft.trim()}
                  className="btn-blue px-4 py-2 text-xs disabled:opacity-60">
                  {busy ? 'Saving…' : 'Post response'}
                </button>
                <button onClick={() => { setEditing(false); setDraft(v.owner_reply ?? '') }}
                  className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                <span className="text-[11px] text-gray-300 ml-auto">{draft.length}/300</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
