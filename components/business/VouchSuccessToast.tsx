'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function VouchSuccessToast() {
  const params = useSearchParams()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (params.get('vouched') === '1') {
      setShow(true)
      const t = setTimeout(() => setShow(false), 4500)
      return () => clearTimeout(t)
    }
  }, [params])

  if (!show) return null

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-fade-up px-2 w-full max-w-sm">
      <div
        className="rounded-2xl px-5 py-4 text-white shadow-lg flex items-center gap-3"
        style={{
          backgroundImage: 'linear-gradient(135deg, var(--vouch-green), var(--vouch-green-dark))',
        }}
      >
        <span className="text-2xl animate-heart-pop">🫶</span>
        <div>
          <p className="font-bold text-sm">Thanks for vouching!</p>
          <p className="text-white/85 text-xs">Your neighbours trust you.</p>
        </div>
      </div>
    </div>
  )
}
