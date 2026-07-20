import { readFileSync } from 'fs'
import { join } from 'path'
import { ImageResponse } from 'next/og'
import { createServiceClient } from '@/lib/supabase/service'
import { photoForGroup, DEFAULT_PHOTO } from '@/lib/og/category-photos'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'iVouch — trusted local services, vouched for by neighbours'

const WARD_SLUG = 'jhb-south-ward-23'

// Read self-hosted fonts once at module load — no network at render time.
function loadFont(weight: 600 | 800): Buffer | null {
  try {
    return readFileSync(join(process.cwd(), 'assets', 'fonts', `jakarta-${weight}.ttf`))
  } catch {
    return null
  }
}
const FONT_800 = loadFont(800)
const FONT_600 = loadFont(600)

/** Read a /public photo off disk as a data URI (no HTTP at render). */
function photoDataUri(publicPath: string): string | null {
  for (const p of [publicPath, DEFAULT_PHOTO]) {
    try {
      const buf = readFileSync(join(process.cwd(), 'public', p.replace(/^\//, '')))
      return `data:image/jpeg;base64,${buf.toString('base64')}`
    } catch {
      /* try fallback */
    }
  }
  return null
}

/** Pre-generate a card for every active category (served as a static PNG). */
export async function generateStaticParams() {
  try {
    const svc = createServiceClient()
    const { data } = await svc.from('categories').select('slug').eq('status', 'active')
    return (data ?? []).map((c) => ({ communitySlug: WARD_SLUG, categorySlug: c.slug as string }))
  } catch {
    return []
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ communitySlug: string; categorySlug: string }>
}) {
  const { categorySlug } = await params

  // Non-cookie lookup so the card can be fully statically generated & cached.
  let name = 'Local services'
  let group: string | null = null
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from('categories')
      .select('name, group_name')
      .eq('slug', categorySlug)
      .maybeSingle()
    if (data?.name) name = data.name
    group = (data?.group_name as string | null) ?? null
  } catch {
    /* fall back to defaults */
  }

  const photo = photoDataUri(photoForGroup(group))

  const INK = '#0B1F4E'
  const BLUE = '#2F6BFF'

  const fonts = [
    ...(FONT_800 ? [{ name: 'Jakarta', data: FONT_800, weight: 800 as const, style: 'normal' as const }] : []),
    ...(FONT_600 ? [{ name: 'Jakarta', data: FONT_600, weight: 600 as const, style: 'normal' as const }] : []),
  ]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          fontFamily: 'Jakarta',
          backgroundColor: INK,
        }}
      >
        {/* Background photo */}
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            width={1200}
            height={630}
            style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, objectFit: 'cover' }}
          />
        )}
        {/* Legibility overlay: uniform base + left wash + bottom scrim baked
            into a single gradient stack on one absolute layer. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: 'flex',
            backgroundImage: [
              'linear-gradient(90deg, rgba(11,31,78,0.92) 0%, rgba(11,31,78,0.5) 50%, rgba(11,31,78,0.12) 100%)',
              'linear-gradient(0deg, rgba(11,31,78,0.9) 0%, rgba(11,31,78,0.12) 44%)',
            ].join(', '),
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 64,
            width: 1200,
            height: 630,
          }}
        >
          {/* Top bar: wordmark + ward */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 999,
                padding: '12px 26px',
                fontSize: 34,
                fontWeight: 800,
              }}
            >
              <span style={{ color: INK }}>i</span>
              <span style={{ color: BLUE }}>Vouch</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#fff',
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: 1,
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 999,
                padding: '10px 20px',
                textTransform: 'uppercase',
              }}
            >
              JHB Ward 23
            </div>
          </div>

          {/* Category name */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                color: BLUE,
                backgroundColor: 'rgba(47,107,255,0.18)',
                border: '1px solid rgba(47,107,255,0.45)',
                borderRadius: 999,
                padding: '8px 18px',
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: 1,
                marginBottom: 20,
                textTransform: 'uppercase',
              }}
            >
              Trusted local
            </div>
            <div
              style={{
                display: 'flex',
                color: '#fff',
                fontSize: name.length > 22 ? 78 : 104,
                fontWeight: 800,
                lineHeight: 1.02,
                letterSpacing: -2,
                maxWidth: 980,
              }}
            >
              {name}
            </div>
            <div style={{ display: 'flex', color: '#C6D4F5', fontSize: 34, fontWeight: 600, marginTop: 14 }}>
              in JHB South Ward 23
            </div>
          </div>

          {/* Bottom tagline */}
          <div style={{ display: 'flex', alignItems: 'center', color: '#fff', fontSize: 26, fontWeight: 600 }}>
            <span
              style={{
                display: 'flex',
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: '#3BD07E',
                marginRight: 14,
              }}
            />
            Vouched for by real neighbours · No paid reviews
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  )
}
