import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  /** Colour of the wordmark text. Defaults to ink navy for the light header. */
  textClassName?: string
  href?: string | null
  className?: string
  /** Pixel height of the mark. */
  size?: number
  /** Use the white/navy-inverted icon for dark backgrounds (e.g. footer). */
  dark?: boolean
}

/**
 * iVouch logo — the brand shield mark (person + verified check), cropped and
 * cleaned from the source artwork, plus the "iVouch" wordmark. The shield reads
 * on both light and dark backgrounds, so the same icon is used everywhere.
 */
export default function Logo({
  textClassName = 'text-[var(--ink)]',
  href = '/',
  className = '',
  size = 34,
}: LogoProps) {
  const iconSrc = '/logo-icon.png'
  // Shield icon aspect ratio is 209:240 (w:h)
  const width = Math.round((size * 209) / 240)

  const mark = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src={iconSrc}
        alt=""
        width={width}
        height={size}
        priority
        className="flex-shrink-0"
        style={{ width, height: size }}
      />
      <span className={`text-2xl font-extrabold tracking-tight ${textClassName}`}>iVouch</span>
    </span>
  )

  if (href === null) return mark
  return (
    <Link href={href} className="inline-flex items-center" aria-label="iVouch home">
      {mark}
    </Link>
  )
}
