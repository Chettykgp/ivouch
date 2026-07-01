'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Logo from '@/components/layout/Logo'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const urlError = searchParams.get('error')

  const supabase = createClient()

  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(urlError)
  const [success, setSuccess] = useState<string | null>(null)

  const inputClass =
    'w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus-ring transition-shadow'
  const inputStyle = { borderColor: 'var(--cloud-grey)' as const }

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })
    if (oauthError) {
      setError(oauthError.message)
      setGoogleLoading(false)
    }
    // On success the browser redirects to Google.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      })
      if (signUpError) setError(signUpError.message)
      else setSuccess('Account created! Check your email to confirm your address, then sign in.')
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) setError(signInError.message)
      else {
        router.push(redirect)
        router.refresh()
      }
    }
    setLoading(false)
  }

  async function handleMagicLink() {
    if (!email) {
      setError('Enter your email first, then request a magic link.')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })
    if (otpError) setError(otpError.message)
    else setSuccess(`We emailed a sign-in link to ${email}. Check your inbox.`)
    setLoading(false)
  }

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16" style={{ backgroundColor: 'var(--mist)' }}>
        <div className="w-full max-w-md animate-fade-up">
          <div className="text-center mb-7">
            <div className="flex justify-center mb-3">
              <Logo href={null} size={38} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>
              {mode === 'signin' ? 'Welcome back' : 'Join iVouch'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {mode === 'signin'
                ? 'Sign in to vouch for people in Ward 23'
                : 'Create your free account'}
            </p>
          </div>

          <div className="card-soft p-6 sm:p-8">
            {/* Google — prominent, top */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border font-semibold text-sm bg-white hover:bg-gray-50 transition-colors disabled:opacity-60"
              style={{ borderColor: 'var(--cloud-grey)', color: 'var(--ink)' }}
            >
              <GoogleIcon />
              {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--cloud-grey)' }} />
              <span className="text-xs text-gray-400 font-medium">or use email</span>
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--cloud-grey)' }} />
            </div>

            {/* Sign in / Register segmented control */}
            <div
              className="flex rounded-xl overflow-hidden border mb-5"
              style={{ borderColor: 'var(--cloud-grey)' }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setSuccess(null)
                }}
                className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                style={
                  mode === 'signin'
                    ? { backgroundColor: 'var(--ivouch-blue)', color: 'white' }
                    : { color: 'var(--ink)' }
                }
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setSuccess(null)
                }}
                className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                style={
                  mode === 'signup'
                    ? { backgroundColor: 'var(--ivouch-blue)', color: 'white' }
                    : { color: 'var(--ink)' }
                }
              >
                Register
              </button>
            </div>

            {success ? (
              <div
                className="rounded-xl p-4 text-sm text-center"
                style={{ backgroundColor: 'rgba(47,107,255,0.12)', color: 'var(--ivouch-blue-dark)' }}
              >
                {success}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ink)' }}>
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      placeholder="How your neighbours see you"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ink)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.co.za"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ink)' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-blue w-full py-3 disabled:opacity-60"
                >
                  {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>

                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={loading}
                  className="w-full text-sm font-semibold py-2 disabled:opacity-60"
                  style={{ color: 'var(--ivouch-blue)' }}
                >
                  ✉️ Email me a magic link instead
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing you agree to our{' '}
            <Link href="/terms" className="underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20">Loading…</div>}>
      <AuthForm />
    </Suspense>
  )
}
