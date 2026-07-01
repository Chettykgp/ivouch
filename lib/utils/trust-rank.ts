export function calculateTrustScore(business: {
  vouch_count: number
  claimed_status: boolean
  verification_status: string
  report_count?: number
  latest_vouch_at?: string
}): number {
  let score = business.vouch_count * 10
  if (business.claimed_status) score += 20
  if (business.verification_status === 'verified') score += 30
  if (business.verification_status === 'phone_verified') score += 10
  if (business.report_count) score -= business.report_count * 5
  return score
}
