'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      })
      if (signUpError) {
        setError(signUpError.message)
      } else {
        setSuccess('Account created! Please check your email to confirm your address.')
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
      } else {
        router.push(redirect)
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-3xl font-black mb-2" style={{ color: 'var(--navy)' }}>
              i<span style={{ color: 'var(--vouch-green)' }}>Vouch</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--charcoal)' }}>
              {mode === 'signin' ? 'Welcome back' : 'Join iVouch'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {mode === 'signin' ? 'Sign in to vouch for local businesses' : 'Create your free account'}
            </p>
          </div>

          <div
            className="rounded-2xl p-8 shadow-sm border"
            style={{ backgroundColor: 'white', borderColor: 'var(--cloud-grey)' }}
          >
            {/* Tab toggle */}
            <div className="flex rounded-xl overflow-hidden border mb-6" style={{ borderColor: 'var(--cloud-grey)' }}>
              <button
                onClick={() => setMode('signin')}
                className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                style={mode === 'signin' ? { backgroundColor: 'var(--navy)', color: 'white' } : { color: 'var(--charcoal)' }}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                style={mode === 'signup' ? { backgroundColor: 'var(--navy)', color: 'white' } : { color: 'var(--charcoal)' }}
              >
                Register
              </button>
            </div>

            {success ? (
              <div
                className="rounded-xl p-4 text-sm text-center"
                style={{ backgroundColor: 'var(--vouch-green)', color: 'white' }}
              >
                {success}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--charcoal)' }}>
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      placeholder="How your neighbours see you"
                      className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: 'var(--cloud-grey)' }}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--charcoal)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.co.za"
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--cloud-grey)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--charcoal)' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--cloud-grey)' }}
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: 'var(--vouch-green)' }}
                >
                  {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="underline">Terms</Link> and{' '}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
      <AuthForm />
    </Suspense>
  )
}
