import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Logo from '@/components/layout/Logo'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth?redirect=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/?error=unauthorized')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--mist)' }}>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b" style={{ borderColor: 'var(--cloud-grey)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <Logo href="/admin" />
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--ivouch-blue-soft)', color: 'var(--ivouch-blue-dark)' }}>
                Admin
              </span>
            </div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-[var(--ivouch-blue)] transition-colors">
              <ArrowLeft size={15} /> Back to site
            </Link>
          </div>
          <div className="pb-2 -mt-1">
            <AdminNav />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
