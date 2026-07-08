import { NextResponse } from 'next/server'
import {
  sendEmail,
  newBusinessAdminEmail,
  newClaimAdminEmail,
  newReportAdminEmail,
} from '@/lib/email'

/**
 * Fire-and-forget admin notifications, called by the public forms after a
 * successful submission. Never blocks or errors the user journey.
 */
export async function POST(request: Request) {
  try {
    const { event, name, reason } = (await request.json()) as {
      event: 'new_business' | 'new_claim' | 'new_report'
      name?: string
      reason?: string
    }

    const admin = process.env.ADMIN_EMAIL
    if (!admin) return NextResponse.json({ ok: false, reason: 'no ADMIN_EMAIL configured' })

    if (event === 'new_business') {
      await sendEmail(newBusinessAdminEmail(admin, name ?? 'A new business'))
    } else if (event === 'new_claim') {
      await sendEmail(newClaimAdminEmail(admin, name ?? 'a business', 'Someone'))
    } else if (event === 'new_report') {
      await sendEmail(newReportAdminEmail(admin, reason ?? 'unspecified'))
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
