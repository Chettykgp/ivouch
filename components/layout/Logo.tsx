import Link from 'next/link'

interface LogoProps {
  /** Colour of the wordmark text. Defaults to ink navy for the light header. */
  textClassName?: string
  href?: string | null
  className?: string
  /** Pixel height of the mark. */
  size?: number
}

/**
 * iVouch logo — a bright-blue check-mark that doubles as a person raising
 * their arms (circle "head" above a tick), plus the "iVouch" wordmark.
 */
export default function Logo({
  textClassName = 'text-[var(--ink)]',
  href = '/',
  className = '',
  size = 30,
}: LogoProps) {
  const mark = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        height={size}
        viewBox="0 0 132 116"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ overflow: 'visible' }}
      >
        {/* head */}
        <circle cx="31" cy="28" r="14" fill="var(--ivouch-blue)" />
        {/* check-mark / raised arms */}
        <path
          d="M31 54 L53 92 L118 16"
          stroke="var(--ivouch-blue)"
          strokeWidth="17"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className={`text-2xl font-extrabold tracking-tight ${textClassName}`}>
        iVouch
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
