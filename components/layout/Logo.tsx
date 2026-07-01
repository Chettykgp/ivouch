import Link from 'next/link'

interface LogoProps {
  /** Colour of the wordmark text. Defaults to ink navy for the light header. */
  textClassName?: string
  href?: string | null
  className?: string
}

/**
 * iVouch logo — two overlapping petals forming a "V" checkmark, plus the wordmark.
 */
export default function Logo({ textClassName = 'text-[var(--ink)]', href = '/', className = '' }: LogoProps) {
  const mark = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M6.5 8 C 10 20 15.5 27 20 34 C 15.5 23 12 15 8.5 8 Z"
          fill="var(--ivouch-blue-dark)"
        />
        <path
          d="M33.5 8 C 30 20 24.5 27 20 34 C 24.5 23 28 15 31.5 8 Z"
          fill="var(--ivouch-blue)"
        />
        <circle cx="20" cy="33.5" r="2.4" fill="var(--ivouch-blue-dark)" />
      </svg>
      <span className={`text-2xl font-extrabold tracking-tight ${textClassName}`}>
        i<span style={{ color: 'var(--ivouch-blue)' }}>Vouch</span>
      </span>
    </span>
  )

  if (href === null) return mark
  return (
    <Link href={href} className="inline-flex items-center" aria-label="iVouch home">
      {mark}
    </Link>
  )
}
