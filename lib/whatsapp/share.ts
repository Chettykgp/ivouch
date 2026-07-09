/** Canonical site origin for shareable links (falls back to production). */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://ivouch.co.za'
}

/** Absolute URL to a business profile — the target of all share links. */
export function businessUrl(slug: string): string {
  return `${siteUrl()}/b/${slug}`
}

/** Wrap any text in a wa.me deep link. */
export function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

/** Neutral "please vouch" message shared to invite others to vouch. */
export function vouchShareMessage(businessName: string, url: string): string {
  return `Vouch for ${businessName} on iVouch so our Ward 23 community knows who to trust: ${url}`
}

/** Discovery share — "I found X, they're vouched for". */
export function buildWhatsAppShareUrl(businessName: string, vouchCount: number, url: string): string {
  const text = `I found ${businessName} on iVouch. ${vouchCount} neighbours vouch for them: ${url}`
  return buildWhatsAppUrl(text)
}

/** Owner-facing "ask your customers to vouch" WhatsApp link. */
export function buildVouchRequestUrl(businessName: string, slug: string): string {
  const text = `Happy with our service? Please vouch for us on iVouch: ${businessUrl(slug)} — thanks, ${businessName}`
  return buildWhatsAppUrl(text)
}
