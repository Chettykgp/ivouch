import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth?redirect=/admin')

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/?error=unauthorized')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cloud-grey)' }}>
      <nav style={{ backgroundColor: 'var(--navy)' }} className="px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <Link href="/admin" className="text-white font-black text-xl">
            i<span style={{ color: 'var(--vouch-green)' }}>Vouch</span>
            <span className="text-xs ml-2 opacity-60 font-normal">Admin</span>
          </Link>
          <div className="flex gap-4 text-sm text-white/70">
            <Link href="/admin/businesses" className="hover:text-white">Businesses</Link>
            <Link href="/admin/claims" className="hover:text-white">Claims</Link>
            <Link href="/admin/vouches" className="hover:text-white">Vouches</Link>
            <Link href="/admin/communities" className="hover:text-white">Communities</Link>
            <Link href="/admin/categories" className="hover:text-white">Categories</Link>
          </div>
          <Link href="/" className="ml-auto text-white/60 hover:text-white text-sm">← Site</Link>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
