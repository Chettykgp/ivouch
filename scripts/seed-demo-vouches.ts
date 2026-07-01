/**
 * scripts/seed-demo-vouches.ts
 *
 * Seeds ~12 realistic demo vouches so the social activity feed looks alive
 * before real users start vouching.
 *
 * It creates a handful of clearly-marked DEMO auth users + profiles (emails
 * under @demo.ivouch.local) and inserts staggered vouches across popular
 * JHB South Ward 23 businesses over the past two weeks.
 *
 * Everything is tagged so it can be removed later:
 *   - Demo auth users have emails ending in `@demo.ivouch.local`
 *   - Delete with: npx tsx scripts/seed-demo-vouches.ts --clean
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env
 * (loaded automatically from .env.local below).
 *
 * Run: npm run seed:demo-vouches
 *      npm run seed:demo-vouches -- --clean
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

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

const DEMO_DOMAIN = 'demo.ivouch.local'
const WARD_SLUG = 'jhb-south-ward-23'

interface DemoVoucher {
  firstName: string
  community: string
}

const VOUCHERS: DemoVoucher[] = [
  { firstName: 'Kevan', community: 'Glenvista' },
  { firstName: 'Sarah', community: 'Bassonia' },
  { firstName: 'Thabo', community: 'Mulbarton' },
  { firstName: 'Priya', community: 'Glenvista' },
  { firstName: 'Johan', community: 'Bassonia' },
  { firstName: 'Nadia', community: 'Mulbarton' },
]

const TAG_POOL = [
  'Reliable',
  'Fair price',
  'Good workmanship',
  'Fast response',
  'Friendly',
  'Professional',
  'Would use again',
]

// business slug -> pool of realistic comments
const COMMENTS: Record<string, string[]> = {
  'mikes-plumbing-and-gas': [
    'Fixed my geyser fast and charged fairly.',
    'Sorted a burst pipe on a Sunday — absolute lifesaver.',
  ],
  'fastfix-plumbers': ['Quick to respond and left everything spotless.'],
  'bright-spark-electrical': [
    'Rewired half the house and explained everything clearly.',
    'Professional and on time. Highly recommend.',
  ],
  'power-up-electrical': ['Installed our inverter neatly — no load-shedding stress anymore.'],
  'johnnys-auto-repairs': [
    'Honest about what actually needed fixing. Rare these days.',
    'Great price on the service and the car runs like new.',
  ],
  'green-thumb-gardens': ['Transformed our overgrown yard in a weekend.'],
  'propaint-interior-exterior': ['Neat lines, no mess, finished ahead of schedule.'],
  'handy-harry': [
    'Hung shelves, fixed the gate, and mounted the TV in one visit.',
    'Friendly and super handy — our go-to now.',
  ],
}

function pickTags(seed: number): string[] {
  const n = 2 + (seed % 3) // 2..4 tags
  const shuffled = [...TAG_POOL].sort(() => Math.sin(seed++) - 0.5)
  return shuffled.slice(0, n)
}

async function getWardId(): Promise<string> {
  const { data } = await supabase
    .from('communities')
    .select('id')
    .eq('slug', WARD_SLUG)
    .single()
  if (!data) throw new Error(`Community ${WARD_SLUG} not found`)
  return data.id
}

async function ensureVoucher(v: DemoVoucher, wardId: string): Promise<string> {
  const email = `${v.firstName.toLowerCase()}.${v.community.toLowerCase().replace(/\s+/g, '')}@${DEMO_DOMAIN}`

  // Find or create the auth user.
  const { data: listed } = await supabase.auth.admin.listUsers()
  let authUser = listed?.users?.find((u) => u.email === email)
  if (!authUser) {
    const created = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { display_name: v.firstName, demo: true },
    })
    if (created.error) throw created.error
    authUser = created.data.user
  }

  // Find or create the profile.
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', authUser!.id)
    .maybeSingle()
  if (existingProfile) return existingProfile.id

  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({
      auth_user_id: authUser!.id,
      first_name: v.firstName,
      display_name: v.firstName,
      email,
      home_community_id: wardId,
      role: 'user',
      verification_status: 'verified',
    })
    .select('id')
    .single()
  if (error) throw error
  return profile.id
}

async function clean(): Promise<void> {
  console.log('Cleaning demo vouches, profiles and auth users…')
  const { data: users } = await supabase.auth.admin.listUsers()
  const demoUsers = (users?.users ?? []).filter((u) => u.email?.endsWith(`@${DEMO_DOMAIN}`))
  for (const u of demoUsers) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', u.id)
      .maybeSingle()
    if (prof) {
      await supabase.from('vouches').delete().eq('user_id', prof.id)
      await supabase.from('profiles').delete().eq('id', prof.id)
    }
    await supabase.auth.admin.deleteUser(u.id)
  }
  console.log(`Removed ${demoUsers.length} demo users and their vouches.`)
}

async function main(): Promise<void> {
  console.log('iVouch — Seed demo vouches')
  console.log('==========================')

  if (process.argv.includes('--clean')) {
    await clean()
    return
  }

  const wardId = await getWardId()

  // Resolve profile ids for each demo voucher.
  const voucherIds = new Map<string, string>()
  for (const v of VOUCHERS) {
    const id = await ensureVoucher(v, wardId)
    voucherIds.set(v.firstName, id)
    console.log(`  voucher ready: ${v.firstName} (${v.community})`)
  }

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, slug')
    .eq('status', 'active')
  if (!businesses || businesses.length === 0) {
    console.error('No active businesses to vouch for.')
    process.exit(1)
  }

  // Build ~12 vouches spread across businesses & vouchers over the past 14 days.
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  let seed = 7
  let inserted = 0
  const plan: { businessSlug: string; voucher: DemoVoucher; hoursAgo: number }[] = []

  const targets = businesses.filter((b) => COMMENTS[b.slug])
  const daysBack = [0.08, 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 13]
  let i = 0
  for (const b of targets) {
    // 1-2 vouches per business
    const count = 1 + (i % 2)
    for (let c = 0; c < count && plan.length < 12; c++) {
      const voucher = VOUCHERS[(i + c) % VOUCHERS.length]
      plan.push({ businessSlug: b.slug, voucher, hoursAgo: daysBack[plan.length] * 24 })
    }
    i++
  }

  for (const p of plan) {
    const business = businesses.find((b) => b.slug === p.businessSlug)!
    const profileId = voucherIds.get(p.voucher.firstName)!
    const comments = COMMENTS[p.businessSlug] ?? []
    const comment = comments[seed % comments.length] ?? null
    const createdAt = new Date(now - p.hoursAgo * (day / 24)).toISOString()

    const { error } = await supabase.from('vouches').insert({
      business_id: business.id,
      user_id: profileId,
      community_id: wardId,
      tags: pickTags(seed),
      comment,
      status: 'active',
      created_at: createdAt,
      updated_at: createdAt,
    })
    seed += 3
    if (error) {
      if (error.code === '23505') continue // already vouched (unique business+user)
      console.warn(`  skip ${p.businessSlug}: ${error.message}`)
    } else {
      inserted++
    }
  }

  console.log(`\nDone. Inserted ${inserted} demo vouches.`)
  console.log('Remove later with: npm run seed:demo-vouches -- --clean')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
