import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Business } from '@/types'

async function updateBusinessStatus(id: string, status: string) {
  'use server'
  const { createClient: createSC } = await import('@/lib/supabase/server')
  const supabase = await createSC()
  const { data: biz, error } = await supabase
    .from('businesses')
    .update({ status })
    .eq('id', id)
    .select('name, slug, email')
    .single()

  if (error) {
    console.error('[admin] updateBusinessStatus failed:', error.message)
    return
  }

  // Congratulate the owner when their listing goes live (if we have an email).
  if (status === 'active' && biz?.email) {
    const { sendEmail, businessApprovedEmail } = await import('@/lib/email')
    await sendEmail(businessApprovedEmail(biz.email, biz.name, biz.slug))
  }

  revalidatePath('/admin/businesses')
  revalidatePath('/admin')
}

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('businesses')
    .select('*, primary_category:categories(name, icon)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data: businesses } = await query

  const statusColors: Record<string, string> = {
    pending: 'var(--sunshine)',
    active: 'var(--vouch-green)',
    hidden: '#aaa',
    rejected: 'var(--coral)',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black" style={{ color: 'var(--ink)' }}>Businesses</h1>
        <div className="flex gap-2 text-sm">
          {['', 'pending', 'active', 'hidden', 'rejected'].map((s) => (
            <a
              key={s}
              href={s ? `/admin/businesses?status=${s}` : '/admin/businesses'}
              className="px-3 py-1.5 rounded-lg border"
              style={
                status === s || (!status && !s)
                  ? { backgroundColor: 'var(--ivouch-blue)', color: 'white', borderColor: 'var(--ivouch-blue)' }
                  : { backgroundColor: 'white', color: 'var(--ink)', borderColor: 'var(--cloud-grey)' }
              }
            >
              {s || 'All'}
            </a>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--cloud-grey)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--cloud-grey)' }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--ink)' }}>Business</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell" style={{ color: 'var(--ink)' }}>Category</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--ink)' }}>Status</th>
              <th className="text-left px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(businesses ?? []).map((b: Business & { primary_category?: { name: string; icon?: string } }) => (
              <tr key={b.id} className="border-t" style={{ borderColor: 'var(--cloud-grey)' }}>
                <td className="px-4 py-3">
                  <div className="font-medium" style={{ color: 'var(--ink)' }}>{b.name}</div>
                  <div className="text-xs text-gray-400">{b.phone}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                  {b.primary_category?.icon} {b.primary_category?.name ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: statusColors[b.status] ?? '#aaa' }}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {b.status !== 'active' && (
                      <form action={async () => { 'use server'; await updateBusinessStatus(b.id, 'active') }}>
                        <button className="text-xs px-2.5 py-1.5 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--vouch-green)' }}>
                          Approve
                        </button>
                      </form>
                    )}
                    {b.status !== 'rejected' && (
                      <form action={async () => { 'use server'; await updateBusinessStatus(b.id, 'rejected') }}>
                        <button className="text-xs px-2.5 py-1.5 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--coral)' }}>
                          Reject
                        </button>
                      </form>
                    )}
                    {b.status !== 'hidden' && (
                      <form action={async () => { 'use server'; await updateBusinessStatus(b.id, 'hidden') }}>
                        <button className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-200 font-medium text-gray-600">
                          Hide
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!businesses || businesses.length === 0) && (
          <div className="text-center py-12 text-gray-400">No businesses found.</div>
        )}
      </div>
    </div>
  )
}
