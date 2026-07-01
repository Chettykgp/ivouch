import { createClient } from '@/lib/supabase/server'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div>
      <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--charcoal)' }}>Categories</h1>
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--cloud-grey)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--cloud-grey)' }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--charcoal)' }}>Icon</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--charcoal)' }}>Name</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--charcoal)' }}>Slug</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--charcoal)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(categories ?? []).map((c) => (
              <tr key={c.id} className="border-t" style={{ borderColor: 'var(--cloud-grey)' }}>
                <td className="px-4 py-3 text-2xl">{c.icon}</td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--charcoal)' }}>{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: c.status === 'active' ? 'var(--vouch-green)' : '#aaa' }}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!categories || categories.length === 0) && (
          <div className="text-center py-12 text-gray-400">No categories found. Run the seed SQL.</div>
        )}
      </div>
    </div>
  )
}
