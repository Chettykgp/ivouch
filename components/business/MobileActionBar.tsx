import Link from 'next/link'
import { Phone, BadgeCheck } from 'lucide-react'

interface MobileActionBarProps {
  businessId: string
  phone?: string | null
  whatsapp?: string | null
}

/**
 * Sticky bottom action bar, mobile only. Most visitors arrive from WhatsApp
 * on a phone — keep the two actions that matter within thumb reach.
 */
export default function MobileActionBar({ businessId, phone, whatsapp }: MobileActionBarProps) {
  const wa = whatsapp?.replace(/\D/g, '')

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-white/95 backdrop-blur-md px-3 py-2.5 flex items-center gap-2"
      style={{ borderColor: 'var(--cloud-grey)', paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}
    >
      <Link href={`/vouch/${businessId}`} className="btn-blue flex-1 py-3 text-sm">
        <BadgeCheck size={16} /> I vouch for them
      </Link>
      {wa && (
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message on WhatsApp"
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: '#25D366' }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
          </svg>
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone}`}
          aria-label="Call"
          className="btn-outline w-12 h-12 flex-shrink-0"
        >
          <Phone size={18} />
        </a>
      )}
    </div>
  )
}
