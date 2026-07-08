'use client'

import { RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--mist)' }}>
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">🔌</div>
        <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--ink)' }}>
          Eish — something tripped a breaker
        </h1>
        <p className="text-gray-500 mb-8">
          A temporary glitch on our side. Give it another try — if it keeps happening,
          it&apos;s us, not you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-blue px-6 py-3">
            <RefreshCcw size={16} /> Try again
          </button>
          <Link href="/" className="btn-outline px-6 py-3">
            <Home size={16} /> Back home
          </Link>
        </div>
      </div>
    </main>
  )
}
