/**
 * iVouch transactional email service — Brevo (Sendinblue) HTTP API.
 *
 * Works with zero SDK dependencies via the Brevo REST API.
 * Configure with env vars:
 *   BREVO_API_KEY     — required to actually send (no-op + log without it)
 *   EMAIL_FROM        — sender address   (default: hello@ivouch.co.za)
 *   EMAIL_FROM_NAME   — sender name      (default: iVouch)
 *   ADMIN_EMAIL       — where admin notifications go
 */

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
  fromName?: string
}

const BRAND = {
  blue: '#2F6BFF',
  ink: '#0B1F4E',
  mist: '#F5F7FD',
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://ivouch.co.za'

/** Shared branded wrapper so every mail looks like iVouch. */
export function renderTemplate(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${BRAND.mist};font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;padding-bottom:20px;">
      <img src="${SITE}/logo-icon.png" alt="iVouch" width="40" height="46" style="display:inline-block;vertical-align:middle;border:0;" />
      <span style="font-size:26px;font-weight:800;color:${BRAND.ink};vertical-align:middle;margin-left:8px;">i<span style="color:${BRAND.blue};">Vouch</span></span>
      <div style="font-size:12px;color:#8a94a6;margin-top:6px;">JHB South · Ward 23</div>
    </div>
    <div style="background:#ffffff;border-radius:16px;padding:28px;border:1px solid #E8EEF2;">
      <h1 style="font-size:20px;color:${BRAND.ink};margin:0 0 14px;">${title}</h1>
      <div style="font-size:14px;line-height:1.6;color:#3d4a5c;">${bodyHtml}</div>
    </div>
    <div style="text-align:center;font-size:11px;color:#9aa4b2;padding-top:20px;">
      Real people. Real vouches. No paid reviews, ever.<br/>
      © iVouch · South Africa · <a href="https://ivouch.co.za" style="color:${BRAND.blue};">ivouch.co.za</a>
    </div>
  </div>
</body></html>`
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.log('[email:noop — set BREVO_API_KEY to send]', options.to, '·', options.subject)
    return false
  }
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          email: options.from ?? process.env.EMAIL_FROM ?? 'hello@ivouch.co.za',
          name: options.fromName ?? process.env.EMAIL_FROM_NAME ?? 'iVouch',
        },
        to: [{ email: options.to }],
        subject: options.subject,
        htmlContent: options.html,
      }),
    })
    if (!res.ok) {
      console.error('[email:error]', res.status, await res.text())
      return false
    }
    return true
  } catch (err) {
    console.error('[email:error]', err)
    return false
  }
}

/* ────────────────────────── Templates ────────────────────────── */

export function businessApprovedEmail(to: string, businessName: string, slug: string): EmailOptions {
  return {
    to,
    subject: `🎉 ${businessName} is now live on iVouch`,
    html: renderTemplate(
      `${businessName} is live!`,
      `<p>Great news — your listing has been approved and is now visible to the whole Ward 23 community.</p>
       <p><a href="https://ivouch.co.za/b/${slug}" style="display:inline-block;background:${BRAND.blue};color:#fff;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none;">View your listing</a></p>
       <p>Happy customers can now vouch for you. Share your link on WhatsApp and ask them to!</p>`
    ),
  }
}

export function photoNudgeEmail(to: string, businessName: string, slug: string): EmailOptions {
  return {
    to,
    subject: `📸 ${businessName} — add your 2 free photos on iVouch`,
    html: renderTemplate(
      `Make ${businessName} stand out`,
      `<p>Neighbours in Ward 23 are already vouching for <strong>${businessName}</strong> — nice work!</p>
       <p>Listings with photos catch far more eyes. You can add up to <strong>2 free photos</strong> (a cover shot, your work, or a menu) in under a minute.</p>
       <p><a href="https://ivouch.co.za/profile" style="display:inline-block;background:${BRAND.blue};color:#fff;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none;">Add my photos</a></p>
       <p style="color:#5A6B85;font-size:13px;">Sign in, open <em>My Businesses</em> on your profile, and tap the photo uploader. Your public listing: <a href="https://ivouch.co.za/b/${slug}">ivouch.co.za/b/${slug}</a></p>`
    ),
  }
}

export function newBusinessAdminEmail(to: string, businessName: string): EmailOptions {
  return {
    to,
    subject: `New listing to review: ${businessName}`,
    html: renderTemplate(
      'New business submitted',
      `<p><strong>${businessName}</strong> was just submitted and is waiting for review.</p>
       <p><a href="https://ivouch.co.za/admin/businesses?status=pending" style="display:inline-block;background:${BRAND.blue};color:#fff;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none;">Review in admin</a></p>`
    ),
  }
}

export function newClaimAdminEmail(to: string, businessName: string, claimantName: string): EmailOptions {
  return {
    to,
    subject: `New ownership claim: ${businessName}`,
    html: renderTemplate(
      'New claim submitted',
      `<p><strong>${claimantName}</strong> claims to own <strong>${businessName}</strong>.</p>
       <p><a href="https://ivouch.co.za/admin/claims" style="display:inline-block;background:${BRAND.blue};color:#fff;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none;">Review claims</a></p>`
    ),
  }
}

export function newReportAdminEmail(to: string, reason: string): EmailOptions {
  return {
    to,
    subject: `⚠️ New report needs review`,
    html: renderTemplate(
      'New report',
      `<p>A community member reported content: <strong>${reason}</strong></p>
       <p><a href="https://ivouch.co.za/admin" style="display:inline-block;background:${BRAND.blue};color:#fff;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none;">Open admin</a></p>`
    ),
  }
}

export function newConcernAdminEmail(to: string, businessName: string): EmailOptions {
  return {
    to,
    subject: `⚠️ New community concern: ${businessName}`,
    html: renderTemplate(
      'New concern raised',
      `<p>A neighbour raised a concern about <strong>${businessName}</strong>. Review it and decide whether to verify, resolve or dismiss.</p>
       <p><a href="https://ivouch.co.za/admin/concerns" style="display:inline-block;background:${BRAND.blue};color:#fff;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none;">Review concerns</a></p>`
    ),
  }
}
