import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws } }
)

async function main() {
  console.log('\n🔍 Verifying migration 004\n')

  // 1. Community rename
  const { data: comm } = await supabase
    .from('communities')
    .select('name, slug, display_name, status')
    .eq('slug', 'jhb-south-ward-23')
    .single()
  console.log('Community:', comm ? `✓ ${comm.name} (${comm.slug}) — ${comm.status}` : '❌ not found')

  // 2. Active communities count (should be 1)
  const { count: activeComm } = await supabase
    .from('communities')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  console.log(`Active communities: ${activeComm} (expect 1)`)

  // 3. Duplicate categories removed
  const dupSlugs = ['alterations', 'catering', 'driving-instructor', 'photographer', 'tutor']
  const { data: dups } = await supabase.from('categories').select('slug').in('slug', dupSlugs)
  console.log(`Leftover duplicate categories: ${dups?.length ?? 0} (expect 0)`)

  // 4. Total + grouped categories
  const { count: totalCats } = await supabase
    .from('categories').select('*', { count: 'exact', head: true }).eq('status', 'active')
  const { data: cats } = await supabase.from('categories').select('group_name')
  const groups = [...new Set((cats ?? []).map(c => c.group_name).filter(Boolean))]
  console.log(`Total active categories: ${totalCats}`)
  console.log(`Category groups (${groups.length}):`)
  for (const g of groups.sort()) {
    const n = (cats ?? []).filter(c => c.group_name === g).length
    console.log(`   • ${g}: ${n}`)
  }

  // 5. Ungrouped check
  const ungrouped = (cats ?? []).filter(c => !c.group_name).length
  console.log(`Ungrouped categories: ${ungrouped} (expect 0)`)

  // 6. Businesses still linked to the ward
  const { count: linked } = await supabase
    .from('business_communities').select('*', { count: 'exact', head: true })
    .eq('community_id', (await supabase.from('communities').select('id').eq('slug','jhb-south-ward-23').single()).data?.id)
  console.log(`\nBusinesses linked to JHB South Ward 23: ${linked}`)

  console.log('\n✅ Verification complete\n')
}
main().catch(e => { console.error(e.message); process.exit(1) })
