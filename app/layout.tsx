import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'iVouch – Find people your neighbours vouch for',
  description: 'South Africa\'s trusted local recommendation platform. Find verified plumbers, electricians, mechanics and more vouched for by your community.',
  keywords: 'local services, recommendations, community, South Africa, plumber, electrician, Johannesburg',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--cream)' }}>
        {children}
      </body>
    </html>
  )
}
