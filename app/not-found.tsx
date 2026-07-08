import Link from 'next/link'
import { MapPin, ArrowRight, Search } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20" style={{ backgroundColor: 'var(--mist)' }}>
        <div className="text-center max-w-md">
          <div className="text-7xl font-black mb-2" style={{ color: 'var(--ivouch-blue)' }}>404</div>
          <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--ink)' }}>
            This street doesn&apos;t exist in Ward 23
          </h1>
          <p className="text-gray-500 mb-8">
            The page you&apos;re looking for has moved or never existed. Your neighbours can
            still point you in the right direction.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-blue px-6 py-3">
              <MapPin size={16} /> Back home
            </Link>
            <Link href="/categories" className="btn-outline px-6 py-3">
              <Search size={16} /> Browse services <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
