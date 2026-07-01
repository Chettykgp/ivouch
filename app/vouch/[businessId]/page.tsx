'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'
import { avatarColor, initials } from '@/lib/utils/avatar'
import type { Business } from '@/types'

const VOUCH_TAGS = [
  'Reliable',
  'Fair price',
  'Good workmanship',
  'Fast response',
  'Friendly',
  'Professional',
  'Would use again',
]

const WARD_SLUG = 'jhb-south-ward-23'

// Neighbourhoods of Ward 23 — optional / informational.
const NEIGHBOURHOODS = [
  'Glenvista',
  'Bassonia',
  'Mulbarton',
  'Glenanda',
  'Liefde en Vrede',
  'Mayfield Park',
  'Rispark',
  'South View',
]

export default function VouchPage() {
  const params = useParams()
  const businessId = params.businessId as string
  const router = useRouter()
  const supabase = createClient()

  const [business, setBusiness] = useState<Business | null>(null)
  const [checked, setChecked] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [wardId, setWardId] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [neighbourhood, setNeighbourhood] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const {
        data: { user: u },
      } = await supabase.auth.getUser()
      setUser(u ? { id: u.id } : null)
      if (u) {
        const { data: p } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', u.id)
          .maybeSingle()
        setProfileId(p?.id ?? null)
      }
      const [{ data: b }, { data: ward }] = await Promise.all([
        supabase
          .from('businesses')
          .select('*, primary_category:categories(*)')
          .eq('id', businessId)
          .maybeSingle(),
        supabase.from('communities').select('id').eq('slug', WARD_SLUG).maybeSingle(),
      ])
      setBusiness(b as Business | null)
      setWardId(ward?.id ?? null)
      setChecked(true)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId])

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !profileId) {
      router.push(`/auth?redirect=/vouch/${businessId}`)
      return
    }
    if (!wardId) {
      setError('Community not found. Please try again shortly.')
      return
    }
    setLoading(true)
    setError(null)

    // Fold the (optional) neighbourhood into the comment so it stays visible,
    // while community_id is always the single Ward 23 community.
    const parts: string[] = []
    if (comment.trim()) parts.push(comment.trim())
    const finalComment = parts.length > 0 ? parts.join(' ') : null

    const { error: vErr } = await supabase.from('vouches').insert({
      business_id: businessId,
      user_id: profileId,
      community_id: wardId,
      tags: selectedTags,
      comment: finalComment,
      status: 'active',
    })

    if (vErr) {
      if (vErr.code === '23505') setError('You have already vouched for this business.')
      else setError(vErr.message)
      setLoading(false)
      return
    }

    // Success — go to the business profile with a success flag.
    router.push(`/b/${business?.slug ?? ''}?vouched=1`)
    router.refresh()
  }

  // --- Loading ---
  if (!checked) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg space-y-4">
            <div className="h-8 w-2/3 skeleton mx-auto" />
            <div className="h-40 skeleton" />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // --- Signed out ---
  if (!user) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-sm">
            <div className="text-4xl mb-4">🔐</div>
            <h1 className="text-xl font-bold mb-3" style={{ color: 'var(--charcoal)' }}>
              Sign in to vouch
            </h1>
            <p className="text-gray-500 mb-6 text-sm">
              A vouch comes from a real neighbour — sign in so yours counts.
            </p>
            <Link
              href={`/auth?redirect=/vouch/${businessId}`}
              className="btn-vouch inline-block px-6 py-3"
            >
              Sign In / Register
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const bizName = business?.name ?? 'this business'
  const color = avatarColor(bizName)

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-10">
        <div className="max-w-lg mx-auto animate-fade-up">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-lg"
              style={{ backgroundColor: color }}
            >
              {business?.primary_category?.icon ?? initials(bizName)}
            </div>
            <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--charcoal)' }}>
              Vouch for {bizName}
            </h1>
            <p className="text-gray-500 text-sm">
              Would you recommend them to a neighbour in Ward 23?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card-soft p-6 space-y-6">
            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--charcoal)' }}>
                What are they great at? (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {VOUCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                    style={
                      selectedTags.includes(tag)
                        ? {
                            backgroundColor: 'var(--vouch-green)',
                            color: 'white',
                            borderColor: 'var(--vouch-green)',
                          }
                        : {
                            backgroundColor: 'white',
                            color: 'var(--charcoal)',
                            borderColor: 'var(--cloud-grey)',
                          }
                    }
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Neighbourhood — optional / informational */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--charcoal)' }}>
                Which part of Ward 23 are you in?{' '}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <select
                value={neighbourhood}
                onChange={(e) => setNeighbourhood(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus-ring"
                style={{ borderColor: 'var(--cloud-grey)' }}
              >
                <option value="">Prefer not to say</option>
                {NEIGHBOURHOODS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--charcoal)' }}>
                Add a comment <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Tell your neighbours why you recommend them…"
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus-ring resize-none"
                style={{ borderColor: 'var(--cloud-grey)' }}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-vouch w-full py-4 text-lg disabled:opacity-60"
            >
              <Heart size={20} fill="currentColor" />
              {loading ? 'Submitting…' : 'Yes, I vouch for them'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
