'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { resizeImage } from '@/lib/utils/imageResize'

interface BusinessPhotoManagerProps {
  businessId: string
  initialImages?: string[]
  compact?: boolean
}

const MAX = 2

export default function BusinessPhotoManager({ businessId, initialImages = [], compact }: BusinessPhotoManagerProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking same file
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      const resized = await resizeImage(file)
      const fd = new FormData()
      fd.append('file', resized)
      const res = await fetch(`/api/business/${businessId}/photo`, { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')
      setImages(json.images)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  async function remove(url: string) {
    setError(null)
    setBusy(true)
    try {
      const res = await fetch(`/api/business/${businessId}/photo`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Could not remove photo')
      setImages(json.images)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove photo')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((url) => (
          <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--cloud-grey)' }}>
            <Image src={url} alt="Business photo" fill sizes="96px" className="object-cover" />
            <button
              onClick={() => remove(url)}
              disabled={busy}
              aria-label="Remove photo"
              className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white disabled:opacity-50"
              style={{ backgroundColor: 'rgba(11,31,78,0.7)' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {images.length < MAX && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[var(--ivouch-blue)] hover:text-[var(--ivouch-blue)] transition-colors disabled:opacity-50"
            style={{ borderColor: 'var(--cloud-grey)' }}
          >
            {busy ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
            <span className="text-[0.65rem] font-semibold">Add photo</span>
          </button>
        )}
      </div>

      {!compact && (
        <p className="text-xs text-gray-400 mt-2">
          Up to {MAX} photos — a cover, a menu, a job you&apos;re proud of. JPG/PNG, max 5MB.
        </p>
      )}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
    </div>
  )
}
