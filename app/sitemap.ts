import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE = 'https://ivouch.co.za'
const WARD_SLUG = 'jhb-south-ward-23'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/categories`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/c/${WARD_SLUG}`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/add-business`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE}/guidelines`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      { auth: { persistSession: false } }
    )

    const [{ data: businesses }, { data: categories }] = await Promise.all([
      supabase.from('businesses').select('slug, updated_at').eq('status', 'active').limit(2000),
      supabase.from('categories').select('slug').eq('status', 'active').limit(300),
    ])

    const businessEntries: MetadataRoute.Sitemap = (businesses ?? []).map((b) => ({
      url: `${SITE}/b/${b.slug}`,
      lastModified: b.updated_at ? new Date(b.updated_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    const categoryEntries: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
      url: `${SITE}/c/${WARD_SLUG}/${c.slug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticEntries, ...businessEntries, ...categoryEntries]
  } catch {
    return staticEntries
  }
}
