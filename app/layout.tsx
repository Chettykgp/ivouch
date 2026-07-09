import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://ivouch.co.za'),
  title: {
    default: 'iVouch – Find the help your neighbours vouched for',
    template: '%s · iVouch',
  },
  description:
    "South Africa's trusted community recommendation platform for JHB South Ward 23. Find plumbers, electricians, tutors, bakers and more — vouched for by real neighbours in Glenvista, Bassonia, Mulbarton and surrounds. No paid reviews, ever.",
  keywords: [
    'local services', 'recommendations', 'community', 'South Africa',
    'plumber Glenvista', 'electrician Bassonia', 'Ward 23', 'Johannesburg South',
    'trusted local businesses', 'neighbourhood recommendations',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://ivouch.co.za',
    siteName: 'iVouch',
    title: 'iVouch – Find the help your neighbours vouched for',
    description:
      'Trusted local businesses in JHB South Ward 23, vouched for by real neighbours. No paid reviews, ever.',
    images: [{ url: '/hero-poster.jpg', width: 1100, height: 733, alt: 'iVouch — your community, vouched for' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iVouch – Find the help your neighbours vouched for',
    description: 'Trusted local businesses in JHB South Ward 23, vouched for by real neighbours.',
    images: ['/hero-poster.jpg'],
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--cream)' }}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
