export function buildWhatsAppShareUrl(businessName: string, vouchCount: number, url: string): string {
  const text = `I found ${businessName} on iVouch. ${vouchCount} neighbours vouch for them: ${url}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function buildVouchRequestUrl(businessName: string, businessId: string): string {
  const url = `https://ivouch.co.za/b/${businessId}`
  const text = `Happy with our service? Please vouch for us on iVouch: ${url}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
