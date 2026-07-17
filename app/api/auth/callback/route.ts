import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  // Support both `redirect` (used by our auth page / OAuth options) and `next`.
  const redirectTo =
    requestUrl.searchParams.get('redirect') ?? requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Called from a context where cookies can't be set; ignore.
            }
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      )
    }

    // Magic-link / OTP sign-ins collect no name, and the signup trigger can
    // leave display_name null. Guarantee a display name from the email prefix
    // so vouches never show as an anonymous "A neighbour".
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, first_name, display_name')
        .eq('auth_user_id', user.id)
        .maybeSingle()
      if (profile && !profile.display_name && !profile.first_name) {
        await supabase
          .from('profiles')
          .update({ display_name: user.email.split('@')[0] })
          .eq('id', profile.id)
      }
    }
  }

  // Only allow same-origin relative redirects.
  const safePath = redirectTo.startsWith('/') ? redirectTo : '/'
  return NextResponse.redirect(new URL(safePath, requestUrl.origin))
}
