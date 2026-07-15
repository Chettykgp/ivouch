/**
 * Normalise a South African phone number to WhatsApp's international format
 * (country code, no plus, no spaces) for use in wa.me links.
 *
 *   "082 784 5905" / "0827845905" → "27827845905"
 *   "+27 82 784 5905"             → "27827845905"
 *   "27827845905"                 → "27827845905"
 *   "827845905" (missing 0)       → "27827845905"
 *
 * Returns null when there's nothing usable.
 */
export function toWhatsAppNumber(raw?: string | null): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('27')) return digits
  if (digits.startsWith('0')) return '27' + digits.slice(1)
  if (digits.length === 9) return '27' + digits // local number missing its leading 0
  return digits
}
