'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface EditProfileFormProps {
  displayName: string
  firstName: string
  lastName: string
  phone: string
}

export default function EditProfileForm({ displayName, firstName, lastName, phone }: EditProfileFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ displayName, firstName, lastName, phone })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You are not signed in.'); setLoading(false); return }

    const display = form.displayName.trim() || form.firstName.trim() || null

    // Keep the auth metadata in sync so the header/menu update too.
    await supabase.auth.updateUser({ data: { display_name: display } })

    const { error: upErr } = await supabase
      .from('profiles')
      .update({
        display_name: display,
        first_name: form.firstName.trim() || null,
        last_name: form.lastName.trim() || null,
        phone: form.phone.trim() || null,
      })
      .eq('auth_user_id', user.id)

    setLoading(false)
    if (upErr) { setError(upErr.message); return }
    setOpen(false)
    router.refresh()
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus-ring'
  const inputStyle = { borderColor: 'var(--cloud-grey)' as const }
  const labelClass = 'block text-sm font-semibold mb-1.5'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-outline px-4 py-2 text-sm whitespace-nowrap"
      >
        <Pencil size={14} /> Edit profile
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(11,31,78,0.45)' }} onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold" style={{ color: 'var(--ink)' }}>Edit profile</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={save} className="space-y-4">
              <div>
                <label className={labelClass} style={{ color: 'var(--ink)' }}>
                  Display name <span className="font-normal text-gray-400">(how neighbours see you)</span>
                </label>
                <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="e.g. Kevan C." className={inputClass} style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ color: 'var(--ink)' }}>First name</label>
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className={labelClass} style={{ color: 'var(--ink)' }}>Last name</label>
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className={inputClass} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className={labelClass} style={{ color: 'var(--ink)' }}>
                  Phone <span className="font-normal text-gray-400">(private — not shown publicly)</span>
                </label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="082 xxx xxxx" className={inputClass} style={inputStyle} />
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">{error}</div>}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn-outline flex-1 py-3">Cancel</button>
                <button type="submit" disabled={loading} className="btn-blue flex-1 py-3 disabled:opacity-60">
                  {loading ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
