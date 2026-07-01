/**
 * scripts/geo/import-communities.ts
 *
 * Reads data/processed/jhb-wards.geojson and upserts each ward into Supabase
 * as a community of type 'ward', then stores the GeoJSON polygon in
 * community_boundaries.
 *
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment.
 * Run: npx tsx scripts/geo/import-communities.ts
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const INPUT_FILE = path.join(process.cwd(), 'data', 'processed', 'jhb-wards.geojson')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

interface WardProperties {
  ward_number: number | null
  municipality: string | null
  municipality_code: string | null
  slug: string
  name: string
  source: string
  bbox: [number, number, number, number] | null
}

async function main(): Promise<void> {
  console.log('iVouch — Import Communities from GeoJSON')
  console.log('=========================================')

  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Processed GeoJSON not found: ${INPUT_FILE}`)
    console.error('Run convert-wards-to-geojson.ts first.')
    process.exit(1)
  }

  const geojson = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8')) as GeoJSON.FeatureCollection
  console.log(`Loaded ${geojson.features.length} wards from ${INPUT_FILE}`)

  let inserted = 0
  let updated = 0
  let errors = 0

  for (const feature of geojson.features) {
    const props = feature.properties as WardProperties

    if (!props.slug || !props.name) {
      console.warn('  Skipping feature with missing slug/name')
      continue
    }

    process.stdout.write(`  ${props.name} (ward ${props.ward_number ?? '?'})... `)

    // Upsert community record
    const { data: community, error: commErr } = await supabase
      .from('communities')
      .upsert(
        {
          name: props.name,
          slug: props.slug,
          display_name: props.ward_number ? `Ward ${props.ward_number} — Johannesburg` : props.name,
          type: 'ward',
          ward_number: props.ward_number,
          municipality: props.municipality ?? 'City of Johannesburg Metropolitan Municipality',
          municipality_code: props.municipality_code ?? 'JHB',
          province: 'Gauteng',
          country: 'South Africa',
          source_name: props.source,
          status: 'active',
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single()

    if (commErr || !community) {
      console.error(`ERROR: ${commErr?.message ?? 'no data'}`)
      errors++
      continue
    }

    // Upsert boundary record
    const bboxObj = props.bbox
      ? { minLon: props.bbox[0], minLat: props.bbox[1], maxLon: props.bbox[2], maxLat: props.bbox[3] }
      : null

    const { error: boundaryErr } = await supabase.from('community_boundaries').upsert(
      {
        community_id: community.id,
        boundary_type: feature.geometry?.type ?? 'polygon',
        source_name: props.source,
        geojson: feature.geometry ?? null,
        bbox: bboxObj,
        boundary_version: new Date().toISOString().split('T')[0],
      },
      { onConflict: 'community_id' }
    )

    if (boundaryErr) {
      console.error(`boundary error: ${boundaryErr.message}`)
    }

    // Track insert vs update (rough heuristic via created_at proximity)
    inserted++
    console.log('OK')
  }

  console.log(`\nDone. Upserted: ${inserted}, Errors: ${errors}`)
  if (errors > 0) process.exit(1)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
