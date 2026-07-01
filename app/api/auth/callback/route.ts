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
  }

  // Only allow same-origin relative redirects.
  const safePath = redirectTo.startsWith('/') ? redirectTo : '/'
  return NextResponse.redirect(new URL(safePath, requestUrl.origin))
}
