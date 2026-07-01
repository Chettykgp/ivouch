/**
 * scripts/geo/convert-wards-to-geojson.ts
 *
 * Reads data/raw/wards/jhb-wards-raw.geojson, normalises property names,
 * filters to Johannesburg wards, and outputs a clean GeoJSON to
 * data/processed/jhb-wards.geojson.
 *
 * Run: npx tsx scripts/geo/convert-wards-to-geojson.ts
 *
 * Note: If your source is a Shapefile, convert first with ogr2ogr:
 *   ogr2ogr -f GeoJSON -t_srs EPSG:4326 data/raw/wards/jhb-wards-raw.geojson JHB_Wards.shp
 */

import fs from 'fs'
import path from 'path'

const INPUT_FILE = path.join(process.cwd(), 'data', 'raw', 'wards', 'jhb-wards-raw.geojson')
const OUTPUT_DIR = path.join(process.cwd(), 'data', 'processed')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'jhb-wards.geojson')

// Property name variants to try when extracting ward number
const WARD_NUM_KEYS = ['WARD_NO', 'WardNo', 'ward_no', 'WARD_NUM', 'WardNum', 'ward_number', 'WARD_NUMBER', 'Ward_No']
// Property name variants for municipality
const MUNIC_KEYS = ['MUNIC_NAME', 'munic_name', 'MunicipalityName', 'CAT_B_NAME', 'cat_b_name']
const MUNIC_CODE_KEYS = ['CAT_B', 'cat_b', 'MUNIC_CODE', 'munic_code']

// Acceptable municipality name fragments / codes for JHB
const JHB_IDENTIFIERS = [
  'city of johannesburg',
  'johannesburg',
  'jhb',
  'TSH', // Sometimes used but that's Tshwane — kept for debug
]

type Properties = Record<string, unknown>

function extractWardNumber(props: Properties): number | null {
  for (const key of WARD_NUM_KEYS) {
    const val = props[key]
    if (val !== undefined && val !== null) {
      const num = parseInt(String(val), 10)
      if (!isNaN(num)) return num
    }
  }
  return null
}

function extractMunicipality(props: Properties): string | null {
  for (const key of MUNIC_KEYS) {
    const val = props[key]
    if (val && typeof val === 'string') return val
  }
  return null
}

function extractMunicCode(props: Properties): string | null {
  for (const key of MUNIC_CODE_KEYS) {
    const val = props[key]
    if (val && typeof val === 'string') return val
  }
  return null
}

function isJohannesburgWard(props: Properties): boolean {
  const munic = extractMunicipality(props)?.toLowerCase() ?? ''
  const code = extractMunicCode(props)?.toLowerCase() ?? ''
  return JHB_IDENTIFIERS.some((id) => munic.includes(id) || code === id.toLowerCase())
}

function computeBbox(geometry: GeoJSON.Geometry): [number, number, number, number] | null {
  const coords: [number, number][] = []

  function collectCoords(g: GeoJSON.Geometry): void {
    if (g.type === 'Polygon') {
      for (const ring of g.coordinates) {
        for (const c of ring) coords.push([c[0], c[1]])
      }
    } else if (g.type === 'MultiPolygon') {
      for (const poly of g.coordinates) {
        for (const ring of poly) {
          for (const c of ring) coords.push([c[0], c[1]])
        }
      }
    }
  }

  collectCoords(geometry)
  if (coords.length === 0) return null

  const lons = coords.map((c) => c[0])
  const lats = coords.map((c) => c[1])
  return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)]
}

interface NormalisedProperties {
  ward_number: number | null
  municipality: string | null
  municipality_code: string | null
  slug: string
  name: string
  source: string
  bbox: [number, number, number, number] | null
  raw: Properties
}

interface NormalisedFeature {
  type: 'Feature'
  geometry: GeoJSON.Geometry
  properties: NormalisedProperties
}

function main(): void {
  console.log('iVouch — Convert Ward GeoJSON')
  console.log('==============================')

  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Input file not found: ${INPUT_FILE}`)
    console.error('Run fetch-jhb-wards.ts first, or manually place the raw GeoJSON.')
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8')) as GeoJSON.FeatureCollection
  console.log(`Loaded ${raw.features.length} raw features`)

  const jhbFeatures: NormalisedFeature[] = []
  let ward23Found = false

  for (const feature of raw.features) {
    const props = feature.properties as Properties

    if (!isJohannesburgWard(props)) continue

    const wardNum = extractWardNumber(props)
    const munic = extractMunicipality(props)
    const municCode = extractMunicCode(props)
    const bbox = feature.geometry ? computeBbox(feature.geometry as GeoJSON.Geometry) : null

    const name = wardNum ? `Johannesburg Ward ${wardNum}` : 'Johannesburg Ward (unknown)'
    const slug = wardNum ? `johannesburg-ward-${wardNum}` : `johannesburg-ward-unknown-${Date.now()}`

    if (wardNum === 23) ward23Found = true

    jhbFeatures.push({
      type: 'Feature',
      geometry: feature.geometry as GeoJSON.Geometry,
      properties: {
        ward_number: wardNum,
        municipality: munic ?? 'City of Johannesburg Metropolitan Municipality',
        municipality_code: municCode ?? 'JHB',
        slug,
        name,
        source: 'Municipal Demarcation Board / open.africa',
        bbox,
        raw: props,
      },
    })
  }

  // Sort by ward number
  jhbFeatures.sort((a, b) => (a.properties.ward_number ?? 999) - (b.properties.ward_number ?? 999))

  const output: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: jhbFeatures,
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8')

  console.log(`\nResults:`)
  console.log(`  Total JHB wards: ${jhbFeatures.length}`)
  console.log(`  Ward 23 found: ${ward23Found ? 'YES' : 'NO'}`)
  console.log(`  Output: ${OUTPUT_FILE}`)

  if (!ward23Found && jhbFeatures.length > 0) {
    console.warn('\nWARNING: Ward 23 not found. Check that ward number extraction is working.')
    console.warn('Sample properties from first feature:', JSON.stringify(jhbFeatures[0].properties.raw, null, 2))
  }

  console.log('\nNext step: npx tsx scripts/geo/import-communities.ts')
}

main()
