/**
 * scripts/geo/seed-ward-23.ts
 *
 * Runs the Ward 23 seed SQL via the Supabase service role client.
 * Idempotent — safe to run multiple times.
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY
 * Run: npx tsx scripts/geo/seed-ward-23.ts
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const SQL_FILE = path.join(process.cwd(), 'supabase', 'seed', 'seed-ward-23.sql')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  db: { schema: 'public' },
})

async function main(): Promise<void> {
  console.log('iVouch — Seed Ward 23')
  console.log('======================')

  if (!fs.existsSync(SQL_FILE)) {
    console.error(`SQL file not found: ${SQL_FILE}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(SQL_FILE, 'utf-8')

  // Split on semicolons to run statement by statement
  // (Supabase JS client .rpc runs via PostgREST which doesn't support multi-statement in standard mode)
  // We use supabase.rpc('exec_sql') if available, or print instructions.
  // Since exec_sql requires a custom function, we use the postgres REST endpoint approach.

  console.log('\nNote: This script requires either:')
  console.log('  1. The SQL to be run directly in the Supabase SQL editor (recommended), OR')
  console.log('  2. A custom exec_sql RPC function in your Supabase project')
  console.log('')
  console.log('SQL file location:')
  console.log(`  ${SQL_FILE}`)
  console.log('')
  console.log('To run in Supabase SQL Editor:')
  console.log('  1. Open your Supabase project dashboard')
  console.log('  2. Go to SQL Editor')
  console.log('  3. Paste the contents of supabase/seed/seed-ward-23.sql')
  console.log('  4. Click Run')
  console.log('')

  // Attempt to seed via individual Supabase JS operations as a fallback
  console.log('Attempting JS-based seed (partial — uses Supabase client operations)...')

  // Step 1: Upsert Ward 23 community
  const { data: ward, error: wardErr } = await supabase
    .from('communities')
    .upsert(
      {
        name: 'Johannesburg Ward 23',
        slug: 'johannesburg-ward-23',
        display_name: 'Ward 23 — Glenvista, Bassonia, Mulbarton',
        type: 'ward',
        ward_number: 23,
        municipality: 'City of Johannesburg Metropolitan Municipality',
        municipality_code: 'JHB',
        province: 'Gauteng',
        country: 'South Africa',
        source_name: 'Municipal Demarcation Board / Manual curation',
        source_date: '2026-07-01',
        description:
          'Ward 23 covers Glenvista, Bassonia, Mulbarton, Glenanda, Liefde en Vrede, Mayfield Park, Rispark, and South View in the south of Johannesburg.',
        status: 'active',
      },
      { onConflict: 'slug' }
    )
    .select('id')
    .single()

  if (wardErr || !ward) {
    console.error('Failed to upsert Ward 23:', wardErr?.message)
    process.exit(1)
  }
  console.log(`  Ward 23 upserted (id: ${ward.id})`)

  // Step 2: Upsert child suburbs
  const suburbs = [
    { name: 'Glenvista', slug: 'glenvista', description: 'Quiet, leafy suburb in the south of Johannesburg.' },
    { name: 'Bassonia', slug: 'bassonia', description: 'Family-friendly suburb adjacent to Glenvista.' },
    { name: 'Mulbarton', slug: 'mulbarton', description: 'Established suburb in Johannesburg South.' },
    { name: 'Glenanda', slug: 'glenanda', description: 'Residential suburb in Ward 23.' },
    { name: 'Liefde en Vrede', slug: 'liefde-en-vrede', description: 'Suburb in Ward 23.' },
    { name: 'Mayfield Park', slug: 'mayfield-park', description: 'Suburb in Ward 23.' },
    { name: 'Rispark', slug: 'rispark', description: 'Suburb in Ward 23.' },
    { name: 'South View', slug: 'south-view', description: 'Suburb in Ward 23.' },
  ]

  for (const suburb of suburbs) {
    const { error } = await supabase.from('communities').upsert(
      {
        name: suburb.name,
        slug: suburb.slug,
        display_name: suburb.name,
        type: 'suburb',
        parent_community_id: ward.id,
        municipality: 'City of Johannesburg Metropolitan Municipality',
        province: 'Gauteng',
        country: 'South Africa',
        status: 'active',
        description: suburb.description,
      },
      { onConflict: 'slug' }
    )
    if (error) {
      console.error(`  Failed to upsert ${suburb.name}:`, error.message)
    } else {
      console.log(`  Suburb upserted: ${suburb.name}`)
    }
  }

  // Step 3: Insert aliases for Ward 23
  const aliases = [
    { alias_name: 'Glenvista', alias_slug: 'glenvista', alias_type: 'suburb', confidence: 'manual' },
    { alias_name: 'Bassonia', alias_slug: 'bassonia', alias_type: 'suburb', confidence: 'manual' },
    { alias_name: 'Mulbarton', alias_slug: 'mulbarton', alias_type: 'suburb', confidence: 'manual' },
    { alias_name: 'Glenanda', alias_slug: 'glenanda', alias_type: 'suburb', confidence: 'manual' },
    { alias_name: 'Liefde en Vrede', alias_slug: 'liefde-en-vrede', alias_type: 'suburb', confidence: 'manual' },
    { alias_name: 'Mayfield Park', alias_slug: 'mayfield-park', alias_type: 'suburb', confidence: 'manual' },
    { alias_name: 'Rispark', alias_slug: 'rispark', alias_type: 'suburb', confidence: 'manual' },
    { alias_name: 'South View', alias_slug: 'south-view', alias_type: 'suburb', confidence: 'manual' },
    { alias_name: 'Ward 23', alias_slug: 'ward-23', alias_type: 'ward_label', confidence: 'official' },
    { alias_name: 'JHB Ward 23', alias_slug: 'jhb-ward-23', alias_type: 'ward_label', confidence: 'manual' },
  ]

  for (const alias of aliases) {
    const { error } = await supabase.from('community_aliases').upsert(
      {
        community_id: ward.id,
        alias_name: alias.alias_name,
        alias_slug: alias.alias_slug,
        alias_type: alias.alias_type,
        confidence: alias.confidence,
        source_name: 'Local knowledge / SPWard list May 2026',
      },
      { onConflict: 'community_id,alias_slug' }
    )
    if (error) {
      console.error(`  Failed to upsert alias ${alias.alias_name}:`, error.message)
    } else {
      console.log(`  Alias upserted: ${alias.alias_name}`)
    }
  }

  console.log('\nSeed complete.')
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
