import { createClient } from '@/lib/supabase/server'
import type { Claim } from '@/types'

export default async function AdminClaimsPage() {
  const supabase = await createClient()
  const { data: claims } = await supabase
    .from('claims')
    .select('*, business:businesses(name, slug)')
    .order('created_at', { ascending: false })

  async function updateClaim(id: string, status: string) {
    'use server'
    const { createClient: sc } = await import('@/lib/supabase/server')
    const s = await sc()
    await s.from('claims').update({ status, reviewed_at: new Date().toISOString() }).eq('id', id)
  }

  return (
    <div>
      <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--ink)' }}>Business Claims</h1>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--cloud-grey)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--cloud-grey)' }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--ink)' }}>Business</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell" style={{ color: 'var(--ink)' }}>Claimant</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--ink)' }}>Status</th>
              <th className="text-left px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(claims ?? []).map((c: Claim & { business?: { name: string } }) => (
              <tr key={c.id} className="border-t" style={{ borderColor: 'var(--cloud-grey)' }}>
                <td className="px-4 py-3">
                  <div className="font-medium" style={{ color: 'var(--ink)' }}>{c.business?.name ?? '—'}</div>
                  <div className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('en-ZA')}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div>{c.claimant_name}</div>
                  <div className="text-xs text-gray-400">{c.claimant_email}</div>
                  {c.evidence_text && (
                    <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">{c.evidence_text}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: c.status === 'pending' ? 'var(--sunshine)' : c.status === 'approved' ? 'var(--vouch-green)' : 'var(--coral)' }}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {c.status === 'pending' && (
                    <div className="flex gap-2">
                      <form action={async () => { 'use server'; await updateClaim(c.id, 'approved') }}>
                        <button className="text-xs px-2.5 py-1.5 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--vouch-green)' }}>
                          Approve
                        </button>
                      </form>
                      <form action={async () => { 'use server'; await updateClaim(c.id, 'rejected') }}>
                        <button className="text-xs px-2.5 py-1.5 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--coral)' }}>
                          Reject
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!claims || claims.length === 0) && (
          <div className="text-center py-12 text-gray-400">No claims found.</div>
        )}
      </div>
    </div>
  )
}
