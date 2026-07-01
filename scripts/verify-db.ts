import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws }
  }
)

async function main() {
  console.log('\n🔍 iVouch — Database verification\n')

  const checks = [
    { label: 'Communities', table: 'communities' },
    { label: 'Categories',  table: 'categories' },
    { label: 'Businesses',  table: 'businesses' },
    { label: 'Vouches',     table: 'vouches' },
    { label: 'Profiles',    table: 'profiles' },
    { label: 'Community aliases', table: 'community_aliases' },
    { label: 'User communities',  table: 'user_communities' },
    { label: 'Business service areas', table: 'business_service_areas' },
  ]

  for (const { label, table } of checks) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    if (error) {
      console.log(`  ❌ ${label}: ${error.message}`)
    } else {
      console.log(`  ✓ ${label}: ${count} rows`)
    }
  }

  // Show Ward 23
  console.log('\n📍 Ward 23 check:')
  const { data: ward } = await supabase
    .from('communities')
    .select('id, name, type, ward_number, display_name')
    .eq('slug', 'johannesburg-ward-23')
    .single()
  if (ward) {
    console.log(`  ✓ ${ward.name} (type: ${ward.type}, ward: ${ward.ward_number})`)
    console.log(`    Display: ${ward.display_name}`)

    const { data: aliases } = await supabase
      .from('community_aliases')
      .select('alias_name')
      .eq('community_id', ward.id)
    console.log(`    Aliases: ${aliases?.map(a => a.alias_name).join(', ')}`)

    const { count: bizCount } = await supabase
      .from('business_communities')
      .select('*', { count: 'exact', head: true })
      .eq('community_id', ward.id)
    console.log(`    Businesses linked: ${bizCount}`)
  } else {
    console.log('  ❌ Ward 23 not found')
  }

  console.log('\n✅ Verification complete\n')
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
