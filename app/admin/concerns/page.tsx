import { formatDistanceToNow } from 'date-fns'
import { getAllConcernsAdmin } from '@/lib/data/concerns'

async function updateConcernStatus(id: string, status: string) {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  await supabase.from('concerns').update({ status }).eq('id', id)
}

const CATEGORY_LABELS: Record<string, string> = {
  no_show: "Didn't show up",
  poor_workmanship: 'Poor workmanship',
  overcharging: 'Overcharging',
  unprofessional: 'Unprofessional',
  safety: 'Safety concern',
  other: 'Other',
}

const STATUS_COLORS: Record<string, string> = {
  open: 'var(--sunshine)',
  reviewed: 'var(--coral)',
  resolved: 'var(--vouch-green)',
  dismissed: '#aaa',
}

export default async function AdminConcernsPage() {
  const concerns = await getAllConcernsAdmin()

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--ink)' }}>Concerns</h1>
      <p className="text-sm text-gray-500 mb-6">
        Private community concerns. Mark <strong>Verified</strong> to show the public
        &ldquo;concerns noted&rdquo; notice on the listing; <strong>Resolve</strong> or{' '}
        <strong>Dismiss</strong> to clear it.
      </p>

      <div className="space-y-3">
        {concerns.map((c) => (
          <div key={c.id} className="card-soft p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm" style={{ color: 'var(--ink)' }}>
                    {c.business?.name ?? 'Unknown business'}
                  </span>
                  <span className="chip">{CATEGORY_LABELS[c.category] ?? c.category}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: STATUS_COLORS[c.status] ?? '#aaa' }}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  From {c.profile?.display_name ?? c.profile?.first_name ?? 'a neighbour'}
                  {c.profile?.email ? ` (${c.profile.email})` : ''} ·{' '}
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </p>
                {c.details && <p className="text-sm text-gray-600 mt-2">&ldquo;{c.details}&rdquo;</p>}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {c.status !== 'reviewed' && (
                  <form action={async () => { 'use server'; await updateConcernStatus(c.id, 'reviewed') }}>
                    <button className="text-xs px-2.5 py-1.5 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--coral)' }}>
                      Verify
                    </button>
                  </form>
                )}
                {c.status !== 'resolved' && (
                  <form action={async () => { 'use server'; await updateConcernStatus(c.id, 'resolved') }}>
                    <button className="text-xs px-2.5 py-1.5 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--vouch-green)' }}>
                      Resolve
                    </button>
                  </form>
                )}
                {c.status !== 'dismissed' && (
                  <form action={async () => { 'use server'; await updateConcernStatus(c.id, 'dismissed') }}>
                    <button className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-200 font-medium text-gray-600">
                      Dismiss
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {concerns.length === 0 && (
        <div className="card-soft text-center py-14 text-gray-400">
          No concerns raised — a happy ward. 🎉
        </div>
      )}
    </div>
  )
}
