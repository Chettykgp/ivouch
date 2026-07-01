/**
 * scripts/geo/verify-ward-import.ts
 *
 * Queries Supabase and prints a summary of the community/ward data quality.
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY
 * Run: npx tsx scripts/geo/verify-ward-import.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function main(): Promise<void> {
  console.log('iVouch — Ward Import Verification')
  console.log('===================================')

  // 1. Count communities by type
  const { data: typeCounts, error: typeErr } = await supabase
    .from('communities')
    .select('type')
    .eq('status', 'active')

  if (typeErr) {
    console.error('Failed to fetch communities:', typeErr.message)
    process.exit(1)
  }

  const byType: Record<string, number> = {}
  for (const row of typeCounts ?? []) {
    const t = (row as { type: string }).type
    byType[t] = (byType[t] ?? 0) + 1
  }

  console.log('\nCommunities by type:')
  for (const [type, count] of Object.entries(byType)) {
    console.log(`  ${type}: ${count}`)
  }

  // 2. Ward 23 details
  const { data: ward23, error: w23Err } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', 'johannesburg-ward-23')
    .single()

  if (w23Err || !ward23) {
    console.log('\nWard 23: NOT FOUND (run seed-ward-23.ts)')
  } else {
    const w = ward23 as Record<string, unknown>
    console.log('\nWard 23:')
    console.log(`  id:            ${w.id}`)
    console.log(`  name:          ${w.name}`)
    console.log(`  display_name:  ${w.display_name}`)
    console.log(`  type:          ${w.type}`)
    console.log(`  ward_number:   ${w.ward_number}`)
    console.log(`  municipality:  ${w.municipality}`)
    console.log(`  status:        ${w.status}`)
    console.log(`  source_name:   ${w.source_name}`)
    console.log(`  source_date:   ${w.source_date}`)

    // 3. Ward 23 aliases
    const { data: aliases, error: aliasErr } = await supabase
      .from('community_aliases')
      .select('*')
      .eq('community_id', w.id as string)

    if (aliasErr) {
      console.log('\nAliases: error fetching')
    } else {
      console.log(`\nWard 23 aliases (${(aliases ?? []).length}):`)
      for (const alias of aliases ?? []) {
        const a = alias as Record<string, unknown>
        console.log(`  [${a.alias_type}/${a.confidence}] ${a.alias_name} (${a.alias_slug})`)
      }
    }

    // 4. Child suburbs
    const { data: children } = await supabase
      .from('communities')
      .select('id, name, slug, type')
      .eq('parent_community_id', w.id as string)

    console.log(`\nChild suburbs (${(children ?? []).length}):`)
    for (const child of children ?? []) {
      const c = child as Record<string, unknown>
      console.log(`  ${c.name} (${c.slug})`)
    }
  }

  // 5. Communities missing boundaries
  const { data: allComms } = await supabase
    .from('communities')
    .select('id, slug, type')
    .eq('status', 'active')
    .eq('type', 'ward')

  const { data: boundaries } = await supabase
    .from('community_boundaries')
    .select('community_id')

  const boundaryIds = new Set((boundaries ?? []).map((b) => (b as { community_id: string }).community_id))
  const missing = (allComms ?? []).filter((c) => !boundaryIds.has((c as { id: string }).id))

  console.log(`\nWards missing boundaries: ${missing.length}`)
  if (missing.length > 0 && missing.length <= 10) {
    for (const m of missing) {
      const c = m as Record<string, unknown>
      console.log(`  ${c.slug}`)
    }
  } else if (missing.length > 10) {
    console.log('  (too many to list — run geo:import to populate boundaries)')
  }

  console.log('\nVerification complete.')
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
