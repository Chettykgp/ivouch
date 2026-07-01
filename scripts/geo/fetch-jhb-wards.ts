/**
 * scripts/geo/fetch-jhb-wards.ts
 *
 * Attempts to fetch Johannesburg ward boundaries from the Municipal Demarcation
 * Board (MDB) ArcGIS REST API. Falls back to printing manual download instructions
 * if the API is unavailable or returns no usable data.
 *
 * Run: npx tsx scripts/geo/fetch-jhb-wards.ts
 */

import fs from 'fs'
import path from 'path'

const RAW_DIR = path.join(process.cwd(), 'data', 'raw', 'wards')
const OUTPUT_FILE = path.join(RAW_DIR, 'jhb-wards-raw.geojson')
const MANIFEST_FILE = path.join(RAW_DIR, 'manifest.json')

// MDB ArcGIS REST service — Wards 2021 (typical layer index varies)
const MDB_BASE = 'https://services6.arcgis.com/VBRh56lBQJSUxMBm/arcgis/rest/services'
const MDB_WARD_LAYER_CANDIDATES = [
  `${MDB_BASE}/Wards_2021/FeatureServer/0/query`,
  `${MDB_BASE}/Municipal_Wards/FeatureServer/0/query`,
  `${MDB_BASE}/DemarcationWards/FeatureServer/0/query`,
]

const JHB_FILTER = "MUNIC_NAME='City of Johannesburg' OR CAT_B='JHB'"

interface Manifest {
  source: string
  fetched_at: string
  record_count: number
  status: 'success' | 'fallback'
  notes?: string
}

async function fetchFromArcGIS(queryUrl: string): Promise<GeoJSON.FeatureCollection | null> {
  const params = new URLSearchParams({
    where: JHB_FILTER,
    outFields: '*',
    f: 'geojson',
    resultRecordCount: '300',
  })

  const url = `${queryUrl}?${params.toString()}`
  console.log(`  Trying: ${url}`)

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
    if (!res.ok) {
      console.log(`  HTTP ${res.status} — skipping`)
      return null
    }
    const json = (await res.json()) as { features?: unknown[]; error?: { message: string } }
    if (json.error) {
      console.log(`  ArcGIS error: ${json.error.message}`)
      return null
    }
    if (!json.features || json.features.length === 0) {
      console.log(`  No features returned (filter may not match this layer)`)
      return null
    }
    console.log(`  Got ${json.features.length} features`)
    return json as GeoJSON.FeatureCollection
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.log(`  Fetch failed: ${msg}`)
    return null
  }
}

function printManualInstructions(): void {
  console.log('')
  console.log('=== MANUAL DOWNLOAD INSTRUCTIONS ===')
  console.log('')
  console.log('Option A — MDB ArcGIS Open Data Portal:')
  console.log('  1. Open: https://services6.arcgis.com/VBRh56lBQJSUxMBm/arcgis/rest/services/')
  console.log('  2. Find a "Wards" or "Municipal Wards" FeatureServer')
  console.log('  3. Open layer 0 → "Query" tab')
  console.log('  4. Set: Where = MUNIC_NAME=\'City of Johannesburg\'')
  console.log('  5. Format = GeoJSON → Get Features')
  console.log(`  6. Save response to: ${OUTPUT_FILE}`)
  console.log('')
  console.log('Option B — open.africa shapefile:')
  console.log('  1. Open: https://open.africa/dataset/johannesburg-metropolitan-municipality-wards')
  console.log('  2. Download the .zip shapefile')
  console.log('  3. Extract and convert with:')
  console.log(`     ogr2ogr -f GeoJSON -t_srs EPSG:4326 ${OUTPUT_FILE} JHB_Wards.shp`)
  console.log('')
  console.log('After saving the GeoJSON, re-run: npx tsx scripts/geo/convert-wards-to-geojson.ts')
  console.log('')
}

async function main(): Promise<void> {
  console.log('iVouch — Fetch JHB Ward Boundaries')
  console.log('====================================')

  fs.mkdirSync(RAW_DIR, { recursive: true })

  let result: GeoJSON.FeatureCollection | null = null
  let successUrl = ''

  for (const candidateUrl of MDB_WARD_LAYER_CANDIDATES) {
    console.log(`\nAttempting MDB layer: ${candidateUrl}`)
    result = await fetchFromArcGIS(candidateUrl)
    if (result && result.features.length > 0) {
      successUrl = candidateUrl
      break
    }
  }

  if (result && result.features.length > 0) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf-8')
    const manifest: Manifest = {
      source: successUrl,
      fetched_at: new Date().toISOString(),
      record_count: result.features.length,
      status: 'success',
    }
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8')
    console.log(`\nSaved ${result.features.length} features to ${OUTPUT_FILE}`)
    console.log(`Manifest written to ${MANIFEST_FILE}`)
    console.log('\nNext step: npx tsx scripts/geo/convert-wards-to-geojson.ts')
  } else {
    const manifest: Manifest = {
      source: 'none',
      fetched_at: new Date().toISOString(),
      record_count: 0,
      status: 'fallback',
      notes: 'All ArcGIS endpoints failed or returned no data. Manual download required.',
    }
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8')
    printManualInstructions()
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
