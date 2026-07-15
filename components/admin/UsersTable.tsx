'use client'

import { useMemo, useState } from 'react'
import { Search, BadgeCheck, ShieldCheck, Store, Heart } from 'lucide-react'
import { avatarColor, initials } from '@/lib/utils/avatar'

export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  role: string
  verified: boolean
  inWard: boolean
  isDemo: boolean
  vouches: number
  businesses: number
  createdAt: string
}

type Filter = 'all' | 'residents' | 'pending' | 'admins'

export default function UsersTable({
  users,
  setResidency,
}: {
  users: AdminUser[]
  setResidency: (profileId: string, verified: boolean) => Promise<void>
}) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [showDemo, setShowDemo] = useState(false)

  const real = useMemo(() => users.filter((u) => showDemo || !u.isDemo), [users, showDemo])

  const counts = useMemo(() => ({
    all: real.length,
    residents: real.filter((u) => u.verified).length,
    pending: real.filter((u) => !u.verified).length,
    admins: real.filter((u) => u.role === 'admin').length,
  }), [real])

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return real.filter((u) => {
      if (filter === 'residents' && !u.verified) return false
      if (filter === 'pending' && u.verified) return false
      if (filter === 'admins' && u.role !== 'admin') return false
      if (needle && !`${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(needle)) return false
      return true
    })
  }, [real, filter, q])

  const chips: { key: Filter; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'residents', label: `Residents (${counts.residents})` },
    { key: 'pending', label: `Unverified (${counts.pending})` },
    { key: 'admins', label: `Admins (${counts.admins})` },
  ]

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email or phone…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus-ring"
            style={{ borderColor: 'var(--cloud-grey)' }}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
          <input type="checkbox" checked={showDemo} onChange={(e) => setShowDemo(e.target.checked)} />
          Show demo accounts
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className="px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors"
            style={
              filter === c.key
                ? { backgroundColor: 'var(--ivouch-blue)', color: '#fff', borderColor: 'var(--ivouch-blue)' }
                : { backgroundColor: '#fff', color: 'var(--ink)', borderColor: 'var(--cloud-grey)' }
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-x-auto" style={{ borderColor: 'var(--cloud-grey)' }}>
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr style={{ backgroundColor: 'var(--cloud-grey)' }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--ink)' }}>Member</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--ink)' }}>Contact</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--ink)' }}>Activity</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--ink)' }}>Residency</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: 'var(--ink)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t align-top" style={{ borderColor: 'var(--cloud-grey)' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                      style={{ backgroundColor: avatarColor(u.name) }}>
                      {initials(u.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium flex items-center gap-1.5" style={{ color: 'var(--ink)' }}>
                        <span className="truncate">{u.name}</span>
                        {u.role === 'admin' && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ backgroundColor: 'var(--ivouch-blue-soft)', color: 'var(--ivouch-blue-dark)' }}>
                            <ShieldCheck size={10} /> Admin
                          </span>
                        )}
                        {u.isDemo && <span className="text-[10px] text-gray-400">demo</span>}
                      </div>
                      <div className="text-xs text-gray-400">
                        Joined {new Date(u.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-600 truncate max-w-[220px]">{u.email || '—'}</div>
                  {u.phone && <div className="text-xs text-gray-400">{u.phone}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><Heart size={12} /> {u.vouches}</span>
                    <span className="inline-flex items-center gap-1"><Store size={12} /> {u.businesses}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {u.verified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: 'var(--vouch-green)' }}>
                      <BadgeCheck size={12} /> Resident
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: 'var(--cloud-grey)', color: 'var(--ink)' }}>
                      Unverified
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.verified ? (
                    <form action={setResidency.bind(null, u.id, false)}>
                      <button className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                        Revoke
                      </button>
                    </form>
                  ) : (
                    <form action={setResidency.bind(null, u.id, true)}>
                      <button className="text-xs px-2.5 py-1.5 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: 'var(--vouch-green)' }}>
                        Confirm resident
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="text-center py-12 text-gray-400">No users match.</div>
        )}
      </div>
    </div>
  )
}
