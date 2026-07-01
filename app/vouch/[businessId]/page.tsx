'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'
import type { Business } from '@/types'

const VOUCH_TAGS = ['Reliable', 'Fair price', 'Good workmanship', 'Fast response', 'Friendly', 'Professional', 'Would use again']

const COMMUNITIES = [
  { name: 'Glenvista', slug: 'glenvista' },
  { name: 'Bassonia', slug: 'bassonia' },
  { name: 'Mondeor', slug: 'mondeor' },
  { name: 'Mulbarton', slug: 'mulbarton' },
  { name: 'Lenasia', slug: 'lenasia' },
  { name: 'Alberton', slug: 'alberton' },
]

export default function VouchPage() {
  const params = useParams()
  const businessId = params.businessId as string
  const router = useRouter()
  const supabase = createClient()

  const [business, setBusiness] = useState<Business | null>(null)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [profile, setProfile] = useState<{ id: string } | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [community, setCommunity] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      if (u) {
        const { data: p } = await supabase.from('profiles').select('id').eq('auth_user_id', u.id).single()
        setProfile(p)
      }
      const { data: b } = await supabase.from('businesses').select('*, primary_category:categories(*)').eq('id', businessId).single()
      setBusiness(b)
    }
    load()
  }, [businessId])

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !profile) { router.push(`/auth?redirect=/vouch/${businessId}`); return }
    if (!community) { setError('Please select your community.'); return }
    setLoading(true)
    setError(null)

    // Get community ID
    const { data: comm } = await supabase.from('communities').select('id').eq('slug', community).single()
    if (!comm) { setError('Community not found.'); setLoading(false); return }

    const { error: vErr } = await supabase.from('vouches').insert({
      business_id: businessId,
      user_id: profile.id,
      community_id: comm.id,
      tags: selectedTags,
      comment: comment || null,
      status: 'active',
    })

    if (vErr) {
      if (vErr.code === '23505') {
        setError('You have already vouched for this business.')
      } else {
        setError(vErr.message)
      }
    } else {
      setSubmitted(true)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">❤️</div>
            <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--charcoal)' }}>Thanks for vouching!</h1>
            <p className="text-gray-500 mb-6">Your community trusts your recommendation.</p>
            <Link
              href={`/b/${business?.slug}`}
              className="px-6 py-3 rounded-xl font-bold text-white inline-block"
              style={{ backgroundColor: 'var(--vouch-green)' }}
            >
              View Business Profile
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-sm">
            <div className="text-4xl mb-4">🔐</div>
            <h1 className="text-xl font-bold mb-3" style={{ color: 'var(--charcoal)' }}>Sign in to vouch</h1>
            <p className="text-gray-500 mb-6 text-sm">You need to be signed in to vouch for a business.</p>
            <Link
              href={`/auth?redirect=/vouch/${businessId}`}
              className="px-6 py-3 rounded-xl font-bold text-white inline-block"
              style={{ backgroundColor: 'var(--vouch-green)' }}
            >
              Sign In / Register
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-10">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--charcoal)' }}>
              Vouch for {business?.name ?? '...'}
            </h1>
            <p className="text-gray-500 text-sm">Would you recommend this business to a neighbour?</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--charcoal)' }}>
                What would you say about them? (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {VOUCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
                    style={
                      selectedTags.includes(tag)
                        ? { backgroundColor: 'var(--vouch-green)', color: 'white', borderColor: 'var(--vouch-green)' }
                        : { backgroundColor: 'white', color: 'var(--charcoal)', borderColor: 'var(--cloud-grey)' }
                    }
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Community */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--charcoal)' }}>
                Your community *
              </label>
              <select
                required
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: 'var(--cloud-grey)' }}
              >
                <option value="">Select your area...</option>
                {COMMUNITIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--charcoal)' }}>
                Add a comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Tell your neighbours why you recommend them..."
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none"
                style={{ borderColor: 'var(--cloud-grey)' }}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white text-lg transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: 'var(--vouch-green)' }}
            >
              {loading ? 'Submitting...' : '❤️ Yes, I vouch for them'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
