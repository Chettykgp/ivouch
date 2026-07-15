import Link from 'next/link'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { avatarColor, initials } from '@/lib/utils/avatar'
import BusinessSearch from '@/components/business/BusinessSearch'
import WithdrawVouchButton from '@/components/vouches/WithdrawVouchButton'
import ShareVouchButton from '@/components/business/ShareVouchButton'
import EditProfileForm from '@/components/profile/EditProfileForm'
import BusinessPhotoManager from '@/components/business/BusinessPhotoManager'
import BusinessEditForm from '@/components/business/BusinessEditForm'
import { businessUrl } from '@/lib/whatsapp/share'

export const dynamic = 'force-dynamic'

interface MyVouchRow {
  id: string
  created_at: string
  comment: string | null
  tags: string[] | null
  business: { name: string; slug: string } | null
}

interface MyBusinessRow {
  id: string
  name: string
  slug: string
  images: string[] | null
  status: string
  claimed_status: boolean
  owner_user_id: string | null
  created_by_user_id: string | null
  description: string | null
  phone: string | null
  whatsapp: string | null
  website: string | null
  address_text: string | null
  primary_category_id: string | null
  in_ward: boolean | null
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth?redirect=/profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, display_name, email, phone, home_community_id, home_community:home_community_id(name)')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const name =
    profile?.display_name ||
    profile?.first_name ||
    (user.user_metadata?.display_name as string) ||
    user.email?.split('@')[0] ||
    'You'

  let vouches: MyVouchRow[] = []
  let myBusinesses: MyBusinessRow[] = []
  if (profile?.id) {
    const [{ data: vData }, { data: oData }] = await Promise.all([
      supabase
        .from('vouches')
        .select('id, created_at, comment, tags, business:businesses(name, slug)')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
      supabase
        .from('businesses')
        .select('id, name, slug, images, status, claimed_status, owner_user_id, created_by_user_id, description, phone, whatsapp, website, address_text, primary_category_id, in_ward')
        .or(`created_by_user_id.eq.${profile.id},owner_user_id.eq.${profile.id}`)
        .order('created_at', { ascending: false }),
    ])
    vouches = (vData as unknown as MyVouchRow[]) ?? []
    // Dedupe (a business you both added and own).
    const seen = new Set<string>()
    myBusinesses = ((oData as MyBusinessRow[]) ?? []).filter((b) => {
      if (seen.has(b.id)) return false
      seen.add(b.id)
      return true
    })
  }

  const color = avatarColor(name)
  const homeCommunity = (profile?.home_community as { name?: string } | null)?.name

  return (
    <>
      <Header />
      <main className="flex-1" style={{ backgroundColor: 'var(--mist)' }}>
        <div className="page-hero py-12 px-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-black ring-4 ring-white flex-shrink-0"
              style={{ backgroundColor: color }}
            >
              {initials(name)}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold truncate" style={{ color: 'var(--ink)' }}>{name}</h1>
              <p className="text-sm text-gray-400 truncate">
                {homeCommunity ? `${homeCommunity} · ` : ''}
                {user.email}
              </p>
            </div>
            <div className="ml-auto flex-shrink-0">
              <EditProfileForm
                displayName={profile?.display_name ?? ''}
                firstName={profile?.first_name ?? ''}
                lastName={profile?.last_name ?? ''}
                phone={profile?.phone ?? ''}
              />
            </div>
          </div>
        </div>

        {/* Vouch for a business — search */}
        <div className="max-w-3xl mx-auto px-4 pt-8">
          <div className="card-soft p-5">
            <h2 className="text-lg font-extrabold mb-1" style={{ color: 'var(--ink)' }}>
              Vouch for a business
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Search a local business you&apos;ve used and vouch for them so your neighbours know.
            </p>
            <BusinessSearch action="vouch" />
          </div>
        </div>

        {/* My Businesses — manage listings you added or own */}
        {myBusinesses.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 pt-6">
            <div className="card-soft p-5">
              <h2 className="text-lg font-extrabold mb-1" style={{ color: 'var(--ink)' }}>
                My Businesses
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Manage the businesses you&apos;ve added or claimed — edit details, add photos, and
                share your link so happy customers can vouch for you.
              </p>
              <div className="space-y-4">
                {myBusinesses.map((b) => {
                  const owns = b.claimed_status && b.owner_user_id === profile?.id
                  const statusBadge =
                    b.status === 'active'
                      ? { label: 'Live', bg: 'var(--vouch-green)' }
                      : b.status === 'pending'
                        ? { label: 'Pending review', bg: 'var(--sunshine)' }
                        : { label: 'Hidden', bg: 'var(--coral)' }
                  return (
                    <div key={b.id} className="rounded-xl border p-4 space-y-3"
                      style={{ borderColor: 'var(--cloud-grey)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold truncate" style={{ color: 'var(--ink)' }}>{b.name}</div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                              style={{ backgroundColor: statusBadge.bg }}>
                              {statusBadge.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                              style={{ backgroundColor: 'var(--ivouch-blue-soft)', color: 'var(--ivouch-blue-dark)' }}>
                              {owns ? 'You own this' : 'Added by you'}
                            </span>
                          </div>
                        </div>
                        <ShareVouchButton
                          businessName={b.name}
                          slug={b.slug}
                          variant="icon"
                          message={`Happy with our service? Please vouch for us on iVouch: ${businessUrl(b.slug)} — thanks, ${b.name}`}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <BusinessEditForm business={b} />
                        {b.status === 'active' && (
                          <Link href={`/b/${b.slug}`} className="btn-outline px-3 py-2 text-xs">
                            View listing
                          </Link>
                        )}
                      </div>

                      <BusinessPhotoManager businessId={b.id} initialImages={b.images ?? []} compact />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 py-8" id="vouches">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--ink)' }}>
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
                    <span className="font-semibold" style={{ color: 'var(--ink)' }}>
                      🫶 You vouched for{' '}
                      <span style={{ color: 'var(--ivouch-blue)' }}>
                        {v.business?.name ?? 'a business'}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-3 whitespace-nowrap">
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                      </span>
                      <WithdrawVouchButton vouchId={v.id} businessName={v.business?.name ?? 'this business'} />
                    </span>
                  </div>
                  {v.comment && <p className="text-sm text-gray-600 mt-1">&ldquo;{v.comment}&rdquo;</p>}
                  {v.tags && v.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {v.tags.map((t) => (
                        <span key={t} className="chip chip-blue">
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
              <p className="font-semibold" style={{ color: 'var(--ink)' }}>
                You haven&apos;t vouched for anyone yet.
              </p>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Know a great local business? Let your neighbours know.
              </p>
              <Link href="/c/jhb-south-ward-23" className="btn-blue inline-flex px-6 py-2.5">
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
