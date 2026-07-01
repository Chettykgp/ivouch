'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils/slugify'

const CATEGORIES = [
  { name: 'Plumber', slug: 'plumber' },
  { name: 'Electrician', slug: 'electrician' },
  { name: 'Mechanic', slug: 'mechanic' },
  { name: 'Tutor', slug: 'tutor' },
  { name: 'Gardener', slug: 'gardener' },
  { name: 'Domestic Worker', slug: 'domestic-worker' },
  { name: 'DJ', slug: 'dj' },
  { name: 'Photographer', slug: 'photographer' },
  { name: 'Painter', slug: 'painter' },
  { name: 'Handyman', slug: 'handyman' },
  { name: 'Locksmith', slug: 'locksmith' },
  { name: 'Pest Control', slug: 'pest-control' },
  { name: 'Pool Service', slug: 'pool-service' },
  { name: 'Security', slug: 'security' },
  { name: 'Tiler', slug: 'tiler' },
  { name: 'Tree Felling', slug: 'tree-felling' },
  { name: 'Roof Repair', slug: 'roof-repair' },
  { name: 'Catering', slug: 'catering' },
  { name: 'Driving Instructor', slug: 'driving-instructor' },
  { name: 'Alterations & Tailoring', slug: 'alterations' },
]

const COMMUNITIES = [
  { name: 'Glenvista', slug: 'glenvista' },
  { name: 'Bassonia', slug: 'bassonia' },
  { name: 'Mondeor', slug: 'mondeor' },
  { name: 'Mulbarton', slug: 'mulbarton' },
  { name: 'Lenasia', slug: 'lenasia' },
  { name: 'Alberton', slug: 'alberton' },
]

export default function AddBusinessPage() {
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    phone: '',
    whatsapp: '',
    website: '',
    address_text: '',
    isOwner: false,
  })
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  function toggleCommunity(slug: string) {
    setSelectedCommunities((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    // Resolve category ID
    let categoryId: string | null = null
    if (form.category) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', form.category).single()
      categoryId = cat?.id ?? null
    }

    const slug = slugify(form.name) + '-' + Math.random().toString(36).slice(2, 6)

    const { data: business, error: bErr } = await supabase.from('businesses').insert({
      name: form.name,
      slug,
      description: form.description || null,
      primary_category_id: categoryId,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      website: form.website || null,
      address_text: form.address_text || null,
      status: 'pending',
      is_community_sourced: true,
      created_by_user_id: user ? (await supabase.from('profiles').select('id').eq('auth_user_id', user.id).single()).data?.id : null,
    }).select().single()

    if (bErr) {
      setError(bErr.message)
      setLoading(false)
      return
    }

    // Link communities
    if (selectedCommunities.length > 0 && business) {
      const { data: comms } = await supabase.from('communities').select('id, slug').in('slug', selectedCommunities)
      if (comms) {
        await supabase.from('business_communities').insert(
          comms.map((c) => ({ business_id: business.id, community_id: c.id }))
        )
      }
    }

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-black mb-3" style={{ color: 'var(--charcoal)' }}>
              Business submitted!
            </h1>
            <p className="text-gray-500 mb-6">
              Your listing is pending review. We&apos;ll publish it within 24 hours once approved.
            </p>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl font-bold text-white inline-block"
              style={{ backgroundColor: 'var(--ivouch-blue)' }}
            >
              Back to Home
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
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--charcoal)' }}>
            Add a Business
          </h1>
          <p className="text-gray-500 mb-8">List a local business for free. All submissions are reviewed before publishing.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--charcoal)' }}>
                Business Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mike's Plumbing"
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: 'var(--cloud-grey)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--charcoal)' }}>
                Category *
              </label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: 'var(--cloud-grey)' }}
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--charcoal)' }}>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Brief description of services offered..."
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none"
                style={{ borderColor: 'var(--cloud-grey)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--charcoal)' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+27 11 xxx xxxx"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: 'var(--cloud-grey)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--charcoal)' }}>
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+27 82 xxx xxxx"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: 'var(--cloud-grey)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--charcoal)' }}>
                Website (optional)
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: 'var(--cloud-grey)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--charcoal)' }}>
                Areas Served *
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMUNITIES.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => toggleCommunity(c.slug)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
                    style={
                      selectedCommunities.includes(c.slug)
                        ? { backgroundColor: 'var(--ivouch-blue)', color: 'white', borderColor: 'var(--ivouch-blue)' }
                        : { backgroundColor: 'white', color: 'var(--charcoal)', borderColor: 'var(--cloud-grey)' }
                    }
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--charcoal)' }}>
                Address (optional)
              </label>
              <input
                type="text"
                value={form.address_text}
                onChange={(e) => setForm({ ...form, address_text: e.target.value })}
                placeholder="Street address or area"
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: 'var(--cloud-grey)' }}
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="isOwner"
                checked={form.isOwner}
                onChange={(e) => setForm({ ...form, isOwner: e.target.checked })}
                className="mt-1"
              />
              <label htmlFor="isOwner" className="text-sm text-gray-600">
                I am the owner or representative of this business and want to claim it
              </label>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: 'var(--ivouch-blue)' }}
            >
              {loading ? 'Submitting...' : 'Submit Business'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
