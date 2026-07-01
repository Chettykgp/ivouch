// Email abstraction - Brevo-ready stub
// To integrate Brevo: npm install @getbrevo/brevo
// and set BREVO_API_KEY in your environment

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Email stub]', options)
    return
  }
  // TODO: integrate Brevo SDK
  // const brevo = new Brevo.TransactionalEmailsApi()
  // brevo.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!)
  // await brevo.sendTransacEmail({ ... })
}

export function vouchConfirmationEmail(displayName: string, businessName: string): EmailOptions {
  return {
    to: '',
    subject: `You vouched for ${businessName} on iVouch`,
    html: `<p>Hi ${displayName},</p><p>Thanks for vouching for <strong>${businessName}</strong>. Your community appreciates it!</p><p>— The iVouch team</p>`,
  }
}

export function claimSubmittedEmail(businessName: string, adminEmail: string): EmailOptions {
  return {
    to: adminEmail,
    subject: `New claim submitted for ${businessName}`,
    html: `<p>A new business claim has been submitted for <strong>${businessName}</strong>. Please review it in the admin panel.</p>`,
  }
}
