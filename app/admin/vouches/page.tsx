import { createClient } from '@/lib/supabase/server'
import type { Vouch } from '@/types'

export default async function AdminVouchesPage() {
  const supabase = await createClient()
  const { data: vouches } = await supabase
    .from('vouches')
    .select('*, business:businesses(name), profile:profiles(display_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  async function updateVouch(id: string, status: string) {
    'use server'
    const { createClient: sc } = await import('@/lib/supabase/server')
    const s = await sc()
    await s.from('vouches').update({ status }).eq('id', id)
  }

  const statusColors: Record<string, string> = {
    active: 'var(--vouch-green)',
    pending: 'var(--sunshine)',
    hidden: '#aaa',
    flagged: 'var(--coral)',
  }

  return (
    <div>
      <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--charcoal)' }}>Vouches</h1>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--cloud-grey)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--cloud-grey)' }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--charcoal)' }}>Business</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell" style={{ color: 'var(--charcoal)' }}>By</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell" style={{ color: 'var(--charcoal)' }}>Comment</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--charcoal)' }}>Status</th>
              <th className="text-left px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(vouches ?? []).map((v: Vouch & { business?: { name: string }; profile?: { display_name?: string } }) => (
              <tr key={v.id} className="border-t" style={{ borderColor: 'var(--cloud-grey)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--charcoal)' }}>
                  {v.business?.name ?? '—'}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                  {v.profile?.display_name ?? '—'}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-500 max-w-xs truncate">
                  {v.comment ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: statusColors[v.status] ?? '#aaa' }}
                  >
                    {v.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {v.status !== 'hidden' && (
                      <form action={async () => { 'use server'; await updateVouch(v.id, 'hidden') }}>
                        <button className="text-xs px-2 py-1 rounded bg-gray-200 font-medium text-gray-600">Hide</button>
                      </form>
                    )}
                    {v.status !== 'flagged' && (
                      <form action={async () => { 'use server'; await updateVouch(v.id, 'flagged') }}>
                        <button className="text-xs px-2 py-1 rounded text-white font-medium" style={{ backgroundColor: 'var(--coral)' }}>Flag</button>
                      </form>
                    )}
                    {v.status !== 'active' && (
                      <form action={async () => { 'use server'; await updateVouch(v.id, 'active') }}>
                        <button className="text-xs px-2 py-1 rounded text-white font-medium" style={{ backgroundColor: 'var(--vouch-green)' }}>Activate</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!vouches || vouches.length === 0) && (
          <div className="text-center py-12 text-gray-400">No vouches found.</div>
        )}
      </div>
    </div>
  )
}
