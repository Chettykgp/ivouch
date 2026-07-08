'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'
import type { Business } from '@/types'

export default function ClaimPage() {
  const params = useParams()
  const businessId = params.businessId as string
  const supabase = createClient()

  const [business, setBusiness] = useState<Business | null>(null)
  const [form, setForm] = useState({
    claimant_name: '',
    claimant_email: '',
    claimant_phone: '',
    evidence_text: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('businesses').select('*').eq('id', businessId).single().then(({ data }) => setBusiness(data))
  }, [businessId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: cErr } = await supabase.rpc('submit_claim', {
      p_business_id: businessId,
      p_name: form.claimant_name,
      p_email: form.claimant_email,
      p_phone: form.claimant_phone,
      p_evidence: form.evidence_text,
    })

    if (cErr) {
      setError(cErr.message)
    } else {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'new_claim', name: business?.name ?? 'a business' }),
      }).catch(() => {})
      setSubmitted(true)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16" style={{ backgroundColor: "var(--mist)" }}>
          <div className="text-center max-w-sm">
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--ink)' }}>Claim submitted!</h1>
            <p className="text-gray-500 mb-6 text-sm">We&apos;ll review your claim and be in touch within 2–3 business days.</p>
            <Link href="/" className="px-6 py-3 rounded-xl font-bold text-white inline-block" style={{ backgroundColor: 'var(--ivouch-blue)' }}>
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
      <main className="flex-1 px-4 py-10" style={{ backgroundColor: "var(--mist)" }}>
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--ink)' }}>
            Claim {business?.name ?? 'this business'}
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Fill in the form below and we&apos;ll verify your ownership before granting you access to manage this listing.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Full Name *</label>
              <input
                required
                type="text"
                value={form.claimant_name}
                onChange={(e) => setForm({ ...form, claimant_name: e.target.value })}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: 'var(--cloud-grey)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Email *</label>
              <input
                required
                type="email"
                value={form.claimant_email}
                onChange={(e) => setForm({ ...form, claimant_email: e.target.value })}
                placeholder="your@email.co.za"
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: 'var(--cloud-grey)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Phone *</label>
              <input
                required
                type="tel"
                value={form.claimant_phone}
                onChange={(e) => setForm({ ...form, claimant_phone: e.target.value })}
                placeholder="+27 82 xxx xxxx"
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: 'var(--cloud-grey)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>
                How can you prove you own / represent this business?
              </label>
              <textarea
                value={form.evidence_text}
                onChange={(e) => setForm({ ...form, evidence_text: e.target.value })}
                rows={4}
                placeholder="e.g. I am the registered owner. My CIPC registration number is..."
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none"
                style={{ borderColor: 'var(--cloud-grey)' }}
              />
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: 'var(--ivouch-blue)' }}
            >
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
