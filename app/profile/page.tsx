import Link from 'next/link'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { avatarColor, initials } from '@/lib/utils/avatar'

export const dynamic = 'force-dynamic'

interface MyVouchRow {
  id: string
  created_at: string
  comment: string | null
  tags: string[] | null
  business: { name: string; slug: string } | null
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth?redirect=/profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, display_name, email, home_community:home_community_id(name)')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const name =
    profile?.display_name ||
    profile?.first_name ||
    (user.user_metadata?.display_name as string) ||
    user.email?.split('@')[0] ||
    'You'

  let vouches: MyVouchRow[] = []
  if (profile?.id) {
    const { data } = await supabase
      .from('vouches')
      .select('id, created_at, comment, tags, business:businesses(name, slug)')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    vouches = (data as unknown as MyVouchRow[]) ?? []
  }

  const color = avatarColor(name)
  const homeCommunity = (profile?.home_community as { name?: string } | null)?.name

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="hero-navy py-12 px-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-black ring-4 ring-white/10"
              style={{ backgroundColor: color }}
            >
              {initials(name)}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{name}</h1>
              <p className="text-white/60 text-sm">
                {homeCommunity ? `${homeCommunity} · ` : ''}
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8" id="vouches">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--charcoal)' }}>
            My Vouches ({vouches.length})
          </h2>

          {vouches.length > 0 ? (
            <div className="space-y-3">
              {vouches.map((v) => (
                <Link
                  key={v.id}
                  href={v.business?.slug ? `/b/${v.business.slug}` : '#'}
                  className="card-soft card-hover block p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold" style={{ color: 'var(--charcoal)' }}>
                      🫶 You vouched for{' '}
                      <span style={{ color: 'var(--vouch-green)' }}>
                        {v.business?.name ?? 'a business'}
                      </span>
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {v.comment && <p className="text-sm text-gray-600 mt-1">&ldquo;{v.comment}&rdquo;</p>}
                  {v.tags && v.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {v.tags.map((t) => (
                        <span key={t} className="chip chip-green">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="card-soft p-8 text-center">
              <div className="text-4xl mb-3">🫶</div>
              <p className="font-semibold" style={{ color: 'var(--charcoal)' }}>
                You haven&apos;t vouched for anyone yet.
              </p>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Know a great local business? Let your neighbours know.
              </p>
              <Link href="/c/jhb-south-ward-23" className="btn-vouch inline-block px-6 py-2.5">
                Browse businesses
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
