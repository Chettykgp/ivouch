import Link from 'next/link'

interface LogoProps {
  /** Colour of the wordmark text. Defaults to ink navy for the light header. */
  textClassName?: string
  href?: string | null
  className?: string
  /** Pixel height of the mark. */
  size?: number
  /** Colour of the "ink" (navy) parts of the mark — set to a light colour on dark backgrounds. */
  markInk?: string
}

/**
 * iVouch logo — a chat bubble containing a person ("i": head + body) beside a
 * thumbs-up, followed by the "iVouch" wordmark.
 */
export default function Logo({
  textClassName = 'text-[var(--ink)]',
  href = '/',
  className = '',
  size = 32,
  markInk = '#14245C',
}: LogoProps) {
  const blue = 'var(--ivouch-blue)'
  const mark = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* speech bubble ring, gap on the right for the thumb */}
        <path d="M83 75 A40 40 0 1 1 83 29" stroke={markInk} strokeWidth="8" strokeLinecap="round" fill="none" />
        {/* downward chat tail */}
        <path d="M40 84 L34 102 L54 88 Z" fill={markInk} />
        {/* person: head + body = the 'i' */}
        <circle cx="47" cy="42" r="9.5" fill={blue} />
        <path d="M47 57 L47 84" stroke={markInk} strokeWidth="11" strokeLinecap="round" />
        {/* thumbs-up cuff */}
        <rect x="60" y="62" width="13" height="24" rx="5.5" fill={markInk} />
        {/* thumbs-up fist */}
        <rect x="70" y="52" width="32" height="34" rx="10" fill={blue} />
        {/* thumb */}
        <path d="M74 55 L74 32 a8 8 0 0 1 16 0 L90 55 Z" fill={blue} />
        {/* knuckle lines */}
        <path d="M94 60 L94 80 M85.5 60 L85.5 80" stroke="#1E4FD6" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
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
