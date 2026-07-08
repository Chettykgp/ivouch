import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/profile', '/vouch/', '/claim/'],
      },
    ],
    sitemap: 'https://ivouch.co.za/sitemap.xml',
  }
}
