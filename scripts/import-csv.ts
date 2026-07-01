/**
 * CSV Import Script for iVouch
 *
 * Usage:
 *   npx ts-node scripts/import-csv.ts <path-to-csv>
 *
 * CSV columns: business_name, category, phone, whatsapp, area, notes, recommended_by, source
 *
 * Required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

async function importCSV(filePath: string) {
  const content = fs.readFileSync(path.resolve(filePath), 'utf-8')
  const rows = parseCSV(content)
  console.log(`Found ${rows.length} rows to import.`)

  let imported = 0
  let skipped = 0

  for (const row of rows) {
    const name = row.business_name
    if (!name) { skipped++; continue }

    // Look up category
    let categoryId: string | null = null
    if (row.category) {
      const { data: cat } = await supabase.from('categories').select('id').ilike('name', `%${row.category}%`).limit(1).single()
      categoryId = cat?.id ?? null
    }

    const slug = slugify(name) + '-' + Math.random().toString(36).slice(2, 6)

    const { data: business, error } = await supabase.from('businesses').insert({
      name,
      slug,
      description: row.notes || null,
      primary_category_id: categoryId,
      phone: row.phone || null,
      whatsapp: row.whatsapp || null,
      status: 'pending',
      is_community_sourced: true,
    }).select().single()

    if (error) {
      console.warn(`Skipped "${name}": ${error.message}`)
      skipped++
      continue
    }

    // Link area/community
    if (row.area && business) {
      const { data: comm } = await supabase.from('communities').select('id').ilike('name', `%${row.area}%`).limit(1).single()
      if (comm) {
        await supabase.from('business_communities').insert({ business_id: business.id, community_id: comm.id })
      }
    }

    imported++
    console.log(`✓ Imported: ${name}`)
  }

  console.log(`\nDone. Imported: ${imported}, Skipped: ${skipped}`)
}

const file = process.argv[2]
if (!file) {
  console.error('Usage: npx ts-node scripts/import-csv.ts <path-to-csv>')
  process.exit(1)
}

importCSV(file).catch(console.error)
