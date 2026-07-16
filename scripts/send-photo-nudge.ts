/**
 * scripts/send-photo-nudge.ts
 *
 * One-off campaign: email active, vouched businesses that have an email
 * address on file but no photos, nudging them to add their 2 free photos.
 *
 * Dry run (default — prints recipients, sends nothing):
 *   npx tsx scripts/send-photo-nudge.ts
 * Real send:
 *   npx tsx scripts/send-photo-nudge.ts --send
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and (for a
 * real send) BREVO_API_KEY in .env.local.
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { sendEmail, photoNudgeEmail } from '../lib/email'

// --- Load .env.local -------------------------------------------------------
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  realtime: { transport: ws as never },
  auth: { autoRefreshToken: false, persistSession: false },
})

const SEND = process.argv.includes('--send')

async function main() {
  // Active businesses with an email, no photos, and at least one active vouch.
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, slug, email, images, vouches(count)')
    .eq('status', 'active')
    .not('email', 'is', null)
  if (error) throw error

  const targets = (businesses ?? []).filter((b) => {
    const hasPhotos = Array.isArray(b.images) && b.images.length > 0
    const vouchCount = (b.vouches as { count: number }[] | null)?.[0]?.count ?? 0
    return !hasPhotos && vouchCount > 0 && b.email && b.email.includes('@')
  })

  console.log(`${targets.length} businesses qualify (active, emailed, vouched, no photos):\n`)
  for (const b of targets) {
    console.log(`  - ${b.name} <${b.email}> (/b/${b.slug})`)
  }

  if (!SEND) {
    console.log('\nDRY RUN — nothing sent. Re-run with --send to email them.')
    return
  }

  let ok = 0
  for (const b of targets) {
    const sent = await sendEmail(photoNudgeEmail(b.email as string, b.name, b.slug))
    console.log(`  ${sent ? '✓ sent' : '✗ FAILED'}: ${b.name} <${b.email}>`)
    if (sent) ok++
    await new Promise((r) => setTimeout(r, 300)) // gentle rate limit
  }
  console.log(`\nDone: ${ok}/${targets.length} sent.`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
