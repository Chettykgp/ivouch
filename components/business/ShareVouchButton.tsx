'use client'

import { useState } from 'react'
import { Share2, X, Copy, Check } from 'lucide-react'
import { businessUrl, vouchShareMessage, buildWhatsAppUrl } from '@/lib/whatsapp/share'

interface ShareVouchButtonProps {
  businessName: string
  slug: string
  variant?: 'button' | 'icon'
  label?: string
  /** Override the share message (e.g. owner-facing). */
  message?: string
}

/**
 * Share a link that invites neighbours to vouch for a business.
 * Works for WhatsApp channels/groups (copy-link), WhatsApp chats (wa.me),
 * and the native OS share sheet on mobile.
 */
export default function ShareVouchButton({
  businessName,
  slug,
  variant = 'button',
  label = 'Share & ask for vouches',
  message,
}: ShareVouchButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const url = businessUrl(slug)
  const text = message ?? vouchShareMessage(businessName, url)
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select the input for manual copy
      const el = document.getElementById('share-vouch-url') as HTMLInputElement | null
      el?.select()
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: 'iVouch', text, url })
    } catch {
      /* user cancelled */
    }
  }

  return (
    <>
      {variant === 'icon' ? (
        <button
          onClick={(e) => { e.preventDefault(); setOpen(true) }}
          aria-label={`Share ${businessName}`}
          className="btn-outline w-10 h-10 flex-shrink-0"
        >
          <Share2 size={16} />
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-outline w-full py-3 text-sm">
          <Share2 size={16} /> {label}
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(11,31,78,0.45)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-extrabold" style={{ color: 'var(--ink)' }}>
                Ask neighbours to vouch
              </h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Share <strong>{businessName}</strong> so more of Ward 23 can vouch for them. Paste
              this into your WhatsApp group or channel.
            </p>

            {/* Copyable link */}
            <div className="flex items-stretch gap-2 mb-3">
              <input
                id="share-vouch-url"
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border bg-[var(--mist)] text-sm"
                style={{ borderColor: 'var(--cloud-grey)', color: 'var(--ink)' }}
              />
              <button
                onClick={copyLink}
                className="btn-blue px-4 py-2.5 text-sm whitespace-nowrap"
              >
                {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy</>}
              </button>
            </div>

            {/* Channels */}
            <div className="flex gap-2">
              <a
                href={buildWhatsAppUrl(text)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: '#25D366' }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                </svg>
                WhatsApp
              </a>
              {canNativeShare && (
                <button onClick={nativeShare} className="flex-1 btn-outline py-3 text-sm">
                  <Share2 size={16} /> More…
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
