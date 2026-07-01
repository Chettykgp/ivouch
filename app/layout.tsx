import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
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
    <html lang="en" className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--cream)' }}>
        {children}
      </body>
    </html>
  )
}
