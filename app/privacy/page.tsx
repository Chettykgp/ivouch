import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = { title: 'Privacy Policy – iVouch' }

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--charcoal)' }}>Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: July 2025</p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--charcoal)' }}>1. Introduction</h2>
            <p>iVouch (Pty) Ltd (&quot;iVouch&quot;, &quot;we&quot;, &quot;us&quot;) operates ivouch.co.za. We are committed to protecting your personal information in accordance with the Protection of Personal Information Act, 2013 (&quot;POPIA&quot;) and applicable South African law.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--charcoal)' }}>2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name and display name when you register</li>
              <li>Email address (required for account creation)</li>
              <li>Phone number (optional, for profile verification)</li>
              <li>Neighbourhood/community you associate with</li>
              <li>Vouches you submit, including comments and tags</li>
              <li>Businesses you list or claim</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--charcoal)' }}>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Operate the iVouch platform and display your vouches</li>
              <li>Verify community membership and prevent fraud</li>
              <li>Send account-related communications</li>
              <li>Improve the platform and community safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--charcoal)' }}>4. Sharing of Information</h2>
            <p>Your display name and vouches are publicly visible. We do not sell your personal information. We share data with service providers (such as Supabase for database hosting) only as necessary to operate the platform, under strict data processing agreements.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--charcoal)' }}>5. Your Rights (POPIA)</h2>
            <p>Under POPIA, you have the right to access, correct, and request deletion of your personal information. To exercise these rights, email us at privacy@ivouch.co.za.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--charcoal)' }}>6. Contact</h2>
            <p>Information Officer: iVouch (Pty) Ltd · privacy@ivouch.co.za</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
