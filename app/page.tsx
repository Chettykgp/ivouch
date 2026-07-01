import Link from 'next/link'
import { Search, Heart, Shield, Users, Star, CheckCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CommunityCard from '@/components/community/CommunityCard'

const POPULAR_CATEGORIES = [
  { name: 'Plumber', icon: '🔧', slug: 'plumber' },
  { name: 'Electrician', icon: '⚡', slug: 'electrician' },
  { name: 'Mechanic', icon: '🔩', slug: 'mechanic' },
  { name: 'Tutor', icon: '📚', slug: 'tutor' },
  { name: 'Gardener', icon: '🌿', slug: 'gardener' },
  { name: 'Domestic Worker', icon: '🏠', slug: 'domestic-worker' },
  { name: 'DJ', icon: '🎵', slug: 'dj' },
  { name: 'Photographer', icon: '📷', slug: 'photographer' },
]

const STATIC_COMMUNITIES: import('@/types').Community[] = [
  { id: '1', name: 'Glenvista', slug: 'glenvista', display_name: 'Glenvista', type: 'suburb', city: 'Johannesburg', province: 'Gauteng', country: 'South Africa', description: 'A quiet, leafy suburb in the south of Johannesburg.', municipality: null, municipality_code: null, ward_number: null, region_code: null, parent_community_id: null, boundary_version: null, source_name: null, source_url: null, source_date: null, status: 'active', created_at: '', updated_at: '' },
  { id: '2', name: 'Bassonia', slug: 'bassonia', display_name: 'Bassonia', type: 'suburb', city: 'Johannesburg', province: 'Gauteng', country: 'South Africa', description: 'Family-friendly suburb adjacent to Glenvista.', municipality: null, municipality_code: null, ward_number: null, region_code: null, parent_community_id: null, boundary_version: null, source_name: null, source_url: null, source_date: null, status: 'active', created_at: '', updated_at: '' },
  { id: '3', name: 'Mondeor', slug: 'mondeor', display_name: 'Mondeor', type: 'suburb', city: 'Johannesburg', province: 'Gauteng', country: 'South Africa', description: 'Long-established southern suburb of Johannesburg.', municipality: null, municipality_code: null, ward_number: null, region_code: null, parent_community_id: null, boundary_version: null, source_name: null, source_url: null, source_date: null, status: 'active', created_at: '', updated_at: '' },
  { id: '4', name: 'Mulbarton', slug: 'mulbarton', display_name: 'Mulbarton', type: 'suburb', city: 'Johannesburg', province: 'Gauteng', country: 'South Africa', description: 'Established suburb in Johannesburg South.', municipality: null, municipality_code: null, ward_number: null, region_code: null, parent_community_id: null, boundary_version: null, source_name: null, source_url: null, source_date: null, status: 'active', created_at: '', updated_at: '' },
  { id: '5', name: 'Lenasia', slug: 'lenasia', display_name: 'Lenasia', type: 'suburb', city: 'Johannesburg', province: 'Gauteng', country: 'South Africa', description: 'Vibrant community in Johannesburg South.', municipality: null, municipality_code: null, ward_number: null, region_code: null, parent_community_id: null, boundary_version: null, source_name: null, source_url: null, source_date: null, status: 'active', created_at: '', updated_at: '' },
  { id: '6', name: 'Alberton', slug: 'alberton', display_name: 'Alberton', type: 'suburb', city: 'Ekurhuleni', province: 'Gauteng', country: 'South Africa', description: 'Large town on the East Rand, Ekurhuleni.', municipality: null, municipality_code: null, ward_number: null, region_code: null, parent_community_id: null, boundary_version: null, source_name: null, source_url: null, source_date: null, status: 'active', created_at: '', updated_at: '' },
]

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <section
          className="relative py-20 md:py-28 px-4 text-center overflow-hidden"
          style={{ backgroundColor: 'var(--navy)' }}
        >
          <div className="max-w-3xl mx-auto relative z-10">
            <div
              className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-6"
              style={{ backgroundColor: 'var(--vouch-green)', color: 'white' }}
            >
              🇿🇦 Trusted by South African communities
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
              Need someone <span style={{ color: 'var(--sunshine)' }}>reliable?</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-10">
              Find local people your neighbours vouch for.
            </p>

            {/* Search Form */}
            <div className="bg-white rounded-2xl p-4 shadow-xl max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  className="flex-1 px-4 py-3 rounded-xl border text-gray-700 focus:outline-none text-sm"
                  style={{ borderColor: 'var(--cloud-grey)' }}
                >
                  <option value="">Select a service...</option>
                  {POPULAR_CATEGORIES.map(c => (
                    <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
                  ))}
                </select>
                <select
                  className="flex-1 px-4 py-3 rounded-xl border text-gray-700 focus:outline-none text-sm"
                  style={{ borderColor: 'var(--cloud-grey)' }}
                >
                  <option value="">Select your area...</option>
                  {STATIC_COMMUNITIES.map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
                <button
                  className="px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--vouch-green)' }}
                >
                  <Search size={18} />
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* POPULAR CATEGORIES */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--charcoal)' }}>
            Browse by Service
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {POPULAR_CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/?category=${cat.slug}`}>
                <div
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border text-center hover:shadow-md transition-shadow cursor-pointer"
                  style={{ backgroundColor: 'white', borderColor: 'var(--cloud-grey)' }}
                >
                  <span className="text-3xl">{cat.icon}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--charcoal)' }}>{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ backgroundColor: 'white' }} className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--charcoal)' }}>
              How iVouch works
            </h2>
            <p className="text-gray-500 mb-12">Three simple steps to find someone you can trust.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  icon: <Search size={32} style={{ color: 'var(--vouch-green)' }} />,
                  title: 'Search your area',
                  desc: 'Browse services by your suburb or area. See who your actual neighbours recommend.',
                },
                {
                  step: '2',
                  icon: <Heart size={32} style={{ color: 'var(--vouch-green)' }} />,
                  title: 'Check the vouches',
                  desc: 'Read real vouches from real neighbours. A vouch is stronger than a star rating.',
                },
                {
                  step: '3',
                  icon: <Shield size={32} style={{ color: 'var(--vouch-green)' }} />,
                  title: 'Hire with confidence',
                  desc: 'Contact directly. Hire confidently knowing the community backs this person.',
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: 'var(--cream)' }}
                  >
                    {item.icon}
                  </div>
                  <div
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: 'var(--navy)' }}
                  >
                    Step {item.step}
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--charcoal)' }}>{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY VOUCHES BEAT REVIEWS */}
        <section className="py-16 px-4 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-black mb-4" style={{ color: 'var(--charcoal)' }}>
                Why vouches beat reviews
              </h2>
              <ul className="space-y-4">
                {[
                  { icon: <Users size={20} style={{ color: 'var(--vouch-green)' }} />, text: 'Vouches come from real, verified neighbours — not anonymous strangers.' },
                  { icon: <CheckCircle size={20} style={{ color: 'var(--vouch-green)' }} />, text: "You can't buy a vouch. They are earned through genuine community trust." },
                  { icon: <Star size={20} style={{ color: 'var(--sunshine)' }} />, text: 'Stars can be faked. "My neighbour Thabo vouches for them" cannot.' },
                  { icon: <Shield size={20} style={{ color: 'var(--navy)' }} />, text: 'POPIA-compliant. Your data stays yours.' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5">{item.icon}</div>
                    <p className="text-gray-600 text-sm">{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-2xl p-8 text-center shadow-sm"
              style={{ backgroundColor: 'var(--navy)' }}
            >
              <div className="text-6xl font-black text-white mb-2">142</div>
              <div className="font-bold mb-1" style={{ color: 'var(--vouch-green)' }}>neighbours vouch for</div>
              <div className="text-white text-xl font-semibold">Mike&apos;s Plumbing</div>
              <div className="text-white/60 text-sm mt-2">Glenvista · Bassonia · Mondeor</div>
              <div className="mt-4">
                <span
                  className="px-4 py-2 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: 'var(--vouch-green)' }}
                >
                  ❤️ I vouch for them
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* BROWSE COMMUNITIES */}
        <section style={{ backgroundColor: 'white' }} className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--charcoal)' }}>
              Browse by community
            </h2>
            <p className="text-center text-gray-500 text-sm mb-8">
              iVouch started in Johannesburg South. More communities coming soon.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {STATIC_COMMUNITIES.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-16 px-4">
          <div
            className="max-w-2xl mx-auto rounded-3xl p-10 text-center shadow-lg"
            style={{ backgroundColor: 'var(--vouch-green)' }}
          >
            <h2 className="text-3xl font-black text-white mb-3">
              List your business for free
            </h2>
            <p className="text-white/90 mb-6">
              Join hundreds of local service providers. Get discovered by your community. Start earning real vouches.
            </p>
            <Link
              href="/add-business"
              className="inline-block px-8 py-3 rounded-xl font-bold text-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--navy)', color: 'white' }}
            >
              Add My Business
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
